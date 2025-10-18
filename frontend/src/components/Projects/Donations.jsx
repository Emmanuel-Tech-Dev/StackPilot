import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

import useTable from '../../hooks/useTable';
import useAntVChart from '../../hooks/useChartAntV';

const donationsData = [
    {
        key: '1',
        donor: 'UNICEF',
        amount: 20000,
        date: '2024-08-15',
        method: 'Bank Transfer',
        notes: 'Water infrastructure support',
    },
    {
        key: '2',
        donor: 'World Vision',
        amount: 15000,
        date: '2024-07-22',
        method: 'Bank Transfer',
        notes: 'Community health program',
    },
    {
        key: '3',
        donor: 'Gates Foundation',
        amount: 25000,
        date: '2024-09-10',
        method: 'Wire Transfer',
        notes: 'Education initiative',
    },
    {
        key: '4',
        donor: 'Local Church',
        amount: 5000,
        date: '2024-06-05',
        method: 'Cash',
        notes: 'Community support',
    },
    {
        key: '5',
        donor: 'Anonymous Donor',
        amount: 7000,
        date: '2024-08-28',
        method: 'Mobile Money',
        notes: '–',
    },
];

const Donations = () => {



    const table = useTable(
        { pagination: { current: 1, pageSize: 10 } },
        null,
        null
    );




    const totalDonations = donationsData.reduce((sum, d) => sum + d.amount, 0);
    const lastDonation = donationsData.reduce((latest, d) =>
        new Date(d.date) > new Date(latest.date) ? d : latest
    );

    // Chart data for donations trend
    const donationTrendData = donationsData
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((d, idx, arr) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: arr.slice(0, idx + 1).reduce((sum, item) => sum + item.amount, 0),
        }));


    const donationColumns = [
        {
            title: 'Donor',
            dataIndex: 'donor',
            key: 'donor',
            render: (text) => <span className="font-medium text-gray-900">{text}</span>,
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: (amount) => (
                <span className="font-semibold text-green-600">
                    ₵{amount.toLocaleString()}
                </span>
            ),
            sorter: (a, b) => a.amount - b.amount,
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
            title: 'Method',
            dataIndex: 'method',
            key: 'method',
            render: (method) => <Tag color="blue">{method}</Tag>,
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes) => <span className="text-gray-600">{notes}</span>,
        },
    ];

    const { containerRef: lineRef } = useAntVChart("Line", {
        data: donationTrendData,
        xField: 'date',
        yField: 'amount',
        smooth: true,
        color: '#1890ff',
        point: {
            size: 5,
            shape: 'circle',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
        tooltip: {
            formatter: (datum) => {
                return { name: 'Total Raised', value: `₵${datum.amount.toLocaleString()}` };
            },
        },
        yAxis: {
            label: {
                formatter: (v) => `₵${(v / 1000).toFixed(0)}K`,
            },
        },
    }
    );

    useEffect(() => {
        table.setColumns(donationColumns);
        table.setData(donationsData);
    }, []);

    return (
        <div className="p-6 space-y-2">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Donations & Funding</h3>
                <p className="text-gray-500">Track all donations and funding sources</p>
            </div>

            {/* Summary Cards */}
            <Row gutter={[16, 16]} className="mb-12">
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <Statistic
                            title={<span className="text-gray-700 font-medium">Total Donations</span>}
                            value={totalDonations}
                            prefix="₵"
                            valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
                            suffix={
                                <span className="text-sm text-gray-600">
                                    ({donationsData.length} donations)
                                </span>
                            }
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <Statistic
                            title={<span className="text-gray-700 font-medium">Last Donation</span>}
                            value={new Date(lastDonation.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1d4ed8', fontSize: '20px' }}
                        />
                        <div className="text-sm text-gray-600 mt-2">
                            {lastDonation.donor} - ₵{lastDonation.amount.toLocaleString()}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <Statistic
                            title={<span className="text-gray-700 font-medium">Average Donation</span>}
                            value={(totalDonations / donationsData.length).toFixed(0)}
                            prefix="₵"
                            valueStyle={{ color: '#7c3aed', fontWeight: 'bold' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Donations Trend Chart */}
            <Card title="Cummulative Donation Trends" className='mt-6'>
                {/* {loading && <Loader active={loading} rows={1} width="100%" className="h-full" />} */}

                <div ref={lineRef} style={{ height: 300 }} />
            </Card>

            {/* Donations Table */}
            <Card>
                {table.table}
            </Card>
        </div>
    );
};

export default Donations;