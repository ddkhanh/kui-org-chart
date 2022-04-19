import React, { useRef, useLayoutEffect } from 'react';
import { KuiChartKa } from './KuiChart';

export const OrgChartComponent = (props, ref) => {
    const d3Container = useRef(null);
    let chart = null; 

    // We need to manipulate DOM
    useLayoutEffect(() => {
        if (props.data && d3Container.current) {
            if (!chart) {
                chart = new KuiChartKa();
            }
            chart.container(d3Container.current)
                .data(props.data)             
                .initialZoom(0.6)
                .render();
        }
    }, [props.data, d3Container.current]);

    return (
        <div>
            <div ref={d3Container} />
        </div>
    );
};

