/*

 ClusterModeler.visClus = function (containerId = "") {
        var width = 960,
            height = 500;
        ClusterModeler.radius = 15;
        var dataIn = Main.trainData;
        var m = 6;
        var maxRadius = 12,
            padding = 4, // separation between same-color nodes
            clusterPadding = 12;
        if (containerId == "") {
            containerId = "clusterDivSvg";
        }

        var clusters = new Array(m);

        width = $("#" + containerId).width() * 0.98;
        height = $("#" + containerId).height() * 0.98;

        var fill = d3.scale.category10();

        // var nodes = d3.range(100).map(function (i) {
        //     return { index: i };
        // });

        var nodes = dataIn.map(function (d, i) {
            var b = Math.floor(Math.random() * m)
            d.fixed = false;
            d.index = i
            d.radius = ClusterModeler.radius; // Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius;
            // d.radius = Math.sqrt((i + 1) / m * -Math.log(Math.random())) * maxRadius,
            // d.radius = Util.getRandomNumberBetween(30,9)
            d.x = Math.cos(i / m * 2 * Math.PI) * 200 + width / 2 + Math.random();
            d.y = Math.sin(i / m * 2 * Math.PI) * 200 + height / 2 + Math.random();
            d.cluster = +d.cluster;
            // d.x = Util.getRandomNumberBetween(w,0)
            // d.y = Util.getRandomNumberBetween(h,0)
            // d.x = 0;
            // d.y = 0;
            // if (!clusters[i]) clusters[i] = d; //|| (d.radius > clusters[i].radius)
            clusters[i] = d; //|| (d.radius > clusters[i].radius)
            if (!clusters[i] || (d.radius > clusters[i].radius)) clusters[i] = d;
            return d;
        });

        var force = d3.layout.force()
            .nodes(nodes)
            .size([width, height])
            .on("tick", tick)
            .start();

        var svg = d3.select("#" + containerId).append("svg")
            .attr("width", width)
            .attr("height", height);

        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("r", 8)
            .style("fill", function (d, i) {
                return fill(i & 3);
            })
            .style("stroke", function (d, i) {
                return d3.rgb(fill(i & 3)).darker(2);
            })
            .call(force.drag)
            .on("mousedown", function () {
                d3.event.stopPropagation();
            });

        svg.style("opacity", 1e-6)
            .transition()
            .duration(1000)
            .style("opacity", 1);

        d3.select("body")
            .on("mousedown", mousedown);


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
            var quadtree = d3.geom.quadtree(nodes);
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

        function tick(e) {

            // Push different nodes in different directions for clustering.
            // var k = 10 * e.alpha;
            // nodes.forEach(function (o, i) {
            //     o.y += i & 1 ? k : -k;
            //     o.x += i & 2 ? k : -k;
            // });

            // node.attr("cx", function (d) { return d.x; })
            //     .attr("cy", function (d) { return d.y; });


            node
                .each(cluster(7 * e.alpha * e.alpha))
                .each(collide(.01))
                .attr("cx", function (d) {
                    return d.x;
                })
                .attr("cy", function (d) {
                    return d.y;
                });
        }

        function mousedown() {
            nodes.forEach(function (o, i) {
                o.x += (Math.random() - .5) * 40;
                o.y += (Math.random() - .5) * 40;
            });
            force.resume();
        }



    }





*/