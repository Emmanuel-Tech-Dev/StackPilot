import React, { useState } from 'react';
import {
    Card,
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Tabs,
    Tag,
    Badge,
    Drawer,
    Calendar,
    List,
    Avatar,
    Space,
    Row,
    Col,
    Statistic,
    Dropdown,
    Menu,
    InputNumber,
    TimePicker,
    Upload,
    message,
    Empty
} from 'antd';
import {
    PlusOutlined,
    UserOutlined,
    CalendarOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    DownOutlined,
    BellOutlined,
    SearchOutlined,
    FilterOutlined,
    UploadOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageHeader } from '../../components/PageHeader';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Volunteer = () => {
    const [userRole, setUserRole] = useState('admin'); // 'admin' or 'volunteer'
    const [activeTab, setActiveTab] = useState('opportunities');
    const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);
    const [form] = Form.useForm();
    const [shiftForm] = Form.useForm();

    // Mock Data
    const opportunitiesData = [
        {
            key: '1',
            title: 'Community Health Outreach',
            department: 'Healthcare',
            slots: 15,
            filled: 8,
            deadline: '2025-10-30',
            status: 'Active',
            description: 'Assist in health awareness campaigns'
        },
        {
            key: '2',
            title: 'School Infrastructure Support',
            department: 'Education',
            slots: 10,
            filled: 10,
            deadline: '2025-10-25',
            status: 'Filled',
            description: 'Help with school building renovations'
        },
        {
            key: '3',
            title: 'Food Distribution Drive',
            department: 'Community',
            slots: 20,
            filled: 5,
            deadline: '2025-11-15',
            status: 'Active',
            description: 'Distribute food packages to families'
        },
        {
            key: '4',
            title: 'Tree Planting Campaign',
            department: 'Environment',
            slots: 50,
            filled: 0,
            deadline: '2025-11-20',
            status: 'Draft',
            description: 'Plant 1000 trees in local communities'
        }
    ];

    const applicationsData = [
        {
            key: '1',
            name: 'John Doe',
            email: 'john@example.com',
            project: 'Community Health Outreach',
            skills: ['First Aid', 'Communication'],
            experience: '2 years',
            status: 'Pending',
            appliedDate: '2025-10-05'
        },
        {
            key: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            project: 'School Infrastructure Support',
            skills: ['Construction', 'Project Management'],
            experience: '3 years',
            status: 'Approved',
            appliedDate: '2025-10-03'
        },
        {
            key: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            project: 'Food Distribution Drive',
            skills: ['Logistics', 'Driving'],
            experience: '1 year',
            status: 'Pending',
            appliedDate: '2025-10-07'
        },
        {
            key: '4',
            name: 'Sarah Williams',
            email: 'sarah@example.com',
            project: 'Community Health Outreach',
            skills: ['Nursing', 'Teaching'],
            experience: '5 years',
            status: 'Rejected',
            appliedDate: '2025-10-04'
        }
    ];

    const volunteersData = [
        {
            key: '1',
            name: 'Emily Brown',
            email: 'emily@example.com',
            phone: '+233 24 123 4567',
            skills: ['Teaching', 'Counseling', 'Event Planning'],
            projects: ['School Infrastructure Support', 'Community Health Outreach'],
            availability: 'Weekends',
            status: 'Active',
            joinDate: '2024-06-15'
        },
        {
            key: '2',
            name: 'David Lee',
            email: 'david@example.com',
            phone: '+233 20 987 6543',
            skills: ['IT Support', 'Data Entry', 'Photography'],
            projects: ['Community Health Outreach'],
            availability: 'Evenings',
            status: 'Active',
            joinDate: '2024-08-20'
        },
        {
            key: '3',
            name: 'Lisa Chen',
            email: 'lisa@example.com',
            phone: '+233 27 456 7890',
            skills: ['Social Media', 'Writing', 'Design'],
            projects: ['Food Distribution Drive'],
            availability: 'Flexible',
            status: 'Inactive',
            joinDate: '2024-05-10'
        }
    ];

    const myTasksData = [
        {
            key: '1',
            task: 'Health Workshop Facilitation',
            project: 'Community Health Outreach',
            date: '2025-10-15',
            time: '09:00 - 12:00',
            location: 'Kumasi Central Hospital',
            status: 'Upcoming'
        },
        {
            key: '2',
            task: 'School Supplies Distribution',
            project: 'School Infrastructure Support',
            date: '2025-10-12',
            time: '14:00 - 17:00',
            location: 'St. Mary\'s School',
            status: 'Completed'
        },
        {
            key: '3',
            task: 'Food Package Sorting',
            project: 'Food Distribution Drive',
            date: '2025-10-20',
            time: '08:00 - 16:00',
            location: 'Community Center',
            status: 'Upcoming'
        }
    ];

    const notificationsData = [
        {
            id: '1',
            title: 'New Task Assigned',
            message: 'You have been assigned to Health Workshop Facilitation on Oct 15',
            time: '2 hours ago',
            read: false
        },
        {
            id: '2',
            title: 'Schedule Change',
            message: 'Food Package Sorting has been rescheduled to Oct 20',
            time: '1 day ago',
            read: false
        },
        {
            id: '3',
            title: 'Task Completed',
            message: 'Thank you for completing School Supplies Distribution',
            time: '3 days ago',
            read: true
        }
    ];

    // Columns Definitions
    const opportunityColumns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            sorter: (a, b) => a.title.localeCompare(b.title)
        },
        {
            title: 'Department',
            dataIndex: 'department',
            key: 'department',
            filters: [
                { text: 'Healthcare', value: 'Healthcare' },
                { text: 'Education', value: 'Education' },
                { text: 'Community', value: 'Community' },
                { text: 'Environment', value: 'Environment' }
            ],
            onFilter: (value, record) => record.department === value
        },
        {
            title: 'Slots',
            key: 'slots',
            render: (_, record) => `${record.filled}/${record.slots}`,
            sorter: (a, b) => (a.slots - a.filled) - (b.slots - b.filled)
        },
        {
            title: 'Deadline',
            dataIndex: 'deadline',
            key: 'deadline',
            sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline)
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { Active: 'green', Filled: 'blue', Draft: 'orange', Closed: 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} size="small">View</Button>
                    <Button type="link" icon={<EditOutlined />} size="small">Edit</Button>
                    <Button type="link" danger icon={<DeleteOutlined />} size="small">Delete</Button>
                </Space>
            )
        }
    ];

    const applicationColumns = [
        {
            title: 'Volunteer',
            key: 'volunteer',
            render: (_, record) => (
                <div>
                    <div className="font-medium">{record.name}</div>
                    <div className="text-gray-500 text-xs">{record.email}</div>
                </div>
            )
        },
        {
            title: 'Project',
            dataIndex: 'project',
            key: 'project'
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            key: 'skills',
            render: (skills) => (
                <Space wrap>
                    {skills.map((skill, index) => (
                        <Tag key={index} color="blue">{skill}</Tag>
                    ))}
                </Space>
            )
        },
        {
            title: 'Experience',
            dataIndex: 'experience',
            key: 'experience'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { Pending: 'orange', Approved: 'green', Rejected: 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            },
            filters: [
                { text: 'Pending', value: 'Pending' },
                { text: 'Approved', value: 'Approved' },
                { text: 'Rejected', value: 'Rejected' }
            ],
            onFilter: (value, record) => record.status === value
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => {
                            setSelectedVolunteer(record);
                            setIsDetailDrawerOpen(true);
                        }}
                    >
                        View
                    </Button>
                    {record.status === 'Pending' && (
                        <>
                            <Button type="link" icon={<CheckCircleOutlined />} size="small" style={{ color: 'green' }}>
                                Approve
                            </Button>
                            <Button type="link" danger icon={<CloseCircleOutlined />} size="small">
                                Reject
                            </Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const volunteerColumns = [
        {
            title: 'Name',
            key: 'name',
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Avatar icon={<UserOutlined />} />
                    <div>
                        <div className="font-medium">{record.name}</div>
                        <div className="text-gray-500 text-xs">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            title: 'Skills',
            dataIndex: 'skills',
            key: 'skills',
            render: (skills) => (
                <Space wrap>
                    {skills.slice(0, 2).map((skill, index) => (
                        <Tag key={index}>{skill}</Tag>
                    ))}
                    {skills.length > 2 && <Tag>+{skills.length - 2}</Tag>}
                </Space>
            )
        },
        {
            title: 'Projects',
            dataIndex: 'projects',
            key: 'projects',
            render: (projects) => <Badge count={projects.length} showZero color="blue" />
        },
        {
            title: 'Availability',
            dataIndex: 'availability',
            key: 'availability'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'Active' ? 'green' : 'default'}>{status}</Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => {
                            setSelectedVolunteer(record);
                            setIsDetailDrawerOpen(true);
                        }}
                    >
                        View
                    </Button>
                    <Button type="link" icon={<CalendarOutlined />} size="small">
                        Schedule
                    </Button>
                </Space>
            )
        }
    ];

    const myTaskColumns = [
        {
            title: 'Task',
            dataIndex: 'task',
            key: 'task'
        },
        {
            title: 'Project',
            dataIndex: 'project',
            key: 'project'
        },
        {
            title: 'Date & Time',
            key: 'datetime',
            render: (_, record) => (
                <div>
                    <div><CalendarOutlined /> {record.date}</div>
                    <div className="text-gray-500 text-xs"><ClockCircleOutlined /> {record.time}</div>
                </div>
            )
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location) => (
                <span><EnvironmentOutlined /> {location}</span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = { Upcoming: 'blue', Completed: 'green', Cancelled: 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                record.status === 'Upcoming' ? (
                    <Button type="primary" size="small">Mark Complete</Button>
                ) : (
                    <Button type="link" size="small">View Details</Button>
                )
            )
        }
    ];

    const handleCreateOpportunity = (values) => {
        console.log('New Opportunity:', values);
        message.success('Opportunity created successfully!');
        setIsOpportunityModalOpen(false);
        form.resetFields();
    };

    const handleCreateShift = (values) => {
        console.log('New Shift:', values);
        message.success('Shift scheduled successfully!');
        setIsShiftModalOpen(false);
        shiftForm.resetFields();
    };

    // Admin Dashboard Content
    const AdminDashboard = () => (

        <>




            <div className=" min-h-screen">
                {/* Summary Cards */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm">
                            <Statistic
                                title="Total Volunteers"
                                value={156}
                                prefix={<TeamOutlined className="text-blue-500" />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm">
                            <Statistic
                                title="Active Opportunities"
                                value={12}
                                prefix={<CheckCircleOutlined className="text-green-500" />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm">
                            <Statistic
                                title="Pending Applications"
                                value={28}
                                prefix={<ClockCircleOutlined className="text-orange-500" />}
                                valueStyle={{ color: '#faad14' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} lg={6}>
                        <Card className="shadow-sm">
                            <Statistic
                                title="Scheduled Shifts"
                                value={45}
                                prefix={<CalendarOutlined className="text-purple-500" />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Search & Filter Bar */}
                <Card className="mb-4 shadow-sm">
                    <Space className="w-full" direction="horizontal" size="middle">
                        <Input
                            placeholder="Search volunteers, projects..."
                            prefix={<SearchOutlined />}
                            style={{ width: 300 }}
                        />
                        <Select placeholder="Filter by Department" style={{ width: 200 }}>
                            <Option value="healthcare">Healthcare</Option>
                            <Option value="education">Education</Option>
                            <Option value="community">Community</Option>
                            <Option value="environment">Environment</Option>
                        </Select>
                        <Select placeholder="Filter by Status" style={{ width: 150 }}>
                            <Option value="active">Active</Option>
                            <Option value="inactive">Inactive</Option>
                            <Option value="pending">Pending</Option>
                        </Select>
                        <Button icon={<FilterOutlined />}>More Filters</Button>
                    </Space>
                </Card>

                {/* Main Content Tabs */}
                <Card className="shadow-md">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'opportunities',
                                label: <span><CheckCircleOutlined /> Opportunities</span>,
                                children: (
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <h3 className="text-lg font-semibold">Volunteer Opportunities</h3>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => setIsOpportunityModalOpen(true)}
                                            >
                                                Post New Opportunity
                                            </Button>
                                        </div>
                                        <Table
                                            dataSource={opportunitiesData}
                                            columns={opportunityColumns}
                                            pagination={{ pageSize: 5 }}
                                        />
                                    </div>
                                )
                            },
                            {
                                key: 'applications',
                                label: <span><UserOutlined /> Applications</span>,
                                children: (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Application Management</h3>
                                        <Table
                                            dataSource={applicationsData}
                                            columns={applicationColumns}
                                            pagination={{ pageSize: 5 }}
                                        />
                                    </div>
                                )
                            },
                            {
                                key: 'schedules',
                                label: <span><CalendarOutlined /> Schedules</span>,
                                children: (
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <h3 className="text-lg font-semibold">Volunteer Scheduling</h3>
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => setIsShiftModalOpen(true)}
                                            >
                                                Create Shift
                                            </Button>
                                        </div>
                                        <div className="bg-gray-50 p-8 rounded">
                                            <Empty
                                                description={
                                                    <span className="text-gray-500">
                                                        <CalendarOutlined className="text-4xl mb-2" />
                                                        <div>Calendar View Coming Soon</div>
                                                        <div className="text-sm">FullCalendar integration will be added here</div>
                                                    </span>
                                                }
                                            />
                                        </div>
                                    </div>
                                )
                            },
                            {
                                key: 'volunteers',
                                label: <span><TeamOutlined /> Volunteers</span>,
                                children: (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-4">Volunteer Directory</h3>
                                        <Table
                                            dataSource={volunteersData}
                                            columns={volunteerColumns}
                                            pagination={{ pageSize: 5 }}
                                        />
                                    </div>
                                )
                            }
                        ]}
                    />
                </Card>
            </div>
        </>

    );

    // Volunteer Dashboard Content
    const VolunteerDashboard = () => (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Row gutter={[16, 16]}>
                {/* Left Column */}
                <Col xs={24} lg={16}>
                    {/* Profile Card */}
                    <Card className="mb-4 shadow-sm">
                        <div className="flex items-start gap-4">
                            <Avatar size={80} icon={<UserOutlined />} />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                                <p className="text-gray-500 mb-3">
                                    <MailOutlined /> john.doe@example.com | <PhoneOutlined /> +233 24 123 4567
                                </p>
                                <Space wrap>
                                    <Tag color="blue">First Aid</Tag>
                                    <Tag color="blue">Communication</Tag>
                                    <Tag color="blue">Project Management</Tag>
                                </Space>
                                <div className="mt-3">
                                    <Button type="link" icon={<EditOutlined />}>Edit Profile</Button>
                                </div>
                            </div>
                            <Badge count={notificationsData.filter(n => !n.read).length}>
                                <Button icon={<BellOutlined />} shape="circle" />
                            </Badge>
                        </div>
                    </Card>

                    {/* My Tasks */}
                    <Card className="shadow-sm" title="My Assignments">
                        <Table
                            dataSource={myTasksData}
                            columns={myTaskColumns}
                            pagination={false}
                        />
                    </Card>
                </Col>

                {/* Right Column */}
                <Col xs={24} lg={8}>
                    {/* Calendar */}
                    <Card className="mb-4 shadow-sm" title="My Calendar">
                        <div className="bg-gray-50 p-4 rounded">
                            <Empty
                                description={
                                    <span className="text-gray-500">
                                        <CalendarOutlined className="text-3xl mb-2" />
                                        <div className="text-sm">Calendar widget will be added</div>
                                    </span>
                                }
                            />
                        </div>
                    </Card>

                    {/* Notifications */}
                    <Card className="shadow-sm" title="Recent Notifications">
                        <List
                            dataSource={notificationsData}
                            renderItem={(item) => (
                                <List.Item className={!item.read ? 'bg-blue-50' : ''}>
                                    <List.Item.Meta
                                        avatar={<Avatar icon={<BellOutlined />} style={{ backgroundColor: !item.read ? '#1890ff' : '#d9d9d9' }} />}
                                        title={<span className={!item.read ? 'font-semibold' : ''}>{item.title}</span>}
                                        description={
                                            <div>
                                                <div className="text-sm">{item.message}</div>
                                                <div className="text-xs text-gray-400 mt-1">{item.time}</div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );

    return (
        <div>

            <PageHeader
                header={userRole === 'admin' ? 'Admin Panel' : 'Volunteer Portal'}
                items={[
                    {
                        title: 'Home',
                        href: '/'
                    },
                    {
                        title: 'Volunteer',
                        href: '/volunteer'
                    }
                ]}

                children={
                    <Select value={userRole} onChange={setUserRole} style={{ width: 200 }}>
                        <Option value="admin">Admin View</Option>
                        <Option value="volunteer">Volunteer View</Option>
                    </Select>
                }
            />
            {/* Role Switcher (for demo purposes) */}
            {/* <div className="bg-white border-b p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold">
                    {userRole === 'admin' ? '🔧 Admin Panel' : '👋 Volunteer Portal'}
                </h1>
                <Select value={userRole} onChange={setUserRole} style={{ width: 200 }}>
                    <Option value="admin">Admin View</Option>
                    <Option value="volunteer">Volunteer View</Option>
                </Select>
            </div> */}

            {/* Content */}
            {userRole === 'admin' ? <AdminDashboard /> : <VolunteerDashboard />}

            {/* Create Opportunity Modal */}
            <Modal
                title="Post New Volunteer Opportunity"
                open={isOpportunityModalOpen}
                onCancel={() => {
                    setIsOpportunityModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
                width={700}
            >
                <Form form={form} layout="vertical" onFinish={handleCreateOpportunity}>
                    <Form.Item name="title" label="Opportunity Title" rules={[{ required: true }]}>
                        <Input placeholder="e.g., Community Health Outreach" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                                <Select placeholder="Select department">
                                    <Option value="healthcare">Healthcare</Option>
                                    <Option value="education">Education</Option>
                                    <Option value="community">Community</Option>
                                    <Option value="environment">Environment</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="slots" label="Number of Slots" rules={[{ required: true }]}>
                                <InputNumber min={1} placeholder="15" className="w-full" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="deadline" label="Application Deadline" rules={[{ required: true }]}>
                        <DatePicker className="w-full" />
                    </Form.Item>
                    <Form.Item name="description" label="Description" rules={[{ required: true }]}>
                        <TextArea rows={4} placeholder="Describe the volunteer opportunity..." />
                    </Form.Item>
                    <Form.Item name="requirements" label="Requirements">
                        <Select mode="tags" placeholder="Add skills or requirements">
                            <Option value="first-aid">First Aid</Option>
                            <Option value="communication">Communication</Option>
                            <Option value="teaching">Teaching</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => setIsOpportunityModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Create Opportunity</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Create Shift Modal */}
            <Modal
                title="Schedule Volunteer Shift"
                open={isShiftModalOpen}
                onCancel={() => {
                    setIsShiftModalOpen(false);
                    shiftForm.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form form={shiftForm} layout="vertical" onFinish={handleCreateShift}>
                    <Form.Item name="project" label="Project" rules={[{ required: true }]}>
                        <Select placeholder="Select project">
                            {opportunitiesData.map(opp => (
                                <Option key={opp.key} value={opp.title}>{opp.title}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="volunteer" label="Assign Volunteer" rules={[{ required: true }]}>
                        <Select placeholder="Select volunteer">
                            {volunteersData.map(vol => (
                                <Option key={vol.key} value={vol.name}>{vol.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                                <DatePicker className="w-full" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="time" label="Time" rules={[{ required: true }]}>
                                <TimePicker.RangePicker className="w-full" format="HH:mm" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="location" label="Location" rules={[{ required: true }]}>
                        <Input placeholder="e.g., Kumasi Central Hospital" />
                    </Form.Item>
                    <Form.Item name="notes" label="Additional Notes">
                        <TextArea rows={3} placeholder="Any special instructions..." />
                    </Form.Item>
                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => setIsShiftModalOpen(false)}>Cancel</Button>
                            <Button type="primary" htmlType="submit">Schedule Shift</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Volunteer Detail Drawer */}
            <Drawer
                title="Volunteer Details"
                placement="right"
                width={500}
                onClose={() => setIsDetailDrawerOpen(false)}
                open={isDetailDrawerOpen}
            >
                {selectedVolunteer && (
                    <div>
                        <div className="text-center mb-6">
                            <Avatar size={100} icon={<UserOutlined />} />
                            <h2 className="text-2xl font-bold mt-3">{selectedVolunteer.name}</h2>
                            <p className="text-gray-500">{selectedVolunteer.email}</p>
                            {selectedVolunteer.phone && <p className="text-gray-500">{selectedVolunteer.phone}</p>}
                        </div>

                        <Card className="mb-4" size="small">
                            <div className="mb-3">
                                <h4 className="font-semibold mb-2 text-gray-700">Skills</h4>
                                <Space wrap>
                                    {selectedVolunteer.skills && selectedVolunteer.skills.map((skill, index) => (
                                        <Tag key={index} color="blue">{skill}</Tag>
                                    ))}
                                </Space>
                            </div>

                            {selectedVolunteer.availability && (
                                <div className="mb-3">
                                    <h4 className="font-semibold mb-2 text-gray-700">Availability</h4>
                                    <Tag icon={<ClockCircleOutlined />} color="green">
                                        {selectedVolunteer.availability}
                                    </Tag>
                                </div>
                            )}

                            {selectedVolunteer.projects && (
                                <div className="mb-3">
                                    <h4 className="font-semibold mb-2 text-gray-700">Assigned Projects</h4>
                                    {selectedVolunteer.projects.map((project, index) => (
                                        <Tag key={index} color="purple" className="mb-1">{project}</Tag>
                                    ))}
                                </div>
                            )}

                            {selectedVolunteer.experience && (
                                <div className="mb-3">
                                    <h4 className="font-semibold mb-2 text-gray-700">Experience</h4>
                                    <p className="text-gray-600">{selectedVolunteer.experience}</p>
                                </div>
                            )}

                            {selectedVolunteer.status && (
                                <div className="mb-3">
                                    <h4 className="font-semibold mb-2 text-gray-700">Status</h4>
                                    <Tag color={selectedVolunteer.status === 'Active' ? 'green' : selectedVolunteer.status === 'Pending' ? 'orange' : 'red'}>
                                        {selectedVolunteer.status}
                                    </Tag>
                                </div>
                            )}

                            {selectedVolunteer.joinDate && (
                                <div>
                                    <h4 className="font-semibold mb-2 text-gray-700">Join Date</h4>
                                    <p className="text-gray-600">{selectedVolunteer.joinDate}</p>
                                </div>
                            )}
                        </Card>

                        <Space className="w-full" direction="vertical">
                            <Button type="primary" block icon={<CalendarOutlined />}>
                                Schedule Shift
                            </Button>
                            <Button block icon={<MailOutlined />}>
                                Send Message
                            </Button>
                            <Button block icon={<EditOutlined />}>
                                Edit Profile
                            </Button>
                            {selectedVolunteer.status === 'Pending' && (
                                <>
                                    <Button type="primary" block icon={<CheckCircleOutlined />} style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}>
                                        Approve Application
                                    </Button>
                                    <Button danger block icon={<CloseCircleOutlined />}>
                                        Reject Application
                                    </Button>
                                </>
                            )}
                        </Space>
                    </div>
                )}
            </Drawer>
        </div>
    );
};

export default Volunteer;