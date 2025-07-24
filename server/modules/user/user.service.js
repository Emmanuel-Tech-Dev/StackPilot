const db = require("../../shared/dbConfig/config");
const Utilities = require("../../shared/helpers/functions");
const otpService = require("../../shared/helpers/otpService");
const tempUtils = require("../../shared/helpers/utils");
const AppError = require("../../shared/helpers/appError");
const logger = require("../../shared/middleWare/logger");

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
      const { password, email } = data;

      const User = db.models.admin;
      if (!email || !password) {
        throw new AppError(
          "Operation failed! missing required fields",
          400,
          "ValidationError",
          { ...data },
          { ip: req.ip, event: this.event }
        );
      }

      const existingUser = User.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new AppError(
          "User already exist",
          409,
          "AuthError",
          { email: data?.email },
          { ip: req.ip, event: this.event }
        );
      }

      const hashedPassword = await Utilities.hashPassword(password);
      const cid = Utilities.generateCustomId();

      const user = await User.create({
        ...data,
        custom_id: cid,
        password: hashedPassword,
        status: 1,
      });
      const response = {
        success: true,
        status: "success",
        statusCode: 201,
        message: "Operation successful! User account created",
        // data: user,
      };

      logger.security({
        event: "user_account_creation_success",
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });
      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Operation failed!: Service Worker Error ",
        500,
        "AuthError",
        { email: data?.email, serviceError: error },
        { ip: req.ip, event: this.event }
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
          { email },
          { ip: req.ip, event: this.event }
        );
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw new AppError(
          "Operation failed!: user not found",
          404,
          "AuthError",
          { email: user?.email },
          { ip: req.ip, event: this.event }
        );
      }

      if (user?.status === 0) {
        throw new AppError(
          "User not active. Please contact support.",
          403,
          "AuthError",
          { email },
          { ip: req.ip, event: this.event }
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
          { email },
          { ip: req.ip, event: this.event }
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

      logger.security({
        event: "authenticate_user",
        ip: req.ip,
        email,
        userId: user.custom_id,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Authentication failed due to service worker error",
        500,
        "AuthError",
        { email, serviceError: error.message },
        { ip: req.ip, event: this.event }
      );
    }
  }

  async refreshAuthtoken(refreshToken, req) {
    try {
      //   console.log(refreshToken);
      //   return;
      const User = db.models.admin;
      const token = await Utilities.verifyRefereshToken(refreshToken);

      //   console.log(token);
      //   return;
      if (!token || !token.id) {
        throw new AppError(
          "Invalid or expired refresh token",
          400,
          "AuthError",
          { email },
          { ip: req.ip, event: this.event }
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
          { email: user?.email },
          { ip: req.ip, event: this.event }
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

      logger.security({
        event: "refresh_token_success",
        ip: req.ip,
        userId: user.id,
        status: "success",
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Token refresh failed due to server error",
        500,
        "AuthError",
        { serviceError: error.message },
        { ip: req.ip, event: this.event }
      );
    }
  }

  async otpLogin() {}

  async verifyOtp() {}

  async changePassword() {}

  async forgotPassword(user, req) {
    try {
      const { email } = user;

      const User = db.models.admin;

      if (!email) {
        throw new AppError(
          "Operation failed! missing required fields",
          400,
          "AuthError",
          { email },
          { ip: req.ip, event: this.event }
        );
      }

      const activeUser = await User.findOne({ where: { email, status: 1 } });

      if (!activeUser) {
        throw new AppError(
          "Operation failed! user not active",
          403,
          "AuthError",
          { email: user?.email },
          { ip: req.ip, event: this.event }
        );
      }

      const secret = otpService.generateOtpSecret();
      const resetToken = otpService.generateOtpCode(secret);

      const encrypted = otpService.encryptSecret(
        secret,
        UserService.ENCRYPTION_KEY
      );
      const { encryptedSecret, iv } = encrypted;
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
          "AuthError",
          { email: user?.email, mailerError: err?.message },
          { ip: req.ip, event: this.event }
        );
      }

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "Operation successful: Password reset email sent",
        // errorMessage: error?.message,
      };

      logger.security({
        event: "PASSWORD_RESET_REQUESTED",
        ip: req.ip,
        email,
        userId: user.custom_id,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed: Service worker error",
        500,
        "AuthError",
        { email: user?.email, serviceError: error?.message },
        { ip: req.ip, event: this.event }
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
          { email },
          { ip: req.ip, event: this.event }
        );
      }

      if (password !== confirmPassword) {
        throw new AppError(
          "Operation failed: Passwords do not match",
          401,
          "ValidationError",
          { email },
          { ip: req.ip, event: this.event }
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
          { email },
          { ip: req.ip, event: this.event }
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
          { email },
          { ip: req.ip, event: this.event }
        );
      }

      const isValid = otpService.verifyOtp(token, secret, user?.id);
      if (!isValid) {
        throw new AppError(
          "Operation failed: Invalid or expired token",
          401,
          "AuthError",
          { email },
          { ip: req.ip, event: this.event }
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

      logger.security({
        event: "PASSWORD_RESET_TOKEN_VERIFIED",
        email,
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed: Service worker error",
        500,
        "AuthError",
        { email, serviceError: error?.message },
        { ip: req.ip, event: this.event }
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

  async logout(token, req) {
    try {
      const { accessToken, refreshToken } = token;
      const User = db.models.admin;

      const verifyToken = await Utilities.verifyToken(accessToken);

      if (!accessToken) {
        throw new AppError(
          "Invalid access token",
          401,
          "AuthError",
          {},
          { ip: req.ip, event: this.event }
        );
      }
      await User.update(
        { last_logout: new Date() },
        { where: { email: verifyToken?.email } }
      );

      const blackList = Utilities.blackList();
      blackList.add(accessToken);

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "User logout successfully",
      };

      logger.security({
        event: "USER_LOGOUT",
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;

      throw new AppError(
        "Operation failed! User logout failed due to server error",
        500,
        "AuthError",
        { serviceError: error?.message },
        { ip: req.ip, event: this.event }
      );
    }
  }
}

module.exports = UserService;
