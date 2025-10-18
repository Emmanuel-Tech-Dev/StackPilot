import { CheckCircleOutlined, DollarOutlined, RiseOutlined, TeamOutlined } from '@ant-design/icons'
import { Card, Col, Progress, Row, Tag, Timeline } from 'antd'
import React from 'react'

const DetailsOverview = () => {
    return (
        <div >
            {/* Description Section */}
            <Card className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Project Description</h3>
                <p className="text-gray-700 mb-4">
                    The Clean Water Initiative aims to provide sustainable access to clean drinking water
                    for rural communities in West Africa. Through the installation of modern water filtration
                    systems and community education programs, we are working to improve health outcomes and
                    reduce waterborne diseases.
                </p>
                <div className="flex items-center gap-4">
                    <Tag color="blue" className="text-sm px-3 py-1">Current Phase: Implementation</Tag>
                    <span className="text-gray-500">Phase 2 of 4</span>
                </div>
            </Card>

            {/* KPIs Summary */}
            <h3 className="text-lg font-semibold mb-4">Key Performance Indicators</h3>
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center hover:shadow-md transition-shadow">
                        <TeamOutlined className="text-4xl text-blue-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">12,450</div>
                        <div className="text-gray-500 text-sm">People Reached</div>
                        <Progress
                            percent={83}
                            size="small"
                            strokeColor="#52c41a"
                            className="mt-2"
                            showInfo={false}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center hover:shadow-md transition-shadow">
                        <DollarOutlined className="text-4xl text-green-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">$245K</div>
                        <div className="text-gray-500 text-sm">Funds Used</div>
                        <Progress
                            percent={68}
                            size="small"
                            strokeColor="#1890ff"
                            className="mt-2"
                            showInfo={false}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center hover:shadow-md transition-shadow">
                        <RiseOutlined className="text-4xl text-orange-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">75%</div>
                        <div className="text-gray-500 text-sm">Overall Progress</div>
                        <Progress
                            percent={75}
                            size="small"
                            strokeColor="#faad14"
                            className="mt-2"
                            showInfo={false}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center hover:shadow-md transition-shadow">
                        <CheckCircleOutlined className="text-4xl text-purple-500 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">28/35</div>
                        <div className="text-gray-500 text-sm">Milestones Complete</div>
                        <Progress
                            percent={80}
                            size="small"
                            strokeColor="#722ed1"
                            className="mt-2"
                            showInfo={false}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Activity Timeline */}
            <Card>
                <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                <Timeline
                    items={[
                        {
                            color: 'green',
                            children: (
                                <>
                                    <p className="font-medium mb-1">Phase 1 Completed</p>
                                    <p className="text-gray-500 text-sm">Site assessment and community engagement - March 2024</p>
                                </>
                            ),
                        },
                        {
                            color: 'green',
                            children: (
                                <>
                                    <p className="font-medium mb-1">Water Systems Installed</p>
                                    <p className="text-gray-500 text-sm">15 filtration units deployed across 5 villages - June 2024</p>
                                </>
                            ),
                        },
                        {
                            color: 'blue',
                            children: (
                                <>
                                    <p className="font-medium mb-1">Training Programs Launched</p>
                                    <p className="text-gray-500 text-sm">Community health workers training - September 2024</p>
                                </>
                            ),
                        },
                        {
                            color: 'gray',
                            children: (
                                <>
                                    <p className="font-medium mb-1">Phase 3: Monitoring & Evaluation</p>
                                    <p className="text-gray-500 text-sm">Scheduled for November 2024</p>
                                </>
                            ),
                        },
                    ]}
                />
            </Card>
        </div>
    )
}

export default DetailsOverview