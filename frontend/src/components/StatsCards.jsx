import React from 'react';
import { Card, Row, Col, Statistic, Tag, Tooltip } from 'antd';
import {
    BarChartOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,

    DatabaseOutlined,
    UserOutlined
} from '@ant-design/icons';
import Loader from './Loader';

const StatsCards = ({ data = {}, loading = false }) => {
    // Sample data - replace with your actual data
    const statsData = {
        totalLogs: data?.total || 1247,
        topEvents: data?.topEvents ?? [{ count: 0 }],
        totalUsers: data?.totalUsers || 156,
        avgResponseTime: data?.avgResponseTime || 245,
        lastUpdated: data?.timestamp || '2024-01-15 14:30:25',
        dateRange: data?.dateRange || { oldest: '2024-01-01', newest: '2024-01-15' },
        ...data
    };




    const formatNumber = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full space-y-4">
            {/* Main Statistics Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="h-full border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <Statistic
                                    title={<span className="text-gray-600 text-sm font-medium">Total Logs</span>}
                                    value={statsData.totalLogs}
                                    formatter={(value) => <span className="text-2xl font-bold text-gray-800">{formatNumber(value)}</span>}
                                    prefix={<DatabaseOutlined className="text-blue-500" />}
                                />
                                <div className="mt-2">
                                    <Tag color="blue" className="text-xs">
                                        Active
                                    </Tag>
                                </div>
                            </>

                        }

                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="h-full border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <Statistic
                                    title={<span className="text-gray-600 text-sm font-medium">Top Events</span>}
                                    value={statsData.topEvents[0]?.count}
                                    formatter={(value) => <span className="text-2xl font-bold text-gray-800">{formatNumber(value)}</span>}
                                    prefix={<BarChartOutlined className="text-purple-500" />}
                                />
                                <div className="mt-2">
                                    <Tag color="purple" className="text-xs">
                                        {/* <TrendingUpOutlined className="mr-1" /> */}
                                        +12%
                                    </Tag>
                                </div>
                            </>

                        }


                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="h-full border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <Statistic
                                    title={<span className="text-gray-500 text-sm font-medium">Successful Responses -HTTP 200</span>}
                                    value={statsData.byStatusCode?.[200] || 0}
                                    formatter={(value) => <span className="text-2xl font-bold text-gray-800">{formatNumber(value)}</span>}
                                    prefix={<CheckCircleOutlined className="text-green-500" />}
                                />
                                <div className="mt-2">
                                    <Tag color="green" className="text-xs">
                                        Online
                                    </Tag>
                                </div>
                            </>

                        }

                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="h-full border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <Statistic
                                    title={<span className="text-gray-600 text-sm font-medium">Avg Response</span>}
                                    value={statsData.avgResponseTime}
                                    formatter={(value) => <span className="text-2xl font-bold text-gray-800">{value}ms</span>}
                                    prefix={<ClockCircleOutlined className="text-orange-500" />}
                                />
                                <div className="mt-2">
                                    <Tag color="orange" className="text-xs">
                                        Optimal
                                    </Tag>
                                </div>
                            </>

                        }

                    </Card>
                </Col>
            </Row>

            {/* Time Information Row */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card className="h-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <CalendarOutlined className="text-blue-500 mr-2 text-lg" />
                                            <span className="text-gray-700 font-medium">Date Range</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">From:</span> {formatDate(statsData.dateRange.oldest)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">To:</span> {formatDate(statsData.dateRange.newest)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {Math.ceil((new Date(statsData.dateRange.newest) - new Date(statsData.dateRange.oldest)) / (1000 * 60 * 60 * 24))}
                                        </div>
                                        <div className="text-sm text-gray-500">Days</div>
                                    </div>
                                </div>
                            </>

                        }


                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card className="h-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <ClockCircleOutlined className="text-green-500 mr-2 text-lg" />
                                            <span className="text-gray-700 font-medium">Last Updated</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-lg font-semibold text-gray-800">
                                                {formatDateTime(statsData.lastUpdated)}
                                            </div>
                                            <Tooltip title="Data refreshes every 5 minutes">
                                                <Tag color="green" className="text-xs cursor-help">
                                                    Live Data
                                                </Tag>
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mb-1"></div>
                                        <div className="text-xs text-gray-500">Active</div>
                                    </div>
                                </div>
                            </>

                        }


                    </Card>
                </Col>
            </Row>

            {/* Summary Card */}
            <Row>
                <Col span={24}>
                    <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200">
                        {loading ? <Loader active={loading} rows={2} width="100%" /> :
                            <>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <BarChartOutlined className="text-blue-600 text-xl" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">System Overview</h3>
                                            <p className="text-sm text-gray-600">
                                                Monitoring {formatNumber(statsData.totalLogs)} log entries and {statsData.topEvents[0]?.count} top events
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Tag color="processing">Real-time</Tag>
                                        <Tag color="success">Healthy</Tag>
                                        <Tag color="default">
                                            {formatDate(statsData.dateRange.oldest)} - {formatDate(statsData.dateRange.newest)}
                                        </Tag>
                                    </div>
                                </div>
                            </>

                        }


                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatsCards;