import React from 'react'
import { PageHeader } from '../../components/PageHeader'
import Jumbotron from '../../components/Jumbotron'
import { Button } from 'antd'
import { EditOutlined, FileTextOutlined, UserAddOutlined } from '@ant-design/icons'

const CampaignInfo = () => {
    return (
        <>
            <PageHeader
                header={"Campaigns"}
                items={[
                    { title: <a href="/admin/campaign">Campaign</a> },

                    { title: <h1 className="font-semibold">Name of the Campaign</h1> }
                ]}
            />

            <Jumbotron data={{}} children={
                <>
                    <Button
                        icon={<EditOutlined />}
                        type="default"
                    >
                        Edit
                    </Button>
                    <Button
                        icon={<UserAddOutlined />}
                        type="default"
                    >
                        Assign
                    </Button>
                    <Button
                        icon={<FileTextOutlined />}
                        type="primary"
                    >
                        Generate Report
                    </Button>
                </>
            } />


        </>
    )
}

export default CampaignInfo