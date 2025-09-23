
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
            <Header style={{ background: "#fff", padding: 0 }}>
                <Menu
                    mode="horizontal"
                    className="rounded-lg"
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => navigate(key)}
                    items={[
                        {
                            key: "/admin/management/users",
                            icon: <UserOutlined />,
                            label: "Users",
                        },
                        {
                            key: "/admin/management/roles",
                            icon: <TeamOutlined />,
                            label: "Roles",
                        },
                        {
                            key: "/admin/management/resources",
                            icon: <SettingOutlined />,
                            label: "Resources",
                        },
                        {
                            key: "/admin/management/permission",
                            icon: <KeyOutlined />,
                            label: "Permissions",
                            children: [
                                {
                                    key: "/admin/management/permissions",
                                    label: "Permissions",
                                },
                                {
                                    key: "/admin/management/permissions_roles",
                                    label: "Roles & Permissions",
                                },
                                {
                                    key: "/admin/management/permissions_resources",
                                    label: "Permissions Resources",
                                },
                            ],
                        },
                    ]}
                />
            </Header>
            <Content style={{ padding: "16px" }}>
                <Outlet />
            </Content>
        </Layout>
    );
};

export default UserManagementLayout;
