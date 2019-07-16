(function () {


    Main = {}
    window.socket = io.connect("http://" + document.domain + ":" + location.port);
    Main.currentData = [];
    Main.currentTempStoreData = [];
    Main.leftData = [];
    Main.trainData = [];
    Main.trainDataCopy = [];
    Main.trainTarget = [];
    Main.testData = [];
    Main.testTarget = [];
    Main.attrDict = {};
    Main.numericalAttributes = {};
    Main.targetName = 'target_variable';
    Main.appData = [];
    Main.outerData = [];
    Main.entityName = '';
    Main.entityNameSecondImp = '';
    Main.tooltipDictArr = [];

   


    /*
    stores system colors
    */

    Main.colors = {
        HIGHLIGHT: "#00BCD4",
        LIGHTGRAY : "lightgray",
        BLACK : 'black',
        POS_COL : 'red',
        NEG_COL : 'blue'
    }

    /*
    stores system variables
    */
    Main.commonVars = {
        DEBUG: false,
    }


    Main.init = function (tag = false) {
        $(document).ready(function () {
            console.log("loading data");
            if (!Main.commonVars.DEBUG) {
                // console.log = function () {};
            }
            $("#sidePanel").css("width", "25px");
            $("#viewPanel").css("width", "100%");
            var dataSrc = "static/data/car_full1.csv";
            // var dataSrc = "static/data/BreastCancerDataSet.csv";
            
            if(tag) Main.sendData(Main.outerData);
            else Main.loadData(dataSrc);
         
        });

    }


    Main.getDataById = function(id = 0, data = Main.trainData){
        for(var i=0;i<data.length;i++){
            if(data[i].id == id)
            return data[i];
        }
        return null;
    }

    Main.getDataIndexById = function (id = 0, data = Main.trainData) {
        for (var i = 0; i < data.length; i++) {
            if (data[i].id == id)
                return i
        }
        return -1;
    }

    Main.resetViewsAndData = function(){
        $("#clusterDivSvg").empty();
        $("#globalPanel").empty();
        $("#gridDataPanel").empty();
        $("#tableSelectors").empty();
        $("#tableContent").empty();
        $("#featurePanel").empty();

        $('.modelTooltip').remove();

        //data
        Main.entityName = '';
        Main.entityNameSecondImp = '';
        Main.tooltipDictArr = [];
        Main.attrDict = {};
    }


    Main.sendData = function(dataset){
        console.log('loaded outer data sending ', Main.outerData)
        var objSend = {
            data : dataset,
            targetName: Main.targetName
        }
        socket.emit("data_preprocess", objSend);
        socket.on("data_return_preprocess", function (dataGet) {
            console.log("received data after pre process ", dataGet);
            Main.trainData = dataGet[0];
            Main.trainDataCopy = Util.deepCopyData(Main.trainData)
            Main.leftData = Util.deepCopyData(Main.trainData)
            // Main.currentData = Util.deepCopyData(Main.trainData)
            Main.currentData = [];//Util.deepCopyData(Main.trainData)
            
            // Main.trainTarget = dataGet[1];
            Main.testData = dataGet[1];
            // Main.testTarget = dataGet[3];
            Main.appData = dataGet[2];


            // GridData.deletedNodesData = Util.deepCopyData(Main.trainData);

            Main.processAttrData(Main.trainData);
            Main.taskScheduler();
        });

    }



    Main.loadData = function (fileName) {
        console.log("starting sload data ");
        d3.csv(fileName, function (dataset) {
            console.log("data loaded ", dataset);
            var objSend = {
                data : dataset,
                targetName: Main.targetName
            }
            socket.emit("data_preprocess", objSend);
            socket.on("data_return_preprocess", function (dataGet) {
                // console.log("received data after pre process ", dataGet);
                Main.trainData = dataGet[0];
                Main.trainDataCopy = Util.deepCopyData(Main.trainData)
                Main.leftData = Util.deepCopyData(Main.trainData)
                // Main.currentData = Util.deepCopyData(Main.trainData)
                Main.currentData = [];//Util.deepCopyData(Main.trainData)
                
                Main.trainTarget = dataGet[1];
                Main.testData = dataGet[2];
                Main.testTarget = dataGet[3];
                Main.appData = dataGet[4];


                // GridData.deletedNodesData = Util.deepCopyData(Main.trainData);

                Main.processAttrData(Main.trainData);

                Main.taskScheduler();
            });
           
        });

    }

    /*
    ideally should only run once, when the system loads
    */
    Main.taskScheduler = function(){
        
        // ClusterModeler.visClus()
        DataTable.addIconsTop(Main.trainData);
        DataTable.switchToLeftData();
        DataTable.makeTable(Main.leftData);
        ClusterModeler.addIcons()
        // ClusterModeler.getClustering();
        // GridData.makeGridNodesVis();

        // ClusterV4.makeVisCluster();
    }


    Main.processAttrData = function (data) {

        var title = Object.keys(data[0]);
        // console.log("title found ", title)
        for (var i = 0; i < title.length; i++) {
            var toolKeys = Main.tooltipDictArr.length;
            Main.attrDict[title[i]] = {};
            var type = 'quantitative';
            // console.log(" type is ", typeof parseInt(data[0][title[i]]), parseInt(data[0][title[i]]));
            if (isNaN(parseInt(data[0][title[i]]))) {
                type = "categorical";
                if(Main.entityName == ''){
                    Main.entityName = title[i];
                }else{
                    if(Main.entityNameSecondImp == ''){
                        Main.entityNameSecondImp = title[i];
                    }
                }
            }
            Main.attrDict[title[i]]['type'] = type; 
            if(toolKeys < 5 && title[i] != Main.entityName) Main.tooltipDictArr.push(title[i]);

            var attrList = [];
            data.forEach(function (d) {
                attrList.push(+d[title[i]])
            })

            var attrUniq = Util.getUniqueArray(attrList);
            attrUniq.sort(function(a,b) { return a - b;});
            Main.attrDict[title[i]]["uniqueVals"] = attrUniq;
            Main.attrDict[title[i]]["range"] = [attrUniq[0], attrUniq[attrUniq.length - 1]];
        }

    }

    /*
prints the system state variabbles
*/
    Main.printLogs = function () {
        console.log("MAIN object ", Main);
        console.log("Model Clusterer object ", ClusterModeler);
        console.log("GridData object ", GridData);
        console.log("Metrics object ", Metrics);
    }



})();