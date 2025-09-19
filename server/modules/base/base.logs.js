const express = require("express");
const fs = require("fs").promises;
const path = require("path");

const router = express.Router();

// Configuration
const CONFIG = {
  LOG_DIRECTORY: "./resources/logs", // Update this path as needed
  DEFAULT_LIMIT: 100,
  MAX_LIMIT: 1000,
};

// GET /api/logs - Main endpoint with full filtering, pagination, sorting
router.get("/logs", async (req, res) => {
  try {
    const {
      logType,
      level,
      startDate,
      endDate,
      limit = CONFIG.DEFAULT_LIMIT,
      page = 1, // Default to 1 for 1-based paging
      sortBy = "timestamp",
      sortOrder = "desc",
      search = "",
      event = "",
    } = req.query;

    // console.log("📡 API Request:", {
    //   logType,
    //   level,
    //   search,
    //   event,
    //   pagination: { limit, page },
    //   sorting: { sortBy, sortOrder },
    //   dateRange: startDate && endDate ? { startDate, endDate } : null,
    // });

    // Validate and sanitize inputs
    const validatedParams = {
      limit: Math.min(
        parseInt(limit) || CONFIG.DEFAULT_LIMIT,
        CONFIG.MAX_LIMIT
      ),
      page: parseInt(page) || 1, // Default to page 1
      sortBy: ["timestamp", "level", "event", "statusCode", "logType"].includes(
        sortBy
      )
        ? sortBy
        : "timestamp",
      sortOrder: ["asc", "desc"].includes(sortOrder) ? sortOrder : "desc",
    };

    // Calculate offset for pagination
    const offset = (validatedParams.page - 1) * validatedParams.limit;

    // Get all logs
    const allLogs = await getAllLogs();
    // console.log(`📄 Total logs found: ${allLogs.length}`);

    // Apply filters
    let filteredLogs = routerlyFilters(allLogs, {
      logType,
      level,
      search,
      event,
      startDate,
      endDate,
    });

    // console.log(`🔍 After filtering: ${filteredLogs.length} logs`);

    // Apply sorting
    filteredLogs = routerlySorting(
      filteredLogs,
      validatedParams.sortBy,
      validatedParams.sortOrder
    );

    // Apply pagination
    const count = filteredLogs.length;
    const totalPages = Math.ceil(count / validatedParams.limit);
    const paginatedLogs = filteredLogs.slice(
      offset,
      offset + validatedParams.limit
    );

    // console.log(
    //   `📄 Returning: ${paginatedLogs.length} logs (page ${validatedParams.page})`
    // );

    // Prepare query object for filters in response
    const queryFilters = {
      logType: logType || "all",
      level: level || "all",
      search: search || "",
      event: event || "",
      dateRange: startDate && endDate ? { startDate, endDate } : undefined,
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
    };

    // Build response in the specified format
    const response = {
      success: true,
      message: count === 0 ? "No data found" : "Data successfully fetched",
      status: "ok",
      statusCode: 200,
      data: paginatedLogs,
      meta: {
        pagination: {
          totalItems: count,
          totalPages,
          currentPage: validatedParams.page,
          limit: validatedParams.limit,
        },
        filters: count === 0 ? {} : queryFilters,
      },
      // queryStats: query.getStats(), // Uncomment if you have a query stats function
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    const response = {
      success: false,
      message: error.message,
      status: "error",
      statusCode: 500,
      data: [],
      meta: {
        pagination: {
          totalItems: 0,
          totalPages: 0,
          currentPage: 1,
          limit: CONFIG.DEFAULT_LIMIT,
        },
        filters: {},
      },
    };
    res.status(500).json(response);
  }
});

// GET /api/logs/types - Get available log types
router.get("/logs/types", async (req, res) => {
  try {
    const files = await fs.readdir(CONFIG.LOG_DIRECTORY);
    const logTypes = [...new Set(files.map(getLogTypeFromFilename))];

    res.json({
      success: true,
      data: logTypes.filter((type) => type !== "unknown"),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting log types:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get log types",
      message: error.message,
    });
  }
});

// GET /api/logs/stats - Get comprehensive log statistics
router.get("/logs/stats", async (req, res) => {
  try {
    const logs = await getAllLogs();

    const stats = {
      timestamp: new Date().toISOString(),
      total: logs.length,
      byType: {},
      byLevel: {},
      byEvent: {},
      byStatusCode: {},
      dateRange: {
        oldest: null,
        newest: null,
      },
      recentActivity: {
        lastHour: 0,
        last24Hours: 0,
        lastWeek: 0,
      },
    };

    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    logs.forEach((log) => {
      const logDate = new Date(log.timestamp);

      // Count by type
      stats.byType[log.logType] = (stats.byType[log.logType] || 0) + 1;

      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;

      // Count by event
      stats.byEvent[log.event] = (stats.byEvent[log.event] || 0) + 1;

      // Count by status code
      if (log.statusCode) {
        stats.byStatusCode[log.statusCode] =
          (stats.byStatusCode[log.statusCode] || 0) + 1;
      }

      // Track date range
      if (
        !stats.dateRange.oldest ||
        logDate < new Date(stats.dateRange.oldest)
      ) {
        stats.dateRange.oldest = log.timestamp;
      }
      if (
        !stats.dateRange.newest ||
        logDate > new Date(stats.dateRange.newest)
      ) {
        stats.dateRange.newest = log.timestamp;
      }

      // Recent activity
      if (logDate > oneHourAgo) stats.recentActivity.lastHour++;
      if (logDate > oneDayAgo) stats.recentActivity.last24Hours++;
      if (logDate > oneWeekAgo) stats.recentActivity.lastWeek++;
    });

    // Sort events by frequency (top 10)
    stats.topEvents = Object.entries(stats.byEvent)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([event, count]) => ({ event, count }));

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error getting log stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get log stats",
      message: error.message,
    });
  }
});

