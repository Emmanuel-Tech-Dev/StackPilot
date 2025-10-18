import React, { useEffect } from 'react'
import useTable from '../../../hooks/useTable'
import CustomFunction from '../../../dependencies/custom_functions/customfunctions'
import utils from '../../../dependencies/helpers/utilities'
import { Avatar, Badge, Button, Card, Dropdown, Space, Tag, Tooltip, Typography } from 'antd'
import { CalendarOutlined, DownOutlined, EditOutlined, EllipsisOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import useEdit from '../../../hooks/useEdit'
import ValuesStore from '../../../store/values-store'

const { Text } = Typography
const items = [
    {
        label: (
            <a href="#" >
                Partner Profile
            </a>
        ),
        key: '0',
    },
    {
        label: (
            <a >
                Contact Information
            </a>
        ),
        key: '1',
    },

];
const Parteners = ({ campaignId = "" }) => {
    const valuesStore = ValuesStore()
    const table = useTable({
        pagination: {
            current: 1, pageSize: 10, showSizeChanger: true,
            showQuickJumper: true,
        }
    }, null, null
    )

    const edit = useEdit("tables_metadata", "table_name");

    const columns = [
        {
            title: 'Partner',
            dataIndex: 'partner_name',
            key: 'partner_name',
            width: 250,
            fixed: 'left',
            render: (name, record) => {
                const typeConfig = CustomFunction.getPartnerTypeConfig(record.partner_type);
                const Icon = typeConfig.icon;
                return (
                    <Space>
                        <Avatar
                            style={{
                                backgroundColor: typeConfig.color === 'blue' ? '#1890ff' :
                                    typeConfig.color === 'purple' ? '#722ed1' :
                                        typeConfig.color === 'gold' ? '#faad14' : '#52c41a'
                            }}
                            icon={<Icon />}
                        />
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{name}</div>
                            <Tag color={typeConfig.color} style={{ margin: 0 }}>
                                {typeConfig.label}
                            </Tag>
                        </div>
                    </Space>
                );
            }
        },
        {
            title: 'Contact Information',
            dataIndex: 'contact_info',
            key: 'contact_info',
            width: 300,
            render: (info) => (
                // console.log(info),
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    {info.contact_person && (
                        <Text strong style={{ fontSize: 13 }}>
                            <UserOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                            {info.contact_person}
                        </Text>
                    )}
                    <Tooltip title="Email">
                        <Text copyable style={{ fontSize: 12 }}>
                            <MailOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                            {info.email}
                        </Text>
                    </Tooltip>
                    <Tooltip title="Phone">
                        <Text copyable style={{ fontSize: 12 }}>
                            <PhoneOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                            {info.phone}
                        </Text>
                    </Tooltip>
                    {info.socials && (
                        <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                            📸 {info.socials} {info?.acc} ({info.followers} followers)
                        </Text>
                    )}
                </Space>
            )
        },
        {
            title: 'Contribution',
            key: 'contribution',
            width: 200,
            render: (_, record) => {
                const typeConfig = CustomFunction.getContributionTypeConfig(record.contribution_type);
                const Icon = typeConfig?.icon
                return (
                    <Space direction="vertical" size="small">
                        <Badge
                            color={typeConfig.color === 'success' ? '#52c41a' :
                                typeConfig.color === 'processing' ? '#1890ff' : '#faad14'}
                            text={
                                <Text strong style={{ fontSize: 13 }}>
                                    <Icon /> {typeConfig.label}
                                </Text>
                            }
                        />
                        <Text
                            strong
                            style={{
                                fontSize: 16,
                                color: parseFloat(record.contribution_amount) > 0 ? '#52c41a' : '#8c8c8c'
                            }}
                        >
                            {utils.currencyConvertor(parseFloat(record.contribution_amount))}
                        </Text>
                    </Space>
                );
            }
        },
        // {
        //     title: 'Campaign ID',
        //     dataIndex: 'campaign_id',
        //     key: 'campaign_id',
        //     width: 120,
        //     align: 'center',
        //     render: (id) => (
        //         <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
        //             #{id}
        //         </Tag>
        //     )
        // },
        {
            title: 'Date Added',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => (
                <Space>
                    <CalendarOutlined style={{ color: '#8c8c8c' }} />
                    <Text style={{ fontSize: 13 }}>{utils.formatDateV3(date)}</Text>
                </Space>
            ),
            // sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            width: 100,
            fixed: "right",
            render: (_, record) => (

                <Dropdown menu={{
                    items: [
                        {
                            label: (
                                <Button type='text' onClick={() => editRecord(record, "campaign_partners")} >
                                    Partner Profile
                                </Button >
                            ),
                            key: '0',
                        },
                        {
                            label: (
                                <Button type='text' onClick={() => editContactInfo(record?.contact_info, "campaign_partners")}>
                                    Contact Information
                                </Button>
                            ),
                            key: '1',
                        },

                    ]
                }} trigger={['click']} >
                    <Space>

                        <Button onClick={e => e.preventDefault()} type="default" size="small" icon={<EllipsisOutlined className='text-green-500' />} />

                    </Space>

                </Dropdown >

            )
        }

    ];


    function editRecord(record, tableName) {

        delete record["contact_info"];
        console.log(record)
        const storeKey = 'editableRecord';
        valuesStore.setValue(storeKey, record);
        edit.setTblName(tableName);
        edit.setData(record);
        edit.setRecordKey(storeKey);
        edit.setShowModal(true);
        edit.setSaveCompleted(false);
    }

    function editContactInfo(record, tableName) {

        console.log(record)
        const storeKey = 'editableRecord_cinfo';
        valuesStore.setValue(storeKey, record);
        edit.setTblName(tableName);
        edit.setData(record);
        edit.setRecordKey(storeKey);
        edit.setShowModal(true);
        edit.setSaveCompleted(false);
    }









    async function trigerDataFetch() {
        const res = await CustomFunction.getData({ campaign_id: campaignId }, 'campaign_partners')
        // setTimeline(res)
        table.setData(res)
    }

    useEffect(() => {
        if (!campaignId) return
        table.setColumns(columns)
        trigerDataFetch()

    }, [campaignId])



    return (
        <div>
            <Card title={
                <div className='flex items-center gap-2'>
                    <h1>Partners</h1>
                    <Badge count={table?.data.length} style={{ backgroundColor: '#52c41a' }} />
                </div>

            } className='border-none'
                extra={<Button type='primary' onClick={() => console.log("Click")}>Add Partner</Button>}
            >
                {table.table}
            </Card>

            {edit.editModal("Edit Partner Profile")}

        </div>
    )
}

export default Parteners