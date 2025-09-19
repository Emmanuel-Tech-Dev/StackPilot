import { MailOutlined, RollbackOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, notification } from 'antd'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import utils from '../../../helpers/utility_func'

const RequestResetLink = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const requestResetLinik = async (values) => {
        setLoading(true)
        try {

            const res = await utils.passwordReset(values)
            if (res.status === "ok") {
                message.success(res.message)
                notification.info({
                    message: "Please check your email for your password reset link",
                    placement: "bottomRight"
                })
                setLoading(false)
                // navigate("/password-reset-verify")
            } else {
                message.error(res.message)
                setLoading(false)
            }

        } catch (error) {
            console.log(error)
            message.error("failed to request for a rest link")
            setLoading(false)
        }
    }

    return (
        <div className="h-screen px-4 py-16 md:p-16">

            <div className="md:max-w-md mx-auto md:p-12 p-6 bg-[#f5f5f5] rounded">
                <div className='flex justify-end'>
                    <Button icon={<RollbackOutlined />} href="/" />

                </div>
                <div className='mt-5'>
                    <img
                        src="../img/logo.png"
                        alt="logo"
                        className="w-32 mx-auto mb-5"
                    />
                    {/* <h2 className="text-2xl font-bold mb-6 text-center">OTP Sign Up</h2> */}
                    <h2 className=" font-bold mb-6 text-center">Request Password</h2>

                </div>
                <Form
                    name="login"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    onFinish={requestResetLinik}
                    className="space-y-3"
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please input an email address!" },
                            {
                                type: "email",
                                message: "Please enter a valid email address!"
                            }

                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email address" />
                    </Form.Item>

                    <Form.Item>
                        <Button block type="primary" htmlType="submit" loading={loading}>
                            Request Reset Link
                        </Button>
                    </Form.Item>
                </Form>

                <div className="mt-5 text-center text-sm">
                    <p>Don't have an account? <Link to="/sign-up" className="text-blue-500 font-semibold">Sign up</Link></p>
                </div>
            </div>
        </div>
    )
}

export default RequestResetLink