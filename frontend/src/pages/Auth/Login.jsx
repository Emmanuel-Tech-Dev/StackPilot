
import { Button, Form, Input } from "antd";
import { LockOutlined, RollbackOutlined, UserOutlined } from "@ant-design/icons";

// import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
    // const { loginUser, loading } = useAuth();
    // console.log(loading)


    const handleLogin = async (values) => {
        // await loginUser(values)
        console.log(values)
    }

    return (
        <>
            {/* {redirect && <RedirectRoute />} */}
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
                        <h2 className="text-2xl font-bold mb-3 text-center">Welcome User</h2>
                        <h2 className=" font-bold mb-4 text-center">Login</h2>

                    </div>
                    <Form
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={handleLogin}
                        className="space-y-2"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: "Please input a valid email!" },

                            ]}
                        >
                            <Input prefix={<UserOutlined />} placeholder="johndoe@gmail.com" />
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
                            <Button block type="primary" htmlType="submit" >
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>

                    <Button block className="mt-3" variant="outline" href="/otp-request">
                        LogIn with OTP
                    </Button>

                    <div className="mt-5 text-center text-sm">
                        <p>Don&apos;t have an account? <Link to="/create_account" className="text-blue-500 font-semibold">Sign up</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
