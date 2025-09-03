import { theme } from "antd";
import Item from "antd/es/list/Item";

const ThemeConfig = {
  // Theme mode management
  mode: "light", // 'light' | 'dark' | 'auto'

  // Get theme configuration based on mode
  getTheme(isDark = false, isCompact = false) {
    return {
      algorithm: [
        isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        isCompact ? theme.compactAlgorithm : null,
      ].filter(Boolean),
      token: {
        // 🔵 Primary Colors (Improved for WCAG contrast)
        colorPrimary: "#4F46E5", // Indigo 600
        colorPrimaryBg: "#EEF2FF", // Light indigo
        colorPrimaryBgHover: "#E0E7FF",
        colorPrimaryBorder: "#C7D2FE",
        colorPrimaryBorderHover: "#A5B4FC",
        colorPrimaryHover: "#6366F1",
        colorPrimaryActive: "#3730A3",
        colorPrimaryText: "#4F46E5",
        colorPrimaryTextHover: "#6366F1",
        colorPrimaryTextActive: "#3730A3",

        colorLink: "#4F46E5",
        colorLinkHover: "#6366F1",
        colorLinkActive: "#3730A3",

        // 🎨 Status Colors
        colorSuccess: "#22C55E",
        colorSuccessBg: "#DCFCE7",
        colorSuccessBgHover: "#BBF7D0",
        colorSuccessBorder: "#86EFAC",
        colorSuccessHover: "#16A34A",
        colorSuccessActive: "#15803D",

        colorWarning: "#F59E0B",
        colorWarningBg: "#FEF9C3",
        colorWarningBgHover: "#FEF3C7",
        colorWarningBorder: "#FDE68A",
        colorWarningHover: "#D97706",
        colorWarningActive: "#B45309",

        colorError: "#EF4444",
        colorErrorBg: "#FEE2E2",
        colorErrorBgHover: "#FECACA",
        colorErrorBorder: "#F87171",
        colorErrorHover: "#DC2626",
        colorErrorActive: "#B91C1C",

        colorInfo: "#3B82F6",
        colorInfoBg: "#DBEAFE",
        colorInfoBgHover: "#BFDBFE",
        colorInfoBorder: "#93C5FD",
        colorInfoHover: "#2563EB",
        colorInfoActive: "#1D4ED8",

        // 🧱 Backgrounds & Surfaces
        colorBgBase: isDark ? "#0F172A" : "#FFFFFF",
        colorBgContainer: isDark ? "#1E293B" : "#FFFFFF",
        colorBgElevated: isDark ? "#334155" : "#FFFFFF",
        colorBgLayout: isDark ? "#020617" : "#F3F4F6",
        colorBgSpotlight: isDark ? "#475569" : "#F9FAFB",
        colorBgMask: isDark ? "rgba(0, 0, 0, 0.65)" : "rgba(0, 0, 0, 0.45)", // Improved mask opacity

        // 📝 Text Colors (Optimized for contrast)
        colorText: isDark ? "#F1F5F9" : "#111827",
        colorTextSecondary: isDark ? "#CBD5E1" : "#6B7280",
        colorTextTertiary: isDark ? "#94A3B8" : "#9CA3AF",
        colorTextQuaternary: isDark ? "#64748B" : "#D1D5DB",
        colorTextHeading: isDark ? "#F8FAFC" : "#111827",
        colorTextLabel: isDark ? "#E2E8F0" : "#374151",
        colorTextDescription: isDark ? "#94A3B8" : "#6B7280",
        colorTextPlaceholder: isDark ? "#64748B" : "#9CA3AF",
        colorTextDisabled: isDark ? "#475569" : "#D1D5DB",
        colorTextLightSolid: "#FFFFFF",

        // 🎯 Interactive States
        controlItemBgActive: isDark ? "#3730A3" : "#EEF2FF",
        controlItemBgActiveHover: isDark ? "#4338CA" : "#E0E7FF",
        controlItemBgHover: isDark ? "#374151" : "#F9FAFB",
        controlItemBgActiveDisabled: isDark ? "#1E293B" : "#F3F4F6",
        controlTmpOutline: "#4F46E5",

        // 📦 Borders
        colorBorder: isDark ? "#374151" : "#D1D5DB",
        colorBorderSecondary: isDark ? "#475569" : "#E5E7EB",
        colorBorderBg: isDark ? "#334155" : "#F3F4F6",

        // 🎨 Fills
        colorFill: isDark ? "#334155" : "#F3F4F6",
        colorFillSecondary: isDark ? "#475569" : "#F9FAFB",
        colorFillTertiary: isDark ? "#1E293B" : "#FFFFFF",
        colorFillQuaternary: isDark ? "#0F172A" : "#FAFAFA",

        // 📦 Border Radius
        borderRadius: isCompact ? 6 : 8,
        borderRadiusXS: isCompact ? 2 : 2,
        borderRadiusSM: isCompact ? 3 : 4,
        borderRadiusLG: isCompact ? 10 : 12,
        borderRadiusOuter: isCompact ? 3 : 4,

        // 📘 Typography (Enhanced)
        fontFamily: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
        fontFamilyCode: `'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace`,
        fontSize: 14,
        fontSizeLG: 16,
        fontSizeXL: 20,
        fontSizeXXL: 24, // Added for larger displays
        fontSizeHeading1: 38,
        fontSizeHeading2: 30,
        fontSizeHeading3: 24,
        fontSizeHeading4: 20,
        fontSizeHeading5: 16,
        fontSizeSM: 12,
        fontSizeXS: 10, // Adjusted for compact mode

        // 📏 Line Heights
        lineHeight: 1.5715, // Aligned with AntD defaults
        lineHeightLG: 1.625,
        lineHeightSM: 1.4285,
        lineHeightHeading1: 1.2,
        lineHeightHeading2: 1.3,
        lineHeightHeading3: 1.4,
        lineHeightHeading4: 1.4,
        lineHeightHeading5: 1.5,

        // 🎨 Shadows
        boxShadow: isDark
          ? "0 6px 16px 0 rgba(0, 0, 0, 0.4)"
          : "0 6px 16px 0 rgba(0, 0, 0, 0.08)",
        boxShadowSecondary: isDark
          ? "0 2px 8px 0 rgba(0, 0, 0, 0.3)"
          : "0 2px 8px 0 rgba(0, 0, 0, 0.05)",
        boxShadowTertiary: isDark
          ? "0 1px 3px 0 rgba(0, 0, 0, 0.2)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.1)",

        // 🧭 Spacing
        padding: isCompact ? 12 : 16,
        paddingXXS: 4,
        paddingXS: isCompact ? 6 : 8,
        paddingSM: isCompact ? 10 : 12,
        paddingMD: isCompact ? 12 : 16,
        paddingLG: isCompact ? 20 : 24,
        paddingXL: isCompact ? 28 : 32,

        margin: isCompact ? 12 : 16,
        marginXXS: 4,
        marginXS: isCompact ? 6 : 8,
        marginSM: isCompact ? 10 : 12,
        marginMD: isCompact ? 12 : 16,
        marginLG: isCompact ? 20 : 24,
        marginXL: isCompact ? 28 : 32,

        // 🎚️ Control Heights
        controlHeight: isCompact ? 28 : 32,
        controlHeightXS: isCompact ? 20 : 24,
        controlHeightSM: isCompact ? 24 : 28,
        controlHeightLG: isCompact ? 36 : 40,

        // 🎭 Motion
        motionDurationFast: "0.1s",
        motionDurationMid: "0.2s",
        motionDurationSlow: "0.3s",
        motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
        motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
        motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
        motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",

        // 🔢 Z-Index
        zIndexBase: 0,
        zIndexPopupBase: 1000,
        zIndexAffix: 10,
        zIndexBackTop: 10,
        zIndexModal: 1000,
        zIndexDrawer: 1000,
        zIndexMessage: 1010,
        zIndexNotification: 1010,
        zIndexTooltip: 1070, // Adjusted for better layering
      },

      components: {
        // 📄 Button
        Button: {
          primaryShadow: "none",
          defaultShadow: "none",
          dangerShadow: "none",
          primaryColor: "#FFFFFF",
          defaultColor: isDark ? "#F1F5F9" : "#374151",
          defaultBg: isDark ? "#374151" : "#FFFFFF",
          defaultBorderColor: isDark ? "#4B5563" : "#D1D5DB",
          defaultHoverBg: isDark ? "#4B5563" : "#F9FAFB",
          defaultHoverColor: isDark ? "#F9FAFB" : "#374151",
          defaultHoverBorderColor: "#6366F1",
          defaultActiveBg: isDark ? "#6B7280" : "#F3F4F6",
          defaultActiveColor: "#3730A3",
          defaultActiveBorderColor: "#4F46E5",
          borderRadius: isCompact ? 6 : 8,
          controlHeight: isCompact ? 36 : 40,
          controlHeightSM: isCompact ? 28 : 32,
          controlHeightLG: isCompact ? 44 : 48,
          paddingInline: isCompact ? 14 : 16,
          paddingInlineSM: isCompact ? 10 : 12,
          paddingInlineLG: isCompact ? 18 : 20,
        },

        // 📄 Card
        Card: {
          headerBg: isDark ? "#1E293B" : "#F9FAFB",
          colorBgContainer: isDark ? "#1E293B" : "#FFFFFF",
          colorBorderSecondary: isDark ? "#374151" : "#E5E7EB",
          colorTextHeading: isDark ? "#F8FAFC" : "#111827",
          boxShadow: isDark
            ? "0 6px 16px rgba(0, 0, 0, 0.4)"
            : "0 6px 16px rgba(0, 0, 0, 0.08)",
          borderRadiusLG: isCompact ? 10 : 12,
          paddingLG: isCompact ? 20 : 24,
        },

        // 📦 Modal
        Modal: {
          headerBg: isDark ? "#1E293B" : "#F9FAFB",
          contentBg: isDark ? "#1E293B" : "#FFFFFF",
          colorText: isDark ? "#F1F5F9" : "#111827",
          colorIcon: isDark ? "#94A3B8" : "#6B7280",
          colorIconHover: isDark ? "#CBD5E1" : "#374151",
          borderRadiusLG: isCompact ? 10 : 12,
          paddingLG: isCompact ? 20 : 24,
        },

        // ⬜ Input & TextArea
        Input: {
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          hoverBorderColor: "#6366F1",
          activeBorderColor: "#4F46E5",
          colorText: isDark ? "#F1F5F9" : "#111827",
          colorTextPlaceholder: isDark ? "#64748B" : "#9CA3AF",
          colorBgContainerDisabled: isDark ? "#1E293B" : "#F9FAFB",
          colorTextDisabled: isDark ? "#475569" : "#D1D5DB",
          borderRadius: isCompact ? 6 : 8,
          controlHeight: isCompact ? 36 : 40,
          controlHeightSM: isCompact ? 28 : 32,
          controlHeightLG: isCompact ? 44 : 48,
          paddingInline: isCompact ? 10 : 12,
        },

        // 📋 Select
        Select: {
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
          colorBgElevated: isDark ? "#334155" : "#FFFFFF",
          optionSelectedBg: isDark ? "#3730A3" : "#EEF2FF",
          optionActiveBg: isDark ? "#374151" : "#F9FAFB",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          colorText: isDark ? "#F1F5F9" : "#111827",
          colorTextPlaceholder: isDark ? "#64748B" : "#9CA3AF",
          borderRadius: isCompact ? 6 : 8,
          controlHeight: isCompact ? 36 : 40,
        },

        // ✅ Checkbox & Switch & Radio
        Checkbox: {
          colorPrimary: "#4F46E5",
          colorPrimaryHover: "#6366F1",
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          borderRadiusSM: isCompact ? 3 : 4,
        },

        Switch: {
          colorPrimary: "#4F46E5",
          colorPrimaryHover: "#6366F1",
          colorTextQuaternary: isDark ? "#475569" : "#D1D5DB",
          colorTextTertiary: isDark ? "#64748B" : "#9CA3AF",
        },

        Radio: {
          colorPrimary: "#4F46E5",
          dotColorDisabled: isDark ? "#374151" : "#D1D5DB",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
        },

        // 📅 DatePicker
        DatePicker: {
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
          colorBgElevated: isDark ? "#334155" : "#FFFFFF",
          cellHoverBg: isDark ? "#374151" : "#EEF2FF",
          cellActiveWithRangeBg: isDark ? "#1E293B" : "#E0E7FF",
          cellRangeBorderColor: "#C7D2FE",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          borderRadius: isCompact ? 6 : 8,
        },

        // 🚨 Alert & Message
        Alert: {
          colorSuccessBg: isDark ? "#064E3B" : "#DCFCE7",
          colorInfoBg: isDark ? "#1E3A8A" : "#DBEAFE",
          colorWarningBg: isDark ? "#92400E" : "#FEF9C3",
          colorErrorBg: isDark ? "#991B1B" : "#FEE2E2",
          colorSuccessBorder: isDark ? "#059669" : "#86EFAC",
          colorInfoBorder: isDark ? "#3B82F6" : "#93C5FD",
          colorWarningBorder: isDark ? "#D97706" : "#FDE68A",
          colorErrorBorder: isDark ? "#DC2626" : "#F87171",
          borderRadiusLG: isCompact ? 6 : 8,
        },

        Message: {
          contentBg: isDark ? "#1E293B" : "#FFFFFF",
          colorText: isDark ? "#F1F5F9" : "#111827",
          borderRadiusLG: isCompact ? 6 : 8,
        },

        // 📄 Table
        Table: {
          headerBg: isDark ? "#0F172A" : "#F3F4F6",
          headerColor: isDark ? "#E2E8F0" : "#374151",
          rowHoverBg: isDark ? "#1E293B" : "#F9FAFB",
          rowSelectedBg: isDark ? "#1E3A8A" : "#EEF2FF",
          rowSelectedHoverBg: isDark ? "#1D4ED8" : "#E0E7FF",
          headerSortActiveBg: isDark ? "#1E293B" : "#F3F4F6",
          headerSortHoverBg: isDark ? "#334155" : "#E5E7EB",
          colorBgContainer: isDark ? "#1E293B" : "#FFFFFF",
          colorBorder: isDark ? "#374151" : "#E5E7EB",
          borderRadiusLG: isCompact ? 6 : 8,
        },

        // 📊 Tag
        Tag: {
          colorFillSecondary: isDark ? "#374151" : "#F3F4F6",
          colorText: isDark ? "#E2E8F0" : "#374151",
          colorBorder: isDark ? "#4B5563" : "#D1D5DB",
          defaultBg: isDark ? "#374151" : "#F3F4F6",
          defaultColor: isDark ? "#E2E8F0" : "#374151",
          borderRadiusSM: isCompact ? 4 : 6,
        },

        // 🧩 Tabs
        Tabs: {
          itemActiveColor: "#4F46E5",
          itemSelectedColor: "#4F46E5",
          itemHoverColor: "#6366F1",
          inkBarColor: "#4F46E5",
          colorBgContainer: isDark ? "#1E293B" : "#FFFFFF",
          colorText: isDark ? "#CBD5E1" : "#6B7280",
          colorBorder: isDark ? "#374151" : "#E5E7EB",
        },

        // 🧭 Menu & Dropdown
        Menu: {
          colorBgContainer: isDark ? "#1E293B" : "#FFFFFF",
          colorBgElevated: isDark ? "#334155" : "#FFFFFF",
          colorText: isDark ? "#F1F5F9" : "#1F2937",
          itemActiveBg: isDark ? "#3730A3" : "#EEF2FF",
          itemSelectedBg: isDark ? "#3730A3" : "#EEF2FF",
          itemSelectedColor: "#4F46E5",
          itemHoverBg: isDark ? "#374151" : "#F9FAFB",
          colorBorder: isDark ? "#374151" : "#E5E7EB",
          borderRadius: isCompact ? 6 : 8,
        },

        Dropdown: {
          colorBgElevated: isDark ? "#334155" : "#FFFFFF",
          colorText: isDark ? "#F1F5F9" : "#1F2937",
          controlPaddingHorizontal: isCompact ? 10 : 12,
          borderRadius: isCompact ? 6 : 8,
        },

        // 🔁 Pagination
        Pagination: {
          itemColor: isDark ? "#F1F5F9" : "#1F2937",
          itemSelectedBg: isDark ? "#3730A3" : "#EEF2FF",
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
          // itemActiveBg: isDark ? "" : "#4F46E5",
          itemActiveColor: isDark ? "#F1F5F9" : "#F1F5F9",
          itemLinkBg: isDark ? "#ffffff" : "#FFFFFF",
          itemInputBg: isDark ? "" : "#FFFFFF",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          colorText: isDark ? "#F1F5F9" : "#1F2937",
          colorTextDisabled: isDark ? "#64748B" : "#9CA3AF",
          borderRadius: isCompact ? 6 : 8,
        },

        // 🛠 Tooltip & Popover
        Tooltip: {
          colorBgSpotlight: isDark ? "#0F172A" : "#1F2937",
          colorTextLightSolid: "#FFFFFF",
          borderRadius: isCompact ? 6 : 8,
        },

        Popover: {
          colorBgElevated: isDark ? "#334155" : "#FFFFFF",
          colorText: isDark ? "#F1F5F9" : "#111827",
          colorBorder: isDark ? "#475569" : "#D1D5DB",
          borderRadiusLG: isCompact ? 10 : 12,
        },

        // 🧩 Additional Components
        Progress: {
          colorInfo: "#4F46E5",
          remainingColor: isDark ? "#374151" : "#F3F4F6",
          borderRadius: isCompact ? 6 : 8,
        },

        Form: {
          labelColor: isDark ? "#E2E8F0" : "#374151",
          labelRequiredMarkColor: "#EF4444",
          itemMarginBottom: isCompact ? 20 : 24,
        },

        Upload: {
          colorBgContainer: isDark ? "#334155" : "#FAFAFA",
          colorBorder: isDark ? "#475569" : "#D9D9D9",
          colorText: isDark ? "#F1F5F9" : "#666666",
          borderRadius: isCompact ? 6 : 8,
        },

        Steps: {
          colorPrimary: "#4F46E5",
          colorText: isDark ? "#F1F5F9" : "#1F2937",
          colorTextDescription: isDark ? "#94A3B8" : "#6B7280",
          navArrowColor: isDark ? "#64748B" : "#9CA3AF",
          borderRadiusSM: isCompact ? 4 : 6,
        },

        Timeline: {
          colorPrimary: "#4F46E5",
          colorText: isDark ? "#F1F5F9" : "#1F2937",
          dotBg: isDark ? "#334155" : "#FFFFFF",
          dotBorderColor: isDark ? "#475569" : "#D1D5DB",
        },

        Badge: {
          colorPrimary: "#4F46E5",
          colorBgContainer: isDark ? "#334155" : "#FFFFFF",
          colorText: isDark ? "#F1F5F9" : "#1F2937",
          borderRadiusSM: isCompact ? 4 : 6,
        },
      },
    };
  },

  // Theme mode management
  toggleTheme() {
    this.mode = this.mode === "light" ? "dark" : "light";
    this.notifyThemeChange();
    return this.mode;
  },

  setTheme(mode) {
    if (["light", "dark", "auto"].includes(mode)) {
      this.mode = mode;
      this.notifyThemeChange();
    }
    return this.mode;
  },

  isCurrentThemeDark() {
    if (this.mode === "auto") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return this.mode === "dark";
  },

  getCurrentTheme(isCompact = false) {
    return this.getTheme(this.isCurrentThemeDark(), isCompact);
  },

  // Theme persistence
  saveThemePreference() {
    localStorage.setItem("theme-mode", this.mode);
  },

  loadThemePreference() {
    const saved = localStorage.getItem("theme-mode");
    if (saved && ["light", "dark", "auto"].includes(saved)) {
      this.mode = saved;
    }
    return this.mode;
  },

  // Initialize theme
  initializeTheme(isCompact = false) {
    this.loadThemePreference();
    if (this.mode === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", () => {
        this.notifyThemeChange();
      });
    }
    return this.getCurrentTheme(isCompact);
  },

  // Theme change callback
  onThemeChange: null,

  notifyThemeChange(isCompact = false) {
    if (typeof this.onThemeChange === "function") {
      this.onThemeChange(
        this.getCurrentTheme(isCompact),
        this.isCurrentThemeDark()
      );
    }
    this.applyCSSVariables(this.isCurrentThemeDark());
  },

  // CSS variables
  getCSSVariables(isDark = false, isCompact = false) {
    const theme = this.getTheme(isDark, isCompact);
    const tokens = theme.token;

    return {
      "--color-primary": tokens.colorPrimary,
      "--color-primary-hover": tokens.colorPrimaryHover,
      "--color-primary-active": tokens.colorPrimaryActive,
      "--color-success": tokens.colorSuccess,
      "--color-warning": tokens.colorWarning,
      "--color-error": tokens.colorError,
      "--color-info": tokens.colorInfo,
      "--color-bg-base": tokens.colorBgBase,
      "--color-bg-container": tokens.colorBgContainer,
      "--color-bg-elevated": tokens.colorBgElevated,
      "--color-bg-layout": tokens.colorBgLayout,
      "--color-text": tokens.colorText,
      "--color-text-secondary": tokens.colorTextSecondary,
      "--color-text-heading": tokens.colorTextHeading,
      "--color-border": tokens.colorBorder,
      "--color-border-secondary": tokens.colorBorderSecondary,
      "--border-radius": `${tokens.borderRadius}px`,
      "--border-radius-lg": `${tokens.borderRadiusLG}px`,
      "--font-family": tokens.fontFamily,
      "--font-size-base": `${tokens.fontSize}px`,
      "--font-size-lg": `${tokens.fontSizeLG}px`,
      "--font-size-sm": `${tokens.fontSizeSM}px`,
      "--box-shadow": tokens.boxShadow,
      "--box-shadow-secondary": tokens.boxShadowSecondary,
      "--padding": `${tokens.padding}px`,
      "--padding-lg": `${tokens.paddingLG}px`,
      "--padding-sm": `${tokens.paddingSM}px`,
      "--margin": `${tokens.margin}px`,
      "--margin-lg": `${tokens.marginLG}px`,
      "--margin-sm": `${tokens.marginSM}px`,
      "--control-height": `${tokens.controlHeight}px`,
      "--motion-duration-fast": tokens.motionDurationFast,
      "--motion-duration-mid": tokens.motionDurationMid,
      "--motion-duration-slow": tokens.motionDurationSlow,
      "--motion-ease-in-out": tokens.motionEaseInOut,
    };
  },

  applyCSSVariables(isDark = false, isCompact = false) {
    const variables = this.getCSSVariables(isDark, isCompact);
    const root = document.documentElement;

    Object.entries(variables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  },

  // Tailwind color palette
  getTailwindColors(isDark = false) {
    const theme = this.getTheme(isDark);
    const tokens = theme.token;

    return {
      primary: {
        50: "#EEF2FF",
        100: "#E0E7FF",
        200: "#C7D2FE",
        300: "#A5B4FC",
        400: "#818CF8",
        500: tokens.colorPrimary,
        600: "#4338CA",
        700: tokens.colorPrimaryActive,
        800: "#312E81",
        900: "#1E1B4B",
      },
      gray: isDark
        ? {
            50: "#F8FAFC",
            100: "#F1F5F9",
            200: "#E2E8F0",
            300: "#CBD5E1",
            400: "#94A3B8",
            500: "#64748B",
            600: "#475569",
            700: "#334155",
            800: "#1E293B",
            900: "#0F172A",
          }
        : {
            50: "#F9FAFB",
            100: "#F3F4F6",
            200: "#E5E7EB",
            300: "#D1D5DB",
            400: "#9CA3AF",
            500: "#6B7280",
            600: "#4B5563",
            700: "#374151",
            800: "#1F2937",
            900: "#111827",
          },
      success: {
        50: "#DCFCE7",
        100: "#BBF7D0",
        200: "#86EFAC",
        300: "#4ADE80",
        400: "#22C55E",
        500: tokens.colorSuccess,
        600: "#16A34A",
        700: "#15803D",
        800: "#166534",
        900: "#14532D",
      },
      warning: {
        50: "#FEF9C3",
        100: "#FEF3C7",
        200: "#FDE68A",
        300: "#FCD34D",
        400: "#FBBF24",
        500: tokens.colorWarning,
        600: "#D97706",
        700: "#B45309",
        800: "#92400E",
        900: "#78350F",
      },
      error: {
        50: "#FEE2E2",
        100: "#FECACA",
        200: "#FCA5A5",
        300: "#F87171",
        400: "#EF4444",
        500: tokens.colorError,
        600: "#DC2626",
        700: "#B91C1C",
        800: "#991B1B",
        900: "#7F1D1D",
      },
    };
  },
};

export default ThemeConfig;
