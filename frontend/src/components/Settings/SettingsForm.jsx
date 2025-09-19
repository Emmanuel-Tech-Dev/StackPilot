import React, { useEffect, useState } from "react";
import useAdd from "../../hooks/useAdd";
import utils from "../../dependencies/helpers/utilities";
import { Alert, Button, Divider, Input, Space } from "antd";
import useTable from "../../hooks/useTable";
import { useRequest } from 'ahooks';
import Settings from "../../dependencies/helpers/settings";

const SettingsForm = ({ data, formTitle }) => {

  const addApiSettings = useAdd("tables_metadata", "table_name")
  const table = useTable({ pagination: { current: 1, pageSize: 5 } }, null);
  const [formDisabled, setFormDisabled] = useState(true)

  const column = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",

    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (text, record) => {
        return <div>
          <Space.Compact style={{ width: '100%' }}>
            <Input defaultValue={text} disabled={formDisabled} />
            <Button type="default" icon={formDisabled ? <i className="fas fa-lock bg-gray-100 text-[12px]"></i> : <i className="fas fa-lock-open bg-gray-100 text-[12px]" ></i>}
              onClick={() => setFormDisabled((prev) => !prev)}
            />
            <Button type="default" icon={<i className="fas fa-edit bg-gray-100 text-[12px]"></i>} disabled={formDisabled} />
          </Space.Compact>
        </div>
      }

    },
    // {
    //   title: "Action",
    //   dataIndex: "action",
    //   key: "action",

    //   render: (text, record) => {
    //     return <div>
    //       <Space size={"small"}>
    //         {/* <Button type="text" onClick={() => addApiSettings.setRecord(record)}>
    //           <i className="fas fa-edit text-green-600"></i>
    //         </Button> */}

    //         <Button danger type="text" onClick={() => addApiSettings.setRecord(record)}>
    //           <i className="fas fa-trash"></i>
    //         </Button>
    //       </Space>
    //     </div>


    //   }
    // }
  ]



  // console.log("UseRequest Hook for data fetching ", requestData)


  async function setApiForms(tableName = "apisettings") {
    await utils.sleep(100)
    addApiSettings.setTblName(tableName)
    // addApiSettings.setRecord({
    //   ...data[0]
    // })
  }
  useEffect(() => {

    setApiForms()

    table.setColumns(column)
    table.setData(data)
  }, [addApiSettings.saveCompleted, data, table.refreshData, formDisabled])


  return <div className="space-y-2">

    <Divider orientation="left">
      {formTitle.charAt(0).toUpperCase() + formTitle.slice(1)}
    </Divider>
    <div className="py-2">
      <Alert className="mt-2"
        message="Any Changes made to this settings will be applied to all APIs as well all Api Performace" type="warning" showIcon />

    </div>
    {table.table}
    {/* <div className="">
      <Divider orientation="left">
        Default API Settings
      </Divider>
      {addApiSettings.form}
      <div className="pt-2">
        <Alert className="mt-2" message="Any Changes made to this settings will be applied to all APIs as well all Api Performace" type="info" showIcon />

      </div>

      <div className="flex gap-2 items-center mt-5">
        <Button onClick={() => addApiSettings.setRecord({})}>
          Cancel
        </Button>
        <Button type="primary" onClick={() => addApiSettings.setShowModal(true)} block>
          Add New
        </Button>
      </div>

    </div> */}


  </div>;
};

export default SettingsForm;
