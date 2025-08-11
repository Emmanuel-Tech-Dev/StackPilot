// helpers/socket.js
const socketIo = require("socket.io");
const { authenticateSocket } = require("../middleWare/authMiddleware");
const notificationService = require("../../modules/notification/notfication.service");

class SocketHelper {
  constructor() {
    this.io = null;
    this.server = null;
    this.isInitialized = false;
    this.config = {
      cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      pingTimeout: 60000,
      pingInterval: 25000,
    };
  }

  initialize(server, options = {}) {
    if (this.isInitialized) {
      console.warn("Socket.IO already initialized");
      return this;
    }

    this.server = server;
    this.config = { ...this.config, ...options };

    // Create Socket.IO instance
    this.io = socketIo(server, this.config);

    // Initialize notification service with Socket.IO
    this.setupNotificationService();

    // Setup connection handlers
    this.setupConnectionHandlers();

    // Setup error handlers
    this.setupErrorHandlers();

    this.isInitialized = true;
    console.log("Socket.IO initialized successfully");

    return this;
  }

  /**
   * Setup notification service with middleware
   */
  setupNotificationService() {
    notificationService
      .initSocket(this.io)
      .use(authenticateSocket)
      .use(this.loggingMiddleware.bind(this))
      .use(this.rateLimitMiddleware.bind(this))
      .use(this.userValidationMiddleware.bind(this));

    // Setup notification service event listeners
    this.setupNotificationServiceEvents();
  }

  /**
   * Setup connection handlers
   */
  setupConnectionHandlers() {
    this.io.on("connection", (socket) => {
      notificationService.handleConnection(socket);
    });

    this.io.engine.on("connection_error", (err) => {
      console.error("Socket.IO connection error:", err);
    });
  }

  /**
   * Setup error handlers
   */
  setupErrorHandlers() {
    this.io.engine.on("connection_error", (err) => {
      console.error("Socket.IO Engine connection error:", {
        message: err.message,
        description: err.description,
        context: err.context,
        type: err.type,
      });
    });
  }

  /**
   * Logging middleware for socket connections
   */
  loggingMiddleware(socket, next) {
    const startTime = Date.now();
    socket.connectionTime = startTime;

    console.log(
      `[SOCKET] Connection attempt from ${socket.handshake.address} - User: ${socket.userId}`
    );

    socket.on("disconnect", (reason) => {
      const duration = Date.now() - startTime;
      console.log(
        `[SOCKET] User ${socket.userId} disconnected after ${duration}ms - Reason: ${reason}`
      );
    });

    next();
  }

  /**
   * Rate limiting middleware
   */
  rateLimitMiddleware(socket, next) {
    // Simple rate limiting per IP
    const clientIp = socket.handshake.address;
    const now = Date.now();

    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const clientData = this.rateLimitStore.get(clientIp) || {
      count: 0,
      resetTime: now + 60000,
    };

    if (now > clientData.resetTime) {
      clientData.count = 0;
      clientData.resetTime = now + 60000; // Reset every minute
    }

    clientData.count++;
    this.rateLimitStore.set(clientIp, clientData);

    // Allow max 10 connections per minute per IP
    if (clientData.count > 10) {
      console.warn(`[SOCKET] Rate limit exceeded for IP: ${clientIp}`);
      return next(new Error("Rate limit exceeded"));
    }

    next();
  }

  /**
   * User validation middleware
   */
  async userValidationMiddleware(socket, next) {
    try {
      // Additional user validation logic
      if (!socket.user) {
        return next(new Error("User validation failed"));
      }

      // Check if user is active/enabled
      if (
        socket.user.status === "disabled" ||
        socket.user.status === "banned"
      ) {
        return next(new Error("User account is disabled"));
      }

      // Log user connection for analytics
      this.logUserConnection(socket.user, socket.handshake);

      next();
    } catch (error) {
      console.error("User validation middleware error:", error);
      next(new Error("User validation failed"));
    }
  }

  /**
   * Setup notification service event listeners
   */
  setupNotificationServiceEvents() {
    notificationService.on("userConnected", ({ userId, socket }) => {
      console.log(
        `[NOTIFICATION] User ${userId} connected to notification service`
      );
      this.handleUserConnected(userId, socket);
    });

    notificationService.on("userDisconnected", ({ userId }) => {
      console.log(
        `[NOTIFICATION] User ${userId} disconnected from notification service`
      );
      this.handleUserDisconnected(userId);
    });

    notificationService.on("notificationCreated", (notification) => {
      console.log(
        `[NOTIFICATION] Created: ${notification._id} for user ${notification.userId}`
      );
    });

    notificationService.on("notificationRead", ({ userId, notificationId }) => {
      console.log(`[NOTIFICATION] Read: ${notificationId} by user ${userId}`);
    });

    notificationService.on(
      "multipleNotificationsRead",
      ({ userId, notificationIds }) => {
        console.log(
          `[NOTIFICATION] Multiple read by user ${userId}: ${notificationIds.length} notifications`
        );
      }
    );
  }

  /**
   * Handle user connected event
   */
  handleUserConnected(userId, socket) {
    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Join user to their role-based room if they have a role
    if (socket.userRole) {
      socket.join(`role_${socket.userRole}`);
    }

    // Emit user online status to their friends/contacts (if needed)
    this.broadcastUserStatus(userId, "online");
  }

