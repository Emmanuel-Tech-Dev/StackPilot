import React, { useEffect, useMemo } from 'react'
import useTable from '@/hooks/useTable'
import useAdd from '@/hooks/useAdd';
import { Button, Card, Space, Tag } from 'antd';
import useDrawer from '../../hooks/useDrawer';
import utils from '../../dependencies/helpers/utilities';
import Settings from '../../dependencies/helpers/settings';
import useDelete from '../../hooks/useDelete';


const Roles = () => {

    // const handleToggle = () => {
    //     ThemeConfig.toggleTheme();
    //     ThemeConfig.notifyThemeChange();
    //     ThemeConfig.getCurrentTheme(true)
    // }
    const table = useTable({ pagination: { current: 1, pageSize: 10 } }, "v1/admin_roles", null);
    const addData = useAdd("tables_metadata", 'table_name')
    const deleteRole = useDelete()
    const profileDrawer = useDrawer()

    const columns = useMemo(() => [
        {
            title: 'Role',
            dataIndex: 'role_name',
            key: 'role_name',
            ...table.getColumnSearchProps("name"),
            // sorter: true,
            // filterSearch: true
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',

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

                        {deleteRole.confirm(
                            `${Settings.baseUrl}v1/delete`,
                            record,
                            'Are you sure to delete this item',
                            { tableName: 'admin_roles' },
                            <Button size='small' danger icon={<i className="fas fa-trash text-[12px] text-red-600"></i>} variant='filled' />
                            , null, null, null, async () => {
                                await table.refreshData()
                            }
                        )}
                    </Space>
                )
            }
        }
    ], []);




    function add(tableName = "admin_roles") {
        addData.setTblName(tableName)
        addData.setShowModal(true)
    }


    async function addOnOk() {
        let res = await addData.save(`${Settings.baseUrl}v1/add`, { tbl: 'admin_roles' })
        table.refreshData()
    }



    useEffect(() => {
        console.log('Initializing table...')
        table.setColumns(columns);
        // table.setColFilters("role_name", "v1/filter/admin_roles");
        table.setAllowSelection(true);
        table.fetchData()

    }, []);
    return (
        <>
            <div>

                <Card
                    title="Role Management"
                    extra={
                        <Space size="small">
                            <Button type='primary' onClick={() => add()}>Add New Role</Button>
                            <Button >Exports As Csv</Button>
                            <Button onClick={() => table.refreshData()} icon={<i className="fas fa-sync text-[12px]"></i>} />
                        </Space>
                    }
                >
                    {table.table}
                </Card>

            </div>
            {addData.addModal("Add New Role", addOnOk)}
            {profileDrawer.drawerJSX()}
        </>


    )
}

export default Roles