import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { Card, Tabs } from 'antd';
import utils from '../../dependencies/helpers/utilities';
import Settings from '../../dependencies/helpers/settings';

const Category = () => {

    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const category = params.get("name");
    const [data, setData] = useState([])

    // console.log(category)


    async function getCampaignCategoriesTypes() {
        try {
            const res = await utils.requestWithReauth("post", `${Settings.baseUrl}v1.0/get_categories_types`, null, {
                record: category
            })

            if (res?.status === "Ok") {
                const data = res?.data
                setData(data)
            } else {
                utils.showNotification("Error", res?.message, "text-red-500")
            }
        } catch (error) {
            utils.showNotification("Error", error.message, "text-red-500")

        }
    }

    console.log("Data form state", data)

    useEffect(() => {

        if (!category) return
        getCampaignCategoriesTypes()

    }, [category])


    return (
        <>

            <PageHeader
                header={category}
                items={[
                    { title: <a href="/admin/campaign?tab=campaigns">Campaign</a> },

                    { title: <h1 className="font-semibold">{category}</h1> }
                ]}
            />


            <Card className='mt-5'>
                <Tabs
                    // tabPosition='left'

                    defaultActiveKey='CrowdFunding'
                    items={Array.from({ length: 3 }).map((_, i) => {
                        const id = String(i + 1);
                        return {
                            label: `CrowdFunding`,
                            key: id,
                            children: `Content of Tab ${id}`,
                        };
                    })}
                />
            </Card>
        </>
    )
}

export default Category