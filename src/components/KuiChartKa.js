import { selection, select } from "d3-selection";
import { max, min, sum, cumsum } from "d3-array";
import { tree, stratify } from "d3-hierarchy";
import { zoom, zoomIdentity, zoomTransform } from "d3-zoom";
import { linkHorizontal } from 'd3-shape';
import { drag } from 'd3-drag';
const d3 = {
    selection,
    select,
    max,
    min,
    sum,
    cumsum,
    tree,
    stratify,
    zoom,
    zoomIdentity,
    zoomTransform,
    linkHorizontal,
    drag
}

export class KuiChartKa {
    constructor() {
        const attrs = {
            id: 'ID' + Math.floor(Math.random() * 1000000), // Id for event handlings
            svgWidth: 800,
            svgHeight: window.innerHeight - 100,
            marginTop: 0,
            marginBottom: 0,
            firstDraw: true,
            marginRight: 0,
            marginLeft: 0,
            container: 'body',
            defaultTextFill: '#2C3E50',
            nodeTextFill: 'white',
            defaultFont: 'Helvetica',
            backgroundColor: '#fafafa',
            data: null,
            depth: 180,
            duration: 600,
            strokeWidth: 3,
            dropShadowId: null,
            initialZoom: 1,
            onNodeClick: d => d,
            nodeId: d => d.nodeId || d.id,
            parentNodeId: d => d.parentNodeId || d.parentId,
            nodeDefaultBackground: 'none',
            scaleExtent: [0.001, 20],
        };

        Object.keys(attrs).forEach(key => {
            this[key] = function (_) {
                if (!arguments.length) {
                    return attrs[key];
                } else {
                    attrs[key] = _;
                }
                return this;
            }
        });
        this.getAttrs = () => attrs;
        d3.selection.prototype.patternify = function (params) {
            var container = this;
            var selector = params.selector;
            var elementTag = params.tag;
            var data = params.data || [selector];

            // Pattern in action
            var selection = container.selectAll("." + selector).data(data, (d, i) => {
                if (typeof d === "object") {
                    if (d.id) { return d.id; }
                }
                return i;
            });
            selection.exit().remove();
            selection = selection.enter().append(elementTag).merge(selection);
            selection.attr("class", selector);
            return selection;
        };
    }
    render() {
        const attrs = this.getAttrs();
        const data = attrs.data;
        if (!data || data.length < 1) {
            console.log('ORG CHART - Data is empty')
            return this;
        }

        var container = d3.select(attrs.container);
        var containerRect = container.node().getBoundingClientRect();
        if (containerRect.width > 0) attrs.svgWidth = containerRect.width;

        //Calculated properties
        var calc = {
            id: null,
            chartTopMargin: null,
            chartLeftMargin: null,
            chartWidth: null,
            chartHeight: null
        };
        calc.id = 'ID' + Math.floor(Math.random() * 1000000); // id for event handlings
        calc.chartLeftMargin = attrs.marginLeft;
        calc.chartTopMargin = attrs.marginTop;
        calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
        calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;
        calc.nodeMaxWidth = 170;
        calc.nodeMaxHeight = 250;

        attrs.depth = calc.nodeMaxHeight + 100;

        calc.centerX = calc.chartWidth / 2;
        attrs.calc = calc;

        //********************  LAYOUTS  ***********************
        const layouts = {
            treemap: null
        }

        layouts.treemap = d3.tree().size([calc.chartWidth, calc.chartHeight])
            .nodeSize([calc.nodeMaxWidth + 100, calc.nodeMaxHeight + attrs.depth])

        attrs.layouts = layouts;

        // ******************* BEHAVIORS  **********************
        if (attrs.firstDraw) {
            const behaviors = {
                zoom: null
            };

            // Get zooming function
            behaviors.zoom = d3.zoom().scaleExtent(attrs.scaleExtent).on("zoom", (event, d) => this.zoomed(event, d))
            attrs.zoomBehavior = behaviors.zoom;
            behaviors.drag = d3.drag()
                .on("start", this.dragstarted)
                .on("drag", (e, d) => this.dragged(e, d))
                .on("end", (e, d) => this.dragended(e, d))
            attrs.dragBehavior = behaviors.drag;
        }
        //****************** ROOT node work ************************
        const root = d3
            .stratify()
            .id((d) => attrs.nodeId(d))
            .parentId(d => attrs.parentNodeId(d))(attrs.data);

        root.x0 = 0;
        root.y0 = 0;
        attrs.root = root;
        const allNodes = attrs.root.descendants();

        allNodes.forEach(d => {
            Object.assign(d.data, {
                directSubordinates: d.children ? d.children.length : 0,
                totalSubordinates: d.descendants().length - 1,
                nodeIcon: { size: 32 }
            })
        })
        attrs.allNodes = allNodes;
        root.children.forEach(ch => this.collapse(ch));
        // root.children.forEach(expandSomeNodes);
        if (attrs.root.children) {
            // Expand all nodes first
            attrs.root.children.forEach(ch => this.expand(ch));
            // Then collapse them all
            attrs.root.children.forEach((d) => this.collapse(d));

            // Collapse root if level is 0
            if (attrs.expandLevel == 0) {
                attrs.root._children = attrs.root.children;
                attrs.root.children = null;
            }

            // Then only expand nodes, which have expanded proprty set to true
            [attrs.root].forEach((ch) => this.expandSomeNodes(ch));
        }

        //Add svg
        var svg = container
            .patternify({
                tag: 'svg',
                selector: 'svg-chart-container'
            })
            .attr('width', attrs.svgWidth)
            .attr('height', attrs.svgHeight)
            .attr('font-family', attrs.defaultFont)
            .call(attrs.zoomBehavior)
            .attr('cursor', 'move')
            .style('background-color', attrs.backgroundColor)
        if (attrs.firstDraw) {
            svg.call(attrs.zoomBehavior)
                .on("dblclick.zoom", null)
                .attr("cursor", "move")
        }
        attrs.svg = svg;
        //Add container g element
        var chart = svg
            .patternify({
                tag: 'g',
                selector: 'chart'
            })
            .attr('transform', 'translate(' + calc.chartLeftMargin + ',' + calc.chartTopMargin + ')');

        attrs.chart = chart;
        if (attrs.lastTransform) {
            attrs.behaviors.zoom
                .scaleBy(chart, attrs.lastTransform.k)
                .translateTo(chart, attrs.lastTransform.x, attrs.lastTransform.y)
        }
        var centerG = chart.patternify({
            tag: 'g',
            selector: 'center-group'
        })
            .attr('transform', `translate(${calc.centerX},${calc.nodeMaxHeight / 2}) scale(${attrs.initialZoom})`)

        attrs.centerG = centerG;

        const defs = svg.patternify({
            tag: 'defs',
            selector: 'image-defs'
        });

        attrs.defs = defs;
        const filterDefs = svg.patternify({
            tag: 'defs',
            selector: 'filter-defs'
        });
        attrs.filterDefs = filterDefs;

        var filter = filterDefs.patternify({ tag: 'filter', selector: 'shadow-filter-element' })
            .attr('id', attrs.dropShadowId)
            .attr('y', `${-50}%`)
            .attr('x', `${-50}%`)
            .attr('height', `${200}%`)
            .attr('width', `${200}%`)

        filter.patternify({ tag: 'feGaussianBlur', selector: 'feGaussianBlur-element' })
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 3.1)
            .attr('result', 'blur');

