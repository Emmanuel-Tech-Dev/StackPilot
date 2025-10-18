import React, { useEffect, useState } from 'react'

import { Tag, Avatar, Button, Space, Tabs, Row, Col, Card, Progress, Timeline, Table, Modal, Select, Input, Form, message } from 'antd';
import { EditOutlined, UserAddOutlined, FileTextOutlined, TeamOutlined, DollarOutlined, RiseOutlined, CheckCircleOutlined, DeleteOutlined, PhoneOutlined, MailOutlined, PlusOutlined } from '@ant-design/icons';
import useTable from '../../hooks/useTable';

const initialTeamMembers = [
    {
        key: '1',
        name: 'Jane Doe',
        role: 'Project Manager',
        dateAssigned: '2024-01-15',
        contact: '+233 555 123 456',
        email: 'jane.doe@ngo.org',
        avatar: 'JD',
        avatarColor: '#1890ff',
    },
    {
        key: '2',
        name: 'John Smith',
        role: 'Field Coordinator',
        dateAssigned: '2024-02-01',
        contact: '+233 555 234 567',
        email: 'john.smith@ngo.org',
        avatar: 'JS',
        avatarColor: '#52c41a',
    },
    {
        key: '3',
        name: 'Mary Johnson',
        role: 'Community Liaison',
        dateAssigned: '2024-03-10',
        contact: '+233 555 345 678',
        email: 'mary.johnson@ngo.org',
        avatar: 'MJ',
        avatarColor: '#faad14',
    },
    {
        key: '4',
        name: 'David Brown',
        role: 'Technical Specialist',
        dateAssigned: '2024-04-05',
        contact: '+233 555 456 789',
        email: 'david.brown@ngo.org',
        avatar: 'DB',
        avatarColor: '#722ed1',
    },
];

const availableVolunteers = [
    { value: '5', label: 'Sarah Williams - Health Officer', name: 'Sarah Williams', role: 'Health Officer', contact: '+233 555 567 890', email: 'sarah.w@ngo.org', avatar: 'SW', avatarColor: '#eb2f96' },
    { value: '6', label: 'Michael Chen - Engineer', name: 'Michael Chen', role: 'Engineer', contact: '+233 555 678 901', email: 'michael.c@ngo.org', avatar: 'MC', avatarColor: '#13c2c2' },
    { value: '7', label: 'Emma Davis - Educator', name: 'Emma Davis', role: 'Educator', contact: '+233 555 789 012', email: 'emma.d@ngo.org', avatar: 'ED', avatarColor: '#52c41a' },
    { value: '8', label: 'James Wilson - Logistics', name: 'James Wilson', role: 'Logistics Officer', contact: '+233 555 890 123', email: 'james.w@ngo.org', avatar: 'JW', avatarColor: '#fa8c16' },
    { value: '9', label: 'Lisa Anderson - Finance', name: 'Lisa Anderson', role: 'Finance Officer', contact: '+233 555 901 234', email: 'lisa.a@ngo.org', avatar: 'LA', avatarColor: '#722ed1' },
];

const Team = () => {


    const table = useTable(
        { pagination: { current: 1, pageSize: 10 } }
        , null, null)

    const volunteerTable = useTable(
        { pagination: { current: 1, pageSize: 10 } }
        , null, null)




    const teamColumns = [
        {
            title: 'Team Member',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar style={{ backgroundColor: record.avatarColor }} size="large">
                        {record.avatar}
                    </Avatar>
                    <div>
                        <div className="font-medium text-gray-900">{text}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="blue">{role}</Tag>,
        },
        {
            title: 'Date Assigned',
            dataIndex: 'dateAssigned',
            key: 'dateAssigned',
            render: (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
            render: (contact) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <PhoneOutlined />
                    <span>{contact}</span>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMember(record.key)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    const volunteerColumns = [
        {
            title: 'Volunteer',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center gap-3">
                    <Avatar style={{ backgroundColor: record.avatarColor }} size="large">
                        {record.avatar}
                    </Avatar>
                    <div>
                        <div className="font-medium text-gray-900">{text}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="green">{role}</Tag>,
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
            render: (contact) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <PhoneOutlined />
                    <span>{contact}</span>
                </div>
            ),
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => {
                const isAssigned = initialTeamMembers.some(member => member.key === record.value);
                return (
                    <Tag color={isAssigned ? "default" : "success"}>
                        {isAssigned ? "Assigned" : "Available"}
                    </Tag>
                );
            },
        },
    ];

    useEffect(() => {
        table.setColumns(teamColumns)
        table.setData(initialTeamMembers)

        volunteerTable.setColumns(volunteerColumns)
        volunteerTable.setData(availableVolunteers)
    }, [initialTeamMembers])

    return (
        <div className="p-6">
            {/* Team Members Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Team & Assignments</h3>
                    <p className="text-gray-500">Manage project team leads and their roles</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                // onClick={() => setIsModalOpen(true)}
                >
                    Add Team Member
                </Button>
            </div>

            <Card className="mb-6">
                {table.table}
            </Card>

            {/* Available Volunteers Section */}
            <div className="mt-8">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-1">Available Volunteers</h3>
                    <p className="text-gray-500">Pool of volunteers that can be assigned to the project</p>
                </div>

                <Card>
                    {volunteerTable.table}
                </Card>
            </div>


        </div>
    )
}

export default Team