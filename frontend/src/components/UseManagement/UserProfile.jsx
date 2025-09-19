import { Button, Divider, Flex, Image, Input, Select, Space, Tag, Tooltip } from 'antd'
import React, { useState } from 'react'
import utils from '../../dependencies/helpers/utilities'
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useRequest } from "ahooks";
import Settings from '../../dependencies/helpers/settings';

const UserProfile = ({ record }) => {
    const { loading, data, error } = useRequest(async () => {
        const res = await utils.requestWithReauth(
            "post",
            `${Settings.baseUrl}v2/permission`,
            undefined,
            { role_id: record?.role_name }
        );
        return res?.data || [];
    }, {
        refreshDeps: [record?.role_name],
    });

    return (
        <div className="grid grid-cols-3 gap-x-5">
            <div className="col-span-1 sticky top-10 ">
                <div className="flex flex-col items-center p-2 border rounded-md">
                    <Image
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80"
                        width={200}
                        height={200}
                    />
                    <div className='my-2 space-y-2 text-center'>
                        <h1 className=" font-semibold">{record?.name}</h1>
                        <h1 className="">{record?.email}</h1>
                    </div>

                    <Space>
                        <Button size="small" icon={<i className="fas fa-phone"></i>} />
                        <Button size="small" danger icon={<i className="fas fa-user-slash"></i>} />
                    </Space>
                </div>
            </div>

            <div className="col-span-2">
                <h1 className='font-bold text-2xl'>
                    Profile Information
                </h1>
                <div>
                    <Divider>
                        <span className='text-xs uppercase'>User Information</span>
                    </Divider>
                    <div className='grid grid-cols-2 gap-2'>
                        <div className='col-span-1 space-y-2'>
                            <div>
                                <span className='text-xs uppercase font-bold text-gray-500'>Phone Number</span>
                                <p>{record?.phone_no}</p>
                            </div>
                            <div>
                                <span className='text-xs uppercase font-bold text-gray-500'>Status</span>
                                <p>{
                                    record?.status ? <Tag color="green">Active</Tag> : <Tag color="red">Inactive</Tag>
                                }</p>
                            </div>
                            <div className=''>
                                <span className='text-xs uppercase font-bold text-gray-500'>Role</span>
                                <div>
                                    <Space>
                                        <Tag color="blue" style={{ userSelect: "none" }}>
                                            {record?.role_name}
                                        </Tag>
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<EditOutlined />}

                                        />
                                    </Space>
                                </div>

                            </div>
                        </div>
                        <div className='col-span-1 space-y-2'>
                            <div>
                                <span className='text-xs uppercase font-bold text-gray-500'>Last Login</span>
                                <p>{utils.formatDateV3(record?.last_login)}</p>
                            </div>
                            <div>
                                <span className='text-xs uppercase font-bold text-gray-500'>Member Since</span>
                                <p>{utils.formatDateV3(record?.createdAt)}</p>
                            </div>
                            <div>
                                <span className='text-xs uppercase font-bold text-gray-500'>Login Method</span>
                                <p>{record?.oauth_provider || 'N/A'}</p>
                            </div>
                        </div>

                    </div>

                </div>
                <div>
                    <Divider>
                        <span className='text-xs uppercase'>User Permissions</span>
                    </Divider>
                    <div className='grid grid-cols-1 gap-2'>
                        <div className='col-span-1 space-y-2'>
                            <span className='text-xs uppercase font-bold text-gray-500'>Permissions</span>
                            <div>
                                {data?.map((item, index) => (
                                    <Tag key={index}>
                                        {item?.permission}
                                    </Tag>
                                ))}
                            </div>

                        </div>


                    </div>

                </div>
            </div>
        </div >

    )
}
export default UserProfile


const UserRoleSection = ({ record, onRoleChange }) => {
    const [editing, setEditing] = useState(false);
    const [role, setRole] = useState(record?.role_name);

    const { loading, data, error } = useRequest(async () => {
        const res = await utils.requestWithReauth(
            "post",
            `${Settings.baseUrl}v2/permission`,
            undefined,
            { role_id: record?.role_name }
        );
        return res?.data || [];
    }, {
        refreshDeps: [record?.role_name],
    });


    console.log(data)
    // const handleSelectRoleChange = async (value) => {
    //     try {
    //         const res = await utils.requestWithReauth(
    //             "put",
    //             `${Settings.baseUrl}v1/admin_user_roles/${record.id}`,
    //             null,
    //             {
    //                 role_id: value,
    //                 user_custom_id: record?.custom_id,
    //             }
    //         );

    //         if (res?.status === "ok") {
    //             setRole(value);
    //             utils.showNotification("Success", res?.message, "text-green-500");
    //             if (onRoleChange) onRoleChange(value);
    //         }
    //     } catch (error) {
    //         utils.showNotification("Error", error, "text-red-500");
    //     } finally {
    //         setEditing(false);
    //     }
    // };

    return (
        <div>
            <span className="text-xs uppercase font-bold text-gray-500">Role</span>
            <div className="mt-1">
                <Space>
                    <Tag color="blue" style={{ userSelect: "none" }}>
                        {record?.role_name}
                    </Tag>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => setEditing(true)}
                    />
                </Space>
            </div>
        </div>
    );
};


