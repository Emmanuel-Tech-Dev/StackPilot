import React, { useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import App from "../App";
import ThemeConfig from "../dependencies/helpers/themeConfig";

const Root = () => {
    const [theme, setTheme] = useState(ThemeConfig.initializeTheme());

    useEffect(() => {
        // Apply initial CSS variables
        ThemeConfig.applyCSSVariables(ThemeConfig.isCurrentThemeDark());

        // Set up theme change listener
        const handleThemeChange = (newTheme, isDark) => {
            setTheme(newTheme);
            ThemeConfig.applyCSSVariables(isDark);
            ThemeConfig.saveThemePreference(); // Ensure this doesn't trigger excessive requests
        };

        ThemeConfig.onThemeChange = handleThemeChange;

        // Clean up listener on unmount
        return () => {
            ThemeConfig.onThemeChange = null;
        };
    }, []);

    return (
        <ConfigProvider theme={theme}>
            <App />
        </ConfigProvider>
    );
};

export default Root;