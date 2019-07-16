(function () {

    LocalInfoCluster = {};
    LocalInfoCluster.addedCardId = {}
    LocalInfoCluster.clusterWtObj = {}


    LocalInfoCluster.computeLocalWeights = function(){
        if(Object.keys(LocalInfoCluster.clusterWtObj).length == 0) return;
        var attrNames = Object.keys(LocalInfoCluster.clusterWtObj);
        var arrOfArrWts = [];
        for(var item in LocalInfoCluster.clusterWtObj){
            var wtArr = LocalInfoCluster.clusterWtObj[item];
            wtArr = Util.objToArray(wtArr);
            arrOfArrWts.push(wtArr);
        }
        var arrOfArrWtstrans = [];
        try{
            console.log('wtArr ', arrOfArrWts);
            var arrOfArrWtstrans = Util.transposeArray(arrOfArrWts.slice());
            console.log('wtArr trace ', arrOfArrWtstrans);
        }catch(err){
            return
        }

        LocalInfoCluster.clusterAttrContrb = {};
        var kVal =3;
        for(var i =0;i<arrOfArrWtstrans.length;i++){
            var arr = arrOfArrWtstrans[i];
            var sortIndices = Util.getIndicesfromSortArr(arr, false);
            // sortIndices = Util.shuffleArray(sortIndices); // added as a hack
            var attrNameDict = []
            for(var j=0;j<kVal;j++){
               attrNameDict.push(attrNames[sortIndices[j]]);
            } 
            LocalInfoCluster.clusterAttrContrb[i]  = attrNameDict;
        }   

        console.log('sorted decreasing top k entry ', LocalInfoCluster.clusterAttrContrb, LocalInfoCluster.clusterWtObj)


       

    }

    /*updates cluster ids as already rendered*/
    LocalInfoCluster.updateExistingCards = function () {
        // $("#gridDataPanel").empty();
        $("#featurePanel").empty();

        var grpDict = {};
        for(var i=0;i<ClusterModeler.groups.length;i++){
            grpDict[ClusterModeler.groups[i]['key']] = ClusterModeler.groups[i]['values'];
        }

        var index = 0;
        var clusterKeys = Object.keys(grpDict);
        console.log('making found keys ', clusterKeys)
        for (var item in LocalInfoCluster.addedCardId) {
            var ind = clusterKeys.indexOf(item);
            console.log('making keys ', ind, item, clusterKeys)
            if (ind == -1) continue;
            console.log('making new card ', item, ClusterModeler.numClusters, LocalInfoCluster.addedCardId[item])
            LocalInfoCluster.addedCardId[item]['values'] = grpDict[item];
            var dataG = Object.assign({}, LocalInfoCluster.addedCardId[item]);
            var id = item;
            delete LocalInfoCluster.addedCardId[item];
            LocalInfoCluster.makeCard(dataG, id)
            index += 1;
            // if(ClusterModeler.numClusters < index) break;
        }
    }


    /*remove all present cluster cards */
    LocalInfoCluster.removeClusterCards = function () {
        // $("#gridDataPanel").empty();
        $("#featurePanel").empty();
        Menu.LEFTPANELSHOW = true;
        Menu.toggleLeftPanel();
        LocalInfoCluster.addedCardId = {};
    }

    /*makes local cluster info card*/
    LocalInfoCluster.makeCard = function (dataG, id = ClusterModeler.selectedCluster, containerId = "featurePanel") {
        if (containerId == null) {
            containerId = "featurePanel"
        }





        if (typeof LocalInfoCluster.addedCardId[id] == 'undefined') {
            LocalInfoCluster.addedCardId[id] = Object.assign({}, dataG);
        } else {
            return;
        }

        if (id == null) {
            id = dataG['key']
        }

        console.log('in card making ', dataG, id)
        var numMember = dataG['values'].length;
        var locCoeff = Util.getRandomNumberBetween(1, 0);

        var htmlStr = "<div class = 'localClusterInfo' id  = 'localClusterInfo_" + id + "' ></div>";
        $("#" + containerId).append(htmlStr);

        var txt = "";
        var attrbArr = ClusterModeler.allModelData[ClusterModeler.selectedModelId]['localTopAttrb'][id];// LocalInfoCluster.clusterAttrContrb[id];
        for(var i=0;i<attrbArr.length;i++){
            txt += " "+ attrbArr[i] + " ";
        }

        htmlStr = "<div class = 'localRow' id = 'localRowId' >Cluster Id : " + id + " </div>";
        htmlStr += "<div class = 'localRow' id = 'localRowMember' >Members : " + numMember + " </div>";
        htmlStr += "<div class = 'localRow' id = 'localRowCoeff' >Local Coeff : " + locCoeff.toFixed(3) + " </div>";
        htmlStr += "<div class = 'localRow' id = 'localRowCoeff' >Top Attributes  : " + txt + " </div>";
        htmlStr += "<div class = 'localRow' id = 'localRowBorder' ></div>";
        htmlStr += "<div class = 'localRow' id = 'localRowItems_" + id + "' ></div>";

        $("#localClusterInfo_" + id).append(htmlStr);
        $(".localClusterInfo").css('border', '1px solid lightgray');
        $(".localClusterInfo").css('border-radius', '5px');
        $(".localClusterInfo").css('padding', '10px');
        $(".localClusterInfo").css('max-height', '300px');
        $(".localClusterInfo").css('overflow-Y', 'auto');
        $(".localClusterInfo").css('margin-bottom', '10px');
        $("#localRowCoeff").css('border-bottom', '1px solid lightgray')

        $('.localRow').css('display', 'float');
        $('.localRow').css('width', '100%');
        $('.localRow').css('height', 'auto');
        $('.localRow').css('font-size', '0.8em');

        htmlStr = "";
        for (var i = 0; i < dataG['values'].length; i++) {
            var txt = dataG['values'][i][Main.entityName] + ", " + dataG['values'][i][Main.entityNameSecondImp]
            htmlStr += "<div class = 'rowItemLoc' id = 'rowItemLoc_" + id + "' > \
            " + txt + " </div>";
        }
        $("#localRowItems_" + id).append(htmlStr);

        $("#localRowItems_" + id).css('display', 'float');
        $("#localRowItems_" + id).css('padding', '2px');
        $("#localRowItems_" + id).css('height', 'auto');
        $("#localRowItems_" + id).css('width', '100%');
        $("#localRowItems_" + id).css('margin-bottom', '5px');
        $("#localRowItems_" + id).css('font-size', '0.8em');
        // $("#localRowItems_" + id).css('margin', '20px');


        d3.selectAll("#rowItemLoc_" + id).style('padding', '3px');
        d3.selectAll("#rowItemLoc_" + id).style('background', Main.colors.HIGHLIGHT);
        d3.selectAll("#rowItemLoc_" + id).style('border-radius', '3px');
        d3.selectAll("#rowItemLoc_" + id).style('border', '0.5px solid lightgray');







    }




}())