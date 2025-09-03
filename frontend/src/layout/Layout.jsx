import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
    DashboardOutlined,
    UserOutlined,
    SettingOutlined,
    FileTextOutlined,
    TeamOutlined,
    BarChartOutlined,
    BellOutlined,
    DownOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    AppstoreOutlined,
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Dropdown,
    Layout,
    Menu,
    Badge,
    Typography,
    theme
} from "antd";
import { useNavigate, useLocation } from 'react-router-dom';
import ValuesStore from "../store/values-store"
import utils from '../dependencies/helpers/utilities';
import Settings from '../dependencies/helpers/settings';
const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;



const fetchMainMenuItems = async () => {
    return [
        { key: "/dashboard", label: "Dashboard", hasDropdown: false },
        { key: "/reports", label: "Reports", hasDropdown: true },
        { key: "/settings", label: "Settings", hasDropdown: true },
    ];
};

const fetchSubMenuItems = async (parentKey) => {
    if (parentKey === "/reports") {
        return [
            { key: "/reports/daily", label: "Daily Report" },
            { key: "/reports/monthly", label: "Monthly Report" },
        ];
    }
    if (parentKey === "/settings") {
        return [
            { key: "/settings/profile", label: "Profile Settings" },
            { key: "/settings/system", label: "System Settings" },
        ];
    }
    return [];
};

/**
 * Recursive menu renderer
 */
const renderMenuItems = (items, navigate) =>
    items?.map((item) => {
        if (item?.has_dropdown) {
            return {
                key: item.resource_name,
                label: item?.resource_name,
                icon: <AppstoreOutlined />,
                children: item.children?.length
                    ? renderMenuItems(item.children, navigate)
                    : [], // caret still shows
            };
        }
        return {
            key: item.resource_name,
            label: item?.resource_name,
            icon: <AppstoreOutlined />,
            onClick: () => navigate(item.resource_path),

        };
    });
