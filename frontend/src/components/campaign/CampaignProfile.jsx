import { Badge, Calendar, Card, Progress, Tabs, Tag, Tooltip } from 'antd'
import React, { useEffect, useState } from 'react'
import utils from '../../dependencies/helpers/utilities'
import { AppstoreFilled, BankFilled, BuildFilled, BulbOutlined, CalendarOutlined, CheckCircleOutlined, FileTextOutlined, HomeFilled, PictureFilled, ProfileFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import Overview from './CampaignInfo/Overview'
import Milestone from './CampaignInfo/Milestone'
import { PageHeader } from '../PageHeader'
import Parteners from './CampaignInfo/Parteners'
import PromotionChannels from './CampaignInfo/PromotionChannels'
import Donations from './CampaignInfo/Donations'
import MediaFiles from './CampaignInfo/MediaFiles'

const CampaignProfile = ({ record = {} }) => {
    const [activeTabKey, setActiveTabKey] = useState('1');



    useEffect(() => {
        setActiveTabKey('1')
    }, [activeTabKey])

    return (
        <>

            <PageHeader header={record?.campaign_name} />

            <Tabs
                defaultActiveKey={activeTabKey}
                onChange={(key) => setActiveTabKey(key)}
                items={[
                    {
                        key: '1',
                        label: `Overview`,
                        icon: <HomeFilled />,
                        children: <Overview record={record} />,
                    },
                    {
                        key: "milestones",
                        label: "Milestones",
                        icon: <BuildFilled />,
                        children: <Milestone campaignId={record.id} desc={record.description} />,
                    },
                    {
                        key: "Parteners",
                        label: "Partners",
                        icon: <ProfileFilled />,
                        children: <Parteners campaignId={record.id} />
                    }
                    , {
                        key: "Promotion",
                        label: "Promotion Channels",
                        children: <PromotionChannels />
                    },
                    {
                        key: "Donations",
                        label: "Donations",
                        icon: <BankFilled />,
                        children: <Donations />
                    },
                    {
                        key: "Media",
                        label: "Media",
                        icon: <PictureFilled />,
                        children: <MediaFiles campaignId={record?.id} />
                    }

                ]}
            />




        </>
    )
}

export default CampaignProfile