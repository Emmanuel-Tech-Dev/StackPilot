import { DatabaseOutlined, DeleteFilled, DollarOutlined, EditFilled, ProjectOutlined, TeamOutlined } from '@ant-design/icons';
import React, { useEffect } from 'react'
import StatCard from '../Statistics';
import { Card, Col, Descriptions, Progress, Row, Space, Tag } from 'antd';
import ValuesStore from "../../store/values-store"
import useTable from '../../hooks/useTable';
import useAdd from '../../hooks/useAdd';
import useEdit from '../../hooks/useEdit';
import useDelete from '../../hooks/useDelete';
import utils from '../../dependencies/helpers/utilities';
import Settings from '../../dependencies/helpers/settings';


const STATS_DATA = [
    {
        title: 'Total Campaigns',
        value: 90,
        subtitle: `50 Active • 35 Completed • 5 Planned`,
        icon: ProjectOutlined,

    },
    {
        title: 'Active Tasks',
        value: 156,
        subtitle: '89% Completion Rate',
        icon: DatabaseOutlined,
    },
    {
        title: 'Total Budget',
        value: 89989,
        subtitle: 'GHS1.8M Allocated • GHS700K Spent',
        icon: DollarOutlined,
        prefix: 'GHS ',
    },
    {
        title: 'Funds Raised',
        value: 8989,
        subtitle: 'GHS1.8M Allocated • GHS700K Spent',
        icon: DollarOutlined,
        prefix: 'GHS ',
    },

];

const Overview = () => {

    const valuesStore = ValuesStore();
    const table = useTable({ pagination: { current: 1, pageSize: 5 } }, "v1/campaigns", null);
    const addData = useAdd("tables_metadata", 'table_name')
    const edit = useEdit("tables_metadata", 'table_name')
    const deleteData = useDelete()





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


        // {
        //     title: 'Amount Raised',
        //     dataIndex: 'amount_raised',
        //     key: 'amount_raised',

        // },
        // {
        //     title: 'Goal Achieved %',
        //     dataIndex: 'goal_achieved_percentage',
        //     key: 'goal_achieved_percentage',
        //     render: (_, record) => (
        //         <Progress
        //             percent={record.goal_achieved_percentage || 0}
        //             status="active"
        //             size="small"
        //         />
        //     ),

        // },
        {
            title: 'Target Audience',
            dataIndex: 'target_audience',
            key: 'target_audience',
            ellipsis: true,
            render: (text) => text || '-',
        },
        // {
        //     title: 'Promotion Channels',
        //     dataIndex: 'promotion_channels',
        //     key: 'promotion_channels',
        //     render: (channels) => channels ? JSON.stringify(channels).slice(0, 50) + '...' : '-',
        //     ellipsis: true,
        // },


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
        // {
        //     title: 'Is Public',
        //     dataIndex: 'is_public',
        //     key: 'is_public',
        //     render: (isPublic) => isPublic ? 'Yes' : 'No',
        //     sorter: (a, b) => a.is_public - b.is_public,
        //     filters: [
        //         { text: 'Yes', value: 1 },
        //         { text: 'No', value: 0 },
        //     ],
        //     onFilter: (value, record) => record.is_public === value,
        // },

        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => utils.formatDateV3(date),

        },

        // {
        //     title: "Action",
        //     dataIndex: 'action',
        //     fixed: "right",
        //     key: 'action',
        //     render: (text, record) => {
        //         return (
        //             <Space size={"middle"}>
        //                 <EditFilled
        //                     className='text-blue-500'
        //                     onClick={() => editRecord(record, 'campaigns')}
        //                 />
        //                 {/* <EyeFilled className='text-green-500' onClick={() => {
        //                     campaignInfoDrawer.setOpen(true)
        //                     campaignInfoDrawer.setPlacement('right')
        //                     campaignInfoDrawer.setWidth(700)
        //                     campaignInfoDrawer.setTitle(record.campaign_name)
        //                     campaignInfoDrawer.setContent(
        //                         <CampaignInfo record={record} />
        //                     )
        //                 }
        //                 } /> */}

        //                 {deleteData.confirm(
        //                     `${Settings.baseUrl}v1/delete`,
        //                     record,
        //                     'Are you sure to delete this item',
        //                     { tableName: 'campaigns' },
        //                     <DeleteFilled className='text-red-500' />
        //                     , null, null, null, async () => {
        //                         table.refreshData()
        //                     }
        //                 )}
        //             </Space>
        //         )
        //     }
        // },

    ];

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



    useEffect(() => {
        table.setColumns(columns)

        table.fetchData()

    }, [])

    useEffect(() => {
        table.setExpandedRowKeys([]);
        console.log(table.expandableRecord, table.expandedRowKeys)
        table.setExpandableContent(
            <>
                <Descriptions bordered size="small" title="More Details">
                    <Descriptions.Item label="Type">
                        {table.expandableRecord?.campaign_name}
                    </Descriptions.Item>
                </Descriptions>
            </>
        );
    }, [table.expandableRecord]);





    return (
        <>

            <Row gutter={[16, 16]} className="mb-6">
                {STATS_DATA.map((stat, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <StatCard stat={stat} index={idx} loading={false} />
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]}>
                {/* Bar Chart - Budget vs Actual */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className=" font-bold text-gray-800">📊 Budget vs Actual per Project</span>}
                        className="shadow-sm h-full"
                    >
                        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-400">Insert your Ant Design Bar Chart here</p>
                        </div>
                    </Card>
                </Col>

                {/* Line Chart - Progress Over Time */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold text-gray-800">📈 Project Progress Over Time</span>}
                        className="shadow-sm h-full"
                    >
                        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-400">Insert your Ant Design Line Chart here</p>
                        </div>
                    </Card>
                </Col>

                {/* Pie Chart - KPI Distribution */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className=" font-bold text-gray-800">🥧 KPI Distribution</span>}
                        className="shadow-sm h-full"
                    >
                        <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                            <p className="text-gray-400">Insert your Ant Design Pie Chart here</p>
                        </div>
                    </Card>
                </Col>

                {/* Recent Activity */}
                <Col xs={24} lg={12}>
                    <Card
                        title={<span className="font-bold text-gray-800">Recent Campaign</span>}
                        className="shadow-sm h-full"
                    >
                        {table.tableExpandable}
                    </Card>
                </Col>
            </Row>


            {addData.addModal("Add New Department", addOnOk)}
            {edit.editModal("Edit Department", editOnOk)}

        </>
    )
}

export default Overview