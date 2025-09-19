import React, { useEffect, useMemo } from 'react'
import useTable from '@/hooks/useTable'
import useAdd from '@/hooks/useAdd';
import { Button, Card, Space, Tag } from 'antd';
import useDrawer from '@/hooks/useDrawer';
import UserProfile from '@/components/UseManagement/UserProfile';


const UserManagement = () => {

    // const handleToggle = () => {
    //     ThemeConfig.toggleTheme();
    //     ThemeConfig.notifyThemeChange();
    //     ThemeConfig.getCurrentTheme(true)
    // }
    const table = useTable({ pagination: { current: 1, pageSize: 10 } }, "v2/admin", "custom_id");
    const addData = useAdd("tables_metadata", 'table_name')
    const profileDrawer = useDrawer()

    const columns = useMemo(() => [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...table.getColumnSearchProps("name"),
            // sorter: true,
            // filterSearch: true
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...table.getColumnSearchProps("email"),
            // sorter: true,
            // filterSearch: true
        },
        {
            title: 'Phone',
            dataIndex: 'phone_no',
            key: 'phone_no',
            ...table.getColumnSearchProps("phone_no"),
            // sorter: true,
            // filterSearch: true
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => record.status === 1 ? <Tag color='green'>Active</Tag> : <Tag color='red'>Inactive</Tag>,
            // sorter: true,
            // filterSearch: true
        },
        {
            title: "Avatar",
            dataIndex: 'avatar',
            key: 'avatar',
            // ...table.getColumnSearchProps("avatar"),
            // sorter: true,
            // filterSearch: true
        }
        ,
        {

            title: "OAuth Provider",
            dataIndex: 'oauth_provider',
            key: 'oauth_provider',
            ...table.getColumnSearchProps("oauth_provider"),
            // sorter: true,
            // filterSearch: true
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
            key: 'role_name',
            // ...table.getColumnSearchProps("role_name"),
            // sorter: true,
            filterSearch: true
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
                                profileDrawer.setWidth(800)
                                profileDrawer.setContent(
                                    <UserProfile record={record} />
                                )
                            }}
                        />
                        <Button size='small' danger icon={<i className="fas fa-trash text-[12px] text-red-600"></i>} variant='filled' />
                    </Space>
                )
            }
        }
    ], []);




    function add(tableName = "goals") {
        addData.setTblName(tableName)
        addData.setShowModal(true)
    }



    useEffect(() => {
        console.log('Initializing table...')
        table.setColumns(columns);
        table.setColFilters("role_name", "v1/filter/admin_roles");
        table.setAllowSelection(true);
    }, []);
    return (
        <>
            <div>

                <Card
                    title="User Management"
                    extra={
                        <Space size="small">
                            <Button type='primary'>Add New User</Button>
                            <Button >Exports As Csv</Button>
                            <Button onClick={() => table.refreshData()} icon={<i className="fas fa-sync text-[12px]"></i>} />
                        </Space>
                    }
                >
                    {table.table}
                </Card>

            </div>

            {profileDrawer.drawerJSX()}
        </>


    )
}

export default UserManagement