import React, { useEffect, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Card, Row, Col, Button, DatePicker, Select, Tag, Statistic, message, Space } from 'antd';
import {
    DatabaseOutlined,
    DollarOutlined,
    TeamOutlined,
    ProjectOutlined,
    DownloadOutlined,
    ReloadOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    CalendarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import Loader from '../components/Loader';
import useTable from '../hooks/useTable';
import utils from '../dependencies/helpers/utilities';
import useAdd from '../hooks/useAdd';
import Settings from '../dependencies/helpers/settings';

const { RangePicker } = DatePicker;
const { Option } = Select;

const BORDER_COLORS = ['border-l-blue-500', 'border-l-green-500', 'border-l-purple-500', 'border-l-orange-500'];
const ICON_COLORS = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-orange-500'];
const TAG_COLORS = ['blue', 'green', 'purple', 'orange'];

const REPORT_FILE_TYPE = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },

];

const INITIAL_REPORTS = [
    {
        id: 1,
        type: 'impact',
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        format: 'pdf',
        generatedAt: '2025-09-25 14:30',
        size: '2.3 MB'
    },
    {
        id: 2,
        type: 'financial',
        startDate: '2025-02-01',
        endDate: '2025-02-28',
        format: 'csv',
        generatedAt: '2025-09-24 10:15',
        size: '1.1 MB'
    }
];

const STATS_DATA = [
    {
        title: 'Total Projects',
        value: 24,
        subtitle: '18 Active • 6 Completed',
        icon: ProjectOutlined,
    },
    {
        title: 'Total Budget',
        value: 2500000,
        subtitle: '$1.8M Allocated • $700K Spent',
        icon: DollarOutlined,
        prefix: '$'
    },
    {
        title: 'Volunteers Engaged',
        value: 342,
        subtitle: '28 New This Month',
        icon: TeamOutlined,
    },
    {
        title: 'Active Tasks',
        value: 156,
        subtitle: '89% Completion Rate',
        icon: DatabaseOutlined,
    }
];

/** --- SUB COMPONENTS --- */
const StatCard = ({ stat, index, loading }) => (
    <Card className={`h-full border-l-4 ${BORDER_COLORS[index % BORDER_COLORS.length]} hover:shadow-lg transition-all`}>
        {loading ? (
            <Loader />
        ) : (
            <>
                <Statistic
                    title={<span className="text-gray-600 text-sm font-medium">{stat.title}</span>}
                    value={stat.value}
                    formatter={(value) => (
                        <span className="text-2xl font-bold text-gray-800">
                            {stat.prefix || ''}{value.toLocaleString()}
                        </span>
                    )}
                    prefix={<stat.icon className={ICON_COLORS[index % ICON_COLORS.length]} />}
                />
                <p className="mt-2 text-xs text-gray-500">{stat.subtitle}</p>
            </>
        )}
    </Card>
);

