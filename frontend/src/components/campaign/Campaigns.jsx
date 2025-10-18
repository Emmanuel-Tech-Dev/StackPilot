import { Button, Card, Dropdown, Progress, Segmented, Space, Tabs, Tag, Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import useTable from '../../hooks/useTable'
import utils from '../../dependencies/helpers/utilities'
import useAdd from '../../hooks/useAdd'
import useDelete from '../../hooks/useDelete'
import useEdit from '../../hooks/useEdit'
import Settings from '../../dependencies/helpers/settings'
import ValuesStore from '../../store/values-store'
import useDrawer from '../../hooks/useDrawer'
import { DeleteFilled, EditFilled, ExportOutlined, EyeFilled } from '@ant-design/icons'
import CampaignProfile from './CampaignProfile'
import { useLocation, useNavigate } from 'react-router-dom'





const items = [
    {
        label: (
            <a href="#">
                Export as CSV
            </a>
        ),
        key: '0',
    },
    {
        label: (
            <a href="#">
                Export as PDF
            </a>
        ),
        key: '1',
    },
    // {
    //     type: 'divider',
    // },
    // {
    //     label: '3rd menu item',
    //     key: '3',
    // },
];
// const App = () => (

//     //     <a onClick={e => e.preventDefault()}>
//     //         <Space>
//     //             Click me
//     //             <DownOutlined />
//     //         </Space>
//     //     </a>
//     // </Dropdown>
// );
// export default App;


const Campaigns = () => {

    const navigate = useNavigate();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const activeKey = params.get("category") || "All";




    const valuesStore = ValuesStore()
    const table = useTable({
        pagination: {
            current: 1, pageSize: 10, showSizeChanger: true,
            showQuickJumper: true,
        }
    }, "v1/campaigns", null)

    const addData = useAdd("tables_metadata", 'table_name')
    const edit = useEdit("tables_metadata", 'table_name')
    const deleteData = useDelete()
    const campaignInfoDrawer = useDrawer()

    const [campaignSegment, setCampaignSegment] = useState([])


    const columns = [


        {
            title: ' Name',
            dataIndex: 'campaign_name',
            key: 'campaign_name',
            ellipsis: true,
            render: (text, record) => <a href={`info/${record?.id}`}>{text}</a>


        },


        // {
        //     title: 'Start Date',
        //     dataIndex: 'start_date',
        //     key: 'start_date',
        //     render: (date) => date ? utils.formatDateV3(date) : '-',

        // },
        // {
        //     title: 'End Date',
        //     dataIndex: 'end_date',
        //     key: 'end_date',
        //     render: (date) => date ? utils.formatDateV3(date) : '-',

        // },


        {
            title: 'Amount Raised',
            dataIndex: 'amount_raised',
            key: 'amount_raised',

        },
        {
            title: 'Goal Achieved %',
            dataIndex: 'goal_achieved_percentage',
            key: 'goal_achieved_percentage',
            render: (_, record) => (
                <Progress
                    percent={record.goal_achieved_percentage || 0}
                    status="active"
                    size="small"
                />
            ),

        },
        {
            title: 'Target Audience',
            dataIndex: 'target_audience',
            key: 'target_audience',
            ellipsis: true,
            render: (text) => text || '-',
        },
        {
            title: 'Promotion Channels',
            dataIndex: 'promotion_channels',
            key: 'promotion_channels',
            render: (channels) => channels ? JSON.stringify(channels).slice(0, 50) + '...' : '-',
            ellipsis: true,
        },


        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            sorter: true,
            render: (status) => (
                <Tag color={
                    status === 'Active' ? 'green' :
                        status === 'Draft' ? 'default' :
                            status === 'Paused' ? 'orange' :
                                status === 'Completed' ? 'blue' : 'red'
                }>
                    {status || 'Draft'}
                </Tag>
            ),

        },
        {
            title: 'Is Public',
            dataIndex: 'is_public',
            key: 'is_public',
            render: (isPublic) => isPublic ? 'Yes' : 'No',
            sorter: (a, b) => a.is_public - b.is_public,
            filters: [
                { text: 'Yes', value: 1 },
                { text: 'No', value: 0 },
            ],
            onFilter: (value, record) => record.is_public === value,
        },

        // {
        //     title: 'Created At',
        //     dataIndex: 'createdAt',
        //     key: 'createdAt',
        //     render: (date) => utils.formatDateV3(date),

        // },

        {
            title: "Action",
            dataIndex: 'action',
            fixed: "right",
            key: 'action',
            render: (text, record) => {
                return (
                    <Space size={"middle"}>
                        <EditFilled
                            className='text-blue-500'
                            onClick={() => editRecord(record, 'campaigns')}
                        />
                        <EyeFilled className='text-green-500' onClick={() => {
                            campaignInfoDrawer.setOpen(true)
                            campaignInfoDrawer.setPlacement('right')
                            campaignInfoDrawer.setWidth(1300)
                            campaignInfoDrawer.setTitle(record.campaign_name)
                            campaignInfoDrawer.setContent(
                                <CampaignProfile record={record} />
                            )
                        }
                        } />

                        {deleteData.confirm(
                            `${Settings.baseUrl}v1/delete`,
                            record,
                            'Are you sure to delete this item',
                            { tableName: 'campaigns' },
                            <DeleteFilled className='text-red-500' />
                            , null, null, null, async () => {
                                table.refreshData()
                            }
                        )}
                    </Space>
                )
            }
        },

    ];

    const handleCategoryChange = (key) => {
        navigate(`/admin/campaign/category?name=${key}`);
    };

    function editRecord(record, tableName) {
        const storeKey = 'editableRecord';
        valuesStore.setValue(storeKey, record);
        edit.setTblName(tableName);
        edit.setData(record);
        edit.setRecordKey(storeKey);
        edit.setShowModal(true);
        edit.setSaveCompleted(false);
    }



    function add(tableName = "campaigns") {
        addData.setTblName(tableName)
        addData.setShowModal(true)
    }


    async function addOnOk() {
        let res = await addData.save(`${Settings.baseUrl}v1/add`, { tbl: 'campaigns' })
        table.refreshData()
    }

    async function editOnOk() {
        const data = edit.record

        const res = await utils.requestWithReauth('put', `${Settings.baseUrl}v1/campaigns/${data?.id}`, null, {
            // table_name: 'campaigns',
            data

        })

        if (res?.status === "Ok") {
            utils.showNotification("Success", res?.msg, "text-green-500")
            edit.setShowModal(false)
            edit.resetCompletely()
            table.refreshData()

        }
        // console.log(res, data)

    }


    async function getCampaignCategories() {
        try {
            const res = await utils.requestWithReauth("get", `${Settings.baseUrl}v1.0/campaign_categories`, null, {})

            if (res?.status === "Ok") {
                const data = res?.data
                setCampaignSegment(data)
            } else {
                utils.showNotification("Error", res?.msg, "text-red-500")
            }

        } catch (error) {
            utils.showNotification("Error", error, "text-red-500")
        }

    }


    useEffect(() => {
        table.setColumns(columns)
        table.refreshData()
        getCampaignCategories()
    }, [table.extraParams])


    return (
        <>

            <div className='grid grid-cols-4 mb-3 gap-3'>
                {campaignSegment.map((segment) => (
                    <Card key={segment?.id} className='colspan-1' onClick={() => handleCategoryChange(segment?.name)}>
                        {segment?.name}
                    </Card>
                ))}

                {/* <Card className='colspan-1'>
                    Community and Event
                </Card>
                <Card className='colspan-1'>
                    Engagement AND pARTERNERSHIPS
                </Card>
                <Card className='colspan-1'>aLL cAMPAIGNS</Card> */}

            </div>

            <Card title="All Campaigns" extra={
                <>


                    <Space>
                        <Button type="primary" onClick={() => add()}>Add New Campaign</Button>
                        <Dropdown menu={{ items }} trigger={['click']}>
                            <Tooltip title="Export Data">
                                <Button icon={<ExportOutlined />} onClick={(e) => e.preventDefault()} />
                            </Tooltip>
                        </Dropdown>

                    </Space>
                </>
            }>


                {table.table}
            </Card >

            {addData.addModal("Add New Campaign", addOnOk)}
            {edit.editModal("Edit Campaign", editOnOk)}
            {campaignInfoDrawer.drawerJSX(null, null)}
        </>
    )
}

export default Campaigns