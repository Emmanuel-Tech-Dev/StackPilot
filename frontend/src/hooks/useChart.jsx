import { useMemo, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
    Filler    // Added for Area Chart
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

function useChart(theTitle = "", theLegendPosition = 'top', theOptions = {}, theLabels = []) {
    const [title, setTitle] = useState(theTitle || '');
    const [width, setWidth] = useState()
    const [height, setHeight] = useState(400)
    const [legendPosition, setLegendPosition] = useState(theLegendPosition || 'top');
    const [plugins, setPlugins] = useState([]);
    const allPlugins = { ChartDataLabels };
    const [options, setOptions] = useState(theOptions || {
        responsive: true,
        plugins: {
            legend: {
                position: legendPosition,
            },
            title: {
                display: true,
                text: theTitle || title || '',
            },
        },
    });

    const [data, setData] = useState({});



    useMemo(() => {
        ChartJS.register(
            CategoryScale,
            LinearScale,
            BarElement,
            Title,
            Tooltip,
            Legend,
            ArcElement,
            LineElement,
            PointElement,
            Filler    // Added for Area Chart
        );
    }, [data]);

    function BarChart(localData) {
        if (localData && Object.keys(localData).length) {
            return <Bar options={options} data={localData} plugins={plugins} height={height} width={width} />;
        } else if (data && Object.keys(data).length) {
            return <Bar options={options} data={data} plugins={plugins} height={height} width={width} />;
        } else {
            return <></>
        }
    }

    function LineChart(localData) {
        if (localData && Object.keys(localData).length) {
            return <Line options={options} data={localData} plugins={plugins} height={height} width={width} />;
        } else if (data && Object.keys(data).length) {
            return <Line options={options} data={data} plugins={plugins} height={height} width={width} />;
        } else {
            return <></>
        }
    }

    function AreaChart(localData) {
        // Create area chart specific options
        const areaOptions = {
            ...options,
            elements: {
                line: {
                    tension: 0.3 // Add slight curve to lines
                }
            }
        };

        const processAreaData = (chartData) => {
            // If no data is provided, return empty
            if (!chartData || !Object.keys(chartData).length) return chartData;

            // Modify the datasets to include area chart specific properties
            return {
                ...chartData,
                datasets: chartData.datasets.map(dataset => ({
                    ...dataset,
                    fill: true, // Enable area filling
                    backgroundColor: dataset.backgroundColor ||
                        dataset.borderColor.replace('rgb', 'rgba').replace(')', ', 0.2)'),
                }))
            };
        };

        if (localData && Object.keys(localData).length) {
            return <Line
                options={areaOptions}
                data={processAreaData(localData)}
                plugins={plugins}
                height={height} width={width}
            />;
        } else if (data && Object.keys(data).length) {
            return <Line
                options={areaOptions}
                data={processAreaData(data)}
                plugins={plugins}
                height={height} width={width}
            />;
        } else {
            return <></>
        }
    }

    function PieChart(localData) {
        if (localData && Object.keys(localData).length) {
            return <Pie options={options} data={localData} plugins={plugins} height={height} width={width} />;
        } else if (data && Object.keys(data).length) {
            return <Pie options={options} data={data} plugins={plugins} height={height} width={width} />;
        } else {
            return <></>
        }
    }

    function DoughnutChart(localData) {
        if (localData && Object.keys(localData).length) {
            return <Doughnut options={options} data={localData} plugins={plugins} height={height} width={width} />;
        } else if (data && Object.keys(data).length) {
            return <Doughnut options={options} data={data} plugins={plugins} height={height} width={width} />;
        } else {
            return <></>
        }
    }

    return {
        PieChart,
        DoughnutChart,
        LineChart,
        AreaChart,    // Added Area Chart to return object
        BarChart,
        options,
        setOptions,
        data,
        setData,
        setHeight,
        setWidth,
        title,
        setTitle,
        legendPosition,
        setLegendPosition,
        setPlugins,
        plugins,
        allPlugins
    }
}

export default useChart;