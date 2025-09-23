import React from "react";
import { Card, Row, Col, Breadcrumb, Button, Statistic, Space } from "antd";
import useAntVChart from "../../hooks/useChartAntV";
import { useRequest } from "ahooks";
import utils from "../../dependencies/helpers/utilities";
import Settings from "../../dependencies/helpers/settings";
import CustomFunction from "../../dependencies/custom_functions/customfunctions";
import { ArrowUpOutlined } from "@ant-design/icons";
import StatsCards from "../../components/StatsCards";
import useDrawer from "../../hooks/useDrawer";
import LogHealthDrawer from "../../components/LogHealthDrawer";
import Loader from "../../components/Loader";

const LogsOverview = () => {
    const healthDrawer = useDrawer()
    const { data, loading } = useRequest(async () => {
        const res = await utils.requestWithReauth(
            "get",
            `${Settings.baseUrl}v2/logs/stats`,
            null,
            null
        )
        return res?.data
    }, {
        refreshDeps: [],
        cacheKey: "logs",
        throttleWait: 500
    })


    const graphData = CustomFunction.normalizeData(data);

    const { containerRef: lineRef } = useAntVChart("Line", {
        data: graphData?.statusCodeData,
        xField: "code",
        yField: "value",
        smooth: true,
    });

    const { containerRef: pieRef } = useAntVChart("Pie", {
        data: graphData?.typeData, // You might want to use recentActivity.typeData here instead?
        angleField: "value",
        colorField: "type",
        radius: 0.8,
        label: { type: "inner", offset: "-30%", content: "{value}" },
    });

    const { containerRef: roseRef } = useAntVChart("Rose", {
        data: graphData?.levelData || [],
        xField: 'level',
        yField: 'value',
        seriesField: 'level',
        radius: 0.8,
        innerRadius: 0.2,
        // Simplified label configuration to avoid errors
        label: {
            style: {
                textAlign: 'center',
                fontSize: 12,
            },
            formatter: ({ level, value }) => level,
        },
        // Optional: Customize colors
        // color: ['#1890ff', '#2fc25b', '#facc14', '#f04864', '#8543e0'],
        // Optional: Add tooltip for better UX
        tooltip: {
            formatter: (datum) => ({
                name: datum.level,
                value: datum.value,
            }),
        },
    });

    const { containerRef: barRef } = useAntVChart("Bar", {
        data: data?.topEvents || [],
        xField: "count",        // Value field (horizontal bars)
        yField: "event",        // Category field  

        forceFit: true,

        seriesField: 'count', // field to base the colors on
        color: ({ count }) => {
            if (count >= 1000) return '#f5222d'; // red for high counts
            if (count >= 500) return '#faad14';  // orange for medium-high
            if (count >= 100) return '#1890ff'; // blue for medium
            if (count >= 10) return '#52c41a';  // green for low-medium
            return '#d9d9d9'; // gray for very low
        },
        // Single color or array of colors
        label: {
            position: "middle", // valid: 'top' | 'middle' | 'bottom'
            style: {
                fill: "#fff",
                opacity: 0.6,
            },
            formatter: (text) => `${text?.count}`, // ✅ correct format
        },
        // Optional: customize appearance
        columnStyle: {
            radius: [4, 4, 0, 0]  // rounded corners
        }
    });

    const { containerRef: colRef } = useAntVChart("Column", {
        data: graphData.eventData || [],
        xField: "event",        // Value field (horizontal bars)
        yField: "value",        // Category field  

        // Bar chart specific configs (remove pie chart props)
        color: "#189f",       // Single color or array of colors
        label: {
            position: "middle", // valid: 'top' | 'middle' | 'bottom'
            style: {
                fill: "#fff",
                opacity: 0.6,
            },
            formatter: (text) => `${text?.value}`, // ✅ correct format
        },
        // Optional: customize appearance
        columnStyle: {
            radius: [4, 4, 0, 0]  // rounded corners
        },

    });


    const { containerRef: areaRef } = useAntVChart("Area", {
        data: graphData?.recentActivityData,
        xField: "range",
        yField: "value",
        smooth: true,
        color: "#189f",

    });



    return (

        <>
            <div className="mb-4  px-3 py-2 w-full rounded-lg flex items-center justify-between  ">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">System Logs Overview</h1>
                    <Breadcrumb
                        items={[
                            { title: <a href="#">Settings</a> },
                            { title: <h1 className="font-semibold">System Logs</h1> },
                        ]}
                    />
                </div>

                <Space size="small">
                    <Button type="primary"
                        onClick={() => {
                            healthDrawer.setOpen(true)
                            healthDrawer.setContent(
                                <LogHealthDrawer />
                            )
                            healthDrawer.setPlacement("right")
                            healthDrawer.setWidth(500)
                        }}
                    >Check Health Status</Button>
                    <Button href="system_logs/report">Log Reports</Button>

                </Space>

            </div>
            <div className="mb-4">

                <StatsCards data={data} loading={loading} />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Line Chart */}
                <div className="bg-white rounded-lg shadow p-4">
                    <Card title="Pie Chart - Logs Type">
                        {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />}
                        <div ref={pieRef} style={{ height: 300 }} />
                    </Card>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <Card title="Pie Chart - Logs Level">
                        {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />}

                        <div ref={roseRef} style={{ height: 300 }} />
                    </Card>
                </div>



                {/* Bar Chart */}
                <div className="bg-white rounded-lg shadow p-4">
                    <Card title="Bar Chart - Logs Events">
                        {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />}

                        <div ref={colRef} className="h-[300px]" />
                    </Card>

                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <Card title="Bar Chart - Logs Top Events">
                        {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />}

                        <div ref={barRef} className="h-[300px]" />
                    </Card>

                </div>
                {/* Pie Chart */}
                <div className="bg-white rounded-lg shadow p-4">
                    <Card title="Area Chart - Logs Activity">
                        {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />}

                        <div ref={areaRef} style={{ height: 300 }} />
                    </Card>
                </div>

                <div className="bg-white rounded-lg shadow p-4">
                    <Card title="Line Chart - Logs Statuscode">
                        {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />}

                        <div ref={lineRef} style={{ height: 300 }} />
                    </Card>
                </div>


            </div>

            {healthDrawer.drawerJSX()}
        </>

    );
};

export default LogsOverview;
