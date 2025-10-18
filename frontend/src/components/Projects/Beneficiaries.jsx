import React, { useEffect, useState } from 'react';
import { Card, Tag, DatePicker, Select, Space, Button } from 'antd';
import { FilterOutlined, ClearOutlined, UserOutlined } from '@ant-design/icons';
import useTable from '../../hooks/useTable';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const beneficiariesData = [
    {
        key: '1',
        name: 'Mercy Adu',
        benefitType: 'Scholarship',
        value: 2000,
        dateReceived: '2024-08-20',
        location: 'Accra',
        status: 'Active',
    },
    {
        key: '2',
        name: 'Kwame Mensah',
        benefitType: 'Medical Aid',
        value: 1500,
        dateReceived: '2024-07-15',
        location: 'Kumasi',
        status: 'Completed',
    },
    {
        key: '3',
        name: 'Abena Osei',
        benefitType: 'Food Support',
        value: 500,
        dateReceived: '2024-09-05',
        location: 'Tamale',
        status: 'Active',
    },
    {
        key: '4',
        name: 'Kofi Asante',
        benefitType: 'Scholarship',
        value: 2000,
        dateReceived: '2024-06-10',
        location: 'Accra',
        status: 'Active',
    },
    {
        key: '5',
        name: 'Ama Boateng',
        benefitType: 'Water Access',
        value: 800,
        dateReceived: '2024-08-25',
        location: 'Cape Coast',
        status: 'Active',
    },
    {
        key: '6',
        name: 'Yaw Darko',
        benefitType: 'Training Program',
        value: 1200,
        dateReceived: '2024-07-30',
        location: 'Kumasi',
        status: 'Completed',
    },
    {
        key: '7',
        name: 'Akua Frimpong',
        benefitType: 'Medical Aid',
        value: 1800,
        dateReceived: '2024-09-12',
        location: 'Accra',
        status: 'Active',
    },
    {
        key: '8',
        name: 'Kwabena Owusu',
        benefitType: 'Food Support',
        value: 600,
        dateReceived: '2024-08-05',
        location: 'Tamale',
        status: 'Active',
    },
];

const Beneficiary = () => {
    const table = useTable(
        { pagination: { current: 1, pageSize: 10 } },
        null,
        null
    );

    const [filteredData, setFilteredData] = useState(beneficiariesData);
    const [selectedBenefitType, setSelectedBenefitType] = useState(null);
    const [selectedDateRange, setSelectedDateRange] = useState(null);

    const benefitTypes = [...new Set(beneficiariesData.map(b => b.benefitType))];

    const benefitTypeColors = {
        'Scholarship': 'blue',
        'Medical Aid': 'red',
        'Food Support': 'green',
        'Water Access': 'cyan',
        'Training Program': 'purple',
    };

    const statusColors = {
        'Active': 'success',
        'Completed': 'default',
    };

    const beneficiaryColumns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-gray-400" />
                    <span className="font-medium text-gray-900">{text}</span>
                </div>
            ),
        },
        {
            title: 'Benefit Type',
            dataIndex: 'benefitType',
            key: 'benefitType',
            render: (type) => (
                <Tag color={benefitTypeColors[type] || 'default'}>
                    {type}
                </Tag>
            ),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (value) => (
                <span className="font-semibold text-green-600">
                    ₵{value.toLocaleString()}
                </span>
            ),
            sorter: (a, b) => a.value - b.value,
        },
        {
            title: 'Date Received',
            dataIndex: 'dateReceived',
            key: 'dateReceived',
            render: (date) => new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            sorter: (a, b) => new Date(a.dateReceived) - new Date(b.dateReceived),
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
            render: (location) => <span className="text-gray-600">{location}</span>,
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
    ];

    const handleFilter = () => {
        let filtered = [...beneficiariesData];

        // Filter by benefit type
        if (selectedBenefitType) {
            filtered = filtered.filter(b => b.benefitType === selectedBenefitType);
        }

        // Filter by date range
        if (selectedDateRange && selectedDateRange.length === 2) {
            const [start, end] = selectedDateRange;
            filtered = filtered.filter(b => {
                const date = dayjs(b.dateReceived);
                return date.isAfter(start) && date.isBefore(end);
            });
        }

        setFilteredData(filtered);
        table.setData(filtered);
    };

    const handleClearFilters = () => {
        setSelectedBenefitType(null);
        setSelectedDateRange(null);
        setFilteredData(beneficiariesData);
        table.setData(beneficiariesData);
    };

    useEffect(() => {
        table.setColumns(beneficiaryColumns);
        table.setData(beneficiariesData);
    }, []);

    useEffect(() => {
        handleFilter();
    }, [selectedBenefitType, selectedDateRange]);

    const totalValue = filteredData.reduce((sum, b) => sum + b.value, 0);
    const totalBeneficiaries = filteredData.length;

    return (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Beneficiaries</h3>
                <p className="text-gray-500">Track and manage program beneficiaries</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-sm text-gray-600 mb-1">Total Beneficiaries</div>
                    <div className="text-3xl font-bold text-blue-600">{totalBeneficiaries}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        {filteredData.filter(b => b.status === 'Active').length} Active
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-sm text-gray-600 mb-1">Total Value Distributed</div>
                    <div className="text-3xl font-bold text-green-600">₵{totalValue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                        Avg: ₵{(totalValue / totalBeneficiaries).toFixed(0)}
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                    <div className="text-sm text-gray-600 mb-1">Benefit Types</div>
                    <div className="text-3xl font-bold text-purple-600">{benefitTypes.length}</div>
                    <div className="text-xs text-gray-500 mt-1">Different programs</div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Benefit Type
                        </label>
                        <Select
                            placeholder="Select benefit type"
                            style={{ width: '100%' }}
                            allowClear
                            value={selectedBenefitType}
                            onChange={setSelectedBenefitType}
                        >
                            {benefitTypes.map(type => (
                                <Select.Option key={type} value={type}>
                                    <Tag color={benefitTypeColors[type]}>{type}</Tag>
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date Range
                        </label>
                        <RangePicker
                            style={{ width: '100%' }}
                            value={selectedDateRange}
                            onChange={setSelectedDateRange}
                            format="YYYY-MM-DD"
                        />
                    </div>

                    <Button
                        icon={<ClearOutlined />}
                        onClick={handleClearFilters}
                        disabled={!selectedBenefitType && !selectedDateRange}
                    >
                        Clear Filters
                    </Button>
                </div>

                {(selectedBenefitType || selectedDateRange) && (
                    <div className="mt-3 text-sm text-gray-600">
                        <FilterOutlined /> Showing {filteredData.length} of {beneficiariesData.length} beneficiaries
                    </div>
                )}
            </Card>

            {/* Beneficiaries Table */}
            <Card>
                {table.table}
            </Card>
        </div>
    );
};

export default Beneficiary;