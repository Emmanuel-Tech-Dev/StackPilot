import { Breadcrumb, Button, Card, Col, Row, Space, Tag, Tooltip } from 'antd'
import React, { useEffect } from 'react'
import { PageHeader } from '../../components/PageHeader'
import useTable from '../../hooks/useTable'
import utils from '../../dependencies/helpers/utilities'
import { CalendarOutlined, DatabaseOutlined, DollarOutlined, EditOutlined, EyeOutlined, ProjectOutlined, TeamOutlined } from '@ant-design/icons'
import { Typography } from "antd";
import StatCard from '../../components/Statistics'
import { useNavigate } from 'react-router-dom'
const { Text } = Typography;


const mockedData = [
    {
        "id": 1,
        "custom_id": "PRJ-001",
        "project_name": "Clean Water Initiative",
        "status": "Active",
        "budget": 500000,
        "start_date": "2025-01-15",
        "end_date": "2025-12-31",
        "created_at": "2025-08-28T12:50:00Z",
        "updated_at": "2025-08-28T12:50:00Z"
    },
    {
        "id": 2,
        "custom_id": "PRJ-002",
        "project_name": "Education for All",
        "status": "Active",
        "budget": 1200000,
        "start_date": "2025-03-01",
        "end_date": "2026-01-01",
        "created_at": "2025-08-28T12:50:00Z",
        "updated_at": "2025-08-28T12:50:00Z"
    },
    {
        "id": 3,
        "custom_id": "PRJ-003",
        "project_name": "Healthcare Outreach",
        "status": "Completed",
        "budget": 800000,
        "start_date": "2025-02-01",
        "end_date": "2025-04-10",
        "created_at": "2025-08-28T12:50:00Z",
        "updated_at": "2025-08-28T12:50:00Z"
    },
    {
        "id": 4,
        "custom_id": "PRJ-004",
        "project_name": "Youth Empowerment Program",
        "status": "Active",
        "budget": 650000,
        "start_date": "2025-05-01",
        "end_date": "2025-11-30",
        "created_at": "2025-09-01T09:15:00Z",
        "updated_at": "2025-10-01T14:20:00Z"
    },
    {
        "id": 5,
        "custom_id": "PRJ-005",
        "project_name": "Environmental Conservation Drive",
        "status": "Planned",
        "budget": 300000,
        "start_date": "2025-11-15",
        "end_date": "2026-03-31",
        "created_at": "2025-09-15T16:30:00Z",
        "updated_at": "2025-09-15T16:30:00Z"
    },
    {
        "id": 6,
        "custom_id": "PRJ-006",
        "project_name": "Women’s Literacy Campaign",
        "status": "Active",
        "budget": 450000,
        "start_date": "2025-02-20",
        "end_date": "2025-09-30",
        "created_at": "2025-08-01T11:00:00Z",
        "updated_at": "2025-10-05T10:45:00Z"
    },
    {
        "id": 7,
        "custom_id": "PRJ-007",
        "project_name": "Disaster Relief Fund",
        "status": "Completed",
        "budget": 950000,
        "start_date": "2024-10-01",
        "end_date": "2025-01-31",
        "created_at": "2024-10-05T08:20:00Z",
        "updated_at": "2025-02-15T13:10:00Z"
    },
    {
        "id": 8,
        "custom_id": "PRJ-008",
        "project_name": "Nutrition for Children",
        "status": "Active",
        "budget": 700000,
        "start_date": "2025-06-01",
        "end_date": "2026-05-31",
        "created_at": "2025-05-10T14:00:00Z",
        "updated_at": "2025-10-05T15:30:00Z"
    },
    {
        "id": 9,
        "custom_id": "PRJ-009",
        "project_name": "Sustainable Farming Initiative",
        "status": "Planned",
        "budget": 400000,
        "start_date": "2026-01-01",
        "end_date": "2026-12-31",
        "created_at": "2025-09-20T12:00:00Z",
        "updated_at": "2025-09-20T12:00:00Z"
    },
    {
        "id": 10,
        "custom_id": "PRJ-010",
        "project_name": "Mental Health Support Network",
        "status": "Active",
        "budget": 550000,
        "start_date": "2025-04-15",
        "end_date": "2025-12-15",
        "created_at": "2025-04-01T10:30:00Z",
        "updated_at": "2025-09-25T17:45:00Z"
    },
    {
        "id": 11,
        "custom_id": "PRJ-011",
        "project_name": "Refugee Aid Program",
        "status": "Completed",
        "budget": 1100000,
        "start_date": "2024-11-01",
        "end_date": "2025-06-30",
        "created_at": "2024-11-05T09:50:00Z",
        "updated_at": "2025-07-10T11:20:00Z"
    },
    {
        "id": 12,
        "custom_id": "PRJ-012",
        "project_name": "Digital Skills Training",
        "status": "Active",
        "budget": 350000,
        "start_date": "2025-07-01",
        "end_date": "2026-06-30",
        "created_at": "2025-06-15T13:40:00Z",
        "updated_at": "2025-10-05T09:00:00Z"
    }
]

