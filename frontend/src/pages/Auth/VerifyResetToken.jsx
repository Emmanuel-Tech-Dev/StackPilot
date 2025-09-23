import { LockOutlined, RestTwoTone, RollbackOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import utils from '../../dependencies/helpers/utilities';

const VerifyResetToken = () => {

    const [form] = Form.useForm()

    const { resetToken } = useParams()
    console.log(resetToken)
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const handlePasswordReset = async (values) => {
        setLoading(true)
        try {

            const res = await utils.passwordVerify(resetToken, values)
            if (res.status === 'ok') {
                message.success(res.message)
                setLoading(false)
                navigate("/")
                form.resetFields()

            } else {
                message.error(res.message)
                setLoading(false)
            }


        } catch (error) {
            console.log(error.message)
            message.error("Failed to reset password")
            setLoading(false)
        }
    }


    return (
        <>
            <div className="h-screen px-4 py-16 md:p-16">

                <div className="md:max-w-md mx-auto md:p-12 p-6 bg-[#f5f5f5] rounded">
                    <div className='flex justify-end'>
                        <Button icon={<RollbackOutlined />} href="/reset_password" />

                    </div>
                    <div className='mt-5'>
                        <img
                            src="../img/logo.png"
                            alt="logo"
                            className="w-32 mx-auto mb-3"
                        />
                        <h2 className="text-2xl font-bold mb-3 text-center">Password Reset </h2>
                        <h2 className=" font-bold mb-6 text-center">Reset Password</h2>

                    </div>
                    <Form
                        name="login"
                        layout="vertical"
                        form={form}
                        initialValues={{ remember: true }}
                        onFinish={handlePasswordReset}
                        className="space-y-2"
                    >

                        <Form.Item
                            name="newPassword"
                            label="Password"
                            rules={[
                                { required: true, message: "Please input your Password!" },
                                {
                                    pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                                    message: "Password must be at least 8 characters long, contain letters, numbers, and special characters (@$!%*#?&).",
                                },
                            ]}

                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmedPassword"
                            label="Confirm Password"
                            rules={[
                                { required: true, message: "Please confirm password!" },
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                            />
                        </Form.Item>


                        <Form.Item>
                            <Button block type="primary" htmlType="submit" loading={loading}>
                                Reset Password
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* <Button block className="mt-3" variant="outline" href="/otp-request">
                        LogIn with OTP
                    </Button> */}

                    <div className="mt-5 text-center text-sm">
                        <p>Don't have an account? <Link to="/sign-up" className="text-blue-500 font-semibold">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VerifyResetToken