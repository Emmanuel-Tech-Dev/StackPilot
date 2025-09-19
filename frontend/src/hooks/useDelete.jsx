
import React, { useState, useMemo } from 'react';
// import ValuesStore from '../store/values-store';
import utils from '../dependencies/helpers/utilities';
import Settings from '../dependencies/helpers/settings';
import { Popconfirm, message } from 'antd';
//this hook is based on zustand
const useDelete = (/*tablesMetaData, whereKeyName*/) => {
    // const valuesStore = ValuesStore();    
    // const [tblMetaDataName, setTblMetaDataName] = useState(tablesMetaData);
    // const [whrKeyName, setWhrKeyName] = useState(whereKeyName);
    const [saveCompleted, setSaveCompleted] = useState(false);

    useMemo(() => {

    }, []);

    const cancel = (e) => {
        setSaveCompleted(false);
    };

    const deleteRecord = async (url = `${Settings.baseUrl}v1/delete`, data, endpoint, callback) => {
        setSaveCompleted(false);
        let res = await utils.requestWithReauth('post', url, null, { data, tablemodel: endpoint });
        if (res.status === 'Ok') {
            setSaveCompleted(true);
            if (callback) {
                callback(true, 'Record has deleted successfully', data);
            }
            message.success('Record has been deleted succesfully');
        } else {
            if (callback) {
                callback(false, res.msg, data);
            }
            message.error(res.msg);
        }
    };


    function confirm(url, data, title, endpoint, elem = <a href="#">Delete</a>, okText = 'Yes', cancelText = 'No', okButtonProps = { style: { background: "red", border: 'none' } }, callback) {
        return <Popconfirm
            title={title}
            onConfirm={() => deleteRecord(url, data, endpoint, callback)}
            onCancel={cancel}
            okText={okText}
            cancelText={cancelText}
        >
            {elem}
        </Popconfirm >
    }

    return { confirm, deleteRecord, saveCompleted, setSaveCompleted };
}

export default useDelete;