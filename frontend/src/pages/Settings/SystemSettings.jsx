import React, { useState } from 'react'
import AudienceByLocation from '../../components/Chart'
import { Breadcrumb, Button, Card, Tabs } from 'antd'
import QuerySettings from '../../components/Settings/QuerySettings';

const SystemSettings = () => {

    const [activeTab, setActiveTab] = useState("query")

    const items = [
        {
            key: 'query',
            label: 'Query Parameters Settings',
            children: <QuerySettings />,
            icons: <i className='fas fa-cogs'></i>
        },
        {
            key: 'cache',
            label: 'Cache Settings',
            children: 'Content of Tab Pane 2',
        },

        {
            key: "cors",
            label: 'Cors Settings',
            children: 'Content of Tab Pane 1',
        }, {
            key: "app",
            label: 'Application Settings',
            children: 'Content of Tab Pane 1',
        },
    ];

    return (
        <div>
            <div className='mb-4 bg-white px-3 py-3 w-full rounded-lg flex items-center justify-between'>
                <Breadcrumb
                    items={[
                        {
                            title: <a href='#' >Settings</a>,
                        },
                        {
                            title: <h1 className='font-semibold'>Api Settings</h1>,
                        },


                    ]}
                />
                <Button className='' href='/admin/management/roles'>Manage Access</Button>
            </div>

            <Card
                title="Api Settings"
                styles={{
                    header: {
                        backgroundColor: "#fff",
                        borderBottom: "none",
                        fontWeight: "semibold",
                        height: "10px",
                        fontSize: "18px"
                        //color: "#fff",
                    },
                }}
            >
                <Tabs
                    type='card'
                    tabPosition={"left"}
                    defaultActiveKey={activeTab}
                    items={items}
                    onChange={(key) => setActiveTab(key)}
                />
            </Card>

            {/* <AudienceByLocation /> */}
        </div>
    )
}

export default SystemSettings