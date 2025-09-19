import React, { useEffect, useMemo } from 'react'
import useTable from '@/hooks/useTable'
import useAdd from '@/hooks/useAdd';
import { Button, Card, Space, Tag } from 'antd';
import useDrawer from '../../hooks/useDrawer';
import Settings from '../../dependencies/helpers/settings';
import useDelete from '../../hooks/useDelete';


const Resources = () => {


    const table = useTable({ pagination: { current: 1, pageSize: 10 } }, "v1/admin_resources", null);
    const addData = useAdd("tables_metadata", 'table_name')
    const deleteData = useDelete()
    const profileDrawer = useDrawer()

    const columns = useMemo(() => [
        {
            title: 'Resource',
            dataIndex: 'resource_name',
            key: 'resource_name',
            ...table.getColumnSearchProps("resource_name"),
            // sorter: true,
            // filterSearch: true
        },
        {
            title: 'Type',
            dataIndex: 'resource_type',
            key: 'resource_type',
            filterSearch: true

        },
        {
            title: 'Path',
            dataIndex: 'resource_path',
            key: 'resource_path',

        },
        {
            title: 'HTTP Method',
            dataIndex: 'http_method',
            key: 'http_method',
            filterSearch: true

        },
        {
            title: 'Public',
            dataIndex: 'is_public',
            key: 'is_public',
            sorter: true,
            render: (text, _) => text ? <Tag color='green'>Yes</Tag> : <Tag color='red'>No</Tag>
        }, {
            title: 'Sub Menu',
            dataIndex: 'has_dropdown',
            key: 'has_dropdown',
            sorter: true,
            render: (text, _) => text ? <Tag color='green'>Yes</Tag> : <Tag color='red'>No</Tag>
        }, {
            title: 'Icon',
            dataIndex: 'icon',
            key: 'icon',
            sorter: true,
            render: (text, _) => text ? <i className={`${text}`}></i> : "-"
        },
        {
            title: "Action",
            dataIndex: 'action',
            key: 'action',
            render: (text, record) => {
                return (
                    <Space>
                        <Button type='default'
                            size='small'
                            // className='border-blue-400'
                            variant='filled'
                            icon={<i className="fas fa-edit text-[12px] text-blue-500"></i>}
                            onClick={() => {
                                profileDrawer.setOpen(true)
                                profileDrawer.setPlacement("right")
                                profileDrawer.setWidth(500)
                            }}
                        />
                        {deleteData.confirm(
                            `${Settings.baseUrl}v1/delete`,
                            record,
                            'Are you sure to delete this item',
                            { tableName: 'admin_resources' },
                            <Button size='small' danger icon={<i className="fas fa-trash text-[12px] text-red-600"></i>} variant='filled' />
                            , null, null, null, async () => {
                                await table.refreshData()
                            }
                        )}        </Space>
                )
            }
        }
    ], []);




    function add(tableName = "admin_resources") {
        addData.setTblName(tableName)
        addData.setShowModal(true)
    }
    async function addOnOk() {
        let res = await addData.save(`${Settings.baseUrl}v1/add`, { tbl: 'admin_resources' })
        table.refreshData()
    }



    useEffect(() => {
        console.log('Initializing table...')
        table.setColumns(columns);
        // table.setColFilters("resource_type", "v1/filter/admin_resources");
        table.setColFilters("http_method", "v1/filter/admin_resources");
        table.setAllowSelection(true);
    }, []);
    return (
        <>
            <div>

                <Card
                    title="Resource Management"
                    extra={
                        <Space size="small">
                            <Button type='primary'
                                onClick={() => add()}
                            >Add New Resource</Button>
                            <Button >Exports As Csv</Button>
                            <Button onClick={() => table.refreshData()} icon={<i className="fas fa-sync text-[12px]"></i>} />
                        </Space>
                    }
                >
                    {table.table}
                </Card>

            </div>
            {addData.addModal("Add New Resource", addOnOk)}
            {profileDrawer.drawerJSX()}

        </>


    )
}

export default Resources