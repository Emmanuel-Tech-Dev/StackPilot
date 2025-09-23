// import { useState } from 'react'
import { RollbackOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'

// import utils from '../../../helpers/utility_func'
// import { useNavigate } from 'react-router-dom'
// import RedirectRoute from '../../../protectedRoute/RedirectRoute'
// import { useAuth } from '../../../context/AuthContext'

const VerifyOtp = () => {
    // const { loading, otpVerifyLogin } = useAuth()

    const handleOTPVerificaton = async (values) => {
        // await otpVerifyLogin(values)
    }

    return (
        <>
            {/* {redirect && <RedirectRoute />} */}
            <div className="h-screen px-4 py-16 md:p-16">

                <div className="md:max-w-md mx-auto md:p-12 p-6 bg-[#f5f5f5] rounded">
                    <div className='flex justify-end'>
                        <Button icon={<RollbackOutlined />} href="/otp_request" />

                    </div>
                    <div className='mt-5'>
                        <img
                            src="../img/logo.png"
                            alt="logo"
                            className="w-32 mx-auto mb-3"
                        />
                        {/* <h2 className="text-2xl font-bold mb-6 text-center">OTP Sign Up</h2> */}
                        <h2 className=" font-bold mb-6 text-center">Verfiy OTP code</h2>

                    </div>
                    <Form
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={handleOTPVerificaton}
                        className="space-y-3"
                    >
                        <Form.Item
                            className=' text-center'
                            name="otp"
                            // label=""
                            rules={[
                                { required: true, message: "Please input an otp code!" },
                                {
                                    type: "string",
                                    message: "Please enter a valid Otp code!",
                                    max: 6,
                                    min: 6,
                                }
                            ]}
                        >
                            <Input.OTP />
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit" >
                                Verify Otp
                            </Button>
                        </Form.Item>
                    </Form>


                </div>
            </div>
        </>

    )
}

export default VerifyOtp