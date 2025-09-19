
import { Button, Form, Input, message } from "antd";
import { LockOutlined, MailOutlined, RollbackOutlined, UserOutlined } from "@ant-design/icons";
// import { userAuth } from "../../firebase/services";
// import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";

const SignUp = () => {

    const [messageApi, contextHolder] = message.useMessage();
    const [loading, setLoading] = useState(false);
    return (
        <div className="h-screen px-4 py-12 md:p-16">

            <div className="md:max-w-md mx-auto md:p-12 p-6 bg-[#f5f5f5] rounded">
                <div className='flex justify-between items-center'>
                    <img
                        src="../img/logo.png"
                        alt="logo"
                        className="w-16"
                    />
                    <Button icon={<RollbackOutlined />} href="/" />


                </div>
                <div className='mt-5'>

                    <h2 className="text-2xl font-bold mb-6 text-center">Student Account Registration</h2>
                    {/* <h2 className=" font-bold mb-6 text-center">Sign Up</h2> */}

                </div>
                <Form
                    name="login"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    // onFinish={handleLogin}
                    className="space-y-3"
                >
                    <Form.Item
                        name="name"
                        label="Student Name"
                        rules={[
                            { required: true, message: "Please input your name!" },

                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Enter your name" />
                    </Form.Item>
                    <Form.Item
                        name="index_number"
                        label="Index Number"
                        rules={[
                            { required: true, message: "Please input a valid Index number!" },
                            {
                                type: "string",
                                message: "Please enter a valid Index number",
                                max: 10
                            }

                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="ID number" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please input your email address!" },
                            {
                                type: "email",
                                message: "Please enter a valid email address"
                            }

                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="Email address" />
                    </Form.Item>
                    <Form.Item
                        name="id_number"
                        label="ID Number"
                        rules={[
                            { required: true, message: "Please input a valid ID number!" },

                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="ID number" />
                    </Form.Item>
                    <Form.Item
                        name="id_number"
                        label="ID Number"
                        rules={[
                            { required: true, message: "Please input a valid ID number!" },

                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="ID number" />
                    </Form.Item>
                    <Form.Item
                        name="id_number"
                        label="ID Number"
                        rules={[
                            { required: true, message: "Please input a valid ID number!" },

                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="ID number" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: "Please input your Password!" },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Password"
                        />
                    </Form.Item>

                    <div>
                        <Link
                            to="/password-reset-link"
                            className="text-blue-500 font-semibold text-xs flex justify-end items-end"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Form.Item>
                        <Button block type="primary" htmlType="submit" loading={loading}>
                            Log in
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

export default SignUp