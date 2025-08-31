import { Button, Input, Space, Table } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import utils from "../dependencies/helpers/utilities";
import Settings from "../dependencies/helpers/settings";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import qs from "qs";

const useTable = (initTblParams = {}, endpoint = "v1/goals", rowKey = "id") => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectionType, setSelectionType] = useState("checkbox");
    const [allowSelection, setAllowSelection] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [currentSelectedRow, setCurrentSelectedRow] = useState({});
    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");
    const searchInput = useRef(null);

    // Initialize table parameters with proper defaults
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: false, // Ensure dropdown remains disabled
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            ...initTblParams?.pagination
        },
        filters: initTblParams?.filters || {},
        sorter: initTblParams?.sorter || {},
        ...initTblParams
    });



    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getQueryParams = useCallback((params) => {
        const queryParams = {
            page: params.pagination?.current || 1,  // Map to your backend format
            limit: params.pagination?.pageSize || 10,
        };


        if (params.filters) {
            Object.keys(params.filters).forEach(key => {
                if (params.filters[key]) {
                    // Handle array filters for dropdowns (e.g., name=[1, 2])
                    queryParams[key] = Array.isArray(params.filters[key])
                        ? params.filters[key].join(',') // Convert array to comma-separated string
                        : params.filters[key];
                }
            });
        }

        // Add sorting if it exists
        if (params.sorter && params.sorter.field) {
            queryParams.sortBy = params.sorter.field;
            queryParams.sortOrder = params.sorter.order === 'ascend' ? 'asc' : 'desc';
        }

        return queryParams;
    }, []);

    const rowSelectionConfig = useMemo(() => {
        if (!allowSelection) return;

        return {
            type: selectionType,
            selectedRowKeys,
            selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
                Table.SELECTION_NONE,
            ],
            onChange: (selRowKeys, selRows) => {
                setSelectedRowKeys(selRowKeys);
                setSelectedRows(selRows);
            },
            onSelect: (record, selected, selectedRows, nativeEvent) => {
                setCurrentSelectedRow({ record, selected, selectedRows, nativeEvent });
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log('Select all triggered:', { selected, selectedRows });
            },
        };
    }, [allowSelection, selectionType, selectedRowKeys]);

    const handleTableChange = useCallback((pagination, filters, sorter) => {
        setTableParams(prev => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                current: pagination.current, // Use correct Ant Design property
                pageSize: pagination.pageSize,
                showSizeChanger: false, // Ensure dropdown remains disabled
                showQuickJumper: false,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            },
            filters,
            sorter,
        }));
    }, []);

    const setColFilters = useCallback(async (dataIndex, url) => {
        try {
            const res = await utils.requestWithReauth('post', `${Settings.baseUrl}${url}`, undefined, { dataIndex });

            // Fix: Ensure each filter option has a unique key
            const filters = res?.data?.map((item, index) => ({
                text: item?.name,
                value: item?.name,
                key: item?.id || `${item?.name}-${index}` // Fallback to index if id is missing
            })) || [];

            setColumns((prevColumns) =>
                prevColumns.map((col) =>
                    col.dataIndex === dataIndex && col.filterSearch === true
                        ? {
                            ...col,
                            filters,
                            onFilter: (value, record) => record[dataIndex] === value,
                        }
                        : col
                )
            );
        } catch (error) {
            console.error('Error fetching column filters:', error);
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = getQueryParams(tableParams);
            const queryString = qs.stringify(queryParams);



            const res = await utils.requestWithReauth('get', `${Settings.baseUrl}${endpoint}?${queryString}`);

            setData(res?.data || []);

            // Map backend pagination to Ant Design format
            if (res?.meta?.pagination) {
                setTableParams(prev => ({
                    ...prev,
                    pagination: {
                        ...prev.pagination,
                        total: res?.meta?.pagination.totalItems || prev.pagination.total,
                        current: res?.meta?.pagination.currentPage || prev.pagination.current,
                        pageSize: res?.meta?.pagination.limit || prev.pagination.pageSize,
                        showSizeChanger: false, // Ensure dropdown remains disabled
                        showQuickJumper: false,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }
                }));
            } else {
                console.warn('Pagination data missing in response:', res);
            }

            setError('');
        } catch (error) {
            console.log('Fetch error:', error);
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [endpoint, tableParams, getQueryParams]);


    useEffect(() => {
        fetchData();
    }, [
        JSON.stringify(tableParams)
    ]);

    // Initial data fetch only
    // useEffect(() => {
    //     fetchData();
    // }, [endpoint]); // Only re-fetch if endpoint changes

    const refreshData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const getColumnSearchProps = useCallback((dataIndex) => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            close,
        }) => (
            <div
                style={{ padding: 8 }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: "block",
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => close()}
                    >
                        Close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? "#1890ff" : undefined,
                }}
            />
        ),
        onFilter: (value, record) => {
            return record[dataIndex]
                ?.toString()
                ?.toLowerCase()
                ?.includes(value.toLowerCase());
        },
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: "#ffc069",
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ""}
                />
            ) : (
                text
            ),
    }), [searchText, searchedColumn]);

    const table = useMemo(() => (
        <Table
            rowSelection={rowSelectionConfig}
            columns={columns}
            rowKey={(record) => record[rowKey] || record.id || record.key}
            dataSource={data}
            loading={loading}
            size="small"
            pagination={tableParams?.pagination}
            onChange={handleTableChange}
        />
    ), [rowSelectionConfig, columns, data, loading, tableParams.pagination, handleTableChange, rowKey]);

    const tableWithHeader = useCallback((header, extraProps = {}) => {
        return (
            <Table
                rowSelection={allowSelection ? rowSelectionConfig : undefined}
                columns={columns}
                rowKey={(record) => record[rowKey] || record.id || record.key || `${record.name}-${record.index}`}
                dataSource={data}
                loading={loading}
                size="small"
                title={() =>
                    typeof header === "function" ? (
                        header(data)
                    ) : (
                        <label className="fw-bold text-primary">
                            Total Count: {data?.length || 0}
                        </label>
                    )
                }
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                {...extraProps}
            />
        );
    }, [allowSelection, rowSelectionConfig, columns, data, loading, tableParams.pagination, handleTableChange, rowKey]);

    const tableWithFooter = useCallback((footer, extraProps = {}) => {
        return (
            <Table
                rowSelection={allowSelection ? rowSelectionConfig : undefined}
                columns={columns}
                rowKey={(record) => record[rowKey] || record.id || record.key}
                dataSource={data}
                loading={loading}
                size="small"
                footer={() =>
                    typeof footer === "function" ? (
                        footer(data)
                    ) : (
                        <label className="fw-bold text-primary">
                            Total Count: {data?.length || 0}
                        </label>
                    )
                }
                pagination={tableParams.pagination}
                onChange={handleTableChange}
                {...extraProps}
            />
        );
    }, [allowSelection, rowSelectionConfig, columns, data, loading, tableParams.pagination, handleTableChange, rowKey]);

    // Enable single selection
    const enableSingleSelection = useCallback(() => {
        setSelectionType("radio");
        setAllowSelection(true);
        setSelectedRowKeys([]);
        setSelectedRows([]);
    }, []);

    // Enable multiple selection
    const enableMultipleSelection = useCallback(() => {
        setSelectionType("checkbox");
        setAllowSelection(true);
    }, []);

    // Disable selection
    const disableSelection = useCallback(() => {
        setAllowSelection(false);
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setCurrentSelectedRow({});
    }, []);

    // Clear selection
    const clearSelection = useCallback(() => {
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setCurrentSelectedRow({});
    }, []);

    return {
        table,
        tableWithHeader,
        tableWithFooter,
        setColumns,
        fetchData,
        refreshData,
        selectedRows,
        setSelectedRows,
        rowSelectionConfig,
        setAllowSelection,
        selectionType,
        setSelectionType,
        currentSelectedRow,
        setCurrentSelectedRow,
        data,
        setData,
        selectedRowKeys,
        setSelectedRowKeys,
        loading,
        error,
        tableParams,
        setTableParams,
        enableSingleSelection,
        enableMultipleSelection,
        disableSelection,
        clearSelection,
        getColumnSearchProps,
        setColFilters
    };
};

export default useTable;