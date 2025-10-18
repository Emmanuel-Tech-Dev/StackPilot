import { EditOutlined, FileTextOutlined, UserAddOutlined } from '@ant-design/icons'
import { Avatar, Button, Space, Tabs, Tag } from 'antd'
import React, { useEffect, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import DetailsOverview from '../../components/Projects/DetailsOverview'
import Team from '../../components/Projects/Team'
import Donations from '../../components/Projects/Donations'
import Beneficiary from '../../components/Projects/Beneficiaries'
import Reports from '../../components/Projects/Reports'
import utils from '../../dependencies/helpers/utilities'
import Settings from '../../dependencies/helpers/settings'
import { useParams } from 'react-router-dom'


const ProjectHeader = ({ data = {} }) => {
    return (
        <>
            <div
                className="bg-white shadow-sm border-b border-gray-200 p-6 relative rounded-lg"
                style={{
                    backgroundImage: 'url(https://www.thebighand.org/wp-content/uploads/2019/02/noticias_thebighand_5-1120x550.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex items-start justify-between">
                        {/* Left Section - Project Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <h1 className="text-2xl font-semibold text-white m-0">
                                    {data?.project_name}
                                </h1>
                                <Tag color="green" className="m-0 text-sm">{data?.status}</Tag>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-white">
                                {/* Project Head */}
                                <div className="flex items-center gap-2">
                                    <Avatar
                                        size="small"
                                        style={{ backgroundColor: '#1890ff' }}
                                    >
                                        JD
                                    </Avatar>
                                    <div>
                                        <span className="font-medium text-white">Jane Doe</span>
                                        <span className="text-gray-200 ml-1">• Project Manager</span>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="flex items-center gap-4">
                                    <div>
                                        <span className="text-gray-200">Start:</span>
                                        <span className="ml-1 font-medium text-white">{utils.formatDateV3(data?.start_date)}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-200">End:</span>
                                        <span className="ml-1 font-medium text-white">{utils.formatDateV3(data?.end_date)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Quick Actions */}
                        <div>
                            <Space>
                                <Button
                                    icon={<EditOutlined />}
                                    type="default"
                                >
                                    Edit
                                </Button>
                                <Button
                                    icon={<UserAddOutlined />}
                                    type="default"
                                >
                                    Assign
                                </Button>
                                <Button
                                    icon={<FileTextOutlined />}
                                    type="primary"
                                >
                                    Generate Report
                                </Button>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const ProjectDetails = () => {
    const { projectId: id } = useParams()
    const [data, setData] = useState()
    const items =
        [
            {
                key: '1',
                label: 'Overview',
                children: <DetailsOverview />,
            },
            {
                key: '2',
                label: 'Team & Assignments',
                children: <Team />,
            },
            {
                key: '3',
                label: 'Donations',
                children: <Donations />,
            }, {
                key: '4',
                label: 'Beneficiaries',
                children: <Beneficiary />,
            }, {
                key: '5',
                label: 'Reports & KPIs',
                children: <Reports />,
            },
        ]



    async function getProjectInfo() {
        try {

            const res = await utils.requestWithReauth('get',
                `${Settings.baseUrl}v1/projects/${id}?exclude=updatedAt&exclude=createdAt&exclude=description`,
                null, {})

            if (res?.status === "Ok") {
                const data = res?.data
                setData(data)
            } else {
                utils.showNotification("Error", res?.message, "text-red-500")
            }

        } catch (error) {
            utils.showNotification("Error", error, "text-red-500")
        }
    }


    useEffect(() => {
        getProjectInfo()
    }, [])


    return (
        <>
            <PageHeader header={"Project"}
                items={[

                    { title: <a href="/admin/project/overview">Project Overview</a> },
                    { title: <a href="#">Projects</a> },
                    { title: <h1 className="font-semibold">{data?.project_name}</h1> }
                ]}
            />

            <ProjectHeader data={data} />

            <div className='mt-3'>
                <Tabs
                    defaultActiveKey="1"
                    items={items}
                />
            </div>
        </>

    )
}

export default ProjectDetails