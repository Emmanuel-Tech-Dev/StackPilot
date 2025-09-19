import { Button, Descriptions, Input, Space, Table } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import utils from "../dependencies/helpers/utilities";
import Settings from "../dependencies/helpers/settings";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import qs from "qs";

const useTable = (initTblParams = {}, endpoint = "v1/goals", rowKey = "id", expandable = true, expandableKeys = {}) => {
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
    const [tableParams, setTableParams] = useState(() => ({
        pagination: {
            current: 1,
            pageSize: 10,
            showSizeChanger: false,
            showQuickJumper: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            ...initTblParams?.pagination
        },
        filters: initTblParams?.filters || {},
        sorter: initTblParams?.sorter || {},
        ...initTblParams
    }));

    const handleSearch = useCallback((selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    }, []);

    const handleReset = useCallback((clearFilters) => {
        clearFilters();
        setSearchText("");
    }, []);

    const getQueryParams = useCallback((params) => {
        const queryParams = {
            page: params.pagination?.current || 1,
            limit: params.pagination?.pageSize || 10,
        };

        if (params.filters) {
            Object.keys(params.filters).forEach(key => {
                if (params.filters[key]) {
                    queryParams[key] = Array.isArray(params.filters[key])
                        ? params.filters[key].join(',')
                        : params.filters[key];
                }
            });
        }

        if (params.sorter?.field) {
            queryParams.sortBy = params.sorter.field;
            queryParams.sortOrder = params.sorter.order === 'ascend' ? 'asc' : 'desc';
        }

        return queryParams;
    }, []);

    const rowSelectionConfig = useMemo(() => {
        if (!allowSelection) return null; // Changed from undefined to null

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
            onSelectAll: (selected, selectedRows) => {
                console.log('Select all triggered:', { selected, selectedRows });
            },
        };
    }, [allowSelection, selectionType, selectedRowKeys]);

    const handleTableChange = useCallback((pagination, filters, sorter) => {
        setTableParams(prev => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                current: pagination.current,
                pageSize: pagination.pageSize,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            },
            filters,
            sorter,
        }));
    }, []);

    const setColFilters = useCallback(async (dataIndex, url,) => {
        try {
            const res = await utils.requestWithReauth('post', `${Settings.baseUrl}${url}`, undefined, { dataIndex });

            const filters = res?.data?.map((item, index) => ({
                text: item?.[dataIndex],
                value: item?.[dataIndex],
                key: item?.id || `${item?.[dataIndex]}-${index}`
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
        if (!endpoint) return;

        setLoading(true);
        setError(''); // Clear previous errors

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
                        total: res.meta.pagination.totalItems || 0,
                        current: res.meta.pagination.currentPage || prev.pagination.current,
                        pageSize: res.meta.pagination.limit || prev.pagination.pageSize,
                        showSizeChanger: false,
                        showQuickJumper: false,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    }
                }));
            } else {
                // console.warn('Pagination data missing in response:', res);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message || 'An error occurred while fetching data');
            setData([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    }, [endpoint, getQueryParams, tableParams]);

    // Optimized useEffect - avoid JSON.stringify
    const tableParamsString = useMemo(() =>
        JSON.stringify(tableParams), [tableParams]
    );

    useEffect(() => {
        fetchData();
    }, [tableParamsString]); // Use memoized string

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
            const fieldValue = record[dataIndex];
            return fieldValue?.toString()?.toLowerCase()?.includes(value.toLowerCase()) || false;
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
    }), [searchText, searchedColumn, handleSearch, handleReset]);

    const table = useMemo(() => (
        <Table
            rowSelection={rowSelectionConfig}
            columns={columns}
            rowKey={(record) => record[rowKey] || record.id || record.key}
            dataSource={data}
            loading={loading}
            size="small"
            pagination={tableParams.pagination}
            onChange={handleTableChange}
        />
    ), [rowSelectionConfig, columns, data, loading, tableParams.pagination, handleTableChange, rowKey]);


    const tableExpandable = useMemo(() => (
        <Table
            rowSelection={rowSelectionConfig}
            columns={columns}
            rowKey={(record) => record[rowKey] || record.id || record.key}
            dataSource={data}
            expandable={expandable && {
                expandedRowRender: (record) => {
                    let parsed = null;
                    // console.log(record?.level)
                    try {
                        // raw looks like: "timestamp [HTTP] {JSON}"
                        const jsonPart = record.raw.split(`[${record?.level}]`)[1]?.trim();
                        if (jsonPart) {
                            parsed = JSON.parse(jsonPart);
                            // console.log(parsed);
                        }
                    } catch (e) {
                        console.error("Failed to parse raw log JSON:", e);
                    }

                    return (
                        <Descriptions bordered size="small" title="More Details">
                            <Descriptions.Item label="Type">{record.type}</Descriptions.Item>
                            <Descriptions.Item label="Filename">{record.filename}</Descriptions.Item>
                            <Descriptions.Item label="Line Number">{record.lineNumber}</Descriptions.Item>
                            <Descriptions.Item label="Raw">

                                {record.raw}

                            </Descriptions.Item>
                            {parsed?.meta && (
                                <Descriptions.Item label="Meta">

                                    {JSON.stringify(parsed.meta, null, 2)}

                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    );
                }
                ,
            }}
            loading={loading}
            size="small"
            pagination={tableParams.pagination}
            onChange={handleTableChange}
        />
    ), [rowSelectionConfig, columns, data, loading, tableParams.pagination, handleTableChange, rowKey]);

    const tableWithHeader = useCallback((header, extraProps = {}) => {
        return (
            <Table
                rowSelection={allowSelection ? rowSelectionConfig : null}
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
                rowSelection={allowSelection ? rowSelectionConfig : null}
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

    // Selection management functions
    const enableSingleSelection = useCallback(() => {
        setSelectionType("radio");
        setAllowSelection(true);
        setSelectedRowKeys([]);
        setSelectedRows([]);
    }, []);

    const enableMultipleSelection = useCallback(() => {
        setSelectionType("checkbox");
        setAllowSelection(true);
    }, []);

    const disableSelection = useCallback(() => {
        setAllowSelection(false);
        setSelectedRowKeys([]);
        setSelectedRows([]);
        setCurrentSelectedRow({});
    }, []);

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
        setError, // Added for external error management
        tableParams,
        setTableParams,
        enableSingleSelection,
        enableMultipleSelection,
        disableSelection,
        clearSelection,
        getColumnSearchProps,
        setColFilters,
        tableExpandable
    };
};

export default useTable;