const db = require("../../shared/dbConfig/config");
const Utilities = require("../../shared/helpers/functions");
const otpService = require("../../shared/helpers/otpService");
const tempUtils = require("../../shared/helpers/utils");
const AppError = require("../../shared/helpers/appError");
const logger = require("../../shared/middleWare/logger");
const { level } = require("winston");
const tokenBlacklist = require("../../shared/helpers/tokenBlacklist");
const { verify } = require("crypto");
const sendSms = require("../../shared/helpers/smsFunction");

class UserService {
  constructor(event) {
    this.event = event;
  }

  static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  static logEvent(event) {
    return new UserService(event);
  }

  async createUserAccount(data, req) {
    try {
      const { password, name, email } = data;
      // const email = data?.email?.toLowerCase();

      const User = db.models.admin;
      if (!email || !password) {
        throw new AppError(
          "Operation failed! missing required fields",
          400,
          "ValidationError",
          {
            user: {
              email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const existingUser = await User.findOne({
        where: {
          email,
          // email: {
          //   [db.Sequelize.Op.like]: email, // PostgreSQL    // or [db.Sequelize.Op.like]: email // MySQL
          // },
        },
      });

      if (existingUser) {
        throw new AppError(
          "User already exist",
          409,
          "AuthError",
          {
            user: {
              email: data?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const hashedPassword = await Utilities.hashPassword(password);
      const cid = Utilities.generateCustomId();

      const user = await User.create(
        {
          name: name,
          email,
          custom_id: cid,
          password: hashedPassword,
          status: 1,
        },
        {
          fields: ["custom_id", "name", "email", "password", "status"],
        }
      );
      const response = {
        success: true,
        status: "success",
        statusCode: 201,
        message: "Operation successful! User account created",
        // data: user,
      };

      logger.app({
        timestamp: new Date().toISOString(),
        event: "USER_ACCOUNT_CREATION_SUCCESSFUL",
        statusCode: response?.statusCode,
        type: "app",
        message: response?.message,
        meta: {
          user: {
            email: data?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });
      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Operation failed!: Service Worker Error ",
        500,
        "AuthError",
        {
          user: {
            email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async authenticate(data, req) {
    try {
      const { password, email } = data;
      const User = db.models.admin;

      if (!email || !password) {
        throw new AppError(
          "Email and password fields required",
          400,
          "ValidationError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new AppError(
          "Operation failed!: user not found",
          404,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      if (user?.status === 0) {
        throw new AppError(
          "User not active. Please contact support.",
          403,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const isPasswordValid = await Utilities.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        throw new AppError(
          "Operation failed! password mismatch",
          403,
          "AuthError",
          {
            user: {
              email: email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      await User.update({ last_login: new Date() }, { where: { email } });

      // Success: generate token and log
      const token = Utilities.generateAuthTokens(user);
      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "User authenticated successfully",
        token,
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "USER_AUTHENTICATION_SUCCESSFUL",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: data?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Authentication failed due to service worker error",
        500,
        "AuthError",
        {
          user: {
            email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async refreshAuthtoken(refreshToken, req) {
    try {
      //   console.log(refreshToken);
      //   return;
      const User = db.models.admin;
      const token = await Utilities.verifyRefreshToken(refreshToken);

      //   console.log(token);
      //   return;
      if (!token || !token.id) {
        throw new AppError(
          "Invalid or expired refresh token",
          400,
          "AuthError",
          {
            user: {
              email: token?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const user = await User.findOne({
        where: { id: token.id },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw new AppError(
          "Operation failed! user not found",
          404,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const newToken = Utilities.generateAuthTokens(user);
      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "Token refreshed successfully",
        token: newToken,
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "USER_TOKEN_REFRESH_SUCCESSFUL",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: user?.email || undefined,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Token refresh failed due to server error",
        500,
        "AuthError",
        {
          user: {
            email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async forgotPassword(user, req) {
    try {
      const { email } = user;

      const User = db.models.admin;

      if (!email) {
        throw new AppError(
          "Operation failed! missing required fields",
          400,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const activeUser = await User.findOne({ where: { email, status: 1 } });

      if (!activeUser) {
        throw new AppError(
          "Operation failed! user not active",
          403,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const secret = otpService.generateOtpSecret();
      const resetToken = otpService.generateOtpCode(secret);

      const encryptedKey = otpService.encryptSecret(
        secret,
        UserService.ENCRYPTION_KEY
      );
      const { encryptedSecret, iv } = encryptedKey;
      //   console.log(encryptedSecret);

      //   return;

      await User.update(
        { token_secret: encryptedSecret, token_iv: iv },
        { where: { email } }
      );

      const html = tempUtils.passwordResetTemplate(resetToken);
      const subject = "Password Reset";

      // Send the reset email
      try {
        await Utilities.sendResetLink(email, html, subject);
      } catch (err) {
        console.error("Error sending reset email:", err.message);

        throw new AppError(
          "Operation failed: error sending reset email",
          503,
          "ValidationError",
          {
            user: {
              email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
            serviceErrorMessage: err?.message,
          },
          { event: this.event }
        );
      }

      const response = {
        success: true,
        status: "success",
        statusCode: 201,
        message: "Operation successful: Password reset email sent",
        // errorMessage: error?.message,
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "PASSWORD_RESET_REQUEST_SUCCESSFUL",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: data?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed: Service worker error",
        500,
        "AuthError",
        {
          user: {
            email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async verifyPasswordResetToken(data, token, req) {
    try {
      const User = db.models.admin;
      const { password, confirmPassword, email } = data;

      if (!email || !password || !confirmPassword) {
        throw new AppError(
          "Operation failed: missing required fields",
          400,
          "ValidationError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      if (password !== confirmPassword) {
        throw new AppError(
          "Operation failed: Passwords do not match",
          401,
          "ValidationError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const user = await User.findOne({
        where: { email },
        attributes: ["id", "email", "token_secret", "token_iv"],
      });

      if (!user) {
        throw new AppError(
          "Operation failed: User not found",
          404,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const secret = otpService.decryptSecret(
        user?.token_secret,
        user?.token_iv,
        UserService.ENCRYPTION_KEY
      );

      if (!secret) {
        throw new AppError(
          "Operation failed: invalid secret key",
          401,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const isValid = otpService.verifyOtp(token, secret, user?.id);
      if (!isValid) {
        throw new AppError(
          "Operation failed: Invalid or expired token",
          401,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const hashedPassword = await Utilities.hashPassword(password);

      await User.update(
        { password: hashedPassword, token_secret: null, token_iv: null },
        { where: { email } }
      );

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "Operation successful: Password reset successful",
        // errorMessage: error?.message,
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "PASSWORD_RESET_TOKEN_VERIFIED",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: data?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed: Service worker error",
        500,
        "AuthError",
        {
          user: {
            email: user?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async logout(token, req) {
    try {
      const { accessToken, refreshToken } = token;
      const User = db.models.admin;

      const verifyToken = await Utilities.verifyToken(accessToken);
      const refToken = await Utilities.verifyRefreshToken(refreshToken);

      // console.log(verifyToken, refToken);
      // return;
      if (!accessToken || !verifyToken) {
        throw new AppError(
          "Invalid access token",
          401,
          "AuthError",
          {
            user: {
              email: verifyToken?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }
      await User.update(
        { last_logout: new Date() },
        { where: { email: verifyToken?.email } }
      );

      tokenBlacklist.blacklistAccessToken(verifyToken?.jti, verifyToken);
      tokenBlacklist.blacklistRefreshToken(refToken?.jti);

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "User logout successfully",
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "USER_LOGOUT_SUCCESSFULL",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: verifyToken?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed! User logout failed due to server error",
        500,
        "AuthError",
        {
          user: {
            // email: verifyToken?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async changePassword(body, req) {
    try {
      const { password, new_password, confirm_password } = body;
      const User = db.models.admin;
      const authUser = req.user;
      if (!password || !new_password || !confirm_password) {
        throw new AppError(
          "Password and confirm password fields required",
          400,
          "ValidationError",
          {
            user: {
              // email: verifyToken?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      if (new_password !== confirm_password) {
        throw new AppError(
          "New password and confirm password does not match",
          400,
          "ValidationError",
          {
            user: {
              // email: verifyToken?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const user = await User.findOne({ where: { email: authUser?.email } });
      if (!user) {
        throw new AppError(
          "Operation failed! user not found",
          404,
          "AuthError",
          {
            user: {
              email: authUser?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const hashedPassword = await Utilities.hashPassword(new_password);
      await User.update(
        { password: hashedPassword },
        { where: { email: authUser?.email } }
      );

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "User password changed successfully",
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "USER_PASSWORD_CHANGE_SUCCESSFULL",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: authUser?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed! User password change failed due to server error",
        500,
        "AuthError",
        {
          user: {
            // email: verifyToken?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async passwordLessAuth(data, req) {
    try {
      const { email } = data;
      const User = db.models.admin;
      if (!email) {
        throw new AppError(
          "Operation failed! missing required fields",
          400,
          "AuthError",
          {
            user: {
              email: email || undefined,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const user = await User.findOne({ where: { email, status: 1 } });

      if (!user) {
        throw new AppError(
          "Operation failed! user not found",
          404,
          "AuthError",
          {
            user: {
              email: user?.email || undefined,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const secret = otpService.generateOtpSecret();
      const resetToken = otpService.generateOtpCode(secret);

      const encryptedKey = otpService.encryptSecret(
        secret,
        UserService.ENCRYPTION_KEY
      );
      const { encryptedSecret, iv } = encryptedKey;

      await User.update(
        { token_secret: encryptedSecret, token_iv: iv },
        { where: { email } }
      );

      const html = tempUtils.otpTemplate(resetToken);
      const subject = "One Time Password";

      // Send the reset email
      try {
        await Utilities.sendResetLink(email, html, subject);
        // await sendSms(
        //   user?.id,
        //   "+233208620668",
        //   "Your verification code is " + resetToken
        // );
      } catch (err) {
        console.error("Error sending reset email:", err.message);

        throw new AppError(
          "Operation failed: error sending reset email",
          503,
          "ValidationError",
          {
            user: {
              email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
            serviceErrorMessage: err?.message,
          },
          { event: this.event }
        );
      }

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "An email with a token has been sent to your email address!",
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "PASSWORD_LESS_TOKEN_SENT_SUCCESSFUL",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: data?.email || undefined,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed! passwordless auth failed due to server error",
        500,
        "AuthError",
        {
          user: {
            email: data?.email || undefined,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }
  async verifyPasswordLessToken(data, req) {
    try {
      const User = db.models.admin;
      const { token, email } = data;

      if (!token || !email) {
        throw new AppError(
          "Operation failed: missing required fields",
          400,
          "ValidationError",
          {
            user: {
              email: email || undefined,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const user = await User.findOne({
        where: { email },
        attributes: ["id", "custom_id", "email", "token_secret", "token_iv"],
      });

      if (!user) {
        throw new AppError(
          "Operation failed: User not found",
          404,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const secret = otpService.decryptSecret(
        user?.token_secret,
        user?.token_iv,
        UserService.ENCRYPTION_KEY
      );

      if (!secret) {
        throw new AppError(
          "Operation failed: invalid secret key",
          401,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      const isValid = otpService.verifyOtp(token, secret, user?.id);
      if (!isValid) {
        throw new AppError(
          "Operation failed: Invalid or expired token",
          401,
          "AuthError",
          {
            user: {
              email: user?.email,
            },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          },
          { event: this.event }
        );
      }

      // await User.update(
      //   { password: hashedPassword, token_secret: null, token_iv: null },
      //   { where: { email } }
      // );
      await User.update(
        { last_login: new Date(), token_secret: null, token_iv: null },
        { where: { email } }
      );
      const tokens = Utilities.generateAuthTokens(user);

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "Operation successful: token verified",
        token: tokens,
      };

      logger.access({
        timestamp: new Date().toISOString(),
        event: "PASSWORD_RESET_TOKEN_VERIFIED",
        statusCode: response?.statusCode,
        type: "Access",
        message: response?.message,
        meta: {
          user: {
            email: data?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
        },
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed: Service worker error",
        500,
        "AuthError",
        {
          user: {
            email: user?.email,
          },
          request: {
            userAgent: req.headers["user-agent"],
            ip: req.ip,
            method: req.method,
            path: req.path,
          },
          serviceErrorMessage: error?.message,
        },
        { event: this.event }
      );
    }
  }

  async resetAuthUserPassword() {}

  async assignRole(user, req) {
    try {
      const { custom_id } = user;

      const res = await db.query(
        `
               SELECT 
  a.custom_id,
  a.name AS admin_name,
  r.role_name AS role_name
FROM admin a
JOIN admin_user_roles aur ON a.custom_id = aur.user_id
JOIN admin_roles r ON aur.role_id = r.role_name
WHERE a.custom_id = :custom_id ;
            
            `,
        {
          replacements: { custom_id },
          type: Sequelize.QueryTypes.SELECT,
          // plain: true,
        }
      );

      console.log("from join", res);
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Role assigning failed due to server error",
        errorMessage: error.message,
      };

      logger.security({
        event: "role_assigning_failed",
        ip: req.ip,
        ...response,
        errorDetails: error,
        timestamp: new Date().toISOString(),
      });

      return response;
    }
  }

  async deactivateUser() {}

  async deleteUser() {}
}

module.exports = UserService;