// ==============================================
// 1. PLAIN SIDEBAR NAVIGATION LAYOUT
// ==============================================
export const PlainSidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const { token: { colorBgContainer } } = theme.useToken();

    const menuItems = [
        { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/users', icon: <TeamOutlined />, label: 'Users' },
        { key: '/posts', icon: <FileTextOutlined />, label: 'Posts' },
        { key: '/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
        { key: '/settings', icon: <SettingOutlined />, label: 'Settings' },
    ];

    const user = { name: "Admin", email: "admin@example.com" };

    const profileItems = [
        {
            key: 'profile',
            label: (
                <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Profile</span>
                </div>
            ),
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            label: (
                <div className="flex items-center gap-2 text-red-500">
                    <LogoutOutlined />
                    <span>Logout</span>
                </div>
            ),
            onClick: () => navigate('/')
        },
    ];

    return (
        <Layout className="min-h-screen flex">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={220}
                collapsedWidth={80}
                style={{
                    backgroundColor: '#001529',
                    transition: 'width 0.2s ease-in-out',
                    height: '100vh',
                    overflowY: 'auto',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <div className="p-4 text-center border-b border-gray-700 border-opacity-30">
                    <div className="w-10 h-10 bg-white rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-200">
                        <AppstoreOutlined className="text-gray-600" />
                    </div>
                    {!collapsed && (
                        <div className="transition-all duration-200">
                            <h2 className="text-white font-bold m-0">CMS MASTER</h2>
                            <Text className="text-purple-200 text-xs">Simple</Text>
                        </div>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems.map(item => ({
                        ...item,
                        onClick: () => navigate(item.key)
                    }))}
                    style={{ marginTop: 16 }}
                />
            </Sider>

            <Layout style={{ transition: 'margin-left 0.2s ease-in-out' }}>
                <Header
                    style={{
                        background: colorBgContainer,
                        padding: '0 20px',
                        borderBottom: '1px solid #f0f0f0',
                        position: 'sticky',
                        top: 0,
                        zIndex: 999,
                    }}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button
                                type="text"
                                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-lg"
                            />
                            <h1 className="text-lg font-medium text-gray-700 m-0">
                                Simple Sidebar Layout
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <Badge count={3}>
                                <Button className='!-p-5' type="text" icon={<BellOutlined />} />
                            </Badge>

                            <Dropdown
                                menu={{ items: profileItems }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <Avatar style={{ backgroundColor: '#722ed1' }}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <Text strong className="text-sm">{user.name}</Text>
                                        <Text type="secondary" className="text-xs">{user.email}</Text>
                                    </div>
                                    <DownOutlined />
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </Header>

                <Content style={{ margin: '24px', padding: '24px', minHeight: 'calc(100vh - 112px)' }}>
                    {children}
                </Content>

                <Footer style={{ textAlign: 'center', background: '#fafafa' }}>
                    CMS with Dropdowns © {new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

// ==============================================
// 2. SIDEBAR WITH DROPDOWN NAVIGATION LAYOUT
// ==============================================


export const DropdownSidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const valuesStore = ValuesStore()
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openKeys, setOpenKeys] = useState([]);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const user = { name: "Admin", email: "admin@example.com" };

    const profileItems = [
        {
            key: "profile",
            label: (
                <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Profile</span>
                </div>
            ),
            onClick: () => navigate("/profile"),
        },
        {
            key: "logout",
            label: (
                <div className="flex items-center gap-2 text-red-500">
                    <LogoutOutlined />
                    <span>Logout</span>
                </div>
            ),
            onClick: () => navigate("/"),
        },
    ];


    const fetchRoute = async () => {
        try {

            let res = await utils.requestWithReauth('post', `${Settings.baseUrl}v1/get_browser_routes`, null, { table: "admin_resources" });

            if (!res?.details) return;
            valuesStore.setValue("routes", res)
            const normalizedItems = res?.details.map((item) =>
                item.has_dropdown ? { ...item, children: [] } : item
            );

            setMenuItems(normalizedItems);

        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        fetchRoute()
    }, []);


    // Handle submenu expand (lazy load)
    const handleOpenChange = async (keys) => {
        setOpenKeys(keys);
        const latestKey = keys.find(
            (key) =>
                menuItems.find((item) => item.key === key && item.hasDropdown)?.children
                    ?.length === 0
        );

        if (latestKey) {
            try {
                const subItems = await fetchSubMenuItems(latestKey);
                setMenuItems((prevItems) =>
                    prevItems.map((prevItem) =>
                        prevItem.key === latestKey
                            ? { ...prevItem, children: subItems }
                            : prevItem
                    )
                );
            } catch (error) {
                console.error(`Failed to fetch submenu for ${latestKey}:`, error);
            }
        }
    };

    // Rendered menu
    const renderedMenuItems = useMemo(() => (renderMenuItems(menuItems, navigate)), [menuItems])

    return (
        <Layout className="min-h-screen flex">
            {/* Sidebar */}
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                width={240}
                collapsedWidth={80}
                style={{
                    background: "linear-gradient(180deg, #722ed1 0%, #531dab 100%)",
                    boxShadow: "2px 0 6px rgba(0,0,0,0.1)",
                    transition: "width 0.2s ease-in-out",
                    height: "100vh",
                    overflowY: "auto",
                    position: "sticky",
                    top: 0,
                    zIndex: 1000,
                }}
            >
                <div className="p-4 text-center border-b border-purple-400 border-opacity-30">
                    <div className="w-10 h-10 bg-white rounded-full mx-auto mb-2 flex items-center justify-center transition-all duration-200">
                        <AppstoreOutlined className="text-purple-600" />
                    </div>
                    {!collapsed && (
                        <div className="transition-all duration-200">
                            <h2 className="text-white font-bold m-0">CMS MASTER</h2>
                            <Text className="text-purple-200 text-xs">with Dropdowns</Text>
                        </div>
                    )}
                </div>

                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    openKeys={openKeys}
                    onOpenChange={handleOpenChange}
                    items={renderedMenuItems}
                    style={{ backgroundColor: "transparent", marginTop: 16 }}
                />
            </Sider>

            {/* Main layout */}
            <Layout style={{ transition: "margin-left 0.2s ease-in-out" }}>
                <Header
                    style={{
                        background: colorBgContainer,
                        padding: "10px 20px",
                        borderBottom: "1px solid #f0f0f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 999,
                    }}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Button
                                type="text"
                                icon={
                                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                                }
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-lg"
                            />
                            <h1 className="text-lg font-medium text-gray-700 m-0">
                                Dropdown Sidebar Layout
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <Badge count={3}>
                                <Button className="!-p-5" type="text" icon={<BellOutlined />} />
                            </Badge>

                            <Dropdown
                                menu={{ items: profileItems }}
                                trigger={["click"]}
                                placement="bottomRight"
                            >
                                <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                    <Avatar style={{ backgroundColor: "#722ed1" }}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <Text strong className="text-sm">
                                            {user.name}
                                        </Text>
                                        <Text type="secondary" className="text-xs">
                                            {user.email}
                                        </Text>
                                    </div>
                                    <DownOutlined />
                                </div>
                            </Dropdown>
                        </div>
                    </div>
                </Header>

                <Content
                    style={{
                        margin: "24px",
                        padding: "24px",
                        background: colorBgContainer,
                        minHeight: "calc(100vh - 112px)",
                    }}
                >
                    {children}
                    {/* {loading ? <div>Loading...</div> : children} */}
                </Content>

                <Footer style={{ textAlign: "center", background: "#fafafa" }}>
                    CMS with Dropdowns © {new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

// ==============================================
// 3. TOP NAVIGATION LAYOUT
// ==============================================
export const TopNavLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token: { colorBgContainer } } = theme.useToken();

    const user = { name: "Admin", email: "admin@example.com" };

    const profileItems = [
        {
            key: 'profile',
            label: (
                <div className="flex items-center gap-2">
                    <UserOutlined />
                    <span>Profile</span>
                </div>
            ),
            onClick: () => navigate('/profile')
        },
        {
            key: 'logout',
            label: (
                <div className="flex items-center gap-2 text-red-500">
                    <LogoutOutlined />
                    <span>Logout</span>
                </div>
            ),
            onClick: () => navigate('/')
        },
    ];

    const topMenuItems = [
        { key: '/', label: 'Dashboard', icon: <DashboardOutlined /> },
        { key: '/users', label: 'Users', icon: <TeamOutlined /> },
        { key: '/posts', label: 'Posts', icon: <FileTextOutlined /> },
        { key: '/analytics', label: 'Analytics', icon: <BarChartOutlined /> },
        { key: '/database', label: 'Database', icon: <DatabaseOutlined /> },
        { key: '/settings', label: 'Settings', icon: <SettingOutlined /> },
    ];

    return (
        <Layout className="min-h-screen">
            <Header
                style={{
                    background: '#fff',
                    borderBottom: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000
                }}
            >
                <div className="flex justify-between items-center h-full">
                    {/* Logo and Navigation */}
                    <div className="flex items-center">
                        <div className="flex items-center gap-3 mr-8">
                            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                                <AppstoreOutlined className="text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 m-0">CMS MASTER</h1>
                        </div>

                        <Menu
                            mode="horizontal"
                            selectedKeys={[location.pathname]}
                            items={topMenuItems.map(item => ({
                                ...item,
                                onClick: () => navigate(item.key)
                            }))}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                lineHeight: '64px'
                            }}
                        />
                    </div>

                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <Badge count={5}>
                            <Button icon={<BellOutlined />} />
                        </Badge>

                        <Dropdown menu={{ items: profileItems }} trigger={['click']}>
                            <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <Avatar style={{ backgroundColor: '#f56a00' }}>
                                    {user.name.charAt(0)}
                                </Avatar>
                                <div className="flex flex-col">
                                    <Text strong>{user.name}</Text>
                                    <Text type="secondary" className="text-xs">{user.email}</Text>
                                </div>
                                <DownOutlined />
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </Header>

            <Content
                style={{
                    padding: '24px 50px',
                    // background: '#f5f5f5',
                    minHeight: 'calc(100vh - 64px - 70px)'
                }}
            >
                {/* <div style={{
                    background: colorBgContainer,
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}> */}
                {children}
                {/* </div> */}
            </Content>

            <Footer style={{ textAlign: 'center', background: '#f0f0f0' }}>
                Top Navigation CMS © {new Date().getFullYear()}
            </Footer>
        </Layout>
    );
};

// ==============================================
// 4. SIMPLE MINIMAL LAYOUT
// ==============================================
export const SimpleLayout = ({ children }) => {
    const navigate = useNavigate();
    const { token: { colorBgContainer } } = theme.useToken();

    const user = { name: "Admin" };

    const handleLogout = () => {
        console.log('Logging out...');
        navigate('/');
    };

    return (
        <Layout className="min-h-screen bg-gray-50">
            {/* Simple Header */}
            <Header
                style={{
                    background: '#fff',
                    borderBottom: '1px solid #e8e8e8',
                    padding: '0 24px'
                }}
            >
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                            <AppstoreOutlined className="text-white text-sm" />
                        </div>
                        <h1 className="text-lg font-semibold text-gray-800 m-0">CMS</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-gray-600">Hello, {user.name}</span>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-red-500"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </Header>

            {/* Simple Content */}
            <Content style={{ padding: '40px 24px', minHeight: 'calc(100vh - 134px)' }}>
                <div
                    style={{
                        // background: colorBgContainer,
                        padding: '32px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    {children}
                </div>
            </Content>

            {/* Simple Footer */}
            <Footer style={{ textAlign: 'center', padding: '12px', background: '#fff' }}>
                <Text type="secondary">Simple CMS © {new Date().getFullYear()}</Text>
            </Footer>
        </Layout>
    );
};

// ==============================================
// LAYOUT COMPONENT PROP TYPES
// ==============================================
const layoutPropTypes = {
    children: PropTypes.node.isRequired,
};

PlainSidebarLayout.propTypes = layoutPropTypes;
DropdownSidebarLayout.propTypes = layoutPropTypes;
TopNavLayout.propTypes = layoutPropTypes;
SimpleLayout.propTypes = layoutPropTypes;
// ==============================================
// USAGE EXAMPLES AND EXPORT
// ==============================================

/*
USAGE EXAMPLES:

// 1. Plain Sidebar Layout
import { PlainSidebarLayout } from './layouts/LayoutComponents';

function Dashboard() {
    return (
        <PlainSidebarLayout>
            <h1>Dashboard Content</h1>
            <p>Your dashboard content goes here...</p>
        </PlainSidebarLayout>
    );
}

// 2. Dropdown Sidebar Layout  
import { DropdownSidebarLayout } from './layouts/LayoutComponents';

function UsersPage() {
    return (
        <DropdownSidebarLayout>
            <h1>Users Management</h1>
            <p>Manage your users here...</p>
        </DropdownSidebarLayout>
    );
}

// 3. Top Navigation Layout
import { TopNavLayout } from './layouts/LayoutComponents';

function AnalyticsPage() {
    return (
        <TopNavLayout>
            <h1>Analytics Dashboard</h1>
            <p>View your analytics here...</p>
        </TopNavLayout>
    );
}

// 4. Simple Layout
import { SimpleLayout } from './layouts/LayoutComponents';

function SettingsPage() {
    return (
        <SimpleLayout>
            <h1>Settings</h1>
            <p>Configure your application...</p>
        </SimpleLayout>
    );
}

// You can also create a layout wrapper component:
const AppLayout = ({ layoutType = 'simple', children }) => {
    const layouts = {
        plain: PlainSidebarLayout,
        dropdown: DropdownSidebarLayout,
        top: TopNavLayout,
        simple: SimpleLayout,
    };
    
    const LayoutComponent = layouts[layoutType] || SimpleLayout;
    
    return <LayoutComponent>{children}</LayoutComponent>;
};

// Then use it like:
<AppLayout layoutType="dropdown">
    <YourPageContent />
</AppLayout>
*/