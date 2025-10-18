import React from 'react'
import {
    DatabaseOutlined,
    DollarOutlined,
    TeamOutlined,
    ProjectOutlined,
    DownloadOutlined,
    ReloadOutlined,
    FilePdfOutlined,
    FileExcelOutlined,
    CalendarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { Card, Statistic } from 'antd';
import Loader from './Loader';


const BORDER_COLORS = ['border-l-blue-500', 'border-l-green-500', 'border-l-purple-500', 'border-l-orange-500'];
const ICON_COLORS = ['text-blue-500', 'text-green-500', 'text-purple-500', 'text-orange-500'];
const TAG_COLORS = ['blue', 'green', 'purple', 'orange'];

const StatsCard = ({ icon, title, value }) => (
    <Card style={{ borderRadius: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: "14px", color: "#555" }}>
                {icon} {title}
            </div>
            <div style={{ fontSize: "24px", fontWeight: 600 }}>{value}</div>
        </div>
    </Card>
);



/** --- SUB COMPONENTS --- */
const StatCard = ({ stat, index, loading }) => (
    <Card className={`h-full border-l-4 ${BORDER_COLORS[index % BORDER_COLORS.length]} hover:shadow-lg transition-all`}>
        {loading ? (
            <Loader />
        ) : (
            <>
                <Statistic
                    title={<span className="text-gray-600 text-sm font-medium">{stat.title}</span>}
                    value={stat.value}
                    formatter={(value) => (
                        <span className="text-2xl font-bold text-gray-800">
                            {stat.prefix || ''}{value.toLocaleString()}
                        </span>
                    )}
                    prefix={<stat.icon className={ICON_COLORS[index % ICON_COLORS.length]} />}
                />
                <p className="mt-2 text-xs text-gray-500">{stat.subtitle}</p>
            </>
        )}
    </Card>
);


export default StatCard
