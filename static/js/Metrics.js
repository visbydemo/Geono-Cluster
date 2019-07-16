(function () {

    Metrics = {}
    Metrics.clusterMembersNumByUser = {}
    Metrics.externalCoeff = Util.getRandomNumberBetween(1, 0).toFixed(4);


    Metrics.updateGlobalResults = function (data = Main.trainData) {
        setTimeout(() => {
            try {
                ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters'] = ClusterModeler.groups.length;
            } catch (err) {
            }
            ClusterModeler.numClusters = ClusterModeler.allModelData[ClusterModeler.selectedModelId]['numClusters']
            console.log('updating  data in global results ', data.length)
            $(".globClustCoeff").html("Global cluster coeff : " + Metrics.externalCoeff);
            $("#clusterExtCoeffDiv").slider("value", Metrics.externalCoeff);
            $("#numCluster").slider("value", ClusterModeler.numClusters);
            $("#numClusterNum").html(ClusterModeler.numClusters);
            $("#dataItemNum").html(data.length);
            setTimeout(() => {
                Metrics.makeNumClusterHorizChart("clusterMembersDiv");
            }, 1000);            
        }, 200);
 
    }


    Metrics.addGlobalResults = function (dataIn = Main.trainData, containerId = "") {
        // return
        if (containerId == "") containerId = "globalPanel";
        console.log('data in global results ', dataIn)
        $('#' + containerId).empty();
        var numClus = ClusterModeler.numClusters; //parseInt(Util.getRandomNumberBetween(10, 4))
        var extCoeff = Metrics.externalCoeff;
        var numData = dataIn.length;

        var htmlStr = "<div class = 'glHeader'><span class = 'glHead' > Global  " + "</span><span class = 'spnBtnCluster' >  <button id = 'btnCluster' class='ui-button ui-widget ui-corner-all'>Cluster </button></span></div>";
        htmlStr += "<div class = 'glContent' ><span>Data items    : </span> <span id = 'dataItemNum' > " + numData + " </span></div></div>";
        htmlStr += "<div class = 'glContent' ><div class = 'glContent' ><span>Number of Clusters    : </span> <span id = 'numClusterNum' > " + numClus + " </span></div><div class = 'sliderClass' id = 'numCluster' title= 'Value slidr: ' </div></div></div>";

        // htmlStr += "<div class = 'glContent' ><div>Most number in a Cluster : " + parseInt(Util.getRandomNumberBetween(100, 30)) + "</div>";
        // htmlStr += "<div class = 'glContent' ><div>Least number in a Cluster : " + parseInt(Util.getRandomNumberBetween(30, 4)) + "</div>";
        htmlStr += "<div class = 'glContent' ><div class ='globClustCoeff' >Global cluster coeff : " + extCoeff + "</div></div>";

        htmlStr += "<div class = 'sliderClass' id = 'clusterExtCoeffDiv' ></div>";
        htmlStr += "<div id = 'clusterMembersDiv' ></div>";
        $('#' + containerId).append(htmlStr);


        $('.glHeader').css('border-bottom', '1px solid lightgray');
        $('.glHeader').css('padding-bottom', '5px');
        $("#clusterMembersDiv").css('padding-top', '25px')
        $('.spnBtnCluster').css('float', 'right')
        $('.spnBtnCluster').css('text-align', 'center')
        $("#btnCluster").button();
        $("#btnCluster").css('width', '60px')
        $("#btnCluster").css('height', '30px')
        $("#btnCluster").css('font-size', '0.8em')
        $("#btnCluster").css('display', 'flex')
        $("#btnCluster").css('justify-content', 'center')

        $("#btnCluster").on('click', function (e) {
            console.log('getiing cluster ');
            if (GridData.dataArray.length > 0) {
                for (var i = 0; i < GridData.dataArray.length; i++) {
                    var id = GridData.dataArray[i]['id'];
                    var dataPt = Main.getDataById(id);
                    if (dataPt != null) {
                        dataIn.splice(i, 1);
                    }
                }
                console.log('train data length now is ', dataIn)
            }

            for (var i = 0; i < ClusterModeler.numRecommendations; i++) {
                ClusterModeler.getClustering(true, false, Main.currentData, i);
            }

            setTimeout(() => {
                LocalInfoCluster.updateExistingCards();
            }, 500);

            // ClusterModeler.getClustering(true, Main.currentData);
        })

        $("#clusterMembersDiv").css('width', '100%')
        // $("#clusterMembersDiv").css('height', '90%')


        $(".glHead").css("font-weight", "bold");
        $(".glContent").css("padding-bottom", "10px");

        $(".sliderClass").css('height', '4px')
        // $('.ui-corner-all').css('height', '7px')
        // $('.ui-corner-all').css('bacground', 'red')
        // $('.ui-corner-all').css('padding', '3px')

        setTimeout(() => {
            $("div.sliderClass").children().css('height', '14px')
            $("div.sliderClass").children().css('height', '7px')
            $("div.sliderClass").children().css('bacground', 'red')
            $("div.sliderClass").children().css('padding', '5px')
        }, 200);



        // slider addition
        $("#numCluster").slider({
            max: 30,
            min: 2,
            step: 1,
            value: numClus,
            change: function (event, ui) {

            },
            slide: function (event, ui) {
                // console.log("value changed is a", $(this).slider('value'))
                $(this).attr('title', 'Value Slider now : ' + $(this).slider('value'))
                $("#numClusterNum").html($(this).slider('value'));
                ClusterModeler.numClusters = parseInt($(this).slider('value'))
            }
        });

        $("#clusterExtCoeffDiv").slider({
            max: 1,
            min: 0,
            value: extCoeff,
            step: 0.0222,
            change: function (event, ui) {

            },
            slide: function (event, ui) {
                // console.log("value changed is a", $(this).slider('value'))
                $(this).attr('title', 'Value Slider now : ' + $(this).slider('value'))

                $(".globClustCoeff").html("Global cluster coeff : " + $(this).slider('value'));
            }
        });

        setTimeout(() => {
            Metrics.makeNumClusterHorizChart("clusterMembersDiv");
        }, 1000);

    }


    Metrics.featureWeights = function (containerId = "") {
        if (containerId == "") containerId = "gridDataPanel" // featurePanel

        $("#" + containerId).empty()
        var numAttr = [];
        try{
            var obj = ClusterModeler.allModelData[ClusterModeler.selectedModelId]['globalClusterWtObj']
            for (var item in obj) {
                numAttr.push(item);
            }

        }catch(err){
            for (var item in Main.attrDict) {
                numAttr.push(item);
            }
        }
      

        console.log('main attr dict ', Main.attrDict, numAttr);
        //remove array element
        // var itemArray = ['d3mIndex']
        // //  var numAttr = mar.numericalAttributes.slice();
        // for (var i = 0; i < itemArray.length; i++) {
        //     var index = numAttr.indexOf(itemArray[i]);
        //     if (index > -1) {
        //         numAttr.splice(index, 1);
        //     }
        // }



        var num_cols = numAttr.length;
        var colAdj = 80;

        //add console chart panel, rows, and individual cells
        var consolePanel = d3.select("#" + containerId)
            .append("div")
            .attr("id", "attrChartDiv")


        var htmlStr = "<div id='headingRowVis'><h6>Global Attribute Weights  </h6></div><br>";
        $("#" + containerId).prepend(htmlStr);

        consolePanel = consolePanel.attr("style", "overflow-y:auto;")
            .append("table")
            .attr("id", "consoleChart")
            .style('width', '100%')
        // .attr("style", "overflow:hidden;");


        var classNameFirstConsoleAttr = "1stconTr";
        var classNameConsoleAttr = "conTr";
        console_rows = consolePanel.append("tbody")
            .style('width', '100%')
            .selectAll("tr")
            .data(numAttr)
            .enter()
            .append("tr")
            .attr("class", function (d, i) {
                // console.log('class ofund ', i, d)
                if (i == 0)
                    return classNameFirstConsoleAttr;
                else
                    return classNameConsoleAttr;
            }).attr("id", function (d, i) {
                return "consoleTr" + i;
            }).style('border-bottom', '0.5px solid lightgray')

        var attributeWeights = [];
        var changedAttributes = [];

        var widDiv = $("#" + containerId).height() * 0.65
        // console_width = $("#auxContentDiv").width() + 175; //90 // 175 worked
        console_width = $("#" + containerId).height() - widDiv; //90 // 175 worked
        //For each row, a SVG is added of width proportional to number of rows
        var svgConsole = console_rows.selectAll("td")
            .data(function (column, i) {
                colWidth = (1 / num_cols);
                if (column === "interactionWeight") {
                    colWidth = 0.5;
                    column = "Maximum Interaction Weight";
                }
                return [{
                    id: i,
                    name: column,
                    amount: colWidth
                }];
            }).enter()
            .append("td")
            .html(function (d) {
                attributeWeights[d.id] = d.amount;
                return "<div class = 'textConsole' ><p class=columnChartName id=col" + d.id + " title=" + d.title + ">" + d.name + "</p></div>";
            })
            .append("div")
            .attr("class", "divSvg")
            .attr("id", function (d, i) {
                return "divSvgCons" + i;
            })
            .append("svg")
            .attr("height", 7);

        $(".columnChartName").css('font-size', '0.8em')

        svgConsole.append("rect")
            .style('cursor', 'ew-resize')
            .attr("fill", function (d) {
                if (d.amount >= 0) {
                    return Main.colors.POS_COL;
                }
                return Main.colors.NEG_COL;
            }).attr("id", function (d) {
                return "rect" + d.id;
            })
            .attr("width", function (d) {
                if (typeof d.width == 'undefined') return 1 + 'px'
                else return d.width + "px";


                //  return "0px";
            }).attr("title", function (d) {
                return (d.amount * 100).toFixed(0) + "%";
            }).attr("height", "10px").attr("transform", "translate(" + colAdj + ",0)")
            .call(d3.behavior.drag().on('drag', function (d) {



                colAdj = 150; //80
                //Dragging updates the width, and sets the amount based on how much it's moved.

                //  console.log(document.getElementsByClassName("textConsole")[0].clientWidth);

                if (d == undefined) {
                    // console.log("Its Undefinded");
                    //d = consolechartSortedData;
                }

                var new_width = d.width + d3.event.dx;

                if (new_width > console_width / 2)
                    new_width = console_width / 2;

                if (new_width < console_width / -2)
                    new_width = console_width / -2;

                d.width = new_width;
                d.visibleWidth = (d.width < 2 && d.width > -2 ? 2 : Math.abs(d.width));
                //d.visibleWidth = d.width;

                d.amount = 2 * d.width / console_width;
                console.log('dragged ', d)

                ClusterModeler.allModelData[ClusterModeler.selectedModelId]['userDefinedAttrbWt'][d.name] = d.amount;

                var absVal = Math.abs(d.amount);

                if (d.amount < 0) {
                    colAdj += (console_width * d.amount) / 2;
                }
                attributeWeights[d.id] = d.amount;
                changedAttributes[d.id] = d.amount;
                d3.select(this).attr("width", d.visibleWidth);
                d3.select(this).attr("title", (d.amount * 100).toFixed(0) + "%").attr("fill", function (i) {
                    if (d.amount >= 0) {
                        return Util.getPositiveMoveWithOpacity(.3 + absVal);
                    } else {
                        return Util.getNegativeMoveWithOpacity(.3 + absVal);
                    }
                }).attr("transform", "translate(" + colAdj + ",0)");


            })) // end of behavior drag

        //console.log("here the svg elem is, ", svgConsole);

        var vertLine = svgConsole.append("line")
            .attr("class", "consVertLine")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 100)
            .attr("transform", "translate(" + (colAdj + 70) + ",-30)")
            .attr("stroke-width", 2)
            .attr("stroke", "black");

        var attrPanelRowHeight = 1;

        //        $(".conTr").each(function(i, d) {
        //                $(this).css("height", attrPanelRowHeight);
        //        });

        //On hover, change the width of the svg so its easier to drag, decrease on drag-out.
        d3.selectAll("#consoleChart svg")
            .on('mouseover', function (d) {
                if (d.visibleWidth >= 10) return;
                $(this).find("rect").attr("width", d.visibleWidth + 5);
            })
            .on('mouseout', function (d) {
                $(this).find("rect").attr("width", d.visibleWidth);
            })

        //cache the console chart by saving all datum values.
        htmlConsoleToCache = [];
        d3.selectAll("#consoleChart td").each(function (d) {
            htmlConsoleToCache.push({
                "amount": d.amount,
                "width": d.width,
                "visibleWidth": d.visibleWidth,
                "name": d.name
            });

            //            $(this).css("height", attrPanelRowHeight);
        });

        $(".columnChartName").each(function (d) {
            $(this).css("height", attrPanelRowHeight);
        });


        //add elements to the DOM and then apply headings
        $("#attrChartDiv").append("<br>");
        var htmlStr = "<div id='rowVis'></div>"
        $("#" + containerId).append(htmlStr);
        htmlStr = "<div id='modelDetVis'></div>";
        $("#" + containerId).append(htmlStr);


        //hide the consoole chart ( attrb panel)
        //  $("#attrChartDiv").hide();
        //  $("#consoleChart").hide();

        var wts = [];
        try{
            var obj = ClusterModeler.allModelData[ClusterModeler.selectedModelId]['globalClusterWtObj']
            for (item in obj) {
                wts.push(obj[item])
            }
        }catch(err){
            for (item in Main.attrDict) {
                wts.push(Util.getRandomNumberBetween(1.0, 0.1))
            }
        }
        
        Metrics.updateColumnWeights(wts);

    }



    Metrics.updateColumnWeights = function (weights) {
        var totalPercentage = 0;
        var unusedAttributes = [];
        var attributeWeights = [];
        d3.selectAll("#consoleChart td").each(function (d, i) {
            if (unusedAttributes.indexOf(i) < 0)
                totalPercentage = totalPercentage + Number(d.amount);
        });


        // The weights array does not include any user adjusted atrribute weights
        // so they have to be offset so that the iteration index matches correctly.
        var objs = d3.selectAll("#consoleChart td");
        objs.each(function (d, i) {
            if (unusedAttributes.indexOf(d.id) >= 0)
                d.amount = 0;
            else if (weights == null)
                d.amount = d.amount / totalPercentage;
            else
                d.amount = weights[d.id];

            attributeWeights[d.id] = d.amount;
            var absVal = Math.abs(d.amount);
            var colAdj = 150; // 80
            if (d.amount < 0) {
                colAdj += (console_width * d.amount) / 2;
            }

            d.width = (console_width * absVal) / 2;
            d.visibleWidth = (d.width < 3 ? 3 : d.width);
            $(this).find("rect").attr("width", d.visibleWidth);
            $(this).find("rect").attr("title", (d.amount * 100).toFixed(0) + "%").attr("fill", function (i) {
                if (d.amount >= 0) {
                    return Util.getPositiveMoveWithOpacity(.3 + absVal);
                } else {
                    return Util.getNegativeMoveWithOpacity(.3 + absVal);
                }
            }).attr("transform", "translate(" + colAdj + ",0)");
        });
    }

    Metrics.globalAttrWts = function(){
        if (Object.keys(LocalInfoCluster.clusterWtObj).length == 0) return;
        Metrics.clusterAttrGlobal = {};
        for(var item in LocalInfoCluster.clusterWtObj){
           
            var arr = LocalInfoCluster.clusterWtObj[item];
            // console.log('found item ', item, arr)
            for( var i in arr){
                if (Metrics.clusterAttrGlobal[item] == null){
                    Metrics.clusterAttrGlobal[item] = +arr[i];
                    // console.log('found ', Metrics.clusterAttrGlobal)
                }else{
                    Metrics.clusterAttrGlobal[item] += arr[i];
                    // console.log('found push ', Metrics.clusterAttrGlobal)
                }
            }            
        }//end of out for
        var max = 0;
        for(var item in Metrics.clusterAttrGlobal){
            if(Metrics.clusterAttrGlobal[item] > max) max = Metrics.clusterAttrGlobal[item];
        }
        for (var item in Metrics.clusterAttrGlobal) {
            Metrics.clusterAttrGlobal[item] = Metrics.clusterAttrGlobal[item]/max;
        }

        console.log('found max ', max , Metrics.clusterAttrGlobal)
    }


    Metrics.computeClusterMembers = function () {

        Metrics.clusterMembersNumByUser = {}
        var datagrped = d3.nest()
            .key(function (d) {
                return d.cluster;
            })
            .entries(Main.trainData);

        // console.log('found data grped ', datagrped, ClusterModeler.groups)

        var data = []
        for (var item in ClusterModeler.groups) {
            var obj = {
                label: item,
                value: ClusterModeler.groups[item]['values'].length,
            }

            Metrics.clusterMembersNumByUser[item] = +obj.value;
            data.push(obj);
        }

        data.sort(function (a, b) {
            // if (a.value > b.value) {
            if (+a.label > +b.label) {
                return -1
            } else {
                return 1
            }
        })

        return data;

    }



    Metrics.makeNumClusterHorizChart = function (containerId = "") {

        if (containerId) containerId = "clusterMembersDiv";
        $("#" + containerId).empty();
        var data = Metrics.computeClusterMembers();


        console.log('data is now ', data)

        // data = [{ label: "Category 1", value: 19 }, { label: "Category 2", value: 5 }, { label: "Category 3", value: 13 }, { label: "Category 4", value: 17 }, { label: "Category 5", value: 19 }, { label: "Category 6", value: 27 }];

        var div = d3
            .select("body")
            .append("div")
            .attr("class", "toolTip_numCluster");

        var axisMargin = 15,
            margin = 15,
            valueMargin = 4,
            width = $("#" + containerId).width(),
            height = 200, //$("#" + containerId).height()*0.8,
            barHeight = 20, //(height - axisMargin - margin * 2) * 0.7/ data.length,
            barPadding = 3, //(height - axisMargin - margin * 2) * 0.3 / data.length,
            height = (barHeight + barPadding) * data.length,
            data,
            bar,
            svg,
            scale,
            xAxis,
            labelWidth = 0;

        // console.log("data is now ", width, height);

        max = d3.max(data, function (d) {
            return +d.value;
        });

        svg = d3
            .select("#" + containerId)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        bar = svg
            .selectAll("g")
            .data(data)
            .enter()
            .append("g");

        bar
            .attr("class", "bar")
            .attr("cx", 0)
            .attr("transform", function (d, i) {
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
            });

        bar
            .append("text")
            .attr("class", "label")
            .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function (d) {
                return d.label;
            })
            .attr("transform", function (d, i) {
                return "translate(" + (-10) + "," + 0 + ")";
            })
            .each(function () {
                labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
            });

        scale = d3.scale
            .linear()
            .domain([0, max])
            .range([0, width - margin * 2 - labelWidth]);

        xAxis = d3.svg
            .axis()
            .scale(scale)
            .tickSize(-height + 2 * margin + axisMargin)
            .orient("bottom");

        var wdFac = 1.0;

        bar
            .append("rect")
            .attr('id', function (d) {
                return 'rectCluster_' + d.label;
            })
            .attr("transform", "translate(" + labelWidth + ", 0)")
            .attr("height", barHeight)
            .attr("width", function (d) {
                return scale(d.value);
            })
            .style('fill', Main.colors.HIGHLIGHT)
            .style('cursor', 'ew-resize')
            .call(d3.behavior.drag().on('drag', function (d) {

                wdFac -= 0.0002;
                if (wdFac < 0.1) widFac = 1;
                var wid = $(this).attr('width');

                var new_width = +wid + d3.event.dx;
                var valPer = (d.value * 1.0) / (wid * 1.0);
                var valNew = (valPer * new_width);
                // d.value = wdFac*d.value;
                // d3.selectAll("#rectCluster_"+d.label).attr('width', wid*wdFac )

                Metrics.clusterMembersNumByUser[d.label] = +Math.floor(valNew).toFixed(0);
                d3.selectAll("#rectCluster_" + d.label).attr('width', new_width)
                d3.selectAll("#textCluster_" + d.label).text(function (d) {
                        d.value = (valNew).toFixed(0);
                        return Math.floor(valNew).toFixed(0);
                    })
                    .attr("x", function (d) {
                        var wp = new_width - 15;
                        if (wp < 20) wp = 20
                        // if (wp > +$("#" + containerId).attr('width')) wp = +$("#" + containerId).attr('width') - 15
                        return wp;
                    })


                // console.log('dragging ', d, wid, wdFac)
                // console.log('dragging ', new_width, wid, d3.event.dx, valNew)

            }))

        bar
            .append("text")
            .attr("class", "value")
            .attr("id", function (d) {
                return "textCluster_" + d.label
            })
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function (d) {
                // return d.value.toFixed(3) + "%";
                return d.value;
                // return (d.value * 100 / max).toFixed(2) + "%";
            })
            .attr("x", function (d) {
                var width = this.getBBox().width;
                var wp = Math.max(width + valueMargin - 15, scale(d.value) - 15);
                if (wp < 20) wp = 20
                return wp
            })
            .style("fill", Main.colors.BLACK)
            .style("font-size", '0.75em')



        // var brush = d3.svg.brush()
        //     // .extent(function (d, i) {
        //     //     return [[0, y(i) + delim / 2],
        //     //     [width, y(i) + height / data.length - delim / 2]]
        //     // })
        //     .x(scale)
        //     .on("brush", brushmove);


        // var svgbrush = svg
        //     .selectAll('.brush')
        //     .data(data)
        //     .enter()
        //     .append('g')
        //     .attr('class', 'brush')
        //     .append('g')
        //     .call(brush)
        //     .call(brush.move, function (d) { return [0, +d.value].map(scale); });


        // function brushmove() {
        //     console.log('brushmoving ')
        //     if (!d3.event.sourceEvent) return; // Only transition after input.
        //     if (!d3.event.selection) return; // Ignore empty selections.
        //     if (d3.event.sourceEvent.type === "brush") return;

        //     var d0 = d3.event.selection.map(scale.invert);
        //     var d1 = [0, d0[1]];

        //     // return

        //     var d = d3.select(this).select('.selection');;

        //     d.datum().value = d0[1]; // Change the value of the original data

        //     d3.select(this).call(d3.event.target.move, d1.map(scale));

        //     svgbrush
        //         .selectAll('text')
        //         .attr('x', function (d) { return scale(d.value) - 25; })
        //         .text(function (d) { return d3.format('.2')(d.value); });

        // }

        bar.on("mousemove", function (d) {
            div.style("left", d3.event.pageX + 10 + "px");
            div.style("top", d3.event.pageY - 25 + "px");
            div.style("display", "inline-block");
            div.html(d.label + "<br>" + d.value + "%");
        });
        bar.on("mouseout", function (d) {
            div.style("display", "none");
        });

        svg
            .insert("g", ":first-child")
            .attr("class", "axisHorizontal")
            .attr("transform", "translate(" + (margin + labelWidth) + "," + (height - axisMargin - margin) + ")")
        // .call(xAxis);
    }

}())