// GET /api/logs/health - Health check endpoint
router.get("/logs/health", async (req, res) => {
  try {
    const dirExists = await fs
      .access(CONFIG.LOG_DIRECTORY)
      .then(() => true)
      .catch(() => false);
    const files = dirExists ? await fs.readdir(CONFIG.LOG_DIRECTORY) : [];
    const logFiles = files.filter(
      (file) => file.endsWith(".log") || file.includes(".log.")
    );
    // console.log("Memory Process", process._getActiveHandles());
    res.json({
      success: true,
      data: {
        status: "healthy",
        logDirectory: CONFIG.LOG_DIRECTORY,
        directoryExists: dirExists,
        logFilesCount: logFiles.length,
        logFiles: logFiles, // Show first 10 files
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Health check failed",
      message: error.message,
    });
  }
});

// ============================================
// CORE FUNCTIONS
// ============================================

async function getAllLogs() {
  const allLogs = [];

  try {
    const files = await fs.readdir(CONFIG.LOG_DIRECTORY);
    const logFiles = files.filter(
      (file) => file.endsWith(".log") || file.includes(".log.")
    );

    for (const file of logFiles) {
      const filePath = path.join(CONFIG.LOG_DIRECTORY, file);
      const logType = getLogTypeFromFilename(file);

      try {
        const content = await fs.readFile(filePath, "utf-8");
        const lines = content.split("\n").filter((line) => line.trim());

        // console.log(`📄 Processing ${file}: ${lines.length} lines`);

        for (let i = 0; i < lines.length; i++) {
          const parsedLog = parseLogLine(lines[i], logType, file, i + 1);
          if (parsedLog) {
            allLogs.push(parsedLog);
          }
        }
      } catch (fileError) {
        console.error(`❌ Error reading file ${file}:`, fileError.message);
      }
    }

    // console.log(`✅ Total logs parsed: ${allLogs.length}`);
    return allLogs;
  } catch (error) {
    console.error("❌ Error reading log directory:", error);
    return [];
  }
}

function parseLogLine(line, logType, filename, lineNumber) {
  try {
    // Format 1: Your JSON logs (2025-08-28T14:52:41.149Z [WARN] {"timestamp":...})
    if (line.includes('{"timestamp"')) {
      const jsonMatch = line.match(/\{.*\}/);
      if (jsonMatch) {
        const logData = JSON.parse(jsonMatch[0]);
        return {
          id: `${filename}-${lineNumber}`,
          timestamp: logData.timestamp,
          level: extractLogLevel(line),
          event: logData.event || "UNKNOWN_EVENT",
          statusCode: logData.statusCode || null,
          type: logData.type || "Unknown",
          message: logData.message || "No message",
          logType: logType,
          filename: filename,
          lineNumber: lineNumber,
          raw: line,
          ...extractAdditionalFields(logData),
        };
      }
    }

    // Format 2: Standard log format
    const standardMatch = line.match(
      /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*?)\s+\[(\w+)\]\s+(.+)$/
    );
    if (standardMatch) {
      const [, timestamp, level, message] = standardMatch;
      return {
        id: `${filename}-${lineNumber}`,
        timestamp: timestamp,
        level: level,
        event: extractEventFromMessage(message),
        statusCode: extractStatusCode(message),
        type: "StandardLog",
        message: message,
        logType: logType,
        filename: filename,
        lineNumber: lineNumber,
        raw: line,
      };
    }

    return null;
  } catch (error) {
    console.error(
      `❌ Error parsing line ${lineNumber} in ${filename}:`,
      error.message
    );
    return null;
  }
}

