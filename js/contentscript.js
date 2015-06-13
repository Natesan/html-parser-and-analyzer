chrome.extension.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
        printNodes(request.source);
    }

    function printNodes(nodeList) {
        var table = $('<table>'),
            tableContent = '';
        tableContent += '<tr><td>Type</td><td>XCode</td><td>Attributes</td><td>Content</td></tr>';
        for (var i = 0; i < nodeList.length; i++) {
            tableContent += '<tr>';
            var node = nodeList[i];
            for (var prop in node) {
                if (node.hasOwnProperty(prop)) {
                    console.log("Property : " + prop);
                    if (prop == 'attributes' && node["attributes"] != null) {
                        tableContent += '<td>';
                        for (var attr in node["attributes"]) {
                            console.log(attr + ":" + node["attributes"][attr])
                            tableContent += attr + ':' + node["attributes"][attr] + '<br/>';
                        }
                        tableContent += '</td>';
                    } else if (prop == 'content' || prop == 'type') {
                        tableContent += '<td>' + node[prop] + '</td>';
                    } else {
                        console.log(prop + ":" + node[prop]);
                        tableContent += '<td></td>';
                    }
                    var Aid = 'id',
                        Aclass = 'class';
                    for (var attr in node["attributes"]) {
                        if ((Aid in node["attributes"]) && attr == 'id' && prop == 'type') {
                            tableContent += '<td>' + node[prop] + '[@';
                            tableContent += attr + '="' + node["attributes"][attr];
                            tableContent += '"]</td>';
                        } else if ((Aclass in node["attributes"]) && attr == 'class' && prop == 'type') {
                            tableContent += '<td>' + node[prop] + '[@';
                            tableContent += attr + '="' + node["attributes"][attr];
                            tableContent += '"]</td>';
                        }
                    }
                }
            }
            tableContent += '</tr>';
        }
        console.log(tableContent);
        table.append(tableContent);
        $('#tableData').append(table);
    }

});


var config = [];

function onWindowLoad() {

    $("#btnExport").click(function (e) {
        $('#elementsSelected .btn.active').each(function () {
            config.push($(this).val());
        });


        chrome.tabs.executeScript(null, {
            code: 'var config = ' + JSON.stringify(config)
        }, function () {
            chrome.tabs.executeScript(null, {
                file: "js/getPagesSource.js"
            }, function () {
                // If you try and inject into an extensions page or the webstore/NTP you'll get an error
                if (chrome.extension.lastError) {
                    message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
                }
            });
        });


        setTimeout(function () {
            window.open('data:application/vnd.ms-excel,' + encodeURIComponent($('#tableData').html()));
            e.preventDefault();
        }, 1000);

    });


}

window.onload = onWindowLoad;