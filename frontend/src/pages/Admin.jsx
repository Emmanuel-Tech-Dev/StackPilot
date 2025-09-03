import React, { useEffect, useMemo } from 'react'
import useTable from '../hooks/useTable'
import useAdd from '../hooks/useAdd';
import { Button } from 'antd';
import ThemeConfig from '../dependencies/helpers/themeConfig';
import { Theme } from '@ant-design/cssinjs';

const Admin = () => {

    // const handleToggle = () => {
    //     ThemeConfig.toggleTheme();
    //     ThemeConfig.notifyThemeChange();
    //     ThemeConfig.getCurrentTheme(true)
    // }
    const table = useTable({ pagination: { current: 1, pageSize: 5 } }, "v1/goals");
    const addData = useAdd("tables_metadata", 'table_name')

    const columns = useMemo(() => [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...table.getColumnSearchProps("name"),
            // sorter: true,
            // filterSearch: true
        },
    ], []);


    function add(tableName = "goals") {
        addData.setTblName(tableName)
        addData.setShowModal(true)
    }



    useEffect(() => {
        console.log('Initializing table...')
        table.setColumns(columns);
        table.setColFilters("name", "v1/filter/goals");
        table.setAllowSelection(true);
    }, []);
    return (
        <div>
            {table.table}
            {/* {addData.form} */}
            <Button type='primary' onClick={() => add()}>Add Me</Button>
            {/* <Button onClick={handleToggle}>
                Toggle {ThemeConfig.isCurrentThemeDark() ? "Light" : "Dark"} Mode
            </Button> */}
            {addData.addModal("testing add", null)}
        </div>

    )
}

export default Admin