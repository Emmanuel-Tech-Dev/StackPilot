import {
  DollarOutlined,
  GiftOutlined,
  HeartOutlined,
  ShopOutlined,
  SoundOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Settings from "../helpers/settings";
import utils from "../helpers/utilities";

const CustomFunction = {
  normalizeData: (apiData) => {
    // Add a safety check for apiData itself
    if (!apiData) {
      return {
        typeData: [],
        levelData: [],
        eventData: [],
        statusCodeData: [],
        recentActivityData: [],
        topEventsData: [],
      };
    }

    const {
      byType,
      byLevel,
      byEvent,
      byStatusCode,
      recentActivity,
      topEvents,
    } = apiData;

    return {
      // Pie chart
      typeData: Object.entries(byType || {}).map(([type, count]) => ({
        type,
        value: count,
      })),

      // Bar chart
      levelData: Object.entries(byLevel || {}).map(([level, count]) => ({
        level,
        value: count,
      })),

      // Bar chart (can be long list, maybe use top 10)
      eventData: Object.entries(byEvent || {}).map(([event, count]) => ({
        event,
        value: count,
      })),

      // Pie chart
      statusCodeData: Object.entries(byStatusCode || {}).map(
        ([code, count]) => ({
          code,
          value: count,
        })
      ),

      // Column chart
      recentActivityData: Object.entries(recentActivity || {}).map(
        ([range, count]) => ({
          range,
          value: count,
        })
      ),

      // Horizontal bar chart (already sorted in API) - Added fallback here
      topEventsData: (topEvents || []).map((item) => ({
        event: item.event,
        value: item.count,
      })),
    };
  },

  getPartnerTypeConfig: (type) => {
    const configs = {
      business: { color: "blue", icon: ShopOutlined, label: "Business" },
      influencer: {
        color: "purple",
        icon: UserOutlined,
        label: "Influencer",
      },
      sponsor: { color: "gold", icon: TrophyOutlined, label: "Sponsor" },
      NGO: { color: "green", icon: HeartOutlined, label: "NGO" },
    };
    return configs[type] || configs.business;
  },

  // Helper function to get contribution type config
  getContributionTypeConfig: (type) => {
    const configs = {
      monetary: {
        color: "success",
        icon: DollarOutlined,
        label: "Monetary",
      },
      in_kind: {
        color: "processing",
        icon: GiftOutlined,
        label: "In-Kind",
      },
      promotion: {
        color: "warning",
        icon: SoundOutlined,
        label: "Promotion",
      },
    };
    return configs[type] || configs.monetary;
  },

  getChannelColor: (channel) => {
    const colorMap = {
      "Digital / Online": "blue",
      "Traditional Media": "purple",
      "Community Engagement": "green",
      "Partnership Channels": "orange",
      "Direct Outreach": "cyan",
    };
    return colorMap[channel] || "default";
  },

  async getData(critera, endpoint) {
    try {
      const res = await utils.requestWithReauth(
        "post",
        `${Settings.baseUrl}v1.0/${endpoint}`,
        null,
        critera
      );

      if (res?.status === "Ok") {
        const data = res?.data;
        return data;
      } else {
        utils.showNotification("Error", res?.msg, "text-red-500");
      }
    } catch (error) {
      utils.showNotification("Error", error?.message, "text-red-500");
    }
  },
};

export default CustomFunction;
