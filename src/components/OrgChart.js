import React, { useRef, useLayoutEffect, useState } from 'react';
import { KuiChartKa } from './KuiChartKa';
import * as ReactDOMServer from 'react-dom/server';
import * as d3 from 'd3';
import { ChartDetailed } from './ChartDetail';

export const OrgChartComponent = (props, ref) => {
    const [node, setNode] = useState(null);
    const [show, setShow] = useState(false);
    const d3Container = useRef(null);
    let chart = null;
    const nodeWidth = 250;
    var data = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]
    const getColor = (d) => {
        let depth = 255 % (d.depth + 1);
        let r = 100 + depth, b = 39 + depth, g = 100, o = 0.7;
        return `rgba(${r}, ${g}, ${b}, ${o})`
    };
    function palette(d) {
        let color = 10 - d.depth;
        color = color / 10;
        var myColor = d3.schemeCategory10[d.depth % 10];
        return myColor;
    }
    const nodeContent = d => {
        return `
        <div class="flex flex-row w-full h-full">
            <div class="bg-sky-400/50 rounded-l-2xl w-7/18 flex-none grid place-items-center">
                <img class="rounded-full h-94 w-94 left-2 relative overflow-visible" src="${d.data.imageUrl}"></img>
            </div>                      
            <div class="grid pl-3 text-white rounded-r-2xl pr-2 py-2 w-full" style="background-color:${palette(d)};">
                <p class="text-md capitalize truncate">${d.data.name}</p>
                <p class="truncate">${d.data.office}</p>
                <p class="truncate">${d.data.positionName}</p>
                <span>M: ${d.data.directSubordinates}, O: ${d.data.totalSubordinates}</span>                            
            </div>
        </div>
        `
    }
    // We need to manipulate DOM
    useLayoutEffect(() => {
        if (props.data && d3Container.current) {
            if (!chart) {
                chart = new KuiChartKa();
            }
            chart.container(d3Container.current)
                .data(props.data)
                // .backgroundColor('#F8F9F9')
                .backgroundColor('white')
                .initialZoom(1)
                .nodeWidth(nodeWidth)
                .nodeHeight(Math.round(nodeWidth * 0.44))
                .onNodeClick(handleClick)
                .nodeContent(nodeContent)
                .render();
        }
    }, [props.data, d3Container.current]);

    const handleClick = (d) => {
        setNode(d);
        setShow(!show);
    }
    const toggleModal = () => {
        let toggle = !show;
        setShow(toggle)
    }
    return (
        <div>
            <div ref={d3Container} />
            {show ?
                <ChartDetailed node={node} toggleModal={toggleModal} show={show}></ChartDetailed>
                : null}
        </div>
    );
};