const ReportCard = ({ report, onDownload }) => (
    <div
        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
    >
        <div className="flex items-start gap-3 flex-1">
            <div className="text-2xl mt-1">
                {report.format === 'pdf'
                    ? <FilePdfOutlined className="text-red-500" />
                    : <FileExcelOutlined className="text-green-500" />}
            </div>
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800 capitalize">
                        {report.type} Report
                    </span>
                    <Tag color={TAG_COLORS[REPORT_FILE_TYPE.findIndex(t => t.value === report.type)]}>
                        {report.format.toUpperCase()}
                    </Tag>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <CalendarOutlined />
                        {report.startDate} → {report.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                        <ClockCircleOutlined />
                        {report.generatedAt}
                    </span>
                    <span>{report.size}</span>
                </div>
            </div>
        </div>
        <Button type="link" icon={<DownloadOutlined />} onClick={() => onDownload(report)}>
            Download
        </Button>
    </div>
);

const Dashboard = () => {

    const [loading, setLoading] = useState(false);
    const [reportType, setReportType] = useState('impact');

    const [dateRange, setDateRange] = useState(null);
    const [generatedReports, setGeneratedReports] = useState(INITIAL_REPORTS);

    const table = useTable({ pagination: { current: 1, pageSize: 5 } }, null, null);
    const addHook = useAdd("tables_metadata", "table_name")



    const column = [
        {
            title: "",
            render: (_, report) => {
                return (
                    <>
                        {report.format === 'pdf'
                            ? <FilePdfOutlined className="text-red-500" />
                            : <FileExcelOutlined className="text-green-500" />}
                    </>
                )
            }


        },
        {
            title: "Report Type",
            dataIndex: "type",
            key: "type"
        },
        {
            title: "Start Date",
            dataIndex: "startDate",
            key: "startDate"
        }, {
            title: "End Date",
            dataIndex: "endDate",
            key: "endDate"
        },
        {
            title: "Report Format",
            dataIndex: "format",
            key: "format"
        },
        {
            title: "Generated At",
            dataIndex: "generatedAt",
            key: "generatedAt"
        },
        {
            title: "Size (MB)",
            dataIndex: "size",
            key: "size"

        },
        {
            title: "",
            dataIndex: "action",
            render: (_, report) => {
                return (
                    <Space>
                        <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownloadExisting(report)}>
                            Download
                        </Button>
                    </Space>
                )
            }


        }

    ]

    const handleGenerateReport = async (format) => {
        if (!dateRange) {
            message.warning('Please select a date range first');
            return;
        }

        const [startDate, endDate] = dateRange.map(d => d.format('YYYY-MM-DD'));
        const exists = generatedReports.find(r =>
            r.type === reportType && r.startDate === startDate && r.endDate === endDate && r.format === format
        );
        if (exists) {
            message.info('This report already exists. Check your history below.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/generate-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportType, startDate, endDate, format })
            });

            if (!res.ok) throw new Error();

            const newReport = {
                id: Date.now(),
                type: reportType,
                startDate,
                endDate,
                format,
                generatedAt: new Date().toLocaleString(),
                size: `${(Math.random() * 3 + 0.5).toFixed(1)} MB`
            };
            setGeneratedReports([newReport, ...generatedReports]);
            message.success('Report generated successfully');
        } catch {
            message.error('Error generating report');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadExisting = async (report) => {
        try {
            const res = await fetch(`/api/download-report/${report.id}`);
            if (!res.ok) throw new Error();

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${report.type}_report_${report.startDate}_to_${report.endDate}.${report.format}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            message.success('Download started');
        } catch {
            message.error('Failed to download report');
        }
    };

    async function waitingData() {
        await utils.sleep(300)
        table.setData(INITIAL_REPORTS)
        addHook.setTblName("reports")

    }


    useEffect(() => {


        table.setColumns(column)
        waitingData()

    }, [addHook.saveCompleted])

    console.log(addHook.record)

    return (
        <>
            <PageHeader
                header="Welcome Back"
                items={[
                    { title: <a href="#">Dashboard</a> },
                ]}
                children={null}
            />

            <div>
                {/* Stats Cards */}
                {/* {addHook.form} */}
                <Row gutter={[16, 16]} className="mb-6">
                    {STATS_DATA.map((stat, idx) => (
                        <Col xs={24} sm={12} lg={6} key={idx}>
                            <StatCard stat={stat} index={idx} loading={loading} />
                        </Col>
                    ))}
                </Row>

                {/* Interactive Report Panel */}
                <Card className="mb-6 shadow-sm" title="📑 Report Generator">
                    <div width="100%" className=' w-full flex items-center gap-3'>
                        <div className='grid grid-cols-3 gap-2 items-center'>
                            {addHook.form}
                        </div>

                        <div className='mt-4 space-x-2'>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={() => handleGenerateReport('pdf')}
                                loading={loading}
                            // disabled={!dateRange}

                            >
                                Generate Report
                            </Button>
                            <Button icon={<ReloadOutlined />} onClick={() => { setDateRange(null); setReportType('impact'); }}>
                                Reset
                            </Button>
                        </div>


                    </div>


                    {/* Past Reports */}
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="text-md font-semibold mb-4">Previously Generated Reports</h3>
                        <div>
                            {table.table}
                        </div>
                        {/* {generatedReports.length === 0 ? (
                            <Empty description="No reports generated yet" />
                        ) : (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {generatedReports.map(r => (
                                    <ReportCard key={r.id} report={r} onDownload={handleDownloadExisting} />
                                ))}
                            </div>
                        )} */}
                    </div>
                </Card>

                {/* Charts Section - Empty placeholders for your Ant Design charts */}
                <Row gutter={[16, 16]}>
                    {/* Bar Chart - Budget vs Actual */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span className="text-lg font-semibold text-gray-800">📊 Budget vs Actual per Project</span>}
                            className="shadow-sm h-full"
                        >
                            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-400">Insert your Ant Design Bar Chart here</p>
                            </div>
                        </Card>
                    </Col>

                    {/* Line Chart - Progress Over Time */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span className="text-lg font-semibold text-gray-800">📈 Project Progress Over Time</span>}
                            className="shadow-sm h-full"
                        >
                            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-400">Insert your Ant Design Line Chart here</p>
                            </div>
                        </Card>
                    </Col>

                    {/* Pie Chart - KPI Distribution */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span className="text-lg font-semibold text-gray-800">🥧 KPI Distribution</span>}
                            className="shadow-sm h-full"
                        >
                            <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                                <p className="text-gray-400">Insert your Ant Design Pie Chart here</p>
                            </div>
                        </Card>
                    </Col>

                    {/* Recent Activity */}
                    <Col xs={24} lg={12}>
                        <Card
                            title={<span className="text-lg font-semibold text-gray-800">Recent Activity</span>}
                            className="shadow-sm h-full"
                        >
                            <div className="space-y-4">
                                {[
                                    { action: 'New volunteer registered', time: '2 hours ago', status: 'success' },
                                    { action: 'Budget updated for Project A', time: '5 hours ago', status: 'processing' },
                                    { action: 'Milestone completed', time: '1 day ago', status: 'success' },
                                    { action: 'Task deadline approaching', time: '2 days ago', status: 'warning' }
                                ].map((activity, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                        </div>
                                        <Tag color={
                                            activity.status === 'success' ? 'green' :
                                                activity.status === 'warning' ? 'orange' :
                                                    'blue'
                                        }>
                                            {activity.status}
                                        </Tag>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            {addHook.addModal("etete", undefined)}
        </>
    );
};

export default Dashboard;