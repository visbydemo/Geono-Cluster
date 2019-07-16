(function () {

    ClusterModeler = {};

    ClusterModeler.forceTickStart = false;
    ClusterModeler.translate = "";
    ClusterModeler.scale = "";

    ClusterModeler.selectedCluster = -1;
    ClusterModeler.selectedNodeId = -1;
    ClusterModeler.deletedNodesData = [];
    ClusterModeler.centroidHullDict = {};
    ClusterModeler.draggedNodeId = -1;

    ClusterModeler.hullTipCount = 0;
    ClusterModeler.lastClusterId = 0;

    ClusterModeler.initial = false;
    ClusterModeler.hullDragDelete = true;
    ClusterModeler.hullDragging = false;
    ClusterModeler.hullClicked = false;

    ClusterModeler.timeIt = true;

    ClusterModeler.clusterIds = [];
    ClusterModeler.clusterCenterPos = {};

    ClusterModeler.searchedTextArr = [];
    ClusterModeler.selectedAttributes = [];


    //variables for multiple cluster recommendations
    ClusterModeler.numRecommendations = 3;
    ClusterModeler.numClusters = 5;
    ClusterModeler.allModelData = {}; // { id : 0, data : Main.trainData []}
    ClusterModeler.selectedModelId = -1;


    ClusterModeler.lassoMode = false;
    ClusterModeler.lassoIds = [];
    ClusterModeler.positionVals = {}



    ClusterModeler.searchQueryHandler = function (results) {
        results = results.split(' ');
        ClusterModeler.searchedTextArr.push.apply(ClusterModeler.searchedTextArr, results);
        results = ClusterModeler.searchedTextArr;
        // results = results.toLowerCase();        
        var dataIn = [];
        for (var i = 0; i < Main.trainDataCopy.length; i++) {
            var str = Main.trainDataCopy[i][Main.entityName]
            str = str.toLowerCase();
            for (var j = 0; j < results.length; j++) {
                // console.log(' str is ', str, results)
                results[j] = results[j].toLowerCase();
                if (str.includes(results[j])) {
                    dataIn.push(Object.assign({}, Main.trainDataCopy[i]))
                }
            }
        }
        // console.log(' query value is ', results, Main.trainDataCopy, dataIn);
        Main.trainData = Util.deepCopyData(dataIn);
        ClusterModeler.getClustering(true);
    }

    ClusterModeler.showKeywords = function () {
        var htmlStr = "";
        for (var i = 0; i < ClusterModeler.searchedTextArr.length; i++) {
            htmlStr += "<span class = 'keywordsItem' id ='keywords_" + i + "' > " + ClusterModeler.searchedTextArr[i] + " </span>";
        }
        $("#keywordsList").append(htmlStr);

        $(".keywordsItem").on('click', function () {
            var text = $(this).text();

            var index = ClusterModeler.searchedTextArr.indexOf(text.toString());
            console.log(' clicked text ', text.toString(), ClusterModeler.searchedTextArr, index);
            if (index > -1) {
                ClusterModeler.searchedTextArr.splice(index, 1);
                var results = ClusterModeler.searchedTextArr;
                var dataIn = [];
                for (var i = 0; i < Main.trainDataCopy.length; i++) {
                    var str = Main.trainDataCopy[i][Main.entityName]
                    str = str.toLowerCase();
                    for (var j = 0; j < results.length; j++) {
                        // console.log(' str is ', str, results)
                        results[j] = results[j].toLowerCase();
                        if (str.includes(results[j])) {
                            dataIn.push(Object.assign({}, Main.trainDataCopy[i]))
                        }
                    }
                }
                // console.log(' query value is ', results, Main.trainDataCopy, dataIn);
                Main.trainData = Util.deepCopyData(dataIn);
                ClusterModeler.getClustering(true);
            }
        })
    }

    ClusterModeler.lassoDataMerge = function () {
        if (ClusterModeler.lassoIds.length == 0) return;
        var clusterNotEffectedId = [];
        var lassoClusters = [];
        var defId = ClusterModeler.lassoIds[0];
        var dataItem = Main.getDataById(defId, Main.currentData);
        var clusterDef = dataItem['cluster'];
        for (var i = 0; i < ClusterModeler.lassoIds.length; i++) {
            var data = Main.getDataById(ClusterModeler.lassoIds[i], Main.currentData);
            lassoClusters.push(data['cluster']);
            data['cluster'] = clusterDef;
        }
        lassoClusters = Util.getUniqueArray(lassoClusters);
        for (var i = 0; i < ClusterModeler.lastClusterId + 1; i++) {
            var index = lassoClusters.indexOf(i);
            if (index != -1) continue;
            clusterNotEffectedId.push(i)
        }

        // console.log('merged lasso data ', ClusterModeler.lassoIds);
        ClusterModeler.lassoIds = [];
        ClusterModeler.update(Main.currentData, clusterNotEffectedId);
        setTimeout(() => {
            ClusterModeler.addLasso();
        }, 100);
    }

    ClusterModeler.lassoAutoClusterEffect = function () {
        if (ClusterModeler.lassoIds.length == 0) return;
        var addCluster = true;
        var defId = ClusterModeler.lassoIds[0];
        var dataItem = Main.getDataById(defId, Main.currentData);
        var clusterDef = dataItem['cluster'];
        for (var i = 0; i < ClusterModeler.lassoIds.length; i++) {
            var data = Main.getDataById(ClusterModeler.lassoIds[i], Main.currentData);
            if (data['cluster'] != clusterDef) {
                addCluster = false;
                break;
            }
        } // end of for loop
        if (addCluster) {
            setTimeout(() => {
                // console.log('auto adding cluster ', ClusterModeler.lassoIds)
                ClusterModeler.lassoAddCluster();
            }, 50);
        } else {
            //merge the clusters
            setTimeout(() => {
                //  console.log('auto merging clusters ');
                ClusterModeler.lassoDataMerge();

            }, 50);
        }
    }

    ClusterModeler.lassoAddCluster = function () {
        if (ClusterModeler.lassoIds.length == 0) return;
        var clusterNotEffectedId = [];
        var lastCluster = +ClusterModeler.lastCluster;
        var clusterDef = +ClusterModeler.lastClusterId + 1;


        var lassoClusters = [];
        for (var i = 0; i < ClusterModeler.lassoIds.length; i++) {
            var data = Main.getDataById(ClusterModeler.lassoIds[i], Main.currentData);
            lassoClusters.push(data['cluster']);
            data['cluster'] = clusterDef;
        }
        lassoClusters = Util.getUniqueArray(lassoClusters);
        for (var i = 0; i < clusterDef + 1; i++) {
            var index = lassoClusters.indexOf(i);
            if (index != -1 || i == clusterDef) continue;
            clusterNotEffectedId.push(i)
        }

        ClusterModeler.lastClusterId = clusterDef;
        console.log('added a new cluster lasso data ', ClusterModeler.lassoIds);
        ClusterModeler.lassoIds = [];
        ClusterModeler.update(Main.currentData, clusterNotEffectedId);
        setTimeout(() => {
            //    ClusterModeler.numClusters += 1;
            //    ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters'] = ClusterModeler.numClusters;
            ClusterModeler.addLasso();
        }, 100);
    }

    ClusterModeler.addContextMenu = function () {
        //add context menu on rows
        setTimeout(() => {
            $.contextMenu({
                selector: "#clusterDivSvg",
                callback: function (key, options) {
                    // var id = $(this).attr("id");
                    // var idNum = Util.getNumberFromText(id);

                    // var m = "clicked: " + key + " on " + $(this).attr('id');
                    // console.log("key and options found ", m, key, idNum);

                    if (key == "merge") {
                        console.log('lets merge data ', ClusterModeler.lassoIds);
                        ClusterModeler.lassoDataMerge();
                        // dv.addDataIn(idNum);
                    } else if (key == "add") {
                        console.log('lets drag data ', ClusterModeler.lassoIds);
                        // dv.removeData();
                        ClusterModeler.lassoAddCluster();
                    }
                },
                items: {
                    merge: {
                        name: "Merge",
                        icon: ""
                    },
                    add: {
                        name: "Add Cluster",
                        icon: ""
                    },
                    // update_data: { name: "Update Data", icon: "" },
                }
            });

        }, 100);
    }

    ClusterModeler.toggleLassoMode = function () {
        ClusterModeler.lassoMode = !ClusterModeler.lassoMode;
        if (ClusterModeler.lassoMode) {
            $("#clusterDivSvg").css('border', '1px solid ' + Main.colors.HIGHLIGHT);
            ClusterModeler.addLasso();
            ClusterModeler.addContextMenu();
            setTimeout(() => {
                ClusterModeler.removeLasso();
                ClusterModeler.addLasso();
            }, 200);


        } else {
            $("#clusterDivSvg").css('border', '1px solid transparent');
            // $(".context-menu-one").remove();
            ClusterModeler.lassoIds = [];
            ClusterModeler.removeLasso();
            d3.selectAll('.node').style('fill', function (d) {
                    return ClusterModeler.color(d.cluster);
                })
                .style('stroke', null)
                .attr('r', ClusterModeler.radius);
        }
    }


    ClusterModeler.addIcons = function (containerId = "") {

        if (containerId == "") {
            containerId = "clusterDivSvg";
        }
        $("#clusterControlDiv").remove();

        var htmlStr = "<div id='clusterControlDiv'></div>";
        $("#" + containerId).append(htmlStr);


        htmlStr = "<div class='iconHolder' id='deleteBtn' onclick='ClusterModeler.removeData()' title='Remove Cluster or Node'>" //ClusterModeler.removeData()
        htmlStr += "<img class='imgIcon' src='static/img/icons/delete.png'></div>";
        htmlStr += "<div class='iconHolder' id='resetClusterBtn' onclick='' title='Reset Clusters'>"
        htmlStr += "<img class='imgIcon' src='static/img/icons/reset.png'></div>"
        htmlStr += "<div class='iconHolder' id='seeRecommBtn' onclick='' title='See Recommendations'>"
        htmlStr += "<img class='imgIcon' src='static/img/icons/add.png'></div>"
        htmlStr += "<div class='iconHolder' id='toggleLasso' onclick='' title='Toggle Lasso Mode'>"
        htmlStr += "<img class='imgIcon' src='static/img/icons/lassomake.png'></div>"
        if (Main.commonVars.DEBUG) {
            htmlStr += "<div class='selectAttr'><input class = 'searchBoxCl' type='text' value=''><div id ='keywordsList'></div></div>"
            htmlStr += "<div class = 'selectAttr' ><select class='selectAttrPicker selectpickers' multiple>" //selectpicker

            for (var item in Main.attrDict) {
                htmlStr += "<option>" + item + "</option>"
            }
            htmlStr += "</select></div>"
        }
        htmlStr += "<div class='iconHolder' ><fieldset><input type='file' name='File Upload' id='txtFileUpload' accept='.csv' /></fieldset></div>";

        $("#clusterControlDiv").append(htmlStr);


        $("#txtFileUpload").on('change', function (evt) {
            var file = evt.target.files[0];
            var reader = new FileReader();
            reader.readAsText(file);
            reader.onload = function (event) {
                Main.outerData = $.csv.toObjects(event.target.result);
                //Jquery.csv
                console.log(' file result ', Main.outerData);
                // document.location.reload();
                setTimeout(() => {
                    Main.resetViewsAndData();
                    Main.init(true);
                }, 100);
            };
        })


        $('.selectAttrPicker').on('change', function (e) {

            var values = $(this).val();
            console.log('valuesa re ', values)
            if (values != null) ClusterModeler.selectedAttributes = values;
            else ClusterModeler.selectedAttributes = [];
        })

        $(".selectAttr").css('width', 'auto');
        $(".selectAttr").css('padding', '2px');
        $("#clusterControlDiv").css('display', 'flex');
        $("#clusterControlDiv").css('position', 'absolute');
        $("#clusterControlDiv").css('width', 'auto');
        // $("#clusterControlDiv").css('height', '30px');
        // $("#clusterControlDiv").css('background', Main.colors.LIGHTGRAY);
        $("#clusterControlDiv").css('border-bottom', '1px solid lightgray');

        $('.searchBoxCl').on('keypress', function (e) {
            var typed = $(this).val();
            console.log(' typed value is ', typed)
            if (e.keyCode == 13) {
                console.log('enter called , ', typed);
                ClusterModeler.searchQueryHandler(typed);
            }
        })

        $('#toggleLasso').on('click', function () {
            ClusterModeler.toggleLassoMode();
        })


        // $('#addAllData').on('click', function () {
        //     Main.trainData = Util.deepCopyData(Main.trainDataCopy);
        //     ClusterModeler.getClustering(true);
        // })


        $("#seeRecommBtn").on('click', function () {

            if ($(".recomPanel")[0]) {
                $(".recomPanel").toggle();
            } else {
                var htmlStr = "<div class ='recomPanel'></div>"
                $("#" + containerId).prepend(htmlStr);

                $(".recomPanel").css("position", "absolute");
                $(".recomPanel").css("margin-top", "30px");
                // $(".recomPanel").css("margin-left", "1px");
                $(".recomPanel").css("display", "block");
                // $(".recomPanel").css("flex-direction", "column");
                $(".recomPanel").css("border", "1px solid lightgray");
                $(".recomPanel").css("padding", "5px");
                $(".recomPanel").css("width", "200px");
                $(".recomPanel").css("min-height", "400px");
                $(".recomPanel").css("max-height", "600px");
                // $(".recomPanel").css("height", "600px");
                $(".recomPanel").css("z-index", "20");
                $(".recomPanel").css("overflow-y", "auto");

                htmlStr = ""
                for (var i = 0; i < ClusterModeler.numRecommendations; i++) {
                    htmlStr += "<div class = 'recomBox' id ='recomBox_" + i + "' ></div>"
                }

                $(".recomPanel").append(htmlStr);

                $(".recomBox").css("display", "flex");
                $(".recomBox").css("border", "1px solid lightgray");
                $(".recomBox").css("width", "100%");
                $(".recomBox").css("height", "150px");
                $(".recomBox").css("background", "white");

                $('#recomBox_' + ClusterModeler.selectedModelId).css('border', '2px solid black')


                $('.recomBox').click(function () {
                    $(".recomBox").css("border", "1px solid lightgray");
                    $(this).css('border', '2px solid black');
                    var id = $(this).attr('id');
                    var idNum = Util.getNumberFromText(id);

                    if (idNum != ClusterModeler.selectedModelId) {
                        ClusterModeler.selectedModelId = idNum;
                        console.log('clicked recom box ', id, ClusterModeler.selectedModelId);
                        var dataG = ClusterModeler.allModelData[ClusterModeler.selectedModelId]['data'];

                        ClusterModeler.numClusters = ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters'];
                        dataG = Util.deepCopyData(dataG);
                        Metrics.addGlobalResults(dataG);
                        Metrics.featureWeights();
                        ClusterModeler.addIcons();
                        LocalInfoCluster.removeClusterCards();
                        ClusterModeler.makeD3ClusterVis(dataG);
                    }


                })

                $('.recomBox').hover(function () {
                        $(".recomBox").css("background", "white");
                        $(this).css('background', 'lightgray');

                    },
                    function () {
                        $(".recomBox").css("background", "white");
                    })

            }

            for (var i = 0; i < ClusterModeler.numRecommendations; i++) {
                ClusterOthers.makeD3ClusterVisOther("recomBox_" + i);
            }




        })

        ClusterModeler.showKeywords();

    }

    ClusterModeler.getRecommendedClustering = function () {
        var objSend = {
            data: Main.trainData,
            numClusters: ClusterModeler.numClusters,
            numRecomends: ClusterModeler.numRecommendations,
        }
        socket.emit("find_recommend", objSend);

        socket.on("on_clustering_recieve", function (dataGet) {
            socket.off('on_recommend_recieve');
            socket.off('find_recommend');
            return

        })
    }

    ClusterModeler.getClustering = function (
        firstTime = true,
        addAll = false,
        dataGiven = Main.trainData,
        index = 0,
        preClusterLen = 0,
        singleRowDrag = false,
        onDragDrop = false) {
        var numClus = ClusterModeler.numClusters;
        if (index != 0) numClus = parseInt(Util.getRandomNumberBetween(ClusterModeler.numClusters, ClusterModeler.numClusters - 3));
        if (numClus < 1) numClus = ClusterModeler.numClusters;

        if (index == ClusterModeler.numRecommendations - 1 && onDragDrop) {
            ClusterModeler.numClusters = 1;
            numClus = 1;
        }

        if (numClus == 0) {
            numClus = 1;
            ClusterModeler.numRecommendations = 1;
        }



        dataGiven.forEach(function (d) {
            d['id'] = d['id'].toString();
        })

        var wts = {};
        try {
            wts = ClusterModeler.allModelData[index]['userDefinedAttrbWt'];
        } catch (er) {}
        if (wts == null) wts = {};

        // numClus = ClusterModeler.numClusters;
        var objSend = {
            data: dataGiven, //Main.trainData,
            numClusters: numClus,
            id: index,
            clusterLen: preClusterLen,
            userWts: wts
        }

        // if(dataGiven.length == 1) {
        if (singleRowDrag) {
            // dataGiven.forEach(function (d, i) {
            //     d.cluster += 1;
            // })
            numClus = ClusterModeler.clusterIds.length;
            preClusterLen = numClus;
            objSend = {
                data: dataGiven, //Main.trainData,
                numClusters: numClus,
                id: index,
                clusterLen: preClusterLen,
                userWts: wts
            }
            var newDataObj = Object.assign({}, objSend);


            console.log('sending data but 1 length ', objSend)

            // var dataTemp = Util.deepCopyData(Main.currentTempStoreData);
            // dataTemp.push.apply(dataTemp, dataGiven); // added 

            newDataObj['data'] = Util.deepCopyData(dataGiven);
            ClusterModeler.allModelData[objSend['id']] = newDataObj;
            ClusterModeler.selectedModelId = newDataObj['id'];

            Main.currentData = Util.deepCopyData(dataGiven);
            dataGiven = Util.deepCopyData(Main.currentData); // added
            ClusterModeler.nodes = [];

            Metrics.externalCoeff = (Util.getRandomNumberBetween(1, 0)).toFixed(4);
            Metrics.addGlobalResults(dataGiven);
            Metrics.featureWeights();
            ClusterModeler.addIcons();
            ClusterModeler.makeD3ClusterVis(dataGiven);
            return;
        }




        console.log('sending data obtained ', objSend, Main.currentData)

        if (firstTime) {
            socket.emit("find_clustering", objSend);
            socket.off('find_clustering');
            socket.removeAllListeners('on_clustering_recieve');
            socket.on("on_clustering_recieve" + objSend['id'], function (dataObj) {

                var newDataObj = Object.assign({}, dataObj);




                dataObj['clusterCen'] = JSON.parse(dataObj['clusterCen'])
                dataObj['colHeaders'] = JSON.parse(dataObj['colHeaders'])
                dataGet = dataObj['data'];
                var numClusters = dataObj['numClusters']

                LocalInfoCluster.clusterWtObj = {};
                LocalInfoCluster.clusterWtObj = dataObj['clusterCen']
                // for (var i = 0; i < dataObj['colHeaders'].length; i++) {
                //     var head = dataObj['colHeaders'][i];
                //     var objWts = dataObj['clusterCen'][i];
                //     if (objWts == null) {
                //         objWts = {}
                //         for (var j = 0; j < numClusters; j++) {
                //             objWts[j] = 0;
                //         }
                //     }
                //     LocalInfoCluster.clusterWtObj[head] = objWts;
                // }

                console.log('data obtained after clustering ', dataObj, LocalInfoCluster.clusterWtObj);
                LocalInfoCluster.computeLocalWeights();
                Metrics.globalAttrWts(); //computes Metrics.clusterAttrGlobal

                //   Main.trainData = dataGet.slice(0);
                // Main.trainData.forEach(function (d, i) {
                dataGiven.forEach(function (d, i) {
                    d.cluster = dataGet[i]['cluster'];
                })

                var dataTemp = Util.deepCopyData(Main.currentTempStoreData);
                dataTemp.push.apply(dataTemp, dataGiven); // added 


                newDataObj['data'] = Util.deepCopyData(dataTemp);
                newDataObj['localClusterWtObj'] = LocalInfoCluster.clusterWtObj;
                newDataObj['globalClusterWtObj'] = Metrics.clusterAttrGlobal;
                newDataObj['localTopAttrb'] = LocalInfoCluster.clusterAttrContrb;
                newDataObj['userDefinedAttrbWt'] = {};
                ClusterModeler.allModelData[dataObj['id']] = newDataObj;
                ClusterModeler.selectedModelId = dataObj['id'];
                // ClusterModeler.numClusters = numClus + preClusterLen;
                ClusterModeler.numClusters = newDataObj['numClusters']
                console.log('num cluster goten ', ClusterModeler.numClusters)


                Main.currentData = Util.deepCopyData(dataTemp);
                dataGiven = Util.deepCopyData(Main.currentData); // added
                ClusterModeler.nodes = []


                Metrics.externalCoeff = (Util.getRandomNumberBetween(1, 0)).toFixed(4);


                if (firstTime) {
                    console.log('first time only update ', addAll, ClusterModeler.selectedModelId, objSend['id'])
                    Metrics.addGlobalResults(dataGiven);
                    Metrics.featureWeights();
                    ClusterModeler.addIcons();
                    //added to only render once 
                    if (objSend['id'] == ClusterModeler.numRecommendations - 1 || addAll) ClusterModeler.makeD3ClusterVis(dataGiven);
                } else {
                    console.log('first time not ')
                    Metrics.updateGlobalResults(dataGiven);
                    // ClusterModeler.makeD3ClusterVis();
                }
                // socket.off = socket.removeListener;
                // socket.off('find_clustering');
                socket.off('on_clustering_recieve' + objSend['id']);
                return

            });
        }
        return
    }

    ClusterModeler.removeData = function () {}

    ClusterModeler.tipHullWindow = function (d, idVal) {

        var disp = $("#tip_Hull" + idVal).remove()
        console.log('hill tip disp ', disp);

        ClusterModeler.hullTipCount += 1;

        ClusterModeler.tipHull = d3
            .select("body")
            .append("div")
            .attr("class", "tipHull")
            .attr("id", "tip_Hull" + idVal);


        // d3.selectAll("#tip_Hull" + containerId)
        d3.selectAll(".tipHull")
            .style("position", "absolute")
            .style("display", "flex")
            .style("min-width", "80px")
            .style("height", "auto")
            .style("background", "none repeat scroll 0 0 #ffffff")
            .style("border", "1px solid #6F257F")
            .style("padding", "3px")
            .style("text-align", "center");


        var htmlStr = "<div class = 'tipHullHeader'><span class = 'topHead' > Cluster ID : " + d.key + "</span>";
        htmlStr += "<span> Members : " + d.values.length + "</span></div>";
        htmlStr += "<div class = 'tipHullContent' ><div>Local Coeff : " + Util.getRandomNumberBetween(10, 0).toFixed(4) + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>Origin : " + 2 + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>Cluster : " +  3 + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>MPG : " + 4+ "</div>";

        ClusterModeler.tipHull
            .style("left", d3.event.pageX + 35 + "px")
            .style("top", d3.event.pageY - 75 + "px")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "start")
            .style("font-size", "0.75em")
            .style("padding", "4px")
            .html(htmlStr);

        $(".topHead").css("font-weight", "bold");

        $(".tipHullHeader").css("display", "flex");
        $(".tipHullHeader").css("flex-direction", "column");
        $(".tipHullHeader").css("align-items", "start");
        $(".tipHullHeader").css("width", "100%");
        $(".tipHullHeader").css('background', 'lightgray');
        $(".tipHullHeader").css("padding", "4px");

        $(".tipHullContent").css("display", "flex");
        $(".tipHullContent").css("flex-direction", "column");
        $(".tipHullContent").css("align-items", "start");
        $(".tipHullContent").css("width", "100%");
        $(".tipHullContent").css("background", "transparent");
        // $(".tooltipModelContent").css("padding", "4px");

        setTimeout(() => {
            $("#tip_Hull" + idVal).show();
        }, 100);

        // console.log('showed it ', idVal)

    }

    ClusterModeler.hideTipHull = function () {
        $(".tipHull").css("display", "none");
        d3.selectAll('path').style("stroke", ClusterModeler.groupFill)

    }


    ClusterModeler.tooltipWindow = function (d, tooltip) {


        // console.log(' here tooltip is ', d, tooltip)


        var htmlStr = "<div class = 'tooltipModelHeader'><span class = 'topHead' > Data ID : " + d.id + "</span>";
        htmlStr += "<span> Name : " + d[Main.entityName] + "</span></div>";
        for (var i = 0; i < Main.tooltipDictArr.length; i++) {
            htmlStr += "<div class = 'tooltipModelContent' ><div>" + Main.tooltipDictArr[i] + " : " + d[Main.tooltipDictArr[i]] + "</div>";
        }



        // htmlStr += "<div class = 'tooltipModelContent' ><div> Name : " + d.Model + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>Origin : " + d.Origin + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>Cluster : " + d.cluster + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>MPG : " + d.MPG + "</div>";
        // htmlStr += "<div class = 'tooltipModelContent' ><div>Cylinders : " + d.Cylinders + "</div>";

        tooltip
            .style("left", d3.event.pageX + 35 + "px")
            .style("top", d3.event.pageY - 75 + "px")
            .style("display", "flex")
            .style("position", "absolute")
            .style("border", "1px solid gray")
            .style("flex-direction", "column")
            .style("align-items", "start")
            .style("font-size", "0.75em")
            .style("padding", "4px")
            .html(htmlStr);

        $(".topHead").css("font-weight", "bold");

        $(".tooltipModelHeader").css("display", "flex");
        $(".tooltipModelHeader").css("flex-direction", "column");
        $(".tooltipModelHeader").css("align-items", "start");
        $(".tooltipModelHeader").css("width", "100%");
        $(".tooltipModelHeader").css('background', 'lightgray');
        $(".tooltipModelHeader").css("padding", "4px");

        $(".tooltipModelContent").css("display", "flex");
        $(".tooltipModelContent").css("flex-direction", "column");
        $(".tooltipModelContent").css("align-items", "start");
        $(".tooltipModelContent").css("width", "100%");
        $(".tooltipModelContent").css("background", "transparent");
        // $(".tooltipModelContent").css("padding", "4px");

    }

    ClusterModeler.posClusterCenters = function (w, h) {
        console.log('cluster pos w h ', w, h, ClusterModeler.clusterIds, ClusterModeler.clusterCenterPos)
        // var row = 3;
        // var col = Math.ceil(ClusterModeler.clusterIds.length/row);
        // var xp = w/row;
        // var yp = h/col;

        var k = 0.75,
            l = 1 - k;

        if (ClusterModeler.clusterIds.length > 6) {
            k = 0.80
            l = 1 - k
        }

        if (ClusterModeler.clusterIds.length > 7) {
            k = 0.85
            l = 1 - k
        }

        if (ClusterModeler.clusterIds.length >= 8) {
            k = 0.95
            l = 1 - k
        }

        //random pos
        // for(var i=0;i<ClusterModeler.clusterIds.length;i++){
        //     var xp = Util.getRandomNumberBetween(w*k, w*l);
        //     var yp = Util.getRandomNumberBetween(h*k, h*l);
        //     ClusterModeler.clusterCenterPos[ClusterModeler.clusterIds[i]] = { x : xp, y : yp }
        // }

        var cenX = w * 0.5;
        var cenY = h * 0.5;

        var numPt = 100;
        var ptArr = [];
        var dx = 100;
        var dy = 100;
        var xp = dx;
        var yp = dy;

        var fac = 0.85;
        for (var i = 0; i < numPt; i++) {
            if (xp > w * fac) {
                xp = dx;
                yp += dy;
            }
            ptArr.push({
                x: xp,
                y: yp
            });
            xp += dx;
        }


        ptArr.sort(function (a, b) {
            var diffX = Math.abs(cenX - a.x);
            var diffY = Math.abs(cenY - a.y);
            var dist1 = Math.sqrt(diffX * diffX + diffY * diffY);
            var diffX = Math.abs(cenX - b.x);
            var diffY = Math.abs(cenY - b.y);
            var dist2 = Math.sqrt(diffX * diffX + diffY * diffY);
            if (dist1 > dist2) {
                return 1;
            } else {
                return -1;
            }
        })

        for (var i = 0; i < ClusterModeler.clusterIds.length; i++) {
            ClusterModeler.clusterCenterPos[i] = ptArr[i]; // changed to 'i' from 'ClusterModeler.clusterIds[i]'
        }
        console.log('cluster pos centers ', ClusterModeler.clusterCenterPos)

    }

    /*
    adds d3 cluster modeling vis
    */
    ClusterModeler.makeD3ClusterVis = function (dataIn = Main.trainData, containerId = "") {

        if (containerId == "") {
            containerId = "clusterDivSvg";
        }
        var svgId = "clusterSvgId_" + containerId;
        $("#" + svgId).remove();
        // $("#" + containerId).empty();

        ClusterModeler.radius = 8
        var w = 960,
            h = 500,
            n = 100,
            m = ClusterModeler.numClusters,
            // radius = 7,
            maxRadius = 10,
            padding = 4, // separation between same-color nodes
            clusterPadding = 12,
            fill = d3.scale.category20();

        ClusterModeler.nodes = d3.range(100).map(Object);

        var min_zoom = 0.1;
        var max_zoom = 7;
        var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom])
        console.log('in make num cluster ', ClusterModeler.numClusters)
        var m = ClusterModeler.numClusters;
        var clusters = new Array(m);
        // var dataNew = Main.trainData.slice(0);
        var dataNew = Util.deepCopyData(dataIn);


        // console.log("nodes are ", nodes, d3.range(100))



        w = $("#" + containerId).width() * 0.98;
        h = $("#" + containerId).height() * 0.98;

        var vis = d3.select("#" + containerId).append("svg")
            .attr("id", svgId)
            .attr("width", w)
            .attr("height", h)
            .on("click", function (d) {
                d3.event.stopPropagation();
                ClusterModeler.hideTipHull();
                if (!ClusterModeler.hullClicked) LocalInfoCluster.removeClusterCards();
                // DataTable.makeTable(dataNew);
            })





        ClusterModeler.updateLayoutPack = function () {
            var lay = false;
            ClusterModeler.nodes = Main.trainData.map(function (d, i) {
                var b = Math.floor(Math.random() * m)
                d.fixed = false;
                d.radius = ClusterModeler.radius; // Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius;
                // d.radius = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
                // d.radius = Util.getRandomNumberBetween(30,9)
                // d.x = Math.cos(i / m * 2 * Math.PI) * 200 + w / 2 + Math.random();
                // d.y = Math.sin(i / m * 2 * Math.PI) * 200 + h / 2 + Math.random();
                d.cluster = +d.cluster;
                d.x = +Util.getRandomNumberBetween(w, 0)
                d.y = +Util.getRandomNumberBetween(h, 0)
                // d.x = w*0.5;
                // d.y = h*0.5;
                // if (!clusters[i]) clusters[i] = d; //|| (d.radius > clusters[i].radius)
                clusters[i] = d; //|| (d.radius > clusters[i].radius)
                return d;
            });


            // Use the pack layout to initialize node positions.
            if (lay) {
                console.log('layoutting')
                d3.layout.pack()
                    .sort(null)
                    .size([w, h])
                    .children(function (d) {
                        return d.values;
                    })
                    .value(function (d) {
                        return d.radius * d.radius;
                    })
                    .nodes({
                        values: d3.nest()
                            .key(function (d) {
                                return d.cluster.toString();
                            })
                            .entries(ClusterModeler.nodes)
                    });
            }
        }


        ClusterModeler.force = d3.layout.force()

            // d3.forceSimulation(ClusterModeler.nodes)
            .nodes(ClusterModeler.nodes)
            .links([])
            .size([w, h])
            .friction(0.75)
            // .distance(100)
            // .gravity(.02)
            // .charge(-50)
            // .gravity(0.002)//0.02
            // .charge(-50)//0
            // .theta(-3)
            .gravity(.02) //0.02
            .charge(-30) //0
            .start()
            .on('end', function (e) {
                // console.log('force ended')
                // ClusterModeler.makeTheHull()
            })


        $(".modelTooltip").remove();
        //tooltip addoon
        var tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "modelTooltip")
            .attr("id", "toolTip_" + containerId);



        d3.select("#toolTip_" + containerId)
            .style("position", "absolute")
            .style("display", "none")
            .style("min-width", "80px")
            .style("height", "auto")
            .style("background", "none repeat scroll 0 0 #ffffff")
            .style("border", "1px solid #6F2515757F")
            .style("padding", "3px")
            .style("text-align", "center");


        ClusterModeler.update = function (dataIn = Main.trainData, idsNotUpdate = []) {

            console.log(' in update ', idsNotUpdate, ClusterModeler.numClusters)
            dataIn = Util.deepCopyData(dataIn);
            //////////////////////////////////////////////////////////////////////////////
            m = ClusterModeler.numClusters;
            ClusterModeler.color = d3.scale.category20()
                .domain(d3.range(m));
            clusters = new Array(m);
            // d3.selectAll('path').remove();
            var lay = false
            ClusterModeler.lastClusterId = 0;
            ClusterModeler.clusterIds = [];
            ClusterModeler.nodes = dataIn.map(function (d, i) {
                var b = Math.floor(Math.random() * m)
                d.fixed = false;
                d.radius = 8; //ClusterModeler.radius; // Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius;
                // d.radius = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
                // d.radius = Util.getRandomNumberBetween(30,9)
                // d.x = Math.cos(i / m * 2 * Math.PI) * 200 + w / 2 + Math.random();
                // d.y = Math.sin(i / m * 2 * Math.PI) * 200 + h / 2 + Math.random();
                d.cluster = +d.cluster;
                if (d.cluster > ClusterModeler.lastClusterId) ClusterModeler.lastClusterId = d.cluster;

                if (ClusterModeler.clusterIds.indexOf(d.cluster) == -1) ClusterModeler.clusterIds.push(+d.cluster);
                // d.x = +Util.getRandomNumberBetween(w, 0)
                // d.y = +Util.getRandomNumberBetween(h, 0)
                // d.x = w*0.5;
                // d.y = h*0.5;
                // if (!clusters[i]) clusters[i] = d; //|| (d.radius > clusters[i].radius)
                clusters[i] = d; //|| (d.radius > clusters[i].radius)
                // console.log('found update d ', d)
                return d;
            });


            // console.log('updateing cluster id ', ClusterModeler.clusterIds, ClusterModeler.lastClusterId)
            console.log('update cluster id ', ClusterModeler.nodes);
            // return;
            ClusterModeler.posClusterCenters(w, h);


            // Use the pack layout to initialize node positions.
            // if (lay) {
            //     console.log('layoutting')
            //     d3.layout.pack()
            //         .sort(null)
            //         .size([w, h])
            //         .children(function (d) {
            //             return d.values;
            //         })
            //         .value(function (d) {

            //             return d.radius * d.radius;
            //         })
            //         .nodes({
            //             values: d3.nest()
            //                 .key(function (d) {
            //                     return d.cluster.toString();
            //                 })
            //                 .entries(ClusterModeler.nodes)
            //         });
            // }

            ClusterModeler.force
                .nodes(ClusterModeler.nodes)
                // .nodes(ClusterModeler.nodes, function (d) {
                //     if (Object.keys(ClusterModeler.positionVals).length > 0) {
                //         d.x = ClusterModeler.positionVals[d.id][0];
                //         d.y = ClusterModeler.positionVals[d.id][1];
                //         d.px = ClusterModeler.positionVals[d.id][0];
                //         d.py = ClusterModeler.positionVals[d.id][1];  
                //         d.x = 50;
                //         d.y = 50;
                //         d.px = 50;
                //         d.py = 50; 
                //     }
                //     return d;
                // })
                .links([])
                .start()








            // ClusterModeler.tipHull = d3
            //     .select("body")
            //     .append("div")
            //     .attr("class", "tipHull")
            //     .attr("id", "tip_" + containerId);

            // d3.select("#tip_" + containerId)
            //     .style("position", "absolute")
            //     .style("display", "none")
            //     .style("min-width", "80px")
            //     .style("height", "auto")
            //     .style("background", "none repeat scroll 0 0 #ffffff")
            //     .style("border", "1px solid #6F257F")
            //     .style("padding", "3px")
            //     .style("text-align", "center");




            //////////////////////////////////////////////////////////////////////////////////////







            var drag = ClusterModeler.force.drag()
                .on("dragstart", dragstart)
                .on("drag", dragmove)
                .on("dragend", dragend);


            // nodes = nodes.data(network.nodes, function (d) {
            //     return d.id;
            // });

            // var exitingNodes = nodes.exit();
            // exitingNodes.remove();
            // var newNodes = nodes.enter();

            // newNodes.append("g")

            // return

            //DATA ----
            var nodeData = vis.selectAll("circle").data(ClusterModeler.nodes);
            // var nodeData = d3.selectAll("circle.node")
            // .data(ClusterModeler.nodes, function (d,i) {
            //     console.log(' found , ', d.id)
            //     return d.id;//d.id
            // })

            // // transition
            // var t = d3.transition()
            //     .duration(750);
            // nodeData.exit()
            //     // .style("fill", "#b26745")
            //     .transition(t)
            //     .remove();



            // transition
            var t = d3.transition()
                .duration(100); // 750

            //EXIT ---
            nodeData.exit().remove();

            // ClusterModeler.force.start();

            //UPDATE ---
            nodeData
                .transition(t)
                // .style("fill", "#3a403d")
                .attr("r", function (d) {
                    return ClusterModeler.radius
                })
                .attr("cx", function (d) {
                    // console.log('update circle dx ', d.x)
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })


            //ENTER ---
            var node = nodeData.enter().append("circle")
                .attr("class", function (d) {
                    return "node node_" + d.id;
                })
                // .attr("cx", function (d) {
                //     return d.x;
                // })
                // .attr("cy", function (d) {
                //     return d.y;
                // })
                // .attr("r", ClusterModeler.radius)
                .style("fill", function (d) {
                    if (d.id == 25) console.log('distance coloring ', d.cluster, d.id)
                    return ClusterModeler.color(d.cluster);
                })
                // .style("stroke", function (d, i) {
                //     return d3.rgb(fill(i & 3)).darker(2);
                // })
                // .style("stroke-width", 1.5)
                .call(drag) //force.drag
                // .call(node_drag)
                .on("mouseover", function (d, i) {
                    if (ClusterModeler.hullDragging) return;
                    // console.log('data mouse overed d ', d)
                    ClusterModeler.tooltipWindow(d, tooltip);

                    if (d3.event.shiftKey) {
                        $("#tr_" + d.id).css('border', '3px solid black');
                        // $("#tr_"+d.id).css('background', 'orange');
                        cls = $("#tr_" + d.id).attr('class')
                        var num = cls.replace(/[^0-9]/g, '');
                        var lenTable = $('.trTable').length
                        var fullHeight = 5000; //5000;
                        var scrollAmount = fullHeight * (num / lenTable) - 200

                        // console.log(' class name ', cls, num, lenTable, scrollAmount );

                        // lastElementTop = $("#tr_" + d.id).position().top;
                        // modelPanelTop = $("#modelPanel").position().top;

                        // elementsHeight = $("#modelPanel").outerHeight(),
                        // console.log(' top found ', lastElementTop, modelPanelTop, elementsHeight)
                        // scrollAmount = lastElementTop - 2*elementsHeight;
                        $('#tableContent').animate({
                            scrollTop: scrollAmount
                        }, 300);
                    }



                    if (ClusterModeler.selectedNodeId != d.id) {
                        d3.select(this).style("stroke", "black");

                        d3.selectAll(".node").style("opacity", 0.2);
                        d3
                            .selectAll(".node_" + d.id)
                            .style("opacity", 1)
                            .style("stroke-width", '2px')
                            .style("stroke", 'black');


                        // to add other nodes with similar selected attrib values to the data
                        if (ClusterModeler.selectedAttributes.length > 0) {
                            for (var k = 0; k < Main.trainData.length; k++) {
                                var selected = true;
                                console.log(' selected starting check ', k, Main.trainData)
                                for (var m = 0; m < ClusterModeler.selectedAttributes.length; m++) {
                                    if (Main.trainData[k][ClusterModeler.selectedAttributes[m]] != d[ClusterModeler.selectedAttributes[m]]) {
                                        selected = false;
                                        break;
                                    }
                                }

                                if (selected) {

                                    d3.selectAll('.node_' + Main.trainData[k]['id'])
                                        // .style('fill', function (p) {
                                        //     p.cluster = d.cluster;
                                        //     return ClusterModeler.color(d.cluster)
                                        // })
                                        .style("opacity", 1)
                                        .style("stroke-width", '2px')
                                        .style("stroke", 'black');
                                }
                            }
                        }
                    }

                })
                .on("mouseout", function (d, i) {
                    if (ClusterModeler.hullDragging) return;
                    $('#tablePanel').animate({
                        scrollTop: 0
                    }, 4);
                    $("#tr_" + d.id).css('border', 'transparent');
                    // $("#tr_" + d.id).css('background', 'lightgray');
                    if (ClusterModeler.selectedNodeId != d.id) {
                        d3.selectAll(".node")
                            .style("opacity", 1)
                            .style("stroke-width", "None")
                            .style("stroke", "transparent")
                        d3
                            .selectAll(".node_" + d.id)
                            // .style("opacity", 1)
                            .style("stroke-width", "None")
                            .style("stroke", "transparent");

                        d3.select(this).style("stroke", "transparent");
                    }
                    tooltip.style("display", "none");

                })
                .on("mousedown", function (d, i) {
                    // $("#tr_" + d.id).css('border', '3px solid black');
                    // $("#tr_"+d.id).css('background', 'orange');
                    // cls = $("#tr_" + d.id).attr('class')
                    // var num = cls.replace(/[^0-9]/g, '');
                    // var lenTable = $('.trTable').length
                    // var fullHeight = 5000;
                    // var scrollAmount = fullHeight * (num / lenTable) - 200;
                    // $('#tablePanel').animate({ scrollTop: scrollAmount }, 300);
                    if (d3.event.defaultPrevented) return;
                    d3.event.preventDefault();
                    console.log('clicked ', d3.event)


                    // d3.event.defaultPrevented = true
                    if (ClusterModeler.draggedNodeId == d.id) return;
                    if (ClusterModeler.selectedNodeId == d.id) {
                        ClusterModeler.selectedNodeId = -1;
                        // $(".node_" + d.id).css('fill', ClusterModeler.color(d.cluster))
                        $(".node_" + d.id).css('stroke', "")
                        console.log('click behavior')
                    } else {
                        ClusterModeler.selectedNodeId = d.id;
                        // $(".node_" + d.id).css('fill', 'black')
                        $(".node").css('stroke', "")
                        $(".node_" + d.id).css('stroke', 'black')
                        $(".node_" + d.id).css('stroke-width', '5px')

                    }

                })


            setTimeout(() => {
                d3.selectAll('.node_' + ClusterModeler.selectedNodeId)
                    .style('stroke', 'black')
            }, 500);


            nodeData.transition()
                .duration(10)
                .delay(function (d, i) {
                    return i * 2;
                })
                .attrTween("r", function (d) {
                    var i = d3.interpolate(0, d.radius);
                    return function (t) {
                        return d.radius = i(t);
                    };
                });

            // Apply the general update pattern to the nodes.
            // node = node.data(nodes, function (d) { return d.name; });





            node.forEach(function (d, i) {
                // console.log('node data ', d, i)
            })


            function dragstart(d, i) {
                console.log('dragstarted')
                d3.event.sourceEvent.stopPropagation();
                ClusterModeler.force.stop() // stops the force auto positioning before you start dragging
                d.fixed = true;
            }

            function dragmove(d, i) {
                ClusterModeler.wasDragged = true;
                // console.log('drag moving ', d.id);
                d3.event.sourceEvent.stopPropagation();
                ClusterModeler.force.stop();
                d3.selectAll('.node_' + d.id).attr("cx", function (n) {
                    n.px = n.px + d3.event.dx;
                    n.x = n.x + d3.event.dx;
                    return n.x;
                }).attr("cy", function (n) {
                    n.py = n.py + d3.event.dy;
                    n.y = n.y + d3.event.dy;
                    return n.y;
                });
                // ClusterModeler.makeTheHull();
                ClusterModeler.draggedNodeId = d.id;
                ClusterModeler.selectedNodeId = d.id;
                $(".node").css('stroke', "");
                $(".node_" + d.id).css('stroke', 'black')
                $(".node_" + d.id).css('stroke-width', '5px')
                if (d3.event.x < 25 && d3.event.y < 25) {
                    ClusterModeler.deleteClusterNodes();
                }


            }

            function dragend(d, i) {
                // ClusterModeler.makeTheHull();
                if (!ClusterModeler.wasDragged) return;
                d3.event.sourceEvent.stopPropagation();
                // console.log('getting drag end ', d.cluster);
                ClusterModeler.wasDragged = false;

                var shortestDist = {
                    id: -1,
                    dist: 100000,
                    item: -1,
                    prevItem:-1,
                }
                for (var item in ClusterModeler.centroidHullDict) {
                    var cen = ClusterModeler.centroidHullDict[item]
                    var cenX = cen[0]
                    var cenY = cen[1]
                    var evX = d3.event.sourceEvent.x;
                    var evY = d3.event.sourceEvent.y;
                    var diffX = Math.abs(cenX - evX);
                    var diffY = Math.abs(cenY - evY);
                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);


                    // console.log("distance from ", item, dist, evX, evY, cenX, cenY, d3.event)
                    // console.log("distance from ", item, dist);
                    if (dist < ClusterModeler.radius * 15 && dist < shortestDist.dist) {
                        shortestDist.id = d.id
                        shortestDist.dist = dist;
                        shortestDist.item = item;
                        shortestDist.prevItem = d.cluster
                    }
                }



                if (shortestDist.id != -1) {
                    // console.log('distance found less')
                    var index = Main.getDataIndexById(d.id, Main.currentData);
                    console.log('found close ', index);
                    Main.currentData[index].cluster = shortestDist.item;
                    d.cluster = shortestDist.item;

                    d3.selectAll('.node_' + d.id)
                        .each(function (m) {
                            m.cluster = shortestDist.item;
                            m.fixed = false;
                            // console.log('fileterd, ', m)
                            return true;
                        })

                    // m = ClusterModeler.numClusters
                    //     ClusterModeler.color = d3.scale.category20()
                    //         .domain(d3.range(m));

                    d3.selectAll('.node_' + d.id)
                        .style('fill', function (p) {
                            p.cluster = shortestDist.item;
                            return ClusterModeler.color(shortestDist.item)
                        })
                    // ClusterModeler.force.resume(); // this worked last time


                    // to add other nodes with similar selected attrib values to the data
                    if (ClusterModeler.selectedAttributes.length > 0) {
                        for (var k = 0; k < Main.currentData.length; k++) {
                            var selected = true;
                            // console.log(' selected starting check ', k, Main.currentData)
                            for (var m = 0; m < ClusterModeler.selectedAttributes.length; m++) {
                                if (Main.currentData[k][ClusterModeler.selectedAttributes[m]] != d[ClusterModeler.selectedAttributes[m]]) {
                                    selected = false;
                                    // console.log(' selected cluster made false ', shortestDist.item, Main.currentData[k])
                                    break;
                                }
                            }
                            if (selected) {
                                console.log(' selected cluster ', shortestDist.item, Main.currentData[k])
                                Main.currentData[k]['cluster'] = shortestDist.item;
                                d3.selectAll('.node_' + Main.currentData[k]['id'])
                                    .style('fill', function (p) {
                                        p.cluster = shortestDist.item;
                                        return ClusterModeler.color(shortestDist.item)
                                    })
                            }
                        }
                    }

                    var clusterVal = [];
                    var clusterCount = 0;
                    Main.currentData.forEach(function (d) {
                        clusterVal.push(+d.cluster);
                    })
                    clusterVal = Util.getUniqueArray(clusterVal);
                    clusterVal.sort(function(a,b) { return a - b;});
                    ClusterModeler.numClusters = clusterVal.length;
                    ClusterModeler.clusterIds = clusterVal.slice();
                    ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters'] = ClusterModeler.numClusters;
                    //find clusters not effected
                    var clusterNotEffectedId = [];
                    for(var n = 0;n<ClusterModeler.clusterIds.length;n++){
                        // if(+ClusterModeler.clusterIds[n] == +d.key && +ClusterModeler.clusterIds[n] == item) continue;
                        if(+ClusterModeler.clusterIds[n] == shortestDist.item  || +ClusterModeler.clusterIds[n] == shortestDist.prevItem) continue;
                        clusterNotEffectedId.push(ClusterModeler.clusterIds[n]);
                    }
                    
                    
                    
                    ClusterModeler.update(Main.currentData, clusterNotEffectedId)
                    return;
                }

                // to add other nodes with similar selected attrib values to the data
                if (ClusterModeler.selectedAttributes.length > 0) {
                    for (var k = 0; k < Main.currentData.length; k++) {
                        var selected = true;
                        // console.log(' selected starting check ', k, Main.currentData)
                        for (var m = 0; m < ClusterModeler.selectedAttributes.length; m++) {
                            if (Main.currentData[k][ClusterModeler.selectedAttributes[m]] != d[ClusterModeler.selectedAttributes[m]]) {
                                selected = false;
                                // console.log(' selected cluster made false ', d.cluster, Main.currentData[k])
                                break;
                            }
                        }

                        if (selected) {
                            // console.log(' selected cluster ', d.cluster, Main.currentData[k])
                            Main.currentData[k]['cluster'] = d.cluster;

                            d3.selectAll('.node_' + Main.currentData[k]['id'])
                                .style('fill', function (p) {
                                    p.cluster = d.cluster;
                                    return ClusterModeler.color(d.cluster)
                                })
                        }
                    }
                }




                for (item in ClusterModeler.centroidHullDict) {
                    lastItem = item
                }


                var dataPt = Main.getDataById(d.id, Main.currentData);
                if (dataPt == null) console.log('data pt is null ', d.id, d)
                dataPt.cluster = +lastItem + 1;
                d.cluster = dataPt.cluster
                ClusterModeler.numClusters += 1;

                // console.log('datapt is ', dataPt, lastItem)

                // Metrics.updateGlobalResults();
                // ClusterModeler.updateLayoutPack();
                // ClusterModeler.makeD3ClusterVis();

                // ClusterModeler.update(Main.currentData); // commented

                // ClusterModeler.force.resume();

                // d.fixed = true;
            } // end of drag end


            vis.style("opacity", 1e-6)
                .transition()
                .duration(1000)
                .style("opacity", 1);


            // node.transition()
            //     .duration(750)
            //     .delay(function (d, i) {
            //         return i * 5;
            //     })
            //     .attrTween("r", function (d) {
            //         var i = d3.interpolate(0, d.radius);
            //         return function (t) {
            //             return d.radius = i(t);
            //         };
            //     });

            ClusterModeler.force.on("tick", tickSimulate);


            //zoom
            var nominal_base_node_size = 8;
            var nominal_text_size = 10;
            var max_text_size = 24;
            var nominal_stroke = 1.5;
            var max_stroke = 4.5;
            var max_base_node_size = 36;
            var size = d3.scale.pow().exponent(1)
                .domain([1, 100])
                .range([8, 24]);
            // vis.call(zoom);

            zoom.on("zoom", function () {
                // console.log('zooming ');
                ClusterModeler.hideTipHull();
                var circle = d3.selectAll(".node");
                var circle_center = d3.selectAll(".gridCenRect");
                var paths = d3.selectAll("path");
                var stroke = nominal_stroke;
                if (nominal_stroke * zoom.scale() > max_stroke) stroke = max_stroke / zoom.scale();
                circle.style("stroke-width", stroke);

                var base_radius = nominal_base_node_size;
                if (nominal_base_node_size * zoom.scale() > max_base_node_size) base_radius = max_base_node_size / zoom.scale();
                circle.attr("d", d3.svg.symbol()
                    .size(function (d) {
                        return Math.PI * Math.pow(size(d.size) * base_radius / nominal_base_node_size || base_radius, 2);
                    })
                    .type(function (d) {
                        return d.type;
                    }))

                circle_center.attr("d", d3.svg.symbol()
                    .size(function (d) {
                        return Math.PI * Math.pow(size(d.size) * base_radius / nominal_base_node_size || base_radius, 2);
                    })
                    .type(function (d) {
                        return d.type;
                    }))

                //circle.attr("r", function(d) { return (size(d.size)*base_radius/nominal_base_node_size||base_radius); })
                // if (!text_center) text.attr("dx", function (d) { return (size(d.size) * base_radius / nominal_base_node_size || base_radius); });

                // var text_size = nominal_text_size;
                // if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
                // text.style("font-size", text_size + "px");

                // circle.attr("transform", "translate(" + d3.event.translate + ")");
                // circle_center.attr("transform", "translate(" + d3.event.translate + ")");
                // paths.attr("transform", "translate(" + d3.event.translate + ")");
                // d3.selectAll(".gridCenRect").attr("transform", "translate(" + d3.event.translate + ")");

                circle.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                circle_center.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                paths.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                d3.selectAll(".gridCenRect").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

                ClusterModeler.translate = d3.event.translate;
                ClusterModeler.scale = d3.event.scale;
            });

            function tickSimulate(e) {
                // console.log('ticking , ', e.alpha)

                if (!ClusterModeler.forceTickStart) {
                    // console.log('controlling force')
                    // controlForce();
                }
                ClusterModeler.forceTickStart = true;
                if (!lay) {
                    // node
                    //     .each(cluster(10 * e.alpha * e.alpha))
                    //     .each(collide(.25))
                    // .each(cluster(7 * e.alpha * e.alpha))
                    // .each(collide(.01))
                    // .attr("cx", function (d) {
                    //     return d.x;
                    // })
                    // .attr("cy", function (d) {
                    //     return d.y;
                    // });
                }

                // node
                //     .each(cluster(e.alpha * 2))
                //     .each(collide(e.alpha * 2))
                //     .attr("cx", function (d) { return d.x; })
                //     .attr("cy", function (d) { return d.y; });



                // Push different nodes in different directions for clustering.
                // var k = 6 * e.alpha;
                // ClusterModeler.nodes.forEach(function (o, i) {
                //     o.x += i & 2 ? k : -k;
                //     o.y += i & 1 ? k : -k;
                // });

                // 







                nodeData.each(move_towards_year(e.alpha))
                    .attr("cx", function (d) {
                        // if(idsNotUpdate.indexOf(d.cluster) != -1 ) return $(this).attr('cx');
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        // if(idsNotUpdate.indexOf(d.cluster) != -1 ) return $(this).attr('cy');
                        return d.y;
                    });


                ClusterModeler.makeTheHull();
            }

            function move_towards_year(alpha) {
                // return function(d){
                //     ClusterModeler.positionVals[d.id] = [d.x, d.y];
                // }
                return function (d) {
                    var cluster = d.cluster;
                    if (idsNotUpdate.indexOf(cluster) != -1) {
                        // console.log(' not update ', d.cluster);
                        try {
                            d.x = ClusterModeler.positionVals[d.id][0];
                            d.y = ClusterModeler.positionVals[d.id][1];

                        } catch (err) {

                        }
                    } else {
                        var damper = 0.1
                        // console.log(' lets check target ', d.cluster, ClusterModeler.clusterCenterPos)
                        try {
                            var target = ClusterModeler.clusterCenterPos[d.cluster];
                            d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
                            d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
                        } catch (err) {
                            // console.log(' lets check target ', d.cluster, ClusterModeler.clusterCenterPos)
                        }
                    }
                    ClusterModeler.positionVals[d.id] = [d.x, d.y];
                };
            }

            function controlForce() {
                setTimeout(() => {
                    ClusterModeler.force.alpha(0);
                    // force.resume();
                    ClusterModeler.forceTickStart = false;
                    // console.log('force stopped ', ClusterModeler.force.alpha())


                    // var maxDist = {};
                    // var indexDict = {}
                    // for (var item in ClusterModeler.centroidHullDict) {
                    //     maxDist[item] = 0;
                    //     indexDict[item] = -1;
                    // }
                    // var indexNNode = -1;
                    // vis.selectAll('circle.node').data(ClusterModeler.nodes, function (d) {
                    //     // console.log('here d is ', d)
                    //     var cen = ClusterModeler.centroidHullDict[d.cluster];
                    //     var cenX = cen[0]
                    //     var cenY = cen[1]
                    //     var evX = d.x
                    //     var evY = d.y
                    //     var diffX = Math.abs(cenX - evX);
                    //     var diffY = Math.abs(cenY - evY);
                    //     var dist = Math.sqrt(diffX * diffX + diffY * diffY);


                    //     if (dist > maxDist[d.cluster]) {
                    //         maxDist[d.cluster] = dist;
                    //         indexDict[d.cluster] = d.id;
                    //     }

                    //     return

                    // })

                    // vis.selectAll('circle.node')
                    //     .transition()
                    //     .duration(1000)
                    //     .attr('cx', function (d) {
                    //         d.x = ClusterModeler.centroidHullDict[d.cluster][0] + Util.getRandomNumberBetween(50, -50);
                    //         return d.x;
                    //     })
                    //     .transition()
                    //     .duration(1000)
                    //     .attr('cy', function (d) {
                    //         d.y = ClusterModeler.centroidHullDict[d.cluster][1] + Util.getRandomNumberBetween(50, -50);
                    //         return d.y
                    //     })

                    // // force.resume()
                    // ClusterModeler.makeTheHull(true)



                    // console.log('maxdict and indexdict ', maxDist, indexDict)




                }, 3000);
            }


            d3.select("#resetClusterBtn").on("click", function () {
                ClusterModeler.update(Main.currentData);        
            });




            d3.select("#deleteBtn").on("click", function () {
                ClusterModeler.deleteClusterNodes();
            });




            // Move d to be adjacent to the cluster node.
            function cluster(alpha) {
                return function (d) {
                    var cluster = clusters[d.cluster];
                    if (cluster === d) return;
                    var x = d.x - cluster.x,
                        y = d.y - cluster.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + cluster.radius;
                    if (l != r) {
                        l = (l - r) / l * alpha;
                        d.x -= x *= l;
                        d.y -= y *= l;
                        cluster.x += x;
                        cluster.y += y;
                    }
                };
            }




            // Resolves collisions between d and all other circles.
            function collide(alpha) {
                var quadtree = d3.geom.quadtree(ClusterModeler.nodes);
                return function (d) {
                    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                        nx1 = d.x - r,
                        nx2 = d.x + r,
                        ny1 = d.y - r,
                        ny2 = d.y + r;
                    quadtree.visit(function (quad, x1, y1, x2, y2) {
                        if (quad.point && (quad.point !== d)) {
                            var x = d.x - quad.point.x,
                                y = d.y - quad.point.y,
                                l = Math.sqrt(x * x + y * y),
                                r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                            if (l < r) {
                                l = (l - r) / l * alpha;
                                d.x -= x *= l;
                                d.y -= y *= l;
                                quad.point.x += x;
                                quad.point.y += y;
                            }
                        }
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                };
            }

            d3.selectAll('.node')
                .transition()
                .delay(1000)
                .duration(300)
                .attr("r", ClusterModeler.radius);

            // setTimeout(() => {
            //     d3.selectAll('circle').attr('r', ClusterModeler.radius)  
            // }, 2000);

            ClusterModeler.removeLasso = function () {
                ClusterModeler.lassoIds = [];
                var lasso = function () {};
                vis.call(lasso);
                $(".lasso_rect").remove();
                $(".lasso_svg").remove();
            }


            ClusterModeler.addLasso = function () {
                // Lasso functions to execute while lassoing
                var lasso_start = function () {
                    //return on right click = 2, left click = 0
                    if (d3.event.sourceEvent.button == 2) return;
                    console.log('lasso started ', d3.event.sourceEvent)
                    console.log('lasso started ', d3.event.sourceEvent.button)
                    lasso.items()
                        .attr("r", ClusterModeler.radius) // reset size
                        .style("fill", null) // clear all of the fills
                        .style('stroke', null)
                        .classed({
                            "not_possible": true,
                            "selected": false
                        }); // style as not possible
                };

                var lasso_draw = function () {
                    if (d3.event.sourceEvent.button == 2) return;
                    // Style the possible dots
                    lasso.items().filter(function (d) {
                            return d.possible === true
                        })
                        .classed({
                            "not_possible": false,
                            "possible": true
                        });

                    // Style the not possible dot
                    lasso.items().filter(function (d) {
                            return d.possible === false
                        })
                        .classed({
                            "not_possible": true,
                            "possible": false
                        });
                };

                var lasso_end = function () {
                    if (d3.event.sourceEvent.button == 2) return;
                    // Reset the color of all dots
                    ClusterModeler.lassoIds = [];
                    lasso.items()
                        .style("fill", function (d) {
                            return ClusterModeler.color(d.cluster)
                        });

                    // Style the selected dots
                    lasso.items().filter(function (d) {
                            return d.selected === true
                        })
                        .classed({
                            "not_possible": false,
                            "possible": false
                        })
                        .attr("r", function (d) {
                            ClusterModeler.lassoIds.push(d.id);
                            return 10;
                        })
                        .style('fill', 'darkgray')
                        .style('stroke', 'black')


                    // Reset the style of the not selected dots
                    lasso.items().filter(function (d) {
                            return d.selected === false
                        })
                        .classed({
                            "not_possible": false,
                            "possible": false
                        })
                        .attr("r", ClusterModeler.radius);


                    ClusterModeler.lassoAutoClusterEffect();

                };

                // Create the area where the lasso event can be triggered
                var lasso_area = vis.append("rect")
                    //  var lasso_area = vis.insert("rect", ":first-child")
                    .attr('class', 'lasso_rect')
                    .attr("width", w)
                    .attr("height", h)
                    .style("opacity", 0);

                // Define the lasso
                var lasso = d3.lasso()
                    .closePathDistance(75) // max distance for the lasso loop to be closed
                    .closePathSelect(true) // can items be selected by closing the path?
                    .hoverSelect(true) // can items by selected by hovering over them?
                    .area(lasso_area) // area where the lasso can be started
                    .on("start", lasso_start) // lasso start function
                    .on("draw", lasso_draw) // lasso draw function
                    .on("end", lasso_end); // lasso end function




                // Init the lasso on the svg:g that contains the dots
                vis.call(lasso);
                lasso.items(d3.selectAll(".node"));

                d3.selectAll('.lasso')
                    .attr('class', 'lasso_svg')

                // vis.call(lasso);
            }
            // ClusterModeler.addLasso();

            d3.selectAll('.node').style('opacity', '1');
            Metrics.updateGlobalResults(dataIn);
            DataTable.switchToLeftData();
        } // end of update


        ClusterModeler.update(dataNew);

        ClusterModeler.deleteClusterNodes = function (d = "") {
            // return
            ClusterModeler.hullDragDelete = false;
            setTimeout(() => {
                ClusterModeler.hullDragDelete = true;
            }, 3000);

            ClusterModeler.hideTipHull();
            //for selected node to be deleted
            console.log('deleting cluster and node ', ClusterModeler.selectedCluster)
            if (ClusterModeler.selectedNodeId != -1) {

                console.log('deleting node. ')

                Main.currentData.forEach(function (d, i) {
                    if (d.id == ClusterModeler.selectedNodeId) {
                        ClusterModeler.deletedNodesData.push(Object.assign({}, Main.currentData[i]));
                        Main.currentData.splice(i, 1);
                    }
                }) // end of for each

                var dataIn = Util.deepCopyData(Main.currentData);

                console.log('length after ', Main.currentData.length);
                // d3.selectAll('path').remove();

                d3.selectAll('.node_' + ClusterModeler.selectedNodeId).remove();
                ClusterModeler.nodes = dataIn.map(function (d, i) {
                    d.fixed = false;
                    d.radius = ClusterModeler.radius;
                    if (!clusters[i] || (d.radius > clusters[i].radius)) clusters[i] = d;
                    return d;
                });
                // ClusterModeler.update(Main.currentData);
                Metrics.updateGlobalResults(dataIn);
                // ClusterModeler.makeTheHull(true);
                // GridData.makeGridNodesVis();
                d3.selectAll(".modelTooltip").style("display", "none");
            }


            //for selected cluster to be deleted
            if (ClusterModeler.selectedCluster != -1) {

                var nodeId = []
                var indices = []
                var dataTemp = Util.deepCopyData(Main.currentData);
                dataTemp.forEach(function (d, i) {
                    if (d.cluster == ClusterModeler.selectedCluster) {
                        // Main.trainData.splice(i, 1);
                        indices.push(i);
                        nodeId.push(+d.id);
                        ClusterModeler.deletedNodesData.push(Object.assign({}, Main.currentData[i]));
                    }
                }) // end of for each
                for (var i = indices.length - 1; i >= 0; i--) {
                    Main.currentData.splice(indices[i], 1);
                }


                var dataIn = Util.deepCopyData(Main.currentData);

                for (var i = 0; i < nodeId.length; i++) {
                    $('.node_' + nodeId[i]).remove();
                }

                ClusterModeler.nodes = dataIn.map(function (d, i) {
                    d.fixed = false;
                    d.radius = ClusterModeler.radius;
                    if (!clusters[i] || (d.radius > clusters[i].radius)) clusters[i] = d;
                    return d;
                });



                ClusterModeler.numClusters = parseInt(ClusterModeler.numClusters) - 1;
                ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters'] = ClusterModeler.numClusters;
                // ClusterModeler.update(Main.currentData);
                console.log('num clusters ', ClusterModeler.numClusters)
                Metrics.updateGlobalResults(dataIn);
                // GridData.makeGridNodesVis();
                ClusterModeler.makeTheHull();
            }


            Main.leftData.push.apply(Main.leftData, ClusterModeler.deletedNodesData);
            DataTable.updateHeader();
        }

        ClusterModeler.dragHullChange = 0;
        ClusterModeler.hullDragBehavior = function (e) {

            var retVal = d3.behavior.drag()
                .on('dragstart', function (d) {
                    if (ClusterModeler.hullClicked) return;
                    console.log('drag end seeing 1 ', ClusterModeler.hullClicked, d3.event);
                    d3.event.sourceEvent.stopPropagation();
                    // d3.select(this).style("stroke", "red");
                })
                .on('drag', function (d, i) {
                    if (ClusterModeler.hullClicked) return;
                    // ClusterModeler.dragHullChange = d3.event.dx + d3.event.dy;
                    ClusterModeler.dragHullChange += 1;
                    ClusterModeler.hullDragging = true;
                    console.log('drag end seeing 1 ', ClusterModeler.hullClicked, d3.event.dx, ClusterModeler.dragHullChange);

                    d3.event.sourceEvent.stopPropagation();
                    ClusterModeler.force.stop()
                    // d3.select(this).style("stroke", "lightblue");

                    var nodeGroup = parseInt(d.key);
                    var dx = d3.event.dx;
                    var dy = d3.event.dy;
                    ClusterModeler.moveNodeGroup(nodeGroup, dx, dy);

                    //++ deleting clusters code
                    var x = d3.event.x
                    var y = d3.event.y
                    //   console.log('x and y found ', x, y)
                    if (x < 22 && y < 22 && ClusterModeler.hullDragDelete) {
                        //   console.log('found less values ', x, y)
                        ClusterModeler.selectedCluster = nodeGroup;
                        ClusterModeler.deleteClusterNodes(d);
                    }
                    //++


                    // console.log(' dragging hull ', d3.event, x,y)
                })
                .on('dragend', function (d) {
                    // return
                    if (ClusterModeler.hullClicked) return;
                    console.log('drag end seeing 0 ', d, ClusterModeler.hullClicked, d3.event)
                    // if (ClusterModeler.dragHullChange == 0 ) return
                    if (ClusterModeler.dragHullChange < 5) return;
                    console.log('drag end seeing ', ClusterModeler.hullClicked, d3.event)
                    d3.event.sourceEvent.stopPropagation();


                    //following for merging clusters
                    var dataPts = d.values;
                    for (var item in ClusterModeler.centroidHullDict) {
                        if (item == d.key) continue;
                        var cen = ClusterModeler.centroidHullDict[item]
                        var cenX = cen[0]
                        var cenY = cen[1]
                        // var evX = d3.event.x;
                        // var evY = d3.event.y;
                        var evX = ClusterModeler.centroidHullDict[d.key][0]
                        var evY = ClusterModeler.centroidHullDict[d.key][1]
                        var diffX = Math.abs(cenX - evX);
                        var diffY = Math.abs(cenY - evY);
                        var dist = Math.sqrt(diffX * diffX + diffY * diffY);


                        // console.log("hull distance from ", item, dist, evX, evY)
                        if (dist < 50) {
                            // var index = Main.getDataIndexById(d.id);
                            for (var j = 0; j < dataPts.length; j++) {
                                var id = dataPts[j].id
                                var index = Main.getDataIndexById(id, Main.currentData);
                                Main.currentData[index].cluster = +item;


                                d3.selectAll('.node_' + id)
                                    .style('fill', function (p) {
                                        p.cluster = item;
                                        return ClusterModeler.color(item)
                                    })
                            }
                            // console.log('hull overlap found close ', item);
                            ClusterModeler.numClusters -= 1;
                            ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters'] = ClusterModeler.numClusters;

                            //find clusters not effected
                            var clusterNotEffectedId = [];
                            var clusterIDS = [];
                            for(var p=0;p<Main.currentData.length;p++){
                                clusterIDS.push(+Main.currentData[p].cluster);
                            }
                            clusterIDS = Util.getUniqueArray(clusterIDS);
                            clusterIDS.sort(function(a,b) { return a - b;});
                            ClusterModeler.clusterIds = clusterIDS.slice();                            

                            for(var n = 0;n<ClusterModeler.clusterIds.length;n++){
                                // if(+ClusterModeler.clusterIds[n] == +d.key && +ClusterModeler.clusterIds[n] == item) continue;
                                if(+ClusterModeler.clusterIds[n] == item) continue;
                                clusterNotEffectedId.push(ClusterModeler.clusterIds[n]);
                            }



                            // console.log('getting cluster not effect  ', clusterNotEffectedId)
                            ClusterModeler.update(Main.currentData, clusterNotEffectedId);
                            ClusterModeler.hullDragging = false;
                            ClusterModeler.dragHullChange = 0;
                            return;
                        }
                    }
                    ClusterModeler.hullDragging = false;
                    ClusterModeler.dragHullChange = 0;

                });
            return retVal;
        };

        ClusterModeler.moveNodeGroup = function (iGroup, dx, dy) {

            var filteredNodes = d3.selectAll("circle").filter(function (n) {
                n.fixed = false;
                return n.cluster === iGroup;
            });
            filteredNodes.attr("cx", function (n) {
                // console.log('hulldraging ', n)
                n.fixed = false;
                n.px = n.px + dx;
                n.x = n.x + dx;
                return n.x;
            }).attr("cy", function (n) {
                n.py = n.py + dy;
                n.y = n.y + dy;
                return n.y;
            });
            // force.start();
            ClusterModeler.makeTheHull(true);
        };

        ClusterModeler.makeTheHull = function (drawIt = false) {
            // return; 

            if (ClusterModeler.nodes.length == 0) {
                console.log('in make hul returning ', ClusterModeler.nodes);
                return;
            }

            ClusterModeler.groups = d3.nest().key(function (d) {
                return d.cluster;
            }).entries(ClusterModeler.nodes);


            console.log('in make hull grps ', ClusterModeler.groups, ClusterModeler.nodes)

            var xV = +ClusterModeler.nodes[0].x;
            var yV = +ClusterModeler.nodes[0].y;

            // console.log('grps are ', groups)
            ClusterModeler.centroidHull = function (d) {
                var cenX = 0;
                var cenY = 0;

                d.values.map(function (i) {
                    cenX += +i.x
                    cenY += +i.y
                    return [i.x, i.y];
                })
                cenX = cenX / d.values.length
                cenY = cenY / d.values.length
                return [cenX, cenY]
            }

            //adding a text to the left

            // vis.append('g')
            // .attr('x', xV)
            // .attr('y', yV)
            // .append('text')
            // .text("ID : " + )

            ClusterModeler.groupPath = function (d) {
                ClusterModeler.centroidHullDict[d.key] = ClusterModeler.centroidHull(d);
                return "M" +
                    d3.geom.hull(d.values.map(function (i) {
                        return [i.x, i.y];
                    }))
                    .join("L") +
                    "Z";
            };

            ClusterModeler.groupFill = function (d, i) {
                return ClusterModeler.color(d.cluster);
            };


            // vis.selectAll("path").remove();
            var path = vis.selectAll("path")
                .data(ClusterModeler.groups)
                .attr("d", ClusterModeler.groupPath)



            var pathNode = path.enter().insert("path", "circle")
                .attr('class', function (d, i) {
                    return 'path_circle_' + i
                })
                // .style("fill", ClusterModeler.groupFill)
                .style("fill", 'lightgray')
                // .style("stroke", ClusterModeler.groupFill)
                // .style("stroke", 'lightgray')
                // .style("stroke-width", 50)
                .style("stroke-linejoin", "round")
                .style("opacity", .5)
                .attr("d", ClusterModeler.groupPath)
                .call(ClusterModeler.hullDragBehavior())
                .on('click', function (d) {
                    if (d3.event.defaultPrevented) return;
                    ClusterModeler.hullClicked = true;
                    // d3.event.stopPropagation();
                    console.log('clicking the hull ', d);
                    setTimeout(() => {
                        ClusterModeler.hullClicked = false;
                    }, 500);
                    //+++++
                    // if (ClusterModeler.selectedCluster == d.key) {
                    //     // $(this).css("stroke", ClusterModeler.groupFill)
                    //     // ClusterModeler.selectedCluster = -1
                    //     // $("#tip_" + containerId).css("display", "none");
                    // } else {
                    //     //     d3.selectAll('path').style("stroke", ClusterModeler.groupFill)
                    //     //     $(this).css('stroke', 'black');
                    //     //     ClusterModeler.selectedCluster = d.key
                    //     //     ClusterModeler.tipHullWindow(d)
                    // }

                    // d3.selectAll('path').style("stroke", ClusterModeler.groupFill)
                    //+++


                    // d3.selectAll('path').style("stroke", 'lightgray')
                    // $(this).css('stroke', 'black');
                    ClusterModeler.selectedCluster = d.key
                    // ClusterModeler.tipHullWindow(d, d.key);  //commented out no need now

                    DataTable.filterTableByCluster(d.key);
                    Menu.LEFTPANELSHOW = false;
                    Menu.toggleLeftPanel();
                    LocalInfoCluster.makeCard(d);
                    // console.log('clicked on hull ', ClusterModeler.selectedCluster, d);
                })
                .on('dblclick', function (d) {
                    if (d3.event.defaultPrevented) {
                        return;
                    }
                    // console.log(d);
                })

            d3.selectAll('.text_cluster_id').remove();

            var textObj = vis.selectAll("text")
                .data(ClusterModeler.groups)
                .enter()
                .append('text')
                .attr('class', 'text_cluster_id')
                .attr('x', function (d) {
                    return +d.values[0].x;
                })
                .attr('y', function (d) {
                    return +d.values[0].y;
                })
                // .text(function(d){
                //     return d.key
                // } )
                .text(function (d) {
                    return 'ID : ' + d.key;
                })
                .style('font-size', '1.8em')

            // var bbox = path.node().getBBox();
            // console.log('bounding box found ', bbox)
            // pathNode.attr("transform", "translate(" + 50 + "% , " + 50 + "% )scale(" + 5.5 + ")");
            // path.attr("transform", "translate(" + bbox.x + "px," + bbox.y + "px)scale(" +5.5+ ")");
            // pathNode.attr("transform", "scale(" + 5.5 + ")");
            // pathNode.attr("transform", "translate (50%,50%)");
            // pathNode.attr("transform", "translate(" + 0 + ")scale(" + 1.2 + ")");



            // vis.selectAll(".gridCenRect").remove();
            // vis.selectAll("gridCenRect")
            //     .data(ClusterModeler.groups)
            //     .enter().append("rect")
            //     .attr("class", "gridCenRect")
            //     .attr("id", function (d) {
            //         return "cenRectId_" + d.key
            //     })
            //     .attr("x", function (d) {
            //         return ClusterModeler.centroidHullDict[d.key][0]
            //     })
            //     .attr("y", function (d) {
            //         return ClusterModeler.centroidHullDict[d.key][1]
            //     })
            //     .attr("rx", function (d) {
            //         return 2
            //     })
            //     .attr("ry", function (d) {
            //         return 2
            //     })
            //     .attr("width", function (d) {
            //         return 6
            //     })
            //     .attr("height", function (d) {
            //         return 6;
            //     })
            //     .style("fill", function (d) {
            //         // return ClusterModeler.color(d.cluster);
            //         return Main.colors.BLACK;
            //     })


            if (!drawIt) {
                // d3.selectAll("path").style("opacity", 0);
                // d3.selectAll(".gridCenRect").style("opacity", 0);
            }


            //without the following working fine
            setTimeout(() => {
                try {
                    // vis.selectAll("path").attr("transform", "translate(" + ClusterModeler.translate + ")scale(" + ClusterModeler.scale + ")");
                } catch (err) {

                }
            }, 300);


        } // end of makethehull function
        ClusterModeler.initial = true;
        return;
    }






}());