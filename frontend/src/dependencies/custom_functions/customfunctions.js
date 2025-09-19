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
};

export default CustomFunction;