function SplitDataByStatus(data) {
    const completed = data.filter((item) => item.status === "Completed");
    const active = data.filter((item) => item.status === "Active");
    const planned = data.filter((item) => item.status === "Planned");
    return [completed, active, planned];
}

// ...existing code...

const total = mockedData.reduce((acc, project) => acc + Number(project.budget), 0)

const STATS_DATA = [
    {
        title: 'Total Projects',
        value: mockedData.length,
        subtitle: `${SplitDataByStatus(mockedData)[1].length} Active • ${SplitDataByStatus(mockedData)[0].length} Completed • ${SplitDataByStatus(mockedData)[2].length} Planned`,
        icon: ProjectOutlined,
    },
    {
        title: 'Total Budget',
        value: utils.formatNumber(total),
        subtitle: 'GHS1.8M Allocated • GHS700K Spent',
        icon: DollarOutlined,
        prefix: 'GHS ',
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

// ...existing code...
const Projects = () => {
    const navigate = useNavigate();
    const table = useTable({
        pagination: {
            current: 1, pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: false,
        }
    }, null, null);

    const columns = [
        {
            title: "Project ID",
            dataIndex: "custom_id",
            key: "custom_id",

            render: (id) => (
                <Text strong type="secondary">
                    {id}
                </Text>
            ),
        },
        {
            title: "Project Name",
            dataIndex: "project_name",
            key: "project_name",
            ...table.getColumnSearchProps("project_name"),
            render: (name) => (
                <Text strong style={{ color: "#1677ff" }}>
                    {name}
                </Text>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            sorter: true,
            render: (status) => {
                let color = "default";
                if (status === "Active") color = "green";
                else if (status === "Completed") color = "blue";
                else if (status === "Paused") color = "orange";
                else if (status === "Cancelled") color = "red";

                return <Tag color={color}>{status}</Tag>;
            },
        },
        {
            title: "Budget (₵)",
            dataIndex: "budget",
            key: "budget",
            sorter: (a, b) => a.budget - b.budget,
            render: (budget) => (
                <Text>
                    ₵{Number(budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </Text>
            ),
        },
        {
            title: "Start Date",
            dataIndex: "start_date",
            key: "start_date",
            render: (date) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{utils.formatDateV3(date)}</Text>
                </Space>
            ),
        },
        {
            title: "End Date",
            dataIndex: "end_date",
            key: "end_date",
            render: (date) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{utils.formatDateV3(date)}</Text>
                </Space>
            ),
        },
        {
            title: "Created",
            dataIndex: "createdAt",
            key: "createdAt",

            render: (date) => (
                <Tooltip title={utils.formatDateV3(date)}>
                    {utils.formatDateV3(date)}
                </Tooltip>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            fixed: "right",

            render: (_, record) => (
                <Space>
                    <Tooltip title="View Project">
                        <EyeOutlined style={{ color: "#1890ff" }} onClick={() => navigate(`/admin/project/details/${record.id}`)} />
                    </Tooltip>
                    <Tooltip title="Edit Project">
                        <EditOutlined style={{ color: "#52c41a" }} />
                    </Tooltip>
                </Space>
            ),
        },
    ];




    useEffect(() => {
        table.setColumns(columns)
        table.setData(mockedData)
    }, [table.extrafetchparams])

    return (
        < >
            <PageHeader header={"Projects Overview"} items={[
                { title: <a href="/admin">Dashboard</a> },
                { title: <h1 className="font-semibold">Project Overview</h1> },
            ]} children={
                <>
                    <Button type="primary"
                        onClick={(e) => console.log(e)}
                    >Create new project</Button>
                </>
            } />


            <Row gutter={[16, 16]} className="mb-6">
                {STATS_DATA.map((stat, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <StatCard stat={stat} index={idx} loading={false} />
                    </Col>
                ))}
            </Row>






            <Card title="Projects">
                {table.table}
            </Card>



        </>


    )
}

export default Projects