function routerlyFilters(logs, filters) {
  let filtered = logs;

  if (filters.logType && filters.logType !== "all") {
    filtered = filtered.filter((log) => log.logType === filters.logType);
  }

  if (filters.level && filters.level !== "all") {
    filtered = filtered.filter((log) => log.level === filters.level);
  }

  if (filters.event) {
    filtered = filtered.filter((log) =>
      log.event.toLowerCase().includes(filters.event.toLowerCase())
    );
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.message.toLowerCase().includes(searchLower) ||
        log.event.toLowerCase().includes(searchLower) ||
        log.type.toLowerCase().includes(searchLower) ||
        (log.ip && log.ip.includes(filters.search)) ||
        (log.userAgent && log.userAgent.toLowerCase().includes(searchLower))
    );
  }

  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    filtered = filtered.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  return filtered;
}

function routerlySorting(logs, sortBy, sortOrder) {
  return logs.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "timestamp":
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      case "level":
        const levelOrder = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
        aValue = levelOrder[a.level] || 4;
        bValue = levelOrder[b.level] || 4;
        break;
      case "statusCode":
        aValue = a.statusCode || 0;
        bValue = b.statusCode || 0;
        break;
      default:
        aValue = a[sortBy] || "";
        bValue = b[sortBy] || "";
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLogTypeFromFilename(filename) {
  const name = filename.toLowerCase();
  if (name.includes("security")) return "security";
  if (name.includes("access")) return "access";
  if (name.includes("query")) return "query";
  if (name.includes("router")) return "router";
  if (name.includes("error")) return "error";
  if (name.includes("performance")) return "performance";
  return "unknown";
}

function extractLogLevel(line) {
  const match = line.match(/\[(\w+)\]/);
  return match ? match[1] : "INFO";
}

function extractAdditionalFields(logData) {
  const additional = {};

  if (logData.meta) {
    if (logData.meta.request) {
      additional.userAgent = logData.meta.request.userAgent;
      additional.ip = logData.meta.request.ip;
      additional.method = logData.meta.request.method;
      additional.path = logData.meta.request.path;
    }
    if (logData.meta.user) {
      additional.user = logData.meta.user;
    }
  }

  return additional;
}

function extractEventFromMessage(message) {
  const eventMatch = message.match(/^(\w+(?:_\w+)*)/);
  return eventMatch ? eventMatch[1] : "UNKNOWN_EVENT";
}

function extractStatusCode(message) {
  const statusMatch = message.match(/\b([1-5]\d{2})\b/);
  return statusMatch ? parseInt(statusMatch[1]) : null;
}

// Global error handler
router.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "GET /api/logs",
      "GET /api/logs/types",
      "GET /api/logs/stats",
      "GET /api/logs/health",
    ],
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
