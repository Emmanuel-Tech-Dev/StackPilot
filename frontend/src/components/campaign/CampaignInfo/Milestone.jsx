import { AppstoreOutlined, BarsOutlined, ClockCircleOutlined, DeleteFilled, EditFilled, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Segmented, Space, Tag, Timeline } from 'antd'
import React, { Children, useEffect, useState } from 'react'
import useTable from '../../../hooks/useTable';
import utils from '../../../dependencies/helpers/utilities';
import Settings from '../../../dependencies/helpers/settings';
import { get } from 'jquery';
import useAdd from '../../../hooks/useAdd';
import useEdit from '../../../hooks/useEdit';
import ValuesStore from "../../../store/values-store";
import useDelete from '../../../hooks/useDelete';
import CustomFunction from '../../../dependencies/custom_functions/customfunctions';


const Milestone = ({ campaignId = "", desc = "" }) => {
    const valuesStore = ValuesStore()
    const [segmentedValue, setSegmentedValue] = useState('timeline');
    const [timeline, setTimeline] = useState([])
    const add = useAdd("tables_metadata", 'table_name')
    const edit = useEdit("tables_metadata", 'table_name')
    const deleteData = useDelete()

    const table = useTable({
        pagination: {
            current: 1, pageSize: 10, showSizeChanger: true,
            showQuickJumper: true,
        }
    }, null, null)


    const column = [
        {
            title: 'Milestone',
            dataIndex: 'milestone_date',
            key: 'milestone_date',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-3">
                        <ClockCircleOutlined style={{ color: "#1890ff" }} />
                        <div>
                            <div className="font-medium text-gray-900">{record.milestone_name}</div>
                            <div className="text-sm text-gray-500">{utils.formatDateV3(record.milestone_date)}</div>
                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Target Amount',
            dataIndex: 'target_amount',
            key: 'target_amount',
            render: (text) => <span className="text-gray-600">{utils.currencyConvertor(text)}</span>
        },
        {
            title: 'Achieved Amount',
            dataIndex: 'achieved_amount',
            key: 'achieved_amount',
            render: (text) => <span className="text-gray-600">{utils.currencyConvertor(text)}</span>
        }, {
            title: 'Remaining Amount',
            dataIndex: 'remaining_amount',
            key: 'remaining_amount',
            render: (text, record) => {
                const remaining = record?.target_amount - record?.achieved_amount
                return (
                    <span className="text-gray-600">{utils.currencyConvertor(remaining)}</span>
                )
            }
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text) => <Tag color={text === 'Achieved' ? 'green' : text === 'Pending' ? 'orange' : 'red'}>{text}</Tag>
        }
        ,
        {
            title: 'Actual Achieved Date',
            dataIndex: 'actual_achieved_date',
            key: 'actual_achieved_date',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-3">
                        <ClockCircleOutlined style={{ color: "#1890ff" }} />
                        <div>
                            <div className="font-medium text-gray-900">{utils.formatDateV3(record.actual_achieved_date) || "-"}</div>
                        </div>
                    </div>
                )
            }
        }



    ]


    function editRecord(record, tableName) {
        const storeKey = 'editableRecord';
        valuesStore.setValue(storeKey, record);
        edit.setTblName(tableName);
        edit.setData(record);
        edit.setRecordKey(storeKey);
        edit.setShowModal(true);
        edit.setSaveCompleted(false);
    }


    function addModal(table_name = "campaign_milestone") {
        add.setTblName(table_name)
        add.setShowModal(true)

    }

    // async function getData() {
    //     try {
    //         // console.log(campaignId)

    //         const res = await utils.requestWithReauth('post', `${Settings.baseUrl}v1.0/campaign_milestone`, null, {
    //             campaign_id: campaignId
    //         })

    //         if (res?.status === "Ok") {
    //             const data = res?.data
    //             table.setData(data)
    //             setTimeline(data)
    //             console.log(data)
    //         } else {
    //             utils.showNotification("Error", res?.message, "text-red-500")
    //         }

    //     } catch (error) {
    //         utils.showNotification("Error", error?.message, "text-red-500")
    //     }
    // }





    async function addOnOk() {
        let res = await add.save(`${Settings.baseUrl}v1/add`, { tbl: 'campaign_milestone' })
        table.refreshData()
    }

    async function editOnOk() {
        const data = edit.record

        const res = await utils.requestWithReauth('put', `${Settings.baseUrl}v1/campaign_milestone/${data?.id}`, null, {
            // table_name: 'campaigns',
            data

        })

        if (res?.status === "Ok") {
            utils.showNotification("Success", res?.msg, "text-green-500")
            edit.setShowModal(false)
            edit.resetCompletely()
            const res = await CustomFunction.getData({ campaign_id: campaignId }, 'campaign_milestones')
            setTimeline(res)
            table.setData(res)

        }
        // console.log(res, data)

    }

    async function trigerDataFetch() {
        const res = await CustomFunction.getData({ campaign_id: campaignId }, 'campaign_milestones')
        setTimeline(res)
        table.setData(res)
    }

    useEffect(() => {
        if (!campaignId) return
        table.setColumns(column)
        trigerDataFetch()

    }, [campaignId])

    useEffect(() => {


    }, [])



    const DataTimeline = () => {
        return (
            <div>
                <Timeline
                    mode="alternate"
                    items={
                        timeline?.map((item) => ({
                            // Change color logic to include orange for pending
                            color: item.status === 'Achieved' ? 'green' : item.status === 'Pending' ? 'orange' : 'red',
                            dot: <ClockCircleOutlined style={{ fontSize: '16px' }} />,
                            children: (
                                <Card key={item?.id} className="">
                                    <div className="flex flex-col gap-2">
                                        <div className='flex items-center justify-between  bg-slate-100 p-2 rounded'>
                                            <h4 className="font-medium text-gray-900">{item.milestone_name}</h4>
                                            <Space>
                                                <EditFilled className='text-green-500 cursor-pointer' onClick={() => editRecord(item, "campaign_milestones")} />
                                                {deleteData.confirm(
                                                    `${Settings.baseUrl}v1/delete`,
                                                    item,
                                                    'Are you sure to delete this item',
                                                    { tableName: 'campaign_milestones' },
                                                    <DeleteFilled className='text-red-500' />
                                                    , null, null, null, async () => {
                                                        await trigerDataFetch()
                                                    }
                                                )}
                                            </Space>
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            <p><strong className='text-xs'>Target Date: </strong>{utils.formatDateV3(item.milestone_date)}</p>
                                            <p> <strong className='text-xs'>Target Amount: </strong>{utils.currencyConvertor(item.target_amount)}</p>
                                            <p><strong className='text-xs'>Achieved:</strong> {utils.currencyConvertor(item.achieved_amount)}</p>
                                            {item.actual_achieved_date && (
                                                <p><strong>Achieved Date:</strong> {utils.formatDateV3(item.actual_achieved_date)}</p>
                                            )}
                                        </div>
                                        {/* Update Tag color logic to match timeline */}
                                        <Tag color={item.status === 'Achieved' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'}>
                                            {item.status}
                                        </Tag>
                                    </div>
                                </Card>
                            )
                        }))
                    }
                />
            </div>
        )
    }


    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='mb-3'>
                    <h1 className='text-xl font-semibold'>Campaign Milestone</h1>
                    <p>{desc}</p>
                </div>
                <Space size={"small"}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            addModal("campaign_milestone")
                        }}
                    >Add Milestone</Button>

                    <Segmented
                        vertical
                        defaultValue={segmentedValue}
                        // value='timeline'
                        options={[
                            { value: 'timeline', icon: <BarsOutlined /> },
                            { value: 'table', icon: <AppstoreOutlined /> },
                        ]}
                        onChange={async (value) => {
                            setSegmentedValue(value)
                            await trigerDataFetch()
                        }}
                    />
                </Space>

            </div>


            <div className='mt-2'>
                {segmentedValue === 'timeline' &&
                    <div className='max-w-[700px]  mx-auto p-3'>
                        <DataTimeline />
                    </div>
                }
                {segmentedValue === 'table' &&
                    <div>
                        {table.table}
                    </div>

                }
            </div>

            {add.addModal("Campaign Milestone")}
            {edit.editModal("Campaign Milestone")}
        </div>
    )
}

export default Milestone