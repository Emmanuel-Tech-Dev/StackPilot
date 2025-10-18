import { Badge, Calendar, Card, Progress, Tag, Tooltip } from 'antd'
import React from 'react'
import utils from '../../../dependencies/helpers/utilities'
import { BulbOutlined, CalendarOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'

const Overview = ({ record = {} }) => {
    console.log(record)

    const remainingAmount = record?.fundraising_goal - record?.amount_raised || 0

    const start = dayjs(record?.start_date);
    const end = dayjs(record?.end_date);

    // Customize full cell rendering
    const fullCellRender = (value) => {
        const isStart = value.isSame(start, "day");
        const isEnd = value.isSame(end, "day");
        const inRange = value.isAfter(start, "day") && value.isBefore(end, "day");

        const style = {
            position: "relative",
            zIndex: 2,
            width: 24,
            height: 24,
            margin: "0 auto",
            borderRadius: isStart || isEnd ? "50%" : 4,
            border: isStart
                ? "2px solid #52c41a"
                : isEnd
                    ? "2px solid #ff4d4f"
                    : "none",
            backgroundColor: inRange ? "#e6f7ff" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isStart ? "#52c41a" : isEnd ? "#ff4d4f" : "#000",
            fontWeight: isStart || isEnd || inRange ? 600 : "normal",
        };

        if (isStart || isEnd || inRange) {
            return (
                <Tooltip
                    title={
                        isStart
                            ? `Campaign "${record?.campaign_name}" starts`
                            : isEnd
                                ? `Campaign "${record?.campaign_name}" ends`
                                : record?.name
                    }
                >
                    <div className="ant-picker-cell-inner" style={style}>
                        {value.date()}
                    </div>
                </Tooltip>
            );
        }

        return (
            <div className="ant-picker-cell-inner">
                {value.date()}
            </div>
        );
    }


    const mockData = {
        notes: "This campaign aims to support local community development initiatives. We will be focusing on educational programs for underprivileged children and providing necessary resources to schools in rural areas.\n\nKey considerations:\n- Budget allocation must be reviewed quarterly\n- Monthly progress reports required\n- Stakeholder meetings scheduled for the 15th of each month\n\nSpecial attention needed for donor engagement and volunteer coordination.",
        objectives: [
            "Raise $50,000 to fund educational programs in 10 rural schools",
            "Recruit and train 100+ volunteer tutors by the end of Q2",
            "Provide learning materials and technology resources to 500+ students",
            "Establish partnerships with at least 5 local businesses for sustained support",
            "Achieve 80% satisfaction rate from beneficiaries and stakeholders"
        ]
    };

    // Use mock data if record is empty or doesn't have the fields
    const displayData = {
        notes: record?.notes || mockData.notes,
        objectives: record?.objectives || mockData.objectives
    };

    // Parse objectives if it's a string, otherwise use as array
    const objectives = typeof displayData.objectives === 'string'
        ? displayData.objectives.split('\n').filter(obj => obj.trim())
        : displayData.objectives || [];

    return (
        <>
            <div className='space-y-3 mb-3'>
                <div className='flex items-start justify-between'>
                    <div><h1 className='font-semibold text-lg '>Performance Overview
                        <Badge className='ml-3' color={record?.status == "Active" ? "green" : "red"} />
                    </h1>
                        <p>{record?.description}</p></div>

                    <Tag
                        color={record?.status == "Active" ? "green" : "red"}
                    >{record?.status}</Tag>
                </div>

                <div className='grid grid-cols-3 gap-3'>
                    <Card className='col-span-1 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100'>
                        <div className='text-center'>
                            <h1 className='font-semibold text-2xl text-green-500'>{utils.currencyConvertor(record?.fundraising_goal)}</h1>
                            <span className='text-green-300 font-medium'>Target</span>
                        </div>
                    </Card>
                    <Card className='col-span-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'>
                        <div className='text-center'>
                            <h1 className='font-semibold text-2xl text-blue-500'>{utils.currencyConvertor(record?.amount_raised)}</h1>
                            <span className='text-blue-300 font-medium'>Amount Raised</span>
                        </div>
                    </Card>
                    <Card className='col-span-1 bg-gradient-to-r from-red-50 to-rose-50 border border-red-100 bg-'>
                        <div className='text-center'>
                            <h1 className='font-semibold text-2xl text-red-500'>{utils.currencyConvertor(remainingAmount)}</h1>
                            <span className='text-red-300 font-medium'>Remaining Amount</span>
                        </div>
                    </Card>
                </div>
                <div >

                    <h1 className='font-semibold text-xs'>Goal Percentage Achieved</h1>

                    <Progress
                        percent={record?.goal_achieved_percentage || 0}
                        className='col-span-1'
                        strokeColor={{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                        }}
                        format={percent => `${percent}%`}
                    />
                </div>




            </div>

            <div className='space-y-3'>
                <div>
                    <h1 className='font-semibold text-lg '>Campaign Duration</h1>
                </div>

                <div className='grid grid-cols-3 gap-3'>
                    <div className='col-span-2'>
                        <div className='grid grid-cols-4 gap-3'>
                            <Card className='col-span-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100'>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            <CalendarOutlined className="text-blue-500 mr-2 text-lg" />
                                            <span className="text-gray-700 font-medium">Date Duration</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">From:</span> {utils.formatDateV3(record?.start_date)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">To:</span> {utils.formatDateV3(record?.end_date)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Actual End Date:</span> {utils.formatDateV3(record?.actual_end_date || record?.end_date)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {utils.getDaysFromRawDate(record?.start_date, record?.end_date)}
                                        </div>
                                        <div className="text-sm text-gray-500">Days</div>
                                    </div>
                                </div>
                            </Card>
                            <Card title={
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <FileTextOutlined className="text-blue-600 text-lg" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-800">Campaign Notes</h3>
                                </div>
                            } size="small" className='col-span-2'>
                                <div className="p-2 bg-gray-50 rounded-lg">
                                    <div className="min-h-[120px]">
                                        {displayData.notes ? (
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                    {displayData.notes}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-[120px]">
                                                <p className="text-gray-400 text-sm italic">No notes available</p>
                                            </div>
                                        )}
                                    </div>

                                    {displayData.notes && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-400">
                                                {displayData.notes.length} characters
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                            <Card title={
                                <div className="flex items-center justify-between ">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                            <BulbOutlined className="text-green-600 text-lg" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800">Campaign Objectives</h3>
                                    </div>
                                    {objectives.length > 0 && (
                                        <Tag color="green" className="m-0">
                                            {objectives.length} {objectives.length === 1 ? 'Goal' : 'Goals'}
                                        </Tag>
                                    )}
                                </div>
                            } size="small" className='col-span-2'>
                                <div className=" bg-gray-50 rounded-lg">
                                    <div className="min-h-[120px]">
                                        {objectives.length > 0 ? (
                                            <div className="space-y-2">
                                                {objectives.map((objective, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <CheckCircleOutlined className="text-green-500 mt-0.5 flex-shrink-0" />
                                                        <p className="text-sm text-gray-600 leading-relaxed flex-1">
                                                            {objective}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-[120px]">
                                                <p className="text-gray-400 text-sm italic">No objectives defined</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>

                    </div>

                    <div className='col-span-1'>
                        <Card title="Campaign Reminder" size="small">
                            <Calendar fullscreen={false} fullCellRender={fullCellRender} />
                        </Card>
                    </div>

                </div>
            </div>


        </>
    )
}

export default Overview