function DOMtoString(document_root, config) {
    
    var initElement = document_root.getElementsByTagName("html")[0];
    var json = mapDOM(initElement, true);
    var arr = JSON.parse(json);
    var FinalNodeList = getObjects(arr, 'type', config);

    return FinalNodeList;

    function getObjects(obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i))
                continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));
            } else if (i == key && jQuery.inArray(obj[key], val) > -1) {
                objects.push(obj);
                /*if (obj["attributes"] != null) {
                    for (var att in obj["attributes"]) {
                        console.log(att + ": " + obj["attributes"][att]);
                    }
                }*/
            }
        }
        return objects;
    }
    
    //helper method to fetch the DOM map
    function mapDOM(element, json) {
        var treeObject = {};

        // If string convert to document Node
        if (typeof element === "string") {
            if (window.DOMParser) {
                parser = new DOMParser();
                docNode = parser.parseFromString(element, "text/xml");
            } else { // Microsoft strikes again
                docNode = new ActiveXObject("Microsoft.XMLDOM");
                docNode.async = false;
                docNode.loadXML(element);
            }
            element = docNode.firstChild;
        }

        //Recursively loop through DOM elements and assign properties to object
        function treeHTML(element, object) {
            object["type"] = element.nodeName;
            var nodeList = element.childNodes;
            if (nodeList != null) {
                if (nodeList.length) {
                    object["content"] = [];
                    for (var i = 0; i < nodeList.length; i++) {
                        if (nodeList[i].nodeType == 3) {
                            object["content"].push(nodeList[i].nodeValue);
                        } else {
                            object["content"].push({});
                            treeHTML(nodeList[i], object["content"][object["content"].length - 1]);
                        }
                    }
                }
            }
            if (element.attributes != null) {
                if (element.attributes.length) {
                    object["attributes"] = {};
                    for (var i = 0; i < element.attributes.length; i++) {
                        object["attributes"][element.attributes[i].nodeName] = element.attributes[i].nodeValue;
                    }
                }
            }
        }
        treeHTML(element, treeObject);

        return (json) ? JSON.stringify(treeObject) : treeObject;
    }
}
if (typeof(config) == undefined) 
    window.config = [];

chrome.extension.sendMessage({
    action: "getSource",
    source: DOMtoString(document, window.config)
})