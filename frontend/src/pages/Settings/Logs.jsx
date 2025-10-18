import { Breadcrumb, Button, Card, Space, Tag } from 'antd'
import React, { useEffect } from 'react'
import useTable from '../../hooks/useTable'

import utils from '../../dependencies/helpers/utilities'
import Statistic from 'antd/es/statistic/Statistic'

const Logs = () => {



    const statusColor = (code) => {
        if (code >= 500) return "red"; // server error
        if (code >= 400) return "orange"; // client error
        if (code >= 300) return "cyan"; // redirect
        if (code >= 200) return "green"; // success
        return "default";
    };

    const levelColor = (level) => {
        switch (level) {
            case "ERROR":
                return "red";
            case "WARN":
                return "orange";
            case "HTTP":
                return "blue";
            case "INFO":
                return "green";
            default:
                return "default";
        }
    };


    const table = useTable(
        { pagination: { current: 1, pageSize: 10 } },
        "v2/logs",
        null
    )


    const column = [
        {
            title: "TimeStamp",
            dataIndex: "timestamp",
            key: "timestamp",
            sorter: true,
            render: (text) => text ? utils.formatDateV3(text) : "-"
        },
        {
            title: "Event",
            dataIndex: "event",
            key: "event",
            ...table.getColumnSearchProps("event"),
            render: (event) => <Tag color="blue">{event}</Tag>,
        },
        {
            title: "Status",
            dataIndex: "statusCode",
            key: "statusCode",

            render: (code) => <Tag color={statusColor(code)}>{code}</Tag>,
        },
        {
            title: "Level",
            dataIndex: "level",
            key: "level",
            ...table.getColumnSearchProps("level"),
            render: (level) => <Tag color={levelColor(level)}>{level}</Tag>,
        },
        { title: "Message", dataIndex: "message", key: "message" },
        {
            title: "Method",
            dataIndex: "method",
            key: "method",
            render: (method) => (
                <Tag color={method === "POST" ? "purple" : "geekblue"}>{method}</Tag>
            ),
        },
        // { title: "Log Type", dataIndex: "logType", key: "logType", sorter: true },
        { title: "Path", dataIndex: "path", key: "path" },
        { title: "IP", dataIndex: "ip", key: "ip" },
        { title: "User Agent", dataIndex: "userAgent", key: "userAgent" },
    ]

    // console.log(table.data)

    useEffect(() => {
        table.setColumns(column)
        // table.fetchData()
    }, [])

    return (
        <div>
            <div className="mb-4  px-3 py-2 w-full rounded-lg flex items-center justify-between  ">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold">System Logs</h1>
                    <Breadcrumb
                        items={[
                            { title: <a href="#">Settings</a> },
                            { title: <a href='/admin/settings/system_logs'>System Logs</a> },
                            { title: <h1 className="font-semibold">Reports</h1> },
                        ]}
                    />

                </div>

                <Space size="small">

                    <Button href="/admin/settings/system_logs">
                        <i className='fa fa-arrow-left'></i> Logs Overview
                    </Button>

                </Space>

            </div>


            <Card title="System Logs">
                {table.tableExpandable}
            </Card>
        </div>
    )
}

export default Logs