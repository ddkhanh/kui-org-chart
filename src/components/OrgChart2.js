import React, { useRef, useLayoutEffect, useEffect, useState, useCallback } from 'react';
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

export function OrgChart(props, ref) {
    const myRef = useRef(null);
    const [render, setRender] = useState(false);
    const [attrs, setAttrs] = useState({
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
        initialZoom: 0.5,
        onNodeClick: d => d,
        nodeId: d => d.nodeId || d.id,
        parentNodeId: d => d.parentNodeId || d.parentId,
        nodeDefaultBackground: 'none',
        scaleExtent: [0.1, 10],
    });

    function init() {
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
        attrs.data = props.data;
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
        calc.nodeMaxWidth = 300;
        calc.nodeMaxHeight = 250;
        attrs.depth = calc.nodeMaxHeight + 100;

        calc.centerX = calc.chartWidth / 2;
        attrs.calc = calc;
        const layouts = {
            treemap: null
        }

        layouts.treemap = d3.tree().size([calc.chartWidth, calc.chartHeight])
            .nodeSize([calc.nodeMaxWidth + 100, calc.nodeMaxHeight + attrs.depth])

        attrs.layouts = layouts;

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
        root.children.forEach(ch => collapse(ch));

        // root.children.forEach(expandSomeNodes);
        if (attrs.root.children) {
            // Expand all nodes first
            attrs.root.children.forEach(ch => expand(ch));
            // Then collapse them all
            attrs.root.children.forEach((d) => collapse(d));

            // Collapse root if level is 0
            if (attrs.expandLevel == 0) {
                attrs.root._children = attrs.root.children;
                attrs.root.children = null;
            }

            // Then only expand nodes, which have expanded proprty set to true
            [attrs.root].forEach((ch) => expandSomeNodes(ch));
        }
        const source = root;
        const treeData = attrs.layouts.treemap(attrs.root);
        const nodes = getTreeDataAndLink(source, treeData);

        const links = treeData.descendants().slice(1);
        // Set constant depth for each nodes
        nodes.forEach(d => d.y = d.depth * attrs.depth);
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        // root.y = root.y - root.height/2;
        setRender(true);
    };
    function getTreeDataAndLink(source, treeData) {
        // Get tree nodes and links
        const nodes = treeData.descendants().map(d => {
            if (d.width) return d;

            let imageWidth = 100;
            let imageHeight = 100;
            let imageBorderColor = 'steelblue';
            let imageBorderWidth = 0;
            let imageRx = 15;
            let imageCenterTopDistance = 0;
            let imageCenterLeftDistance = 0;
            let borderColor = 'steelblue';
            let backgroundColor = 'steelblue';
            let width = 280;
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
                // imageBorderColor = this.rgbaObjToColor(d.data.nodeImage.borderColor)
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
                // borderColor = this.rgbaObjToColor(d.data.borderColor);
            }
            if (d.data.backgroundColor) {
                // backgroundColor = this.rgbaObjToColor(d.data.backgroundColor);
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
        return nodes;
    }

    function expandSomeNodes(d) {
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
            d._children.forEach(n => expandSomeNodes(n));
        }
    }
    function diagonal(s, t) {
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
        L ${ex} ${ey}`
        return path;
    }

    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(c => collapse(c));
            d.children = null;
            d.expanded = false;
        }
    }
    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.expanded = true;
            d.children.forEach((ch) => expand(ch));
            d._children = null;
        }
    }
    useEffect(() => {
        if (props.data) {
            init()
        }
    }, [props.data, render])

    function centerGroup() {
        return `translate(${attrs.calc.centerX},${attrs.calc.nodeMaxHeight / 2}) scale(${attrs.initialZoom})`
    }
    if (!render) {
        return <div>Loading</div>
    }
    return (
        <div>
            <svg ref={myRef} viewBox="0 0 800 600">
                <g className='center-group' transform={centerGroup()}>
                    {attrs.root.children.map(d => {
                        <Link data={d} key={d.id} />
                    })}
                    {attrs.root.children.map(d => {
                        return <Node key={d.id} data={d} />
                    })}
                    <Node data={attrs.root} key={attrs.root.id} />
                </g>
            </svg>
        </div>
    )
}

const Link = (props) => {
    const node = props.data;
    const parent = node.parent;
    function diagonal(s, t) {
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
        L ${ex} ${ey}`
        return path;
    }
    var t = {
        x: node.x0,
        y: node.y0
    }
    var s = {
        x: parent.x,
        y: parent.y
    }
    return <path className='link animate__animated' key={Math.random()} d={diagonal(s, t)}
        fill='none'
        strokeWidth={2}
        stroke="black"
        strokeDasharray={''}
    ></path>
}

const Node = (props) => {
    const node = props.data;
    return <g className='node'>
        <foreignObject width={node.width} height={node.height} x={node.x - node.width / 2} y={node.y - node.height / 2}>
                <div className='rounded-2xl border-2 w-full h-full bg-sky-400 animate__animated' width={"100%"} height="100%">
                    <p>{node.data.name}</p>
                    <div className='grow'>
                        <button onClick={(e) => { console.log(e.target) }}>Click me</button>
                    </div>
                </div>
        </foreignObject>
    </g>
}