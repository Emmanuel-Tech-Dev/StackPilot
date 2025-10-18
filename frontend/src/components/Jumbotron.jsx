import { Avatar, Button, Space, Tag } from 'antd'
import React from 'react'
import utils from '../dependencies/helpers/utilities'

const Jumbotron = ({ data = {}, children = null }) => {
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
                                {children}
                            </Space>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Jumbotron