(function () {

    ClusterOthers = {};
    ClusterOthers.clusterCenterPos = {};
    ClusterOthers.makeD3ClusterVisOther = function (containerId = "") {

        if (containerId == "") {
            containerId = "clusterDivSvg";
        }
        var svgId = "clusterSvgId_" + containerId;
        $("#" + svgId).remove();

        ClusterOthers.radius = 8

        var n = 100,
            m = ClusterModeler.numClusters,
            // radius = 7,
            maxRadius = 10,
            padding = 4, // separation between same-color nodes
            clusterPadding = 12,
            fill = d3.scale.category20();

        ClusterOthers.nodes = d3.range(100).map(Object);

        // var min_zoom = 0.1;
        // var max_zoom = 7;
        // var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom])

        var m = ClusterModeler.numClusters;
        var clusters = new Array(m);
        var dataNew = Main.trainData.slice(0);


        var w = $("#" + containerId).width() * 0.98;
        var h = $("#" + containerId).height() * 0.98;

        var vis = d3.select("#" + containerId).append("svg")
            .attr("id", svgId)
            .attr("width", w)
            .attr("height", h)



        ClusterOthers.force = d3.layout.force()

            // d3.forceSimulation(ClusterModeler.nodes)
            .nodes(ClusterOthers.nodes)
            .links([])
            .size([w, h])
            .friction(0.75)
            .gravity(.02) //0.02
            .charge(-30) //0
            .start()



        ClusterOthers.updateOthers = function (dataIn = Main.trainData) {
            //////////////////////////////////////////////////////////////////////////////
            m = ClusterModeler.numClusters;
            ClusterOthers.color = d3.scale.category20()
                .domain(d3.range(m));
            clusters = new Array(m);
            d3.selectAll('path').remove();
            var lay = false
            ClusterOthers.lastClusterId = 0;
            ClusterOthers.clusterIds = [];
            ClusterOthers.nodes = dataIn.map(function (d, i) {
                var b = Math.floor(Math.random() * m)
                d.fixed = false;
                d.radius = 8;
                d.cluster = +d.cluster;
                if (d.cluster > ClusterOthers.lastClusterId) ClusterOthers.lastClusterId = d.cluster;

                if (ClusterOthers.clusterIds.indexOf(d.cluster) == -1) ClusterOthers.clusterIds.push(+d.cluster);

                clusters[i] = d; //|| (d.radius > clusters[i].radius)
                return d;
            });

            // console.log('updateing cluster id ', ClusterModeler.clusterIds, ClusterModeler.lastClusterId)
            ClusterOthers.posClusterCenters(w, h);



            ClusterOthers.force
                .nodes(ClusterOthers.nodes)
                .links([])
                .start()


            // var drag = ClusterModeler.force.drag()
                // .on("dragstart", dragstart)
                // .on("drag", dragmove)
                // .on("dragend", dragend);

            //DATA ----
            var nodeData = vis.selectAll("circle").data(ClusterOthers.nodes);


            // transition
            var t = d3.transition()
                .duration(750);

            //EXIT ---
            nodeData.exit().remove();

            //UPDATE ---
            nodeData
                .transition(t)
                // .style("fill", "#3a403d")
                .attr("r", function (d) {
                    return ClusterOthers.radius
                })
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                })


            //ENTER ---
            var node = nodeData.enter().append("circle")
                .attr("class", function (d) {
                    return "nodeOther_"+svgId+" nodeOther_" + d.id;
                })
                .style("fill", function (d) {
                    // if (d.id == 25) console.log('distance coloring ', d.cluster, d.id)
                    return ClusterOthers.color(d.cluster);
                })
            // .on("mouseover", function (d, i) {
            //     // console.log('data mouse overed d ', d)
            //     ClusterModeler.tooltipWindow(d, tooltip);
            //     if (ClusterModeler.selectedNodeId != d.id) {
            //         d3.select(this).style("stroke", "black");

            //         d3.selectAll("circle").style("opacity", 0.2);
            //         d3
            //             .selectAll(".node_" + d.id)
            //             .style("opacity", 1)
            //             .style("stroke-width", '2px')
            //             .style("stroke", 'black');
            //     }
            // })
            // .on("mouseout", function (d, i) {
            //     if (ClusterModeler.selectedNodeId != d.id) {
            //         d3.selectAll("circle").style("opacity", 1);
            //         d3
            //             .selectAll(".node_" + d.id)
            //             .style("stroke-width", "None")
            //             .style("stroke", "transparent");

            //         d3.select(this).style("stroke", "transparent");
            //     }
            //     tooltip.style("display", "none");

            // })
            // .on("mousedown", function (d, i) {
            //     if (d3.event.defaultPrevented) return;
            //     d3.event.preventDefault();
            //     console.log('clicked ', d3.event)

            //     // d3.event.defaultPrevented = true
            //     if (ClusterModeler.draggedNodeId == d.id) return;
            //     if (ClusterModeler.selectedNodeId == d.id) {
            //         ClusterModeler.selectedNodeId = -1;
            //         // $(".node_" + d.id).css('fill', ClusterModeler.color(d.cluster))
            //         $(".node_" + d.id).css('stroke', "")
            //         console.log('click behavior')
            //     } else {
            //         ClusterModeler.selectedNodeId = d.id;
            //         // $(".node_" + d.id).css('fill', 'black')
            //         $(".node").css('stroke', "")
            //         $(".node_" + d.id).css('stroke', 'black')
            //         $(".node_" + d.id).css('stroke-width', '5px')

            //     }

            // })




            nodeData.transition()
                .duration(750)
                .delay(function (d, i) {
                    return i * 5;
                })
                .attrTween("r", function (d) {
                    var i = d3.interpolate(0, d.radius);
                    return function (t) {
                        return d.radius = i(t);
                    };
                });




            vis.style("opacity", 1e-6)
                .transition()
                .duration(1000)
                .style("opacity", 1);



            ClusterOthers.force.on("tick", tickSimulate);

            var min_zoom = 0.1;
            var max_zoom = 7;
            var zoom = d3.behavior.zoom().scaleExtent([min_zoom, max_zoom])
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
            vis.call(zoom);

            zoom.on("zoom", function () {
                var circle = d3.selectAll(".nodeOther_" + svgId);
                // var paths = d3.selectAll("path");
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

                //circle.attr("r", function(d) { return (size(d.size)*base_radius/nominal_base_node_size||base_radius); })
                // if (!text_center) text.attr("dx", function (d) { return (size(d.size) * base_radius / nominal_base_node_size || base_radius); });

                // var text_size = nominal_text_size;
                // if (nominal_text_size * zoom.scale() > max_text_size) text_size = max_text_size / zoom.scale();
                // text.style("font-size", text_size + "px");

                circle.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                // paths.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
                // d3.selectAll(".gridCenRect").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

                ClusterOthers.translate = d3.event.translate;
                ClusterOthers.scale = d3.event.scale;
            });



            function tickSimulate(e) {

                ClusterOthers.forceTickStart = true;

                nodeData.each(move_towards_year(e.alpha))
                    .attr("cx", function (d) {
                        return d.x;
                    })
                    .attr("cy", function (d) {
                        return d.y;
                    });


                // ClusterOthers.makeTheHull();
            }

            function move_towards_year(alpha) {
                return function (d) {
                    var damper = 0.1
                    // console.log(' lets check target ', d.cluster, ClusterModeler.clusterCenterPos)
                    try {
                        var target = ClusterOthers.clusterCenterPos[d.cluster];
                        d.x = d.x + (target.x - d.x) * (damper + 0.02) * alpha * 1.1;
                        d.y = d.y + (target.y - d.y) * (damper + 0.02) * alpha * 1.1;
                    } catch (err) {
                        // console.log(' lets check target ', d.cluster, ClusterModeler.clusterCenterPos)
                    }

                };
            }


            d3.selectAll('.node')
                .transition()
                .delay(1000)
                .duration(300)
                .attr("r", ClusterOthers.radius);


        } // end of update


        ClusterOthers.updateOthers(dataNew);


        return;
    }
    ClusterOthers.posClusterCenters = function (w, h) {

        var k = 0.75,
            l = 1 - k;

        if (ClusterOthers.clusterIds.length > 6) {
            k = 0.80
            l = 1 - k
        }

        if (ClusterOthers.clusterIds.length > 7) {
            k = 0.85
            l = 1 - k
        }

        if (ClusterOthers.clusterIds.length >= 8) {
            k = 0.95
            l = 1 - k
        }



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

        for (var i = 0; i < ClusterOthers.clusterIds.length; i++) {
            ClusterOthers.clusterCenterPos[ClusterOthers.clusterIds[i]] = ptArr[i]
        }

    }


}())