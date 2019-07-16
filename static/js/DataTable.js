(function () {
    DataTable = {};
    DataTable.pickedAttrDict = {};
    DataTable.viewFullTable = true;
    DataTable.ratioSelect = 0.15;


    DataTable.updateHeader = function () {
        if (DataTable.viewFullTable) {
            $('.dataTableHeadText').text(Main.trainData.length + ' rows')
            DataTable.makeTable(Main.trainData);
        } else {
            $('.dataTableHeadText').text(' Added : ' + Main.currentData.length + ' rows  | Left : ' + Main.leftData.length + ' rows ')
            DataTable.makeTable(Main.leftData);
        }
    }


    DataTable.updateOnlyHeader = function (dataGiven) {
        $('.dataTableHeadText').text(dataGiven.length + ' rows');
    }


    DataTable.switchToLeftData = function () {
        DataTable.viewFullTable = false;
        $('#tableContent').css('background', Main.colors.HIGHLIGHT);
        $('.dataTableHeadText').text(' Added : ' + Main.currentData.length + ' rows  | Left : ' + Main.leftData.length + ' rows ');
    }


    DataTable.addIconsTop = function (dataIn = Main.trainData, containerId = "") {

        if (containerId == "") {
            containerId = "tableSelectors";
        }
        $("#tableSelectors").empty();
        $("#tableSelectors").css('display', 'flex');

        // var htmlStr = "<div id='clusterControlDiv'></div>";
        // $("#" + containerId).append(htmlStr);


        htmlStr = "<div class='iconHolder' id='addAllData' onclick='' title='Add all data'>"
        htmlStr += "<img class='imgIcon' src='static/img/icons/loadData.png'></div>"
        htmlStr += "<div class='iconHolder' id='removeAllData' onclick='' title='Remove all data'>"
        htmlStr += "<img class='imgIcon' src='static/img/icons/subtract.png'></div>"
        htmlStr += "<button id='dataToggleBtn'> </button>";
        htmlStr += "<div class = 'dataTableHeadText'>" + dataIn.length + " rows </div>";


        $("#" + containerId).append(htmlStr);

        $('.dataTableHeadText').css('display', 'flex');
        $('.dataTableHeadText').css('flex-direction', 'row-reverse');
        $('.dataTableHeadText').css('width', '100%');
        $('.dataTableHeadText').css('padding', '5px');
        // $('.dataTableHeadText').css('display' , )

        $('#dataToggleBtn').button({
            icon: "ui-icon-gear",
            showLabel: false
        })

        $('#dataToggleBtn').click(function () {
            DataTable.viewFullTable = !DataTable.viewFullTable;
            DataTable.updateHeader();
        })



        $('#addAllData').on('click', function () {
            Main.trainData = Util.deepCopyData(Main.trainDataCopy);
            for (var i = 0; i < ClusterModeler.numRecommendations; i++) {
                ClusterModeler.getClustering(true, true, Main.trainData, i);
            }

        })

        $('#removeAllData').on('click', function () {
            Main.trainData = Util.deepCopyData(Main.trainDataCopy);
            Main.currentData = [];
            Main.leftData = Util.deepCopyData(Main.trainData);
            DataTable.switchToLeftData();
            DataTable.makeTable(Main.leftData);
            var containerId = "clusterDivSvg";
            var svgId = "clusterSvgId_" + containerId;
            $("#" + svgId).remove();
            $("#globalPanel").empty();
        })



    }

    DataTable.dragFunction = function () {
        console.log('adding drag function')
        $("#dataViewAppTable tr").draggable({
            helper: "clone",
            start: function () {
                // console.log(' starting drag ')
                $(this).css('border-bottom', '5px solid black')
            },
            drag: function () {
                // console.log('dragging now ', this)
            },
            stop: function () {
                var id = $(this).attr('id');
                var idNum = Util.getNumberFromText(id);
                console.log('stopped drag now ', id, idNum);
                $(this).css('border-bottom', 'transparent')
                DataTable.filterById(idNum);

            }
        });
    }

    DataTable.filterById = function (idGiven) {
        var data = [];
        if (Main.leftData.length == 0) {
            data = Util.deepCopyData(Main.trainData);
        } else {
            data = Util.deepCopyData(Main.leftData);
        }
        var key = Object.keys(DataTable.pickedAttrDict);
        if (key.length == 0) {
            data = Main.getDataById(idGiven, data);
            if (typeof data == 'undefined') return;
            var maxCluster = d3.max(ClusterModeler.clusterIds);
            if (typeof maxCluster == 'undefined') maxCluster = 0;
            data['cluster'] = maxCluster + 1;
            ClusterModeler.clusterIds.push(data['cluster']);
            console.log('data length now ', data, idGiven)
            // Main.currentData = [Object.assign({}, data)]
            data = [Object.assign({}, data)]
            data.push.apply(data, Main.currentData)
            singleRowCheck = true;
        } else {
            data = data.filter(function (d) {
                // return d.id == idGiven;
                if (d.id == idGiven) return true
                for (var item in DataTable.pickedAttrDict) {
                    // if (item == 'Cylinders' && d[item] == DataTable.pickedAttrDict[item]) {
                    //     return true;
                    // }

                    // if (item != 'Cylinders') {
                    //     if (Math.abs(d[item] - DataTable.pickedAttrDict[item]) < 5) {
                    //         return true;
                    //     }
                    // }

                    var ran = Main.attrDict[item]['range'];
                    var fac = Math.abs(+ran[0] - +ran[1]) * DataTable.ratioSelect
                    if (d[item] == DataTable.pickedAttrDict[item]) {
                        return true;
                    }

                    if (Math.abs(d[item] - DataTable.pickedAttrDict[item]) < fac) {
                        return true;
                    }

                }
                return false;
            }) // data filtering completes here

            if (data.length < ClusterModeler.numClusters+1) {
                data.push.apply(data, Main.currentData);
                singleRowCheck = true;
                console.log('filter data commes less than 10 length ', data)
            } else {
                singleRowCheck = false;
            }
        }


        Main.currentTempStoreData = Util.deepCopyData(Main.currentData);
        var clusterIds = []
        for (var i = 0; i < Main.currentTempStoreData.length; i++) {
            clusterIds.push(Main.currentTempStoreData[i]['cluster']);
        }
        clusterIds = Util.getUniqueArray(clusterIds);
        if (data.length > 0) {
            // console.log('filtering , ', data.length, Main.currentData.length)
            for (var i = 0; i < ClusterModeler.numRecommendations; i++) {
                console.log('current data obtained iterating ', i, Main.currentData.length, data.length, clusterIds);
                // ClusterModeler.getClustering(true, Main.currentData, i, clusterIds.length); // commented               
                ClusterModeler.getClustering(true, false, data, i, clusterIds.length, singleRowCheck,true);
            }
            // DataTable.makeTable(data); 
        }
        console.log(' filtered by id data now : ', data);
        //computes leftData
        DataTable.computeLeftData();
    }


    DataTable.computeLeftData = function () {
        //computeleftdata
        setTimeout(() => {
            var currentDataId = [];
            for (var i = 0; i < Main.currentData.length; i++) {
                currentDataId.push(+Main.currentData[i]['id']);
            }
            Main.leftData = [];
            for (var i = 0; i < Main.trainData.length; i++) {
                var index = currentDataId.indexOf(Main.trainData[i]['id'])
                if (index == -1) Main.leftData.push(Object.assign({}, Main.trainData[i]));
            }
            DataTable.pickedAttrDict = {};
            DataTable.updateHeader();

        }, 400);
    }




    DataTable.filterTableByCluster = function (item) {
        var data = Util.deepCopyData(Main.currentData);
        // data.forEach(function(d){

        // })
        data = data.filter(function (d) {
            // console.log('got d is ', d, d.cluster)
            return d.cluster == item;
        })

        console.log('data length table  ', data.length, item)
        DataTable.makeTable(data);
        DataTable.updateOnlyHeader(data);
        $('#tableContent').css('background', 'white');
    }


    // DragTable.unFocus = function () {
    //     if (document.selection) {
    //         document.selection.empty()
    //     } else {
    //         window.getSelection().removeAllRanges()
    //     }
    // }



    DataTable.makeTable = function (dataGiven = main.appData) {
        $("#dataViewAppTable").remove();

        var data = Util.deepCopyData(dataGiven);

        // console.log(" drawing test data table ... ", dataGiven);
        data.forEach(function (d, i) {
            delete d.cluster;
        }); // end of data for each
        // main.testData = data.slice();

        var sortAscending = true;
        var table = d3
            .select("#tableContent")
            .insert("table", ":first-child")
            .attr("id", "dataViewAppTable")
            .attr("height", "100%")
            .attr("width", "100%");
        // .attr("margin-top", "10px");

        $("#dataViewAppTable").css("margin-top", "10px");
        //  .append('div')
        //  .attr('class', 'sepDivDataView')
        //  .style('height', '100px')
        //  .style('width', '100%')

        var titles = d3.keys(data[0]);
        titles.sort();
        var headers = table
            .append("thead")
            .append("tr")
            .selectAll("th")
            .data(titles)
            .enter()
            .append("th")
            .text(function (d) {
                return d;
            })
            .on("click", function (d) {
                headers.attr("class", "header");

                if (sortAscending) {
                    rows.sort(function (a, b) {
                        return b[d] < a[d];
                    });
                    sortAscending = false;
                    this.className = "aes";
                } else {
                    rows.sort(function (a, b) {
                        return b[d] > a[d];
                    });
                    sortAscending = true;
                    this.className = "des";
                }
            });

        var rows = table
            .append("tbody")
            .selectAll("tr")
            .data(data)
            .enter()
            .append("tr")
            .attr('class', function (d, i) {
                return 'trTable trCl_' + i
            })
            .attr('id', function (d) {
                return 'tr_' + d.id;
            })
            .on('mouseover', function (d) {
                try {
                    DataTable.nodeColor = d3.selectAll(".node_" + d.id).style("fill");
                    d3.selectAll(".node_" + d.id).style("fill", "black");
                } catch (err) {

                }

            })
            .on('mouseout', function (d) {
                try {
                    d3.selectAll(".node_" + d.id).style("fill", DataTable.nodeColor);
                } catch (err) {

                }

            })
        rows
            .selectAll("td")
            .data(function (d) {
                return titles.map(function (k) {
                    return {
                        value: d[k],
                        name: k
                    };
                });
            })
            .enter()
            .append("td")
            .attr("data-th", function (d) {
                return d.name;
            })
            .attr('class', function (d) {
                return 'td_' + d.value + ' td_' + d.name + ' td_' + d.name + '_' + d.value;
            })
            .text(function (d) {
                return d.value;
            })
            .on('click', function (d) {
                if (DataTable.viewFullTable) return;
                // return;
                var back = $(this).css('background-color');
                console.log(' background value ', back, d)
                if (back.toString() == "rgba(0, 0, 0, 0)" || typeof back == 'undefined') {
                    // $('.td_' + d.name).css('background', 'rgba(0,0,0,0)');
                    // $('.td_' + d.name + '_' + d.value).css('background', Main.colors.HIGHLIGHT);
                    // $(this).css('background', Main.colors.HIGHLIGHT);
                    var txt = $(this).text();
                    var nameAttr = $(this).attr('data-th');

                    DataTable.pickedAttrDict[nameAttr] = txt;
                    console.log('txt clicked ', txt, nameAttr, DataTable.pickedAttrDict);
                } else {
                    // $(this).css('background', 'rgba(0,0,0,0)');
                    // $('.td_' + d.name + '_' + d.value).css('background', 'rgba(0,0,0,0)');
                    var nameAttr = $(this).attr('data-th');
                    delete DataTable.pickedAttrDict[nameAttr];
                    console.log('txt clicked ', txt, nameAttr, DataTable.pickedAttrDict);
                }

                var ran = Main.attrDict[d.name]['range'];
                var fac = Math.abs(+ran[0] - +ran[1]) * DataTable.ratioSelect;
                var idList = [];
                //find data ids which will be effected on selecting this value
                data.forEach(function (m) {
                    if (Math.abs(m[d.name] - d.value) < fac) {
                        idList.push(m.id);
                    }
                })

                for (var k = 0; k < idList.length; k++) {
                    var back = $("#tr_" + idList[k]).find('.td_' + d.name).css('background-color');
                    console.log('background color clikced now ', back);
                    // $("#tr_" + idList[k]).find('.td_' + d.name).css('background', Main.colors.HIGHLIGHT);
                    if (back.toString() == "rgba(0, 0, 0, 0)" || typeof back == 'undefined')  {
                        $("#tr_" + idList[k]).find('.td_' + d.name).css('background', Main.colors.HIGHLIGHT);
                    }else{
                        $("#tr_" + idList[k]).find('.td_' + d.name).css('background', 'rgba(0,0,0,0)');
                    }
                }
                console.log('background ', idList, fac)
                // $(this).css('background', 'cyan')
            })


        if (!DataTable.viewFullTable) {
            DataTable.dragFunction();
            $('#tableContent').css('background', Main.colors.HIGHLIGHT);

        } else {
            $('#tableContent').css('background', 'white');
        }
    };



}());