import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Tag, Button, Drawer, Space, Divider, Typography } from 'antd';
import {
    TeamOutlined,
    DollarOutlined,
    RiseOutlined,
    FileTextOutlined,
    EyeOutlined,
    DownloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import useTable from '../../hooks/useTable';

const { Title, Paragraph, Text } = Typography;

const reportsData = [
    {
        key: '1',
        name: 'Q3 2024 Project Summary',
        type: 'Project Summary',
        format: 'PDF',
        date: '2024-09-25',
        size: '2.4 MB',
        status: 'Published',
        author: 'Jane Doe',
    },
    {
        key: '2',
        name: 'Beneficiary Impact Report',
        type: 'Impact Assessment',
        format: 'Excel',
        date: '2024-09-15',
        size: '1.8 MB',
        status: 'Published',
        author: 'John Smith',
    },
    {
        key: '3',
        name: 'Financial Statement - Aug 2024',
        type: 'Financial Report',
        format: 'PDF',
        date: '2024-09-01',
        size: '3.1 MB',
        status: 'Published',
        author: 'Mary Johnson',
    },
    {
        key: '4',
        name: 'Donor Acknowledgment Report',
        type: 'Donor Report',
        format: 'Word',
        date: '2024-08-20',
        size: '890 KB',
        status: 'Published',
        author: 'David Brown',
    },
    {
        key: '5',
        name: 'Monthly Progress Report - September',
        type: 'Progress Report',
        format: 'PDF',
        date: '2024-09-30',
        size: '1.5 MB',
        status: 'Draft',
        author: 'Jane Doe',
    },
    {
        key: '6',
        name: 'Team Performance Analysis',
        type: 'Internal Report',
        format: 'Excel',
        date: '2024-08-10',
        size: '2.2 MB',
        status: 'Published',
        author: 'John Smith',
    },
];

const Reports = () => {
    const table = useTable(
        { pagination: { current: 1, pageSize: 10 } },
        null,
        null
    );

    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    const kpiData = {
        totalBeneficiaries: 12450,
        fundsUsed: 245000,
        overallProgress: 75,
        milestonesComplete: 28,
        totalMilestones: 35,
        activeVolunteers: 45,
        completedActivities: 82,
    };

    const formatTypeColors = {
        'PDF': 'red',
        'Excel': 'green',
        'Word': 'blue',
    };

    const statusColors = {
        'Published': 'success',
        'Draft': 'warning',
    };

    const handleViewReport = (record) => {
        setSelectedReport(record);
        setDrawerVisible(true);
    };

    const handleDownloadReport = (record) => {
        // Simulate download
        console.log('Downloading:', record.name);
        // In real implementation, trigger file download
    };

    const reportsColumns = [
        {
            title: 'Report Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div className="font-medium text-gray-900">{text}</div>
                    <div className="text-xs text-gray-500">{record.type}</div>
                </div>
            ),
        },
        {
            title: 'Format',
            dataIndex: 'format',
            key: 'format',
            render: (format) => (
                <Tag color={formatTypeColors[format] || 'default'}>
                    {format}
                </Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (date) => new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: 'Size',
            dataIndex: 'size',
            key: 'size',
            render: (size) => <span className="text-gray-600">{size}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusColors[status]}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewReport(record)}
                    >
                        View
                    </Button>
                    <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadReport(record)}
                    >
                        Download
                    </Button>
                </Space>
            ),
        },
    ];

    useEffect(() => {
        table.setColumns(reportsColumns);
        table.setData(reportsData);
    }, []);

    return (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Reports & KPIs</h3>
                <p className="text-gray-500">Monitor key performance indicators and access project reports</p>
            </div>

            {/* KPI Cards Section */}
            <div className="mb-6">
                <h4 className="text-base font-semibold mb-4">Key Performance Indicators</h4>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="People Reached"
                                value={kpiData.totalBeneficiaries}
                                prefix={<TeamOutlined className="text-blue-500" />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                Target: 15,000 (83%)
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Funds Utilized"
                                value={kpiData.fundsUsed}
                                prefix="₵"
                                suffix={
                                    <span className="text-sm text-gray-500">
                                        / ₵360K
                                    </span>
                                }
                                valueStyle={{ color: '#52c41a' }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                68% of budget used
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Overall Progress"
                                value={kpiData.overallProgress}
                                suffix="%"
                                prefix={<RiseOutlined className="text-orange-500" />}
                                valueStyle={{ color: '#faad14' }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                On track for completion
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Milestones Complete"
                                value={`${kpiData.milestonesComplete}/${kpiData.totalMilestones}`}
                                prefix={<CheckCircleOutlined className="text-purple-500" />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                            <div className="text-xs text-gray-500 mt-2">
                                {((kpiData.milestonesComplete / kpiData.totalMilestones) * 100).toFixed(0)}% completed
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Active Volunteers"
                                value={kpiData.activeVolunteers}
                                prefix={<TeamOutlined className="text-cyan-500" />}
                                valueStyle={{ color: '#13c2c2' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={6}>
                        <Card className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Activities Completed"
                                value={kpiData.completedActivities}
                                prefix={<TrophyOutlined className="text-green-500" />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            {/* Reports Table Section */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h4 className="text-base font-semibold">Generated Reports</h4>
                    <Button type="primary" icon={<FileTextOutlined />}>
                        Generate New Report
                    </Button>
                </div>
                <Card>
                    {table.table}
                </Card>
            </div>

            {/* Preview Report Drawer */}
            <Drawer
                title="Report Preview"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={600}
            >
                {selectedReport && (
                    <div>
                        <div className="mb-6">
                            <Title level={4}>{selectedReport.name}</Title>
                            <Space className="mt-2">
                                <Tag color={formatTypeColors[selectedReport.format]}>
                                    {selectedReport.format}
                                </Tag>
                                <Tag color={statusColors[selectedReport.status]}>
                                    {selectedReport.status}
                                </Tag>
                            </Space>
                        </div>

                        <Divider />

                        <div className="space-y-4">
                            <div>
                                <Text strong className="text-gray-600">Report Type:</Text>
                                <div className="mt-1">{selectedReport.type}</div>
                            </div>

                            <div>
                                <Text strong className="text-gray-600">Generated Date:</Text>
                                <div className="mt-1">
                                    {new Date(selectedReport.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            <div>
                                <Text strong className="text-gray-600">Author:</Text>
                                <div className="mt-1">{selectedReport.author}</div>
                            </div>

                            <div>
                                <Text strong className="text-gray-600">File Size:</Text>
                                <div className="mt-1">{selectedReport.size}</div>
                            </div>

                            <Divider />

                            <div>
                                <Text strong className="text-gray-600">Report Summary:</Text>
                                <Paragraph className="mt-2 text-gray-700">
                                    This is a preview of the {selectedReport.type.toLowerCase()}.
                                    The report contains detailed analysis and insights about the project's
                                    performance during the specified period. Key metrics, achievements,
                                    and recommendations are included in the full document.
                                </Paragraph>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                <Text className="text-blue-800">
                                    <ClockCircleOutlined /> Full report preview is available in the downloaded file.
                                </Text>
                            </div>
                        </div>

                        <Divider />

                        <Space className="w-full justify-end">
                            <Button onClick={() => setDrawerVisible(false)}>
                                Close
                            </Button>
                            <Button
                                type="primary"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadReport(selectedReport)}
                            >
                                Download Report
                            </Button>
                        </Space>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Reports;