const EventEmitter = require("events");
const { Op } = require("sequelize");

class NotificationService extends EventEmitter {
  constructor() {
    super(); // Call EventEmitter constructor
    this.connectedUsers = new Map();
    this.userSockets = new Map();
    this.socketMiddleware = [];
    this.eventHandlers = new Map();
    this.io = null;
    this.models = null; // Will store Sequelize models
  }

  // Inject Sequelize models
  setModels(models) {
    this.models = models;
    return this;
  }

  initSocket(io) {
    this.io = io;
    return this;
  }

  use(middleWare) {
    this.socketMiddleware.push(middleWare);
    return this;
  }

  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
    return this;
  }

  handleConnection(socket) {
    console.log("New Socket Connection", socket.id);

    let middleWareIndex = 0;

    const runMiddleware = (error) => {
      if (error) {
        console.log("Error in middleware", error.message);
        socket.disconnect();
        return;
      }

      if (middleWareIndex >= this.socketMiddleware.length) {
        this.onSocketConnection(socket); // Fixed typo: was "onSockentConnection"
        return;
      }

      const middleWare = this.socketMiddleware[middleWareIndex++];
      middleWare(socket, runMiddleware);
    };

    runMiddleware();
  }

  async onSocketConnection(socket) {
    // Fixed method name
    const userId = socket.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    this.connectedUsers.set(socket.id, socket);
    this.userSockets.set(userId, socket.id);

    await this.updateUserSession(socket, true);
    await this.deliverPendingNotifications(userId, socket);

    this.setupSocketHandlers(socket);
    this.emit("userConnected", { userId, socket });

    socket.on("disconnect", async () => {
      await this.handleDisconnection(socket);
    });
  }

  setupSocketHandlers(socket) {
    const userId = socket?.userId;

    socket.on("mark_notification_read", async (data) => {
      try {
        const notification = await this.markAsRead(
          data?.notificationId,
          userId
        );
        socket.emit("notification_read", {
          notificationId: data?.notificationId,
          notification,
        });

        this.emit("notification_read", {
          userId,
          notificationId: data?.notificationId,
        });
      } catch (error) {
        socket.emit("notification_error", {
          message: "Failed to mark notification read", // Fixed typo: was "nessage"
        });
      }
    });

    socket.on("mark_all_notification_read", async (data) => {
      try {
        const result = await this.markMultipleAsRead(
          data.notificationIds,
          userId
        );
        socket.emit("notifications_marked_read", {
          notificationIds: data.notificationIds,
          modifiedCount: result[0], // Sequelize returns [affectedCount, affectedRows]
        });

        this.emit("all_notifications_read", {
          userId,
          notificationIds: data.notificationIds,
        });
      } catch (error) {
        socket.emit("error", {
          message: "Failed to mark notifications as read",
        });
      }
    });

    socket.on("get_notifications", async (data) => {
      try {
        const result = await this.getNotifications(
          userId,
          data.page || 1,
          data.limit || 20,
          data.filter || {}
        );
        socket.emit("notifications_list", result);
      } catch (error) {
        socket.emit("error", { message: "Failed to fetch notifications" });
      }
    });

    socket.on("subscribe_category", (data) => {
      const room = `category_${data.category}_${userId}`;
      socket.join(room);
      socket.emit("subscribed", { category: data.category });
    });

    socket.on("unsubscribe_category", (data) => {
      const room = `category_${data.category}_${userId}`;
      socket.leave(room);
      socket.emit("unsubscribed", { category: data.category });
    });

    // Handle custom events from registered handlers
    for (const [event, handlers] of this.eventHandlers.entries()) {
      socket.on(event, async (data) => {
        for (const handler of handlers) {
          try {
            await handler(socket, data);
          } catch (error) {
            console.error(`Error in custom event handler for ${event}:`, error);
          }
        }
      });
    }
  }

  async updateUserSession(socket, isOnline) {
    try {
      if (!this.models?.UserSession) {
        console.warn("UserSession model not available");
        return;
      }

      const userAgent = socket.handshake.headers["user-agent"] || "unknown";
      const ipAddress = socket.handshake.address || socket.conn.remoteAddress;

      const updateData = {
        socketId: socket.id,
        isOnline,
        lastSeen: new Date(),
        deviceInfo: JSON.stringify({
          userAgent,
          platform: this.extractPlatform(userAgent),
          browser: this.extractBrowser(userAgent),
          ipAddress,
        }),
      };

      if (isOnline) {
        updateData.connectedAt = new Date();
      }

      // Use Sequelize upsert (findOrCreate + update)
      const [userSession, created] = await this.models.UserSession.findOrCreate(
        {
          where: { userId: socket.userId },
          defaults: {
            ...updateData,
            totalSessions: 1,
          },
        }
      );

      if (!created) {
        // Update existing session
        const incrementData = isOnline
          ? { totalSessions: userSession.totalSessions + 1 }
          : {};
        await userSession.update({
          ...updateData,
          ...incrementData,
        });
      }
    } catch (error) {
      console.error("Error updating user session:", error);
    }
  }

  extractPlatform(userAgent) {
    if (/mobile/i.test(userAgent)) return "mobile";
    if (/tablet/i.test(userAgent)) return "tablet";
    return "desktop";
  }

  extractBrowser(userAgent) {
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/edge/i.test(userAgent)) return "Edge";
    return "Unknown";
  }

  async deliverPendingNotifications(userId, socket) {
    try {
      const undeliveredNotifications = await this.getUndeliveredNotifications(
        userId
      );
      const importantNotifications = undeliveredNotifications.filter((n) =>
        ["high", "critical"].includes(n.priority)
      );

      // Send important notifications alert first
      if (importantNotifications.length > 0) {
        socket.emit("important_notifications_alert", {
          count: importantNotifications.length,
          notifications: importantNotifications.map((n) =>
            this.formatNotification(n)
          ),
        });
      }

      // Send all undelivered notifications and mark as delivered
      const notificationIds = [];
      for (const notification of undeliveredNotifications) {
        socket.emit("notification", this.formatNotification(notification));
        notificationIds.push(notification.id);
      }

      // Bulk update to mark as delivered
      if (notificationIds.length > 0) {
        await this.models.Notification.update(
          {
            isDelivered: true,
            deliveredAt: new Date(),
          },
          {
            where: {
              id: { [Op.in]: notificationIds },
            },
          }
        );
      }

      console.log(
        `Delivered ${undeliveredNotifications.length} notifications to user ${userId}`
      );
    } catch (error) {
      console.error("Error delivering pending notifications:", error);
    }
  }

  formatNotification(notification) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      createdAt: notification.createdAt,
      metadata: notification.metadata,
      actionUrl: notification.actionUrl,
      imageUrl: notification.imageUrl,
      isRead: notification.isRead,
    };
  }

  async handleDisconnection(socket) {
    const userId = socket.userId;
    console.log(`User ${userId} disconnected`);

    this.connectedUsers.delete(socket.id);
    this.userSockets.delete(userId);

    // Update user session
    await this.updateUserSession(socket, false);

    // Emit disconnection event
    this.emit("userDisconnected", { userId, socket });
  }

  async createNotification(notificationData) {
    try {
      if (!this.models?.Notification) {
        throw new Error("Notification model not available");
      }

      const notification = await this.models.Notification.create(
        notificationData
      );

      // Try to deliver immediately if user is online
      await this.deliverNotification(notification);

      // Emit event for other services
      this.emit("notificationCreated", notification);

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  async deliverNotification(notification) {
    try {
      const userId = notification.userId.toString();
      const socketId = this.userSockets.get(userId);
      const socket = socketId ? this.connectedUsers.get(socketId) : null;

      if (socket) {
        // User is online, send immediately
        socket.emit("notification", this.formatNotification(notification));

        // Also send to category room if user is subscribed
        const categoryRoom = `category_${notification.category}_${userId}`;
        this.io
          .to(categoryRoom)
          .emit("notification", this.formatNotification(notification));

        // Mark as delivered
        await notification.update({
          isDelivered: true,
          deliveredAt: new Date(),
        });

        console.log(`Notification delivered to user ${userId}`);
      } else {
        console.log(`User ${userId} is offline. Notification queued.`);
      }
    } catch (error) {
      console.error("Error delivering notification:", error);
    }
  }

  async broadcastNotification(userIds, notificationData) {
    const results = [];

    for (const userId of userIds) {
      try {
        const notification = await this.createNotification({
          ...notificationData,
          userId,
        });
        results.push({ userId, notification, success: true });
      } catch (error) {
        results.push({ userId, error: error.message, success: false });
      }
    }

    return results;
  }

  async getUndeliveredNotifications(userId) {
    try {
      if (!this.models?.Notification) {
        console.warn("Notification model not available");
        return [];
      }

      return await this.models.Notification.findAll({
        where: {
          userId: userId,
          isDelivered: false,
          [Op.or]: [
            { expiresAt: null }, // Handle notifications without expiry
            { expiresAt: { [Op.gt]: new Date() } },
          ],
        },
        order: [
          // Sequelize ordering by priority weight
          [
            this.models.sequelize.literal(`
            CASE priority
              WHEN 'critical' THEN 4
              WHEN 'high' THEN 3
              WHEN 'medium' THEN 2
              WHEN 'low' THEN 1
              ELSE 1
            END
          `),
            "DESC",
          ],
          ["createdAt", "DESC"],
        ],
      });
    } catch (error) {
      console.error("Error fetching undelivered notifications:", error);
      return [];
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      if (!this.models?.Notification) {
        throw new Error("Notification model not available");
      }

      const [affectedRows] = await this.models.Notification.update(
        {
          isRead: true,
          readAt: new Date(),
        },
        {
          where: {
            id: notificationId,
            userId: userId,
          },
          returning: true, // This might not work in all databases
        }
      );

      // Fetch the updated notification
      const notification = await this.models.Notification.findOne({
        where: {
          id: notificationId,
          userId: userId,
        },
      });

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markMultipleAsRead(notificationIds, userId) {
    try {
      if (!this.models?.Notification) {
        throw new Error("Notification model not available");
      }

      const result = await this.models.Notification.update(
        {
          isRead: true,
          readAt: new Date(),
        },
        {
          where: {
            id: { [Op.in]: notificationIds },
            userId: userId,
          },
        }
      );

      return result; // Returns [affectedCount]
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }

  async getNotifications(userId, page = 1, limit = 20, filter = {}) {
    try {
      if (!this.models?.Notification) {
        throw new Error("Notification model not available");
      }

      const offset = (page - 1) * limit;
      const where = {
        userId: userId,
        [Op.or]: [
          { expiresAt: null }, // Handle notifications without expiry
          { expiresAt: { [Op.gt]: new Date() } },
        ],
        ...filter,
      };

      const { count, rows: notifications } =
        await this.models.Notification.findAndCountAll({
          where,
          order: [["createdAt", "DESC"]],
          offset,
          limit,
        });

      const totalPages = Math.ceil(count / limit);

      return {
        notifications: notifications.map((n) => this.formatNotification(n)),
        total: count,
        page,
        totalPages,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async getNotificationStats(userId) {
    try {
      if (!this.models?.Notification) {
        throw new Error("Notification model not available");
      }

      // Get basic counts
      const total = await this.models.Notification.count({
        where: { userId },
      });

      const unread = await this.models.Notification.count({
        where: { userId, isRead: false },
      });

      const undelivered = await this.models.Notification.count({
        where: { userId, isDelivered: false },
      });

      // Get counts by priority
      const byPriority = await this.models.Notification.findAll({
        attributes: [
          "priority",
          [this.models.sequelize.fn("COUNT", "priority"), "count"],
        ],
        where: { userId },
        group: ["priority"],
        raw: true,
      });

      // Get counts by category
      const byCategory = await this.models.Notification.findAll({
        attributes: [
          "category",
          [this.models.sequelize.fn("COUNT", "category"), "count"],
        ],
        where: { userId },
        group: ["category"],
        raw: true,
      });

      return {
        total,
        unread,
        undelivered,
        byPriority,
        byCategory,
      };
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      throw error;
    }
  }

  isUserOnline(userId) {
    return this.userSockets.has(userId);
  }

  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  async cleanupExpiredNotifications() {
    try {
      if (!this.models?.Notification) {
        console.warn("Notification model not available");
        return { deletedCount: 0 };
      }

      const deletedCount = await this.models.Notification.destroy({
        where: {
          expiresAt: { [Op.lt]: new Date() },
        },
      });

      console.log(`Cleaned up ${deletedCount} expired notifications`);
      return { deletedCount };
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
  }
}

module.exports = new NotificationService();