        filter.patternify({ tag: 'feOffset', selector: 'feOffset-element' })
            .attr('in', 'blur')
            .attr('result', 'offsetBlur')
            .attr("dx", 4.28)
            .attr("dy", 4.48)
            .attr("x", 8)
            .attr("y", 8)

        filter.patternify({ tag: 'feFlood', selector: 'feFlood-element' })
            .attr("in", "offsetBlur")
            .attr("flood-color", 'black')
            .attr("flood-opacity", 0.3)
            .attr("result", "offsetColor");

        filter.patternify({ tag: 'feComposite', selector: 'feComposite-element' })
            .attr("in", "offsetColor")
            .attr("in2", "offsetBlur")
            .attr("operator", "in")
            .attr("result", "offsetBlur");

        attrs.filter = filter;
        var feMerge = filter.patternify({ tag: 'feMerge', selector: 'feMerge-element' })

        feMerge.patternify({ tag: 'feMergeNode', selector: 'feMergeNode-blur' })
            .attr('in', 'offsetBlur')

        feMerge.patternify({ tag: 'feMergeNode', selector: 'feMergeNode-graphic' })
            .attr('in', 'SourceGraphic')

        attrs.feMerge = feMerge;
        d3.select(window).on(`resize`, () => {
            const containerRect = d3.select(attrs.container).node().getBoundingClientRect();
            attrs.svg.attr('width', containerRect.width)
            this.update(attrs.root)
        });
        // Display tree contenrs
        this.update(root)
        if (attrs.firstDraw) {
            attrs.firstDraw = false;
        }
        return this;
    }
    update(source) {
        //  Assigns the x and y position for the nodes
        const attrs = this.getAttrs();
        const treeData = attrs.layouts.treemap(attrs.root);
        const { defs, centerG, svg, chart, root, layouts } = attrs

        //  Assigns the x and y position for the nodes


        // Get tree nodes and links
        const nodes = treeData.descendants().map(d => {
            if (d.width) return d;

            let imageWidth = 100;
            let imageHeight = 100;
            let imageBorderColor = 'steelblue';
            let imageBorderWidth = 0;
            let imageRx = 0;
            let imageCenterTopDistance = 0;
            let imageCenterLeftDistance = 0;
            let borderColor = 'steelblue';
            let backgroundColor = 'steelblue';
            let width = 170;
            let height = 200;
            let dropShadowId = `none`
            if (d.data.nodeImage && d.data.nodeImage.shadow) {
                dropShadowId = `url(#${attrs.dropShadowId})`
            }
            if (d.data.nodeImage && d.data.nodeImage.width) {
                imageWidth = d.data.nodeImage.width
            };
            if (d.data.nodeImage && d.data.nodeImage.height) {
                imageHeight = d.data.nodeImage.height
            };
            if (d.data.nodeImage && d.data.nodeImage.borderColor) {
                imageBorderColor = this.rgbaObjToColor(d.data.nodeImage.borderColor)
            };
            if (d.data.nodeImage && d.data.nodeImage.borderWidth) {
                imageBorderWidth = d.data.nodeImage.borderWidth
            };
            if (d.data.nodeImage && d.data.nodeImage.centerTopDistance) {
                imageCenterTopDistance = d.data.nodeImage.centerTopDistance
            };
            if (d.data.nodeImage && d.data.nodeImage.centerLeftDistance) {
                imageCenterLeftDistance = d.data.nodeImage.centerLeftDistance
            };
            if (d.data.borderColor) {
                borderColor = this.rgbaObjToColor(d.data.borderColor);
            }
            if (d.data.backgroundColor) {
                backgroundColor = this.rgbaObjToColor(d.data.backgroundColor);
            }
            if (d.data.nodeImage &&
                d.data.nodeImage.cornerShape.toLowerCase() == "circle") {
                imageRx = Math.max(imageWidth, imageHeight);
            }
            if (d.data.nodeImage &&
                d.data.nodeImage.cornerShape.toLowerCase() == "rounded") {
                imageRx = Math.min(imageWidth, imageHeight) / 6;
            }
            return Object.assign(d, {
                imageWidth,
                imageHeight,
                imageBorderColor,
                imageBorderWidth,
                borderColor,
                backgroundColor,
                imageRx,
                width,
                height,
                imageCenterTopDistance,
                imageCenterLeftDistance,
                dropShadowId
            });
        });

        const links = treeData.descendants().slice(1);

        // Set constant depth for each nodes
        nodes.forEach(d => d.y = d.depth * attrs.depth);
        // ------------------- FILTERS ---------------------

        const patternsSelection = defs.selectAll('.pattern')
            .data(nodes, d => d.id);

        const patternEnterSelection = patternsSelection.enter().append('pattern')

        const patterns = patternEnterSelection
            .merge(patternsSelection)
            .attr('class', 'pattern')
            .attr('height', 1)
            .attr('width', 1)
            .attr('id', d => d.id)

        const patternImages = patterns.patternify({
            tag: 'image',
            selector: 'pattern-image',
            data: d => [d]
        })
            .attr('x', 0)
            .attr('y', 0)
            .attr('height', d => d.imageWidth)
            .attr('width', d => d.imageHeight)
            .attr('xlink:href', d => d.data.imageUrl)
            .attr('viewbox', d => `0 0 ${d.imageWidth * 2} ${d.imageHeight}`)
            .attr('preserveAspectRatio', 'xMidYMin slice')

        patternsSelection.exit().transition().duration(attrs.duration).remove();

        // --------------------------  LINKS ----------------------

        // Update the links...
        var linkSelection = centerG.selectAll('path.link')
            .data(links, function (d) {
                return d.id;
            });

        // Enter any new links at the parent's previous position.
        var linkEnter = linkSelection.enter()
            .insert('path', "g")
            .attr("class", "link")
            .attr('d', (d) => {
                var o = {
                    x: source.x0,
                    y: source.y0
                }
                return this.diagonal(o, o)
            });

        // UPDATE
        var linkUpdate = linkEnter.merge(linkSelection)

        // Styling links
        linkUpdate
            .attr("fill", "none")
            .attr("stroke-width", d => d.data.connectorLineWidth || 2)
            .attr('stroke', d => {
                if (d.data.connectorLineColor) {
                    return this.rgbaObjToColor(d.data.connectorLineColor);
                }
                return 'green';
            })
            .attr('stroke-dasharray', d => {
                if (d.data.dashArray) {
                    return d.data.dashArray;
                }
                return '';
            })

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(attrs.duration)
            .attr('d', (d) => {
                return this.diagonal(d, d.parent)
            });

        // Remove any exiting links
        var linkExit = linkSelection.exit().transition()
            .duration(attrs.duration)
            .attr('d', (d) => {
                var o = {
                    x: source.x,
                    y: source.y
                }
                return this.diagonal(o, o)
            })
            .remove();


        // --------------------------  NODES ----------------------
        // Updating nodes
        const nodesSelection = centerG.selectAll('g.node')
            .data(nodes, d => d.id)

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = nodesSelection.enter().append('g')
            .attr('class', 'node')
            .attr('nodeId', (d) => d.id)
            .attr("transform", function (d) {
                return "translate(" + source.x0 + "," + source.y0 + ")";
            })
            // .style("z-index", -1)
            .attr('cursor', 'pointer')
        // .on('click', (event, d) => {
        //     if ([...event.srcElement.classList].
        //         includes('node-button-circle')) {
        //         return;
        //     }
        //     attrs.onNodeClick(d.data.nodeId);
        //     console.log('Node body clicked')
        // })

        // Add rectangle for the nodes 
        nodeEnter
            .patternify({
                tag: 'rect',
                selector: 'node-rect',
                data: d => [d]
            })

            .attr('width', 1e-6)
            .attr('height', 1e-6)
            .style("fill", function (d) {
                return d._children ? "red" : "#fff";
            })



        // Add foreignObject element
        const fo = nodeEnter
            .patternify({
                tag: 'foreignObject',
                selector: 'node-foreign-object',
                data: d => [d]
            })
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('x', d => -d.width / 2)
            .attr('y', d => -d.height / 2)
        // .on('click', ()=>{
        //     console.log("Rect clicked")
        // })

        // Add foreign object 
        fo.patternify({
            tag: 'xhtml:div',
            selector: 'node-foreign-object-div',
            data: d => [d]
        })
            .style('width', d => d.width + 'px')
            .style('height', d => d.height + 'px')
            .style('color', 'white')
            .html(d => d.data.template)
        const nodeRect = nodeEnter.select('.node-foreign-object-div');
        nodeRect.on('click', () => {
            console.log("Rect clicked")
        })
            .call(attrs.dragBehavior)
        nodeEnter
            .patternify({
                tag: 'image',
                selector: 'node-icon-image',
                data: d => [d]
            })
            .attr('width', d => d.data.nodeIcon.size)
            .attr('height', d => d.data.nodeIcon.size)
            // .attr("xlink:href",d=>d.data.nodeIcon.icon)
            .attr('x', d => -d.width / 2 + 5)
            .attr('y', d => d.height / 2 - d.data.nodeIcon.size - 5)

        nodeEnter
            .patternify({
                tag: 'text',
                selector: 'node-icon-text-total',
                data: d => [d]
            })
            .text('test')
            .attr('x', d => -d.width / 2 + 7)
            .attr('y', d => d.height / 2 - d.data.nodeIcon.size - 5)
            //.attr('text-anchor','middle')
            .text(d => d.data.totalSubordinates + ' Subordinates')
            .attr('fill', attrs.nodeTextFill)
            .attr('font-weight', 'bold')

        nodeEnter
            .patternify({
                tag: 'text',
                selector: 'node-icon-text-direct',
                data: d => [d]
            })
            .text('test')
            .attr('x', d => -d.width / 2 + 10 + d.data.nodeIcon.size)
            .attr('y', d => d.height / 2 - 10)
            .text(d => d.data.directSubordinates + ' Direct ')
            .attr('fill', attrs.nodeTextFill)
            .attr('font-weight', 'bold')


        // Node images
        const nodeImageGroups = nodeEnter.patternify({
            tag: 'g',
            selector: 'node-image-group',
            data: d => [d]
        })

        // Node image rectangle 
        nodeImageGroups
            .patternify({
                tag: 'rect',
                selector: 'node-image-rect',
                data: d => [d]
            })

        // Node button circle group
        const nodeButtonGroups = nodeEnter
            .patternify({
                tag: 'g',
                selector: 'node-button-g',
                data: d => [d]
            })
            .on('click', (event, d) => this.click(event, d))

        // Add button circle 
        nodeButtonGroups
            .patternify({
                tag: 'circle',
                selector: 'node-button-circle',
                data: d => [d]
            })

        // Add button text 
        nodeButtonGroups
            .patternify({
                tag: 'text',
                selector: 'node-button-text',
                data: d => [d]
            })
            .attr('pointer-events', 'none')



        // Node update styles
        var nodeUpdate = nodeEnter.merge(nodesSelection)
            .style('font', '16px sans-serif')

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .attr('opacity', 0)
            .duration(attrs.duration)
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .attr('opacity', 1)

        // Move images to desired positions
        nodeUpdate.selectAll('.node-image-group')
            .attr('transform', d => {
                let x = -d.imageWidth / 2 - d.width / 2;
                let y = -d.imageHeight / 2 - d.height / 2;
                return `translate(${x},${y})`
            })


        nodeUpdate.select('.node-image-rect')
            .attr('fill', d => `url(#${d.id})`)
            .attr('width', d => d.imageWidth)
            .attr('height', d => d.imageHeight)
            .attr('stroke', d => d.imageBorderColor)
            .attr('stroke-width', d => d.imageBorderWidth)
            .attr('rx', d => d.imageRx)
            .attr('y', d => d.imageCenterTopDistance)
            .attr('x', d => d.imageCenterLeftDistance)
            .attr('filter', d => d.dropShadowId)

        // Update  node attributes and style
        nodeUpdate.select('.node-rect')
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('x', d => -d.width / 2)
            .attr('y', d => -d.height / 2)
            .attr('rx', d => d.borderRadius || 0)
            .attr('stroke-width', d => d.borderWidth || attrs.strokeWidth)
            .attr('cursor', 'pointer')
            .attr('stroke', d => d.borderColor)
            .style("fill", d => d.backgroundColor)


        // Move node button group to the desired position
        nodeUpdate.select('.node-button-g')
            .attr('transform', d => {
                return `translate(0,${d.height / 2})`
            })
            .attr('opacity', d => {
                if (d.children || d._children) {
                    return 1;
                }
                return 0;
            })

        // Restyle node button circle
        nodeUpdate.select('.node-button-circle')
            .attr('r', 16)
            .attr('stroke-width', d => d.data.borderWidth || attrs.strokeWidth)
            .attr('fill', attrs.backgroundColor)
            .attr('stroke', d => d.borderColor)

        // Restyle texts
        nodeUpdate.select('.node-button-text')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle')
            .attr('fill', attrs.defaultTextFill)
            .attr('font-size', d => {
                if (d.children) return 40;
                return 26;
            })
            .text(d => {
                if (d.children) return '-';
                return '+';
            })

        // Remove any exiting nodes
        var nodeExitTransition = nodesSelection.exit()
            .attr('opacity', 1)
            .transition()
            .duration(attrs.duration)
            .attr("transform", function (d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .on('end', function () {
                d3.select(this).remove();
            })
            .attr('opacity', 0)


        // On exit reduce the node rects size to 0
        nodeExitTransition.selectAll('.node-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 0)
            .attr('y', 0);

        // On exit reduce the node image rects size to 0
        nodeExitTransition.selectAll('.node-image-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', d => d.width / 2)
            .attr('y', d => d.height / 2)

        // Store the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        // debugger;  
    }
    dragstarted(event, d) {
        // if(event.dx === 0 && event.dy === 0) return;
        console.log("Drag started")
        const pNode = d3.select(this.parentNode.parentNode);
        const mNode = pNode.clone(true);
        // const mNode = this.cloneNode(true)
        // const node = mNode.selectChild("foreignObject");
        // node.style("border", '5px solid red');
        // mNode.style("z-index", 999999);
        // mNode.style("position", "absolute");
        pNode.attr('class', "node node-draggable");
        mNode.attr('class', "node node-dragging");
        mNode.select('.node-button-g').remove();
        mNode.raise()
        // mNode.attr("class", "node-draggable");
        // event.sourceEvent.preventDefault();
        // event.sourceEvent.stopPropagation();
        // pNode.style("position", "relative");
        // pNode.style("overflow", "visible");
        // node.attr('stroke-width', 2);
    }


    dragged(event, d) {
        // d.x0 += event.dy;
        // d.y0 += event.dx;
        const node = d3.select("g.node-dragging");
        // var x = d.y, y = d.y;
        d.x += event.dx;
        d.y += event.dy;
        var dx = d.x;
        var dy = d.y;
        console.log("Drag starting")

        const attrs = this.getAttrs();
        attrs.allNodes.forEach(nd => {
            if (d === nd || nd.x === undefined || nd.y === undefined) {
                return
            }
            var oNode = d3.select(`g[nodeId=${nd.id}]`);
            if (this.checkOverLap(d, nd, 50)) {
                oNode.attr('class', 'node node-dropable');
            } else {
                oNode.attr('class', 'node');
            }
        })

        node.attr("transform", "translate(" + dx + "," + dy + ")");
    }

    dragended(event, d) {
        console.log("Drag endded")
        // d3.select(this).attr("cursor", "grab");
        d.x = d.x0;
        d.y = d.y0;
        // var dx = d.x0;
        // var dy = d.y0;

        const node = d3.select(`g[nodeId=${d.id}]`);
        node.attr('class', 'node')
        // node.attr("transform", "translate(" + dx + "," + dy + ")");
        let removed = d3.select('g.node-dragging');
        removed = removed.remove();
        let dropped = d3.select('g.node-dropable');
        if (dropped) {
            const attrs = this.getAttrs()
            dropped.attr('class', 'node');
            let draggingNode = d;
            let selectedNode = dropped.data()[0]
            // this.collapse(draggingNode.parent);
            this.moveNode(draggingNode, selectedNode);
            // this.centerNode(selectedNode);
            // this.update(attrs.root);
            // this.setLayouts(true);
            // this.expand(draggingNode.parent);
            // this.collapse(selectedNode);
            // this.expandSomeNodes(selectedNode);
            this.update(draggingNode.parent)
            // this.centerNode(draggingNode);
            // this.update(selectedNode)
        }
    }
    // centerNode(source) {
    //     const attrs = this.getAttrs();
    //     const container = d3.select(attrs.container);
    //     const containerRect = container.node().getBoundingClientRect();

    //     let t = d3.zoomTransform(attrs.chart.node());
    //     console.log(t);

    //     let x = -source.y0;
    //     let y = -source.x0;

    //     y = -y * t.k + containerRect.height / 2;

    //     attrs.chart.transition().duration(750).call(attrs.zoomBehavior.transform, d3.zoomIdentity.translate(x, y).scale(t.k));

    // }
    updateDepth(parent, depth) {
        parent.depth = depth + 1;
        let childrens = parent.children || parent._children;
        if (childrens) {
            childrens.forEach(d => {
                if (d.children || d._children) {
                    this.updateDepth(d, parent.depth)
                } else {
                    d.depth = parent.depth + 1;
                }
            })
        }
    }

    moveNode(draggingNode, selectedNode) {
        // now remove the element from the parent, and insert it into the new elements children
        var index = draggingNode.parent.children.indexOf(draggingNode);
        if (index > -1) {
            draggingNode.parent.children.splice(index, 1);
            draggingNode.parent = selectedNode;
            draggingNode.data.parentId = selectedNode.id;
            this.updateDepth(draggingNode, selectedNode.depth)
        }
        if (selectedNode.children || selectedNode._children) {
            if (selectedNode.children) {
                selectedNode.children.push(draggingNode);
            } else {
                selectedNode._children.push(draggingNode);
            }
        } else {
            selectedNode.children = [];
            selectedNode.children.push(draggingNode);
        }
    }

    // Zoom handler func
    zoomed(event, d) {
        const attrs = this.getAttrs();

        const chart = attrs.chart;

        // Get d3 event's transform object
        const transform = event.transform;

        // Store it
        attrs.lastTransform = transform;

        // Reposition and rescale chart accordingly
        chart.attr("transform", transform);

    }
    initialZoom(zoomLevel) {
        const attrs = this.getAttrs();
        attrs.lastTransform.k = zoomLevel;
        return this;
    }

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.


    click(event, d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
            d.expanded = true;
        } else {
            d.children = d._children;
            d._children = null;
            d.expanded = false;
        }
        this.update(d);
        console.log('Node clicked')
    }
    expandSomeNodes(d) {
        if (d.expanded) {
            let parent = d.parent;
            while (parent) {

                if (parent._children) {
                    parent.children = parent._children;
                    //parent._children=null;
                }
                parent = parent.parent;
            }
        }
        if (d._children) {
            d._children.forEach(n => this.expandSomeNodes(n));
        }
    }

    checkOverLap(a, b, delta) {
        let aCoordinates = [{ x: a.x, y: a.y }, //top-left
        { x: a.x + a.width, y: a.y }, //top-right
        { x: a.x, y: a.y + a.height },//bot-left
        { x: a.x + a.width, y: a.y + a.height }];//bot-right

        let bCoordinates = [{ x: b.x, y: b.y }, //top-left
        { x: b.x + b.width, y: b.y }, //top-right
        { x: b.x, y: b.y + b.height },//bot-left
        { x: b.x + b.width, y: b.y + b.height }];//bot-right
        // console.log('Data ', a, b, points)
        var overlap = aCoordinates.every((p, i) => {
            var result = Math.abs(p.x - bCoordinates[i].x) <= delta && Math.abs(p.y - bCoordinates[i].y) <= delta;
            return result;
        })

        return overlap;
    }

    diagonal(s, t) {
        const x = s.x;
        const y = s.y;
        const ex = t.x;
        const ey = t.y;

        let xrvs = ex - x < 0 ? -1 : 1;
        let yrvs = ey - y < 0 ? -1 : 1;

        let rdef = 35;
        let r = Math.abs(ex - x) / 2 < rdef ? Math.abs(ex - x) / 2 : rdef;

        r = Math.abs(ey - y) / 2 < r ? Math.abs(ey - y) / 2 : r;

        let h = Math.abs(ey - y) / 2 - r;
        let w = Math.abs(ex - x) - r * 2;
        //w=0;
        const path = `
        M ${x} ${y}
        L ${x} ${y + h * yrvs}
        C  ${x} ${y + h * yrvs + r * yrvs} ${x} ${y + h * yrvs + r * yrvs} ${x + r * xrvs} ${y + h * yrvs + r * yrvs}
        L ${x + w * xrvs + r * xrvs} ${y + h * yrvs + r * yrvs}
        C ${ex}  ${y + h * yrvs + r * yrvs} ${ex}  ${y + h * yrvs + r * yrvs} ${ex} ${ey - h * yrvs}
        L ${ex} ${ey}
`
        return path;
    }

    collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(c => this.collapse(c));
            d.children = null;
            d.expanded = false;
        }
    }
    expand(d) {
        if (d._children) {
            d.children = d._children;
            d.expanded = true;
            d.children.forEach((ch) => this.expand(ch));
            d._children = null;
        }
    }
    rgbaObjToColor(d) {
        return `rgba(${d.red},${d.green},${d.blue},${d.alpha})`
    }
}