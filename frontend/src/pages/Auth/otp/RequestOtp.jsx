import { MailOutlined, RollbackOutlined } from '@ant-design/icons'
import { Button, Form, Input, message, notification } from 'antd'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import utils from '../../../helpers/utility_func'

const RequestOtp = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)


    const handleOtpRequest = async (values) => {
        setLoading(true)
        try {

            const res = await utils.otpRequest(values)
            if (res.status === "ok") {
                message.success(res.message)
                notification.info({
                    message: "Please check your email for your OTP code",
                    placement: "bottomRight"
                })
                setLoading(false)
                navigate("/otp-verify")
            } else {
                message.error(res.message)
                setLoading(false)
            }

        } catch (error) {
            console.log(error)
            setLoading(false)
            message.error("failed to request otp")
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
                        className="w-32 mx-auto mb-3"
                    />
                    <h2 className="text-2xl font-bold mb-3 text-center">OTP Sign Up</h2>
                    <h2 className=" font-bold mb-4 text-center">Request OTP code</h2>

                </div>
                <Form
                    name="login"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    onFinish={handleOtpRequest}
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
                            Request Otp
                        </Button>
                    </Form.Item>
                </Form>

                <div className="mt-5 text-center text-sm">
                    <p>Don&apos;t have an account? <Link to="/sign-up" className="text-blue-500 font-semibold">Sign up</Link></p>
                </div>
            </div>
        </div>
    )
}

export default RequestOtp