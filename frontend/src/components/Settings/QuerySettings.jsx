import { Button, Card, Tabs } from 'antd'
import { useEffect, useState } from 'react'
import utils from '../../dependencies/helpers/utilities'
import SettingsForm from './SettingsForm'
import { useRequest } from 'ahooks';
import Settings from '../../dependencies/helpers/settings';
import Loader from '../Loader';



const data = [
    {
        "id": 1,
        "key": "maxLimit",
        "value": 1000,
        "category": "pagination",
        "description": "Maximum number of records per request",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 2,
        "key": "defaultLimit",
        "value": 10,
        "category": "pagination",
        "description": "Default number of records per request",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 3,
        "key": "maxJoins",
        "value": 3,
        "category": "query",
        "description": "Maximum allowed joins in a query",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 4,
        "key": "maxFilterComplexity",
        "value": 10,
        "category": "query",
        "description": "Maximum number of filter conditions",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 5,
        "key": "enableCache",
        "value": false,
        "category": "performance",
        "description": "Toggle caching of query results",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 6,
        "key": "queryTimeout",
        "value": 30000,
        "category": "performance",
        "description": "Query execution timeout in milliseconds",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 7,
        "key": "enableFullTextSearch",
        "value": false,
        "category": "search",
        "description": "Enable full-text search feature",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 8,
        "key": "enableQueryLogging",
        "value": false,
        "category": "debug",
        "description": "Enable logging of all queries",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 9,
        "key": "cacheTTL",
        "value": 300,
        "category": "performance",
        "description": "Time in seconds before cache expires",
        "createdAt": "2025-06-16T19:01:09",
        "updatedAt": "2025-06-16T19:01:09"
    },
    {
        "id": 10,
        "key": "executionTimeThreshold",
        "value": 1000,
        "category": "performance",
        "description": "Threshold to check for the query execution time",
        "createdAt": "2025-06-17T08:31:55",
        "updatedAt": "2025-06-17T08:31:55"
    }
]

const QuerySettings = () => {
    const [isRefresh, setIsRefresh] = useState(false)
    const { data, loading, error } = useRequest(async () => {
        const res = await utils.requestWithReauth('get', `${Settings.baseUrl}v1/apisettings`, null, { table: "api_settings" });
        // console.log(res)
        const groupedData = utils.groupBy(res?.data, "category");
        console.log(groupedData)
        return groupedData

    }, {
        refreshDeps: [isRefresh],
    })
    // const [groupedData, setGroupedData] = useState({})

    const header = {
        header: {
            // backgroundColor: "#00897b",
            borderBottom: "none",
            height: "15px",
            // color: "#fff",
        },
    }


    if (error) {
        return utils.showNotification("error", error.message)
    }






    // useEffect(() => {
    //     setApiForms(data)
    // }, [])


    return (
        <div>
            <div className='flex gap-2 justify-between items-start'>
                <div className='flex-[3]'>

                    <Card title="Query Options" styles={header} extra={<Button onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="fas fa-sync"></i>
                    </Button>}>
                        {loading && <Loader />}

                        <Tabs
                            tabPosition="top"
                            type="line"
                            items={Object.entries(data || {})?.map(([category, data]) => ({
                                key: category,
                                label: category.charAt(0).toUpperCase() + category.slice(1),
                                children: (
                                    <div className="col-md-12 custom-table p-0">
                                        <SettingsForm
                                            formTitle={category}
                                            data={data}
                                            editValue={(value) => {
                                                console.log(value);
                                            }}
                                            showCheckBox={false}
                                        />
                                    </div>
                                )
                            }))}
                        />
                    </Card>

                </div>
                <Card
                    title="Help"
                    styles={header}
                    className='bg-gray-50 flex-[2.5]'>

                    <div>

                    </div>

                </Card>
            </div>
        </div>
    )
}

export default QuerySettings