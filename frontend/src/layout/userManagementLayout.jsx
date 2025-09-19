
import { Layout, Menu } from "antd";
import {
    UserOutlined,
    TeamOutlined,
    KeyOutlined,
    SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Header } from "antd/es/layout/layout";

const { Sider, Content } = Layout;

const UserManagementLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Layout style={{ minHeight: "100%" }}>
            {/* Horizontal Menu */}
            <Header style={{ background: "#fff", padding: 0 }}>
                <Menu
                    mode="horizontal"
                    className="rounded-lg"
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => navigate(key)}
                    items={[
                        {
                            key: "/user_management/users",
                            icon: <UserOutlined />,
                            label: "Users",
                        },
                        {
                            key: "/user_management/roles",
                            icon: <TeamOutlined />,
                            label: "Roles",
                        },
                        {
                            key: "/user_management/resources",
                            icon: <SettingOutlined />,
                            label: "Resources",
                        },
                        {
                            key: "/user_management/permissions3",
                            icon: <KeyOutlined />,
                            label: "Permissions",
                            children: [
                                {
                                    key: "/user_management/permissions",
                                    label: "Permissions",
                                },
                                {
                                    key: "/user_management/permissions_roles",
                                    label: "Roles & Permissions",
                                },
                                {
                                    key: "/user_management/permissions_resources",
                                    label: "Permissions Resources",
                                },
                            ],
                        },
                    ]}
                />
            </Header>

            {/* Page Content */}
            <Content style={{ padding: "16px" }}>
                <Outlet />
            </Content>
        </Layout>
    );
};

export default UserManagementLayout;
