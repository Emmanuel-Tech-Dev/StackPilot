import React, { useEffect } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Alert, Button, Card, Space, Tag } from 'antd'
import useTable from '../hooks/useTable';
import utils from '../dependencies/helpers/utilities';
import Settings from '../dependencies/helpers/settings';
import useEdit from '../hooks/useEdit';
import useAdd from '../hooks/useAdd';
import useDelete from '../hooks/useDelete';
import ValuesStore from '../store/values-store';

const Department = () => {

    const valuesStore = ValuesStore();
    const table = useTable({ pagination: { current: 1, pageSize: 10 } }, "v1/departments", null);
    const edit = useEdit("tables_metadata", "table_name")
    const addData = useAdd("tables_metadata", 'table_name')
    const deleteData = useDelete()

    const columns = [
        {
            title: 'Department Name',
            dataIndex: 'department_name',
            key: 'department_name',
            ...table.getColumnSearchProps("department_name"),
        },
        {
            title: 'Department Code',
            dataIndex: 'department_code',
            key: 'department_code',
            ...table.getColumnSearchProps("department_code"),
        },
        {
            title: "Budget Allocated",
            dataIndex: "budget_allocated",
            key: "budget_allocated",
            render: (text, record) => utils.currencyConvertor(text)
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (text, record) => {
                return (
                    <Tag color={record.status === 'Active' ? 'green' : 'red'}>{record.status}</Tag>
                )
            }
        }, {
            title: "Date Created",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date, record) => utils.formatDateV3(date)
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
                            onClick={() => editRecord(record, 'departments')}
                        />

                        {deleteData.confirm(
                            `${Settings.baseUrl}v1/delete`,
                            record,
                            'Are you sure to delete this item',
                            { tableName: 'departments' },
                            <Button size='small' danger icon={<i className="fas fa-trash text-[12px] text-red-600"></i>} variant='filled' />
                            , null, null, null, async () => {
                                table.refreshData()
                            }
                        )}
                    </Space>
                )
            }
        }



    ]

    function editRecord(record, tableName) {
        const storeKey = 'editableRecord';
        valuesStore.setValue(storeKey, record);
        edit.setTblName(tableName);
        edit.setData(record);
        edit.setRecordKey(storeKey);
        edit.setShowModal(true);
        edit.setSaveCompleted(false);
    }



    function add(tableName = "departments") {
        addData.setTblName(tableName)
        addData.setShowModal(true)
    }


    async function addOnOk() {
        let res = await addData.save(`${Settings.baseUrl}v1/add`, { tbl: 'departments' })
        table.refreshData()
    }

    async function editOnOk() {
        const data = edit.record

        const res = await utils.requestWithReauth('put', `${Settings.baseUrl}v1/departments/${data?.id}`, null, {
            // table_name: 'departments',
            data

        })

        if (res?.status === "Ok") {
            utils.showNotification("Success", res?.msg, "text-green-500")
            edit.setShowModal(false)
            edit.resetCompletely()
            table.refreshData()

        }
        // console.log(res, data)

    }



    useEffect(() => {
        console.log('Initializing table...')
        table.setColumns(columns);
        // table.setColFilters("role_name", "v1/filter/departments");
        table.setAllowSelection(true);
        table.fetchData()

    }, []);


    return (

        <>
            <PageHeader
                header={"Departmemts"}
                items={[
                    { title: <a href="/admin/">Home</a> },

                    { title: <h1 className="font-semibold">Department</h1> }
                ]}
                children={
                    <>
                        <Button onClick={
                            () => add()
                        } type='primary'>Add New Department</Button>
                        <Alert message="Drawer to show full department details - pending developement" type="info" />
                    </>
                }
            />


            <Card title="List of Departments">
                {table.table}
            </Card>

            {addData.addModal("Add New Department", addOnOk)}
            {edit.editModal("Edit Department", editOnOk)}
        </>
    )
}

export default Department