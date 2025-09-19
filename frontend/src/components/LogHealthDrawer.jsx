import React, { useEffect } from 'react';
import { Card, Table, Progress, Typography, Space, Tag } from 'antd';
import utils from '../dependencies/helpers/utilities';
import useTable from '../hooks/useTable';
import { useRequest } from 'ahooks';
import Settings from '../dependencies/helpers/settings';
import Loader from './Loader';
const { Title, Text } = Typography;

const LogHealthDrawer = () => {
    const table = useTable({ pagination: { current: 1, pageSize: 10 } }, null, null)
    const { loading, data, error } = useRequest(async () => {
        const res = await utils.requestWithReauth(
            "get",
            `${Settings.baseUrl}v2/logs/health`,
            null,
            null
        )

        if (!res?.success) return {}


        const data = res?.data

        const logFilesData = data?.logFiles.map((file, index) => ({
            id: index,
            key: index,
            name: file,
            type: file.split('.')[0],
        }));


        table.setData(logFilesData)

        return data


    },
        {

            cacheKey: "logsHealth",
            throttleWait: 500
        }
    )




    const columns = [
        {
            title: 'Log File',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            ...table.getColumnSearchProps("type"),
            render: (type) => (
                <Tag color={type === 'access' ? 'blue' : type === 'app' ? 'green' : type === 'query' ? 'purple' : "red"}>
                    {type}
                </Tag>
            ),

        },
    ];




    // Transform log files into table data



    useEffect(() => {
        if (error) {
            utils.showNotification("Error", error.message, "text-red-500");
        }
    }, [error]);

    useEffect(() => {
        // utils.sleep(200)
        table.setColumns(columns)

    }, [])

    return (

        <div className="p-6 bg-gray-100 min-h-screen" >
            <Title level={3} className="text-center font-bold mb-6">
                System Log Health
            </Title>
            <Space direction="vertical" size="large" className="w-full">
                <Card title="System Overview" className="shadow-lg">
                    {loading && <Loader />}

                    <Space direction="vertical" size="middle">
                        <Text>
                            <strong>Status:</strong>{' '}
                            <Tag color={data?.status === 'healthy' ? 'green' : 'red'}>
                                {data?.status.toUpperCase()}
                            </Tag>
                        </Text>
                        <Text>
                            <strong>Uptime:</strong> {utils.formatUptime(data?.uptime)}
                        </Text>
                        <Text>
                            <strong>Time:</strong> {utils.formatDateV3(data?.timestamp)}
                        </Text>
                    </Space>
                </Card>

                <Card title="Log Directory" className="shadow-lg">
                    {loading && <Loader />}
                    <Space direction="vertical" size="middle">
                        <Text>
                            <strong>Path:</strong> {data?.logDirectory}
                        </Text>
                        <Text>
                            <strong>Directory Exists:</strong>{' '}
                            <Tag color={data?.directoryExists ? 'green' : 'red'}>
                                {data?.directoryExists ? 'Yes' : 'No'}
                            </Tag>
                        </Text>
                        <Text>
                            <strong>Log Files Count:</strong> {data?.logFilesCount}
                        </Text>
                    </Space>
                </Card>

                <Card title="Log Files" className="shadow-lg">
                    {loading && <Loader />}
                    {table.table}
                </Card>

                <Card title="Memory Usage" className="shadow-lg">
                    {loading && <Loader />}
                    <Space direction="vertical" size="middle" className="w-full">
                        <div>
                            <Text>
                                <strong>RSS:</strong> {utils.formatBytes(data?.memory.rss)}
                            </Text>
                            <Progress
                                percent={(data?.memory.rss / (data?.memory.rss + 100000000)) * 100}
                                status="active"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text>
                                <strong>Heap Total:</strong> {utils.formatBytes(data?.memory.heapTotal)}
                            </Text>
                            <Progress
                                percent={(data?.memory.heapTotal / (data?.memory.heapTotal + 100000000)) * 100}
                                status="active"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text>
                                <strong>Heap Used:</strong> {utils.formatBytes(data?.memory.heapUsed)}
                            </Text>
                            <Progress
                                percent={(data?.memory.heapUsed / data?.memory.heapTotal) * 100}
                                status="active"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text>
                                <strong>External:</strong> {utils.formatBytes(data?.memory.external)}
                            </Text>
                            <Progress
                                percent={(data?.memory.external / (data?.memory.external + 100000000)) * 100}
                                status="active"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Text>
                                <strong>Array Buffers:</strong> {utils.formatBytes(data?.memory.arrayBuffers)}
                            </Text>
                            <Progress
                                percent={(data?.memory.arrayBuffers / (data?.memory.arrayBuffers + 100000000)) * 100}
                                status="active"
                                className="mt-2"
                            />
                        </div>
                    </Space>
                </Card>
            </Space>
        </div >
    );
};

// Default props with the provided data
// LogHealthDrawer.defaultProps = {
//     data: {
//         status: 'healthy',
//         logDirectory: './resources/logs',
//         directoryExists: true,
//         logFilesCount: 29,
//         logFiles: [
//             'access.log.2025-08-11',
//             'access.log.2025-08-12',
//             'access.log.2025-08-26',
//             'access.log.2025-08-28',
//             'access.log.2025-09-15',
//             'app.log.2025-08-11',
//             'app.log.2025-08-12',
//             'error.log.2025-08-11',
//             'error.log.2025-08-12',
//             'error.log.2025-08-31',
//         ],
//         uptime: 49152.0327326,
//         memory: {
//             rss: 14249984,
//             heapTotal: 40644608,
//             heapUsed: 33912808,
//             external: 4197037,
//             arrayBuffers: 82559,
//         },
//         timestamp: '2025-09-18T12:19:31.546Z',
//     },
// };

export default LogHealthDrawer;