  /**
   * Handle user disconnected event
   */
  handleUserDisconnected(userId) {
    // Emit user offline status
    this.broadcastUserStatus(userId, "offline");
  }

  /**
   * Broadcast user status to relevant users
   */
  broadcastUserStatus(userId, status) {
    // This is a placeholder - implement based on your app's needs
    // For example, notify friends or team members about user status
    this.io.to(`user_${userId}_contacts`).emit("user_status_change", {
      userId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Log user connection for analytics
   */
  logUserConnection(user, handshake) {
    // Log connection details for analytics
    const connectionLog = {
      userId: user._id,
      email: user.email,
      userAgent: handshake.headers["user-agent"],
      ipAddress: handshake.address,
      timestamp: new Date(),
      referer: handshake.headers.referer,
    };

    // You can save this to your analytics service or database
    console.log("[ANALYTICS] User connection:", connectionLog);
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    if (!this.isInitialized) {
      throw new Error("Socket.IO not initialized. Call initialize() first.");
    }
    return this.io;
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount() {
    if (!this.isInitialized) return 0;
    return notificationService.getConnectedUsersCount();
  }

  /**
   * Get server instance
   */
  getServer() {
    return this.server;
  }

  /**
   * Check if a user is online
   */
  isUserOnline(userId) {
    return notificationService.isUserOnline(userId);
  }

  /**
   * Send notification to specific user
   */
  async sendNotificationToUser(userId, notificationData) {
    try {
      return await notificationService.createNotification({
        ...notificationData,
        userId,
      });
    } catch (error) {
      console.error("Error sending notification to user:", error);
      throw error;
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  async broadcastNotification(userIds, notificationData) {
    try {
      return await notificationService.broadcastNotification(
        userIds,
        notificationData
      );
    } catch (error) {
      console.error("Error broadcasting notification:", error);
      throw error;
    }
  }

  /**
   * Send notification to all users in a role
   */
  async sendNotificationToRole(role, notificationData) {
    try {
      this.io.to(`role_${role}`).emit("notification", notificationData);
      console.log(`Notification sent to all users with role: ${role}`);
    } catch (error) {
      console.error("Error sending notification to role:", error);
      throw error;
    }
  }

  /**
   * Get socket statistics
   */
  getSocketStats() {
    if (!this.isInitialized) {
      return {
        connected: 0,
        rooms: 0,
        totalConnections: 0,
      };
    }

    return {
      connected: this.io.engine.clientsCount,
      rooms: Object.keys(this.io.sockets.adapter.rooms).length,
      totalConnections: notificationService.getConnectedUsersCount(),
      uptime: this.server ? process.uptime() : 0,
    };
  }

  /**
   * Clean up and close Socket.IO
   */
  async cleanup() {
    if (this.io) {
      console.log("Cleaning up Socket.IO connections...");
      this.io.close();
      this.isInitialized = false;
    }

    // Clean rate limit store
    if (this.rateLimitStore) {
      this.rateLimitStore.clear();
    }

    console.log("Socket.IO cleanup completed");
  }

  /**
   * Add custom middleware to the notification service
   */
  addCustomMiddleware(middleware) {
    if (typeof middleware !== "function") {
      throw new Error("Middleware must be a function");
    }

    notificationService.use(middleware);
    return this;
  }

  /**
   * Add custom event handler to the notification service
   */
  addCustomEventHandler(event, handler) {
    if (typeof handler !== "function") {
      throw new Error("Event handler must be a function");
    }

    notificationService.on(event, handler);
    return this;
  }

  /**
   * Health check data for the socket system
   */
  getHealthCheck() {
    const stats = this.getSocketStats();

    return {
      status: this.isInitialized ? "healthy" : "not_initialized",
      timestamp: new Date().toISOString(),
      socketStats: stats,
      connectedUsers: this.getConnectedUsersCount(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: require("socket.io/package.json").version,
    };
  }

  /**
   * Express route handlers for socket-related endpoints
   */
  getRouteHandlers() {
    return {
      // Health check endpoint
      healthCheck: (req, res) => {
        const healthData = this.getHealthCheck();
        res.json(healthData);
      },

      // Socket statistics endpoint
      stats: (req, res) => {
        const stats = this.getSocketStats();
        res.json({
          success: true,
          data: stats,
        });
      },

      // Connected users endpoint
      connectedUsers: (req, res) => {
        res.json({
          success: true,
          count: this.getConnectedUsersCount(),
          timestamp: new Date().toISOString(),
        });
      },

      // Check if user is online
      userStatus: (req, res) => {
        const { userId } = req.params;
        const isOnline = this.isUserOnline(userId);

        res.json({
          success: true,
          userId,
          isOnline,
          timestamp: new Date().toISOString(),
        });
      },

      // Send test notification (for admin/testing)
      sendTestNotification: async (req, res) => {
        try {
          const { userId, ...notificationData } = req.body;
          const notification = await this.sendNotificationToUser(userId, {
            title: "Test Notification",
            message: "This is a test notification from the system",
            type: "info",
            priority: "low",
            category: "system",
            ...notificationData,
          });

          res.json({
            success: true,
            notification: notificationService.formatNotification(notification),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: error.message,
          });
        }
      },
    };
  }
}

// Export singleton instance
module.exports = new SocketHelper();
