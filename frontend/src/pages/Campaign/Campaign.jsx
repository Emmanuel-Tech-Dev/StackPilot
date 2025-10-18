import React, { useEffect } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { Button, Card, DatePicker, Progress, Space, Tabs, Tag } from 'antd';
import useTable from '../../hooks/useTable';
import utils from '../../dependencies/helpers/utilities';
import useAdd from '../../hooks/useAdd';
import useEdit from '../../hooks/useEdit';
import useDelete from '../../hooks/useDelete';
import Settings from '../../dependencies/helpers/settings';
import ValuesStore from '../../store/values-store';
import { DeleteFilled, EditFilled, EyeFilled } from '@ant-design/icons';
import useDrawer from '../../hooks/useDrawer';
import CampaignInfo from '../../components/Campaign';
import Overview from '../../components/campaign/Overview';
import Campaigns from '../../components/campaign/Campaigns';
import { useLocation, useNavigate } from 'react-router-dom';
const Campaign = () => {

    const navigate = useNavigate();
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const activeKey = params.get("tab") || "overview";
    const category = params.get("category") || "All"


    const handleTabChange = (key) => {
        navigate(`/admin/campaign?tab=${key}`);
    };


    const handleCategoryChange = (key) => {
        navigate(`/admin/campaign?category=${key}`);
    };




    return (
        <>

            <PageHeader
                header={"Campaigns"}
            // items={[
            //     { title: <a href="/admin">Home</a> },

            //     { title: <h1 className="font-semibold">Campaign Overview</h1> }
            // ]}
            />

            <Tabs
                activeKey={activeKey}
                // type='card'
                onChange={handleTabChange}
                items={[
                    {
                        key: 'overview',
                        label: `Overview`,
                        children: <div className=''>
                            {<Overview />}
                        </div>,
                    },
                    {
                        key: 'campaigns',
                        label: `Campaigns`,
                        children: <div className=''>
                            {<Campaigns />}
                        </div>,
                    },

                ]}
            />


            {/* <Card title="Campaigns">
                <div className=''>
                    {table.table}
                </div>


            </Card> */}

        </>
    )
}

export default Campaign