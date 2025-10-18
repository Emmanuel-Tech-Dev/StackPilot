import React, { useState } from 'react';
import {
    Card,
    Space,
    Progress,
    Statistic,
    Tag,
    Button,
    Table,
    Tabs,
    Upload,
    List,
    Collapse,
    Modal,
    DatePicker,
    Select,
    Row,
    Col
} from 'antd';
import {
    DollarOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    BarChartOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    UploadOutlined,
    DownloadOutlined,
    EditOutlined,
    ReloadOutlined,
    FolderOpenOutlined,
    PlusOutlined
} from '@ant-design/icons';
import { Empty } from 'antd';

const PerformanceDashboard = () => {
    const [activeTab, setActiveTab] = useState('budget');
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Mock Data
    const projectInfo = {
        name: "Community Development Initiative 2025",
        status: "Ongoing",
        progress: 68,
        startDate: "Jan 15, 2025",
        endDate: "Dec 31, 2025",
        daysRemaining: 83
    };

    const kpiData = {
        totalBudget: 250000,
        budgetUtilized: 68,
        volunteersActive: 42,
        tasksCompleted: 156,
        totalTasks: 230
    };

    const budgetVsActualData = [
        { category: 'Infrastructure', budget: 80000, actual: 54000 },
        { category: 'Education', budget: 60000, actual: 41000 },
        { category: 'Healthcare', budget: 50000, actual: 48000 },
        { category: 'Admin', budget: 30000, actual: 18000 },
        { category: 'Outreach', budget: 30000, actual: 9000 }
    ];

    const fundAllocationData = [
        { name: 'Infrastructure', value: 32, color: '#1890ff' },
        { name: 'Education', value: 24, color: '#52c41a' },
        { name: 'Healthcare', value: 20, color: '#faad14' },
        { name: 'Admin', value: 12, color: '#f5222d' },
        { name: 'Outreach', value: 12, color: '#722ed1' }
    ];

    const timelineData = [
        { month: 'Jan', tasks: 15 },
        { month: 'Feb', tasks: 28 },
        { month: 'Mar', tasks: 42 },
        { month: 'Apr', tasks: 58 },
        { month: 'May', tasks: 74 },
        { month: 'Jun', tasks: 95 },
        { month: 'Jul', tasks: 118 },
        { month: 'Aug', tasks: 140 },
        { month: 'Sep', tasks: 156 }
    ];

    const budgetTableData = [
        { key: '1', category: 'Infrastructure', allocated: 80000, spent: 54000, remaining: 26000, percentage: 67.5 },
        { key: '2', category: 'Education', allocated: 60000, spent: 41000, remaining: 19000, percentage: 68.3 },
        { key: '3', category: 'Healthcare', allocated: 50000, spent: 48000, remaining: 2000, percentage: 96.0 },
        { key: '4', category: 'Admin', allocated: 30000, spent: 18000, remaining: 12000, percentage: 60.0 },
        { key: '5', category: 'Outreach', allocated: 30000, spent: 9000, remaining: 21000, percentage: 30.0 }
    ];

    const activityLogsData = [
        { key: '1', task: 'School Building Construction', volunteer: 'John Doe', status: 'Completed', completion: 100, date: '2025-09-15' },
        { key: '2', task: 'Health Awareness Campaign', volunteer: 'Jane Smith', status: 'In Progress', completion: 75, date: '2025-09-20' },
        { key: '3', task: 'Teacher Training Program', volunteer: 'Mike Johnson', status: 'In Progress', completion: 60, date: '2025-09-10' },
        { key: '4', task: 'Water Supply Setup', volunteer: 'Sarah Williams', status: 'Pending', completion: 20, date: '2025-09-25' }
    ];

    const documentsData = [
        { title: 'Q3 Progress Report.pdf', date: '2025-09-28', type: 'pdf', size: '2.4 MB' },
        { title: 'Budget Analysis.xlsx', date: '2025-09-25', type: 'excel', size: '1.1 MB' },
        { title: 'Project Photos.zip', date: '2025-09-20', type: 'archive', size: '15.8 MB' },
        { title: 'Evaluation Report.pdf', date: '2025-09-15', type: 'pdf', size: '3.2 MB' }
    ];

    const budgetColumns = [
        { title: 'Category', dataIndex: 'category', key: 'category' },
        { title: 'Allocated', dataIndex: 'allocated', key: 'allocated', render: (val) => `$${val.toLocaleString()}` },
        { title: 'Spent', dataIndex: 'spent', key: 'spent', render: (val) => `$${val.toLocaleString()}` },
        { title: 'Remaining', dataIndex: 'remaining', key: 'remaining', render: (val) => `$${val.toLocaleString()}` },
        { title: 'Utilization', dataIndex: 'percentage', key: 'percentage', render: (val) => <Progress percent={val} size="small" /> }
    ];

    const activityColumns = [
        { title: 'Task', dataIndex: 'task', key: 'task' },
        { title: 'Assigned To', dataIndex: 'volunteer', key: 'volunteer' },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = status === 'Completed' ? 'green' : status === 'In Progress' ? 'blue' : 'orange';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        { title: 'Completion', dataIndex: 'completion', key: 'completion', render: (val) => <Progress percent={val} size="small" /> },
        { title: 'Date', dataIndex: 'date', key: 'date' }
    ];

    const getStatusColor = (status) => {
        const colors = {
            'Ongoing': 'processing',
            'Completed': 'success',
            'On Hold': 'warning'
        };
        return colors[status] || 'default';
    };

    const tabItems = [
        {
            key: 'budget',
            label: 'Budget Details',
            children: <Table dataSource={budgetTableData} columns={budgetColumns} pagination={{ pageSize: 5 }} />
        },
        {
            key: 'activities',
            label: 'Activity Logs',
            children: <Table dataSource={activityLogsData} columns={activityColumns} pagination={{ pageSize: 5 }} />
        },
        {
            key: 'funding',
            label: 'Funding Sources',
            children: (
                <Table
                    dataSource={[
                        { key: '1', source: 'Government Grant', amount: 150000, date: '2025-01-20', status: 'Received' },
                        { key: '2', source: 'Corporate Donations', amount: 75000, date: '2025-03-15', status: 'Received' },
                        { key: '3', source: 'Community Fundraiser', amount: 25000, date: '2025-06-10', status: 'Pending' }
                    ]}
                    columns={[
                        { title: 'Source', dataIndex: 'source', key: 'source' },
                        { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val) => `$${val.toLocaleString()}` },
                        { title: 'Date', dataIndex: 'date', key: 'date' },
                        {
                            title: 'Status',
                            dataIndex: 'status',
                            key: 'status',
                            render: (status) => <Tag color={status === 'Received' ? 'green' : 'orange'}>{status}</Tag>
                        }
                    ]}
                    pagination={false}
                />
            )
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Overview Header */}
            <Card className="mb-6 shadow-md">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{projectInfo.name}</h1>
                        <Space size="large">
                            <Tag color={getStatusColor(projectInfo.status)} className="text-sm px-3 py-1">
                                {projectInfo.status}
                            </Tag>
                            <span className="text-gray-600">
                                <ClockCircleOutlined className="mr-1" />
                                {projectInfo.startDate} - {projectInfo.endDate}
                            </span>
                        </Space>
                    </div>
                    <Space>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsReportModalOpen(true)}>
                            Add Report
                        </Button>
                        <Button icon={<FilePdfOutlined />}>Export PDF</Button>
                        <Button icon={<FileExcelOutlined />}>Export Excel</Button>
                        <Button icon={<ReloadOutlined />}>Update Phase</Button>
                        <Button icon={<FolderOpenOutlined />}>View Docs</Button>
                    </Space>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600 font-medium">Phase Progress</span>
                        <span className="text-gray-800 font-semibold">{projectInfo.progress}%</span>
                    </div>
                    <Progress
                        percent={projectInfo.progress}
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        strokeWidth={12}
                    />
                </div>
            </Card>

            {/* KPI Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={8} xl={4}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Total Budget"
                            value={kpiData.totalBudget}
                            prefix={<DollarOutlined className="text-blue-500" />}
                            valueStyle={{ color: '#1890ff' }}
                            formatter={(value) => `$${value.toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8} xl={4}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Budget Utilized"
                            value={kpiData.budgetUtilized}
                            suffix="%"
                            prefix={<BarChartOutlined className="text-green-500" />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8} xl={4}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Volunteers Active"
                            value={kpiData.volunteersActive}
                            prefix={<TeamOutlined className="text-purple-500" />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8} xl={4}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Tasks Completed"
                            value={`${kpiData.tasksCompleted}/${kpiData.totalTasks}`}
                            prefix={<CheckCircleOutlined className="text-orange-500" />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8} xl={4}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <Statistic
                            title="Days Remaining"
                            value={projectInfo.daysRemaining}
                            prefix={<ClockCircleOutlined className="text-red-500" />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Section */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} lg={12}>
                    <Card title="Budget vs Actual Expenditure" className="shadow-md" bodyStyle={{ height: '350px' }}>
                        {/* <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={budgetVsActualData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="budget" fill="#1890ff" name="Budget" />
                                <Bar dataKey="actual" fill="#52c41a" name="Actual" />
                            </BarChart>
                        </ResponsiveContainer> */}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Fund Allocation by Department" className="shadow-md" bodyStyle={{ height: '350px' }}>
                        {/* <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={fundAllocationData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, value }) => `${name}: ${value}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {fundAllocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer> */}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24}>
                    <Card title="Project Timeline - Tasks Completed Over Time" className="shadow-md" bodyStyle={{ height: '350px' }}>
                        {/* <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="tasks" stroke="#1890ff" strokeWidth={3} name="Tasks Completed" />
                            </LineChart>
                        </ResponsiveContainer> */}
                    </Card>
                </Col>
            </Row>

            {/* Data Tables */}
            <Card className="mb-6 shadow-md">
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Card>

            {/* Comments & Attachments */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={16}>
                    <Card title="Project Notes & Comments" className="shadow-md">
                        <List
                            dataSource={[
                                { author: 'Project Manager', content: 'Healthcare budget is almost exhausted. Need to review allocation.', date: '2 days ago' },
                                { author: 'Finance Officer', content: 'Q3 report submitted. Awaiting approval from stakeholders.', date: '5 days ago' },
                                { author: 'Team Lead', content: 'Infrastructure phase completed successfully. Moving to next milestone.', date: '1 week ago' }
                            ]}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<span className="font-semibold">{item.author}</span>}
                                        description={
                                            <div>
                                                <p className="text-gray-700">{item.content}</p>
                                                <span className="text-gray-400 text-sm">{item.date}</span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card
                        title="Uploaded Documents"
                        className="shadow-md"
                        extra={<Button icon={<UploadOutlined />} size="small">Upload</Button>}
                    >
                        <List
                            dataSource={documentsData}
                            renderItem={(item) => (
                                <List.Item
                                    actions={[<Button type="link" icon={<DownloadOutlined />} size="small">Download</Button>]}
                                >
                                    <List.Item.Meta
                                        avatar={item.type === 'pdf' ? <FilePdfOutlined className="text-red-500 text-xl" /> : <FileExcelOutlined className="text-green-500 text-xl" />}
                                        title={item.title}
                                        description={`${item.date} • ${item.size}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Add Report Modal */}
            <Modal
                title="Add New Report"
                open={isReportModalOpen}
                onCancel={() => setIsReportModalOpen(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsReportModalOpen(false)}>Cancel</Button>,
                    <Button key="submit" type="primary">Submit Report</Button>
                ]}
            >
                <Space direction="vertical" className="w-full" size="large">
                    <div>
                        <label className="block mb-2 font-medium">Report Title</label>
                        <input className="w-full px-3 py-2 border rounded" placeholder="Enter report title" />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Report Type</label>
                        <Select className="w-full" placeholder="Select report type">
                            <Select.Option value="progress">Progress Report</Select.Option>
                            <Select.Option value="financial">Financial Report</Select.Option>
                            <Select.Option value="evaluation">Evaluation Report</Select.Option>
                        </Select>
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Upload Document</label>
                        <Upload>
                            <Button icon={<UploadOutlined />}>Click to Upload</Button>
                        </Upload>
                    </div>
                </Space>
            </Modal>
        </div>
    );
};

export default PerformanceDashboard;