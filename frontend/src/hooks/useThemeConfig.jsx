import { useState, useEffect } from "react";
import ThemeConfig from "../dependencies/helpers/themeConfig";

const useThemeConfig = () => {
    const [theme, setTheme] = useState(ThemeConfig.initializeTheme());

    useEffect(() => {
        // Apply initial CSS variables
        ThemeConfig.applyCSSVariables(ThemeConfig.isCurrentThemeDark());

        // Set up theme change listener
        const handleThemeChange = (newTheme, isDark) => {
            setTheme(newTheme);
            ThemeConfig.applyCSSVariables(isDark);
            ThemeConfig.saveThemePreference(); // safe call
        };

        ThemeConfig.onThemeChange = handleThemeChange;

        // Clean up listener
        return () => {
            ThemeConfig.onThemeChange = null;
        };
    }, []);

    return theme;
};

export default useThemeConfig;
