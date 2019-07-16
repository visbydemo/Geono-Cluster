(function(){
/*
grid data, left over clusters and nodes
*/
GridData = {};

GridData.dataNodes = [];
GridData.dataArray = [];

GridData.addTopBar = function(containerId = ""){
    if (containerId == "") containerId = "gridDataPanel";
    var htmlStr = "<div class = 'gdHeader'><span class = 'gdHead' > Discarded Data  : " + ClusterModeler.deletedNodesData.length+ "</span><span class = 'spnBtnGdReturn' >  <button id = 'btnReturnData' class='ui-button ui-widget ui-corner-all'>Re-use </button></span></div>";
    $("#"+containerId).prepend(htmlStr);

    $('.gdHeader').css('border-bottom', '1px solid lightgray');
    $('.gdHeader').css('padding-bottom', '5px');
    $('.spnBtnGdReturn').css('float', 'right')
    $('.spnBtnGdReturn').css('text-align', 'center')
    $("#btnReturnData").button();
    $("#btnReturnData").css('width', '80px')
    $("#btnReturnData").css('height', '30px')
    $("#btnReturnData").css('font-size', '0.8em')
    $("#btnReturnData").css('display', 'flex')
    $("#btnReturnData").css('justify-content', 'center');

    $('#btnReturnData').on('click', function(){
        // console.log('re use clicked button');
        if (ClusterModeler.deletedNodesData.length>0){

            var clusterFound = [];
            for (var i = 0; i < ClusterModeler.deletedNodesData.length; i++) {
                clusterFound.push(ClusterModeler.deletedNodesData[i]['cluster'])
            }
            clusterFound = Util.getUniqueArray(clusterFound);
            ClusterModeler.numClusters += clusterFound.length;

            // var arrD = [];
            // for (var i = 0; i < ClusterModeler.deletedNodesData.length;i++){
            //     // var id = GridData.dataArray[i].id;
            //     // var dataPt = Main.getDataById(id, Main.trainDataCopy);
            //     var dataPt = ClusterModeler.deletedNodesData[i];
            //     // console.log('found data pt ', dataPt, id)
            //     arrD.push(Object.assign({}, dataPt));                
            // }
            Main.currentData.push.apply(Main.currentData, ClusterModeler.deletedNodesData);
            
            DataTable.computeLeftData();          
            
            ClusterModeler.update(Main.currentData);
            $("#" + containerId).empty();
            GridData.dataArray = [];
            GridData.dataNodes = [];
            ClusterModeler.deletedNodesData = [];
            
        }
    })
}

    GridData.tooltipStylingContent = function (d, tooltip) {
        var htmlStr = "<div class = 'tooltipModelHeader'><span class = 'topHead' > Data ID : " + d.id + "</span>";
        htmlStr += "<span> Name : " + d.Car + "</span></div>";
        htmlStr += "<div class = 'tooltipModelContent' ><div>Model : " + d.Model + "</div>";
        htmlStr += "<div class = 'tooltipModelContent' ><div>Origin : " + d.Origin + "</div>";
        htmlStr += "<div class = 'tooltipModelContent' ><div>Cluster : " + d.cluster + "</div>";
        htmlStr += "<div class = 'tooltipModelContent' ><div>MPG : " + d.MPG + "</div>";

        tooltip
            .style("left", d3.event.pageX + 35 + "px")
            .style("top", d3.event.pageY - 75 + "px")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "start")
            .style("font-size", "0.75em")
            .style("padding", "4px")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
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



    GridData.formDataGrid = function (w,h) {

        var dataGiven = ClusterModeler.deletedNodesData;
        var data = new Array();
        var width = 20;
        var height = width;
        var xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
        var ypos = 1;
        
        var click = 0;
        var colNum = Math.floor(w*0.85/width);
        var rowNum = Math.ceil(dataGiven.length/colNum);
        var count = 0;
        var maxCount = dataGiven.length;
        var ht = rowNum * height * 1.5
        // if (maxCount == 0) maxCount = parseInt(Util.getRandomNumberBetween(63,45));

        // var width = (w*0.95)/rowNum;
        // var height = width;// (h*0.95) / colNum;

        if(width > 60){
            width = 50;
            height = 50;
        }

        // iterate for rows	
        for (var row = 0; row < rowNum; row++) {
            data.push(new Array());
            var addCondition = true;
            // iterate for cells/columns inside rows
            for (var column = 0; column < colNum; column++) {
                if(count >= maxCount) addCondition = false;
                
                if(addCondition){
                    var obj = ClusterModeler.deletedNodesData[count];
                    data[row].push({
                        x: xpos,
                        y: ypos,
                        width: width,
                        height: height,
                        click: click,
                        add: addCondition,
                        id: obj.id,
                        Model: obj.Model,
                        Origin: obj.Origin,
                        cluster: obj.cluster,
                        MPG: obj.MPG,
                        Car: obj.Car

                    })
                }else{
                    var obj = ClusterModeler.deletedNodesData[count];
                    data[row].push({
                        x: xpos,
                        y: ypos,
                        width: width,
                        height: height,
                        click: click,
                        add: addCondition,
                        id: count,
                        Model: "",
                        Origin: "",
                        cluster: -1,
                        MPG: "",
                        Car: "",
                    })
                }
               
                // increment the x position. I.e. move it over by 50 (width variable)
                xpos += width;
                count += 1;
            }
            // reset the x position after a row is complete
            xpos = 1;
            // increment the y position for the next row. Move it down 50 (height variable)
            ypos += height;
        }

        GridData.dataArray = []
        for(var i = 0; i< data.length; i++){
            for(var j= 0;j<data[i].length;j++){
                GridData.dataArray.push(data[i][j]);
            }
            // GridData.dataArray.push.apply(GridData.dataArray, data[i])
        }

        GridData.dataNodes = data.slice();
        return ht;
    }


    GridData.makeGridNodesVis = function (containerId = ""){

         console.log('make grid nodes again ')

        if (containerId == "") containerId = "gridDataPanel";
        $("#"+containerId).empty();
       
        var w = $("#" + containerId).width() * 0.92,
            h = $("#" + containerId).height() * 0.92;

        var fac = 0.8;

        var h = GridData.formDataGrid(w,h);
        GridData.addTopBar();
        // I like to log the data to the console for quick debugging
        // console.log(GridData.dataNodes);


        var tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "gridDataTooltip")
            .attr("id", "gridDataTooltip_" + containerId);
        
            


        var grid = d3.select("#"+containerId)
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append('g')
            .attr('class', 'grpgrid')
            .attr('transform', 'translate(10,10)')

        var row = grid.selectAll(".row")
            .data(GridData.dataNodes)
            .enter().append("g")
            .attr("class", "row");

        var column = row.selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .filter(function (d) { return d.add })
            .attr("class", "gridCircle")
            .attr("id", function(d){return "gridCircleId_"+d.id})
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y; })
            .attr("rx", function (d) { return d.width * fac; })
            .attr("ry", function (d) { return d.height * fac; })
            .attr("width", function (d) { return d.width * fac; })
            .attr("height", function (d) { return d.height * fac; })
            // .style("fill", "#fff")
            .style("fill", function (d) {
                return ClusterModeler.color(d.cluster);
            })
            .style("stroke", "#222")
            .on("mouseover", function (d, i) {
                // console.log('data mouse overed d ', d)
                d3.select(this).style("stroke", "black");
                GridData.tooltipStylingContent(d, tooltip);
                // d3.selectAll(".gridCircle").style("opacity", 0.5);
                d3
                    .selectAll("#gridCircleId_" + d.id)
                    .style("opacity", 1)
                    .style("stroke-width", '2px')
                    .style("stroke", 'black');
            })
            .on("mouseout", function (d, i) {

                // d3.selectAll(".gridCircle").style("opacity", 1);
                // d3
                //     .selectAll("#gridCircleId_" + d.id)
                    // .style("opacity", 1)
                    // .style("stroke-width", "None")
                    // .style("stroke", "transparent");
                tooltip.style("display", "none");
                d3.select(this).style("stroke", "#222");
                d3.select(this).style("stroke-width", "");
            })
            .on('click', function (d) {
                d.click++;
                if ((d.click) % 4 == 0) { d3.select(this).style("fill", "#fff"); }
                if ((d.click) % 4 == 1) { d3.select(this).style("fill", "#2C93E8"); }
                if ((d.click) % 4 == 2) { d3.select(this).style("fill", "#F56C4E"); }
                if ((d.click) % 4 == 3) { d3.select(this).style("fill", "#838690"); }
            });
    }


}())