import React, { useEffect } from "react";
import { CirclePacking } from '@antv/g2plot';

const AudienceByLocation = () => {
    useEffect(() => {
        const data = {
            // name: "Audience",
            children: [
                { name: "US", value: 100 },
                { name: "China", value: 95 },
                { name: "Canada", value: 70 },
                { name: "Brazil", value: 65 },
                { name: "UK", value: 60 },
                { name: "India", value: 55 },
                { name: "France", value: 50 },
                { name: "Germany", value: 45 },
                { name: "Spain", value: 40 },
                { name: "Italy", value: 38 },
                { name: "Japan", value: 35 },
                { name: "Russia", value: 30 },
                { name: "Egypt", value: 28 },
                { name: "South Africa", value: 25 },
                { name: "Australia", value: 20 },
                { name: "Ghana", value: 1000 },
            ]
        };

        const plot = new CirclePacking('container', {
            data,
            width: 600,
            height: 600,
            colorField: 'name',
            padding: 0,
            hierarchyConfig: {
                sort: (a, b) => b.value - a.value,
            },
            label: {
                formatter: (d) => d.name,
                style: {
                    fontSize: 14,
                    fill: '#000',
                    fontWeight: 'bold',
                },
            },
        });

        plot.render();

        return () => plot.destroy(); // cleanup
    }, []);

    return <div id="container"></div>;
};

export default AudienceByLocation;
