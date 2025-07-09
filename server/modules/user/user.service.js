const db = require("../../shared/dbConfig/config");
const Utilities = require("../../shared/helpers/functions");
const otpService = require("../../shared/helpers/otpService");
const tempUtils = require("../../shared/helpers/utils");
const logger = require("../../shared/middleWare/logger");
const crypto = require("crypto");

class UserService {
  // constructor(data , req){
  //   this.createUserAccount(data , req)
  //   this.
  // }

  static ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  async createUserAccount(data, req) {
    try {
      const { password } = data;
      //   console.log(password);
      //   return;
      const User = db.models.admin;
      if (!data) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "Operation failed! Data not found",
        };
        return response;
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
        event: "create_User_Account",
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });
      return response;
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed!: User account creation failed",
        errorMessage: error.message,
      };

      logger.security({
        event: "create_User_Account",
        ip: req.ip,
        ...response,
        message: "User account creation failed",
        errorDetails: error,
        timestamp: new Date().toISOString(),
      });

      return response;
    }
  }

  async authenticate(data, req) {
    try {
      const { password, email } = data;
      const User = db.models.admin;

      if (!email || !password) {
        const response = {
          success: false,
          status: "error",
          statusCode: 400,
          message: "Email and password are required",
        };
        logger.security({
          event: "failed_authentication",
          ip: req.ip,
          email,
          message: "Missing email or password",
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      const user = await User.findOne({ where: { email } });

      if (!user) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "User not found",
        };
        logger.security({
          event: "failed_authentication",
          ip: req.ip,
          email,
          message: "User not found",
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      if (user?.status === 0) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "User not active",
        };
        logger.security({
          event: "failed_authentication",
          ip: req.ip,
          email,
          message: "User not active",
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      const isPasswordValid = await Utilities.comparePassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        const response = {
          success: false,
          status: "error",
          statusCode: 401,
          message: "Invalid password",
        };
        logger.security({
          event: "failed_authentication",
          ip: req.ip,
          email,
          message: "Invalid password",
          timestamp: new Date().toISOString(),
        });
        return response;
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
        userId: user.id,
        status: "success",
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Authentication failed due to server error",
        errorMessage: error.message,
      };

      logger.security({
        event: "authenticate_user",
        ip: req.ip,
        email: data?.email,
        status: "error",
        message: "Authentication failed due to server error",
        errorDetails: error.message,
        timestamp: new Date().toISOString(),
      });

      return response;
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
        const response = {
          success: false,
          status: "error",
          statusCode: 401,
          message: "Invalid or expired refresh token",
        };

        logger.security({
          event: "refresh_token_failed",
          ip: req.ip,
          status: "error",
          message: "Invalid or expired refresh token",
          timestamp: new Date().toISOString(),
        });

        return response;
      }

      const user = await User.findOne({
        where: { id: token.id },
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "User not found",
        };
        return response;
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
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Token refresh failed due to server error",
        errorMessage: error,
      };

      logger.security({
        event: "refresh_token_failed",
        ip: req.ip,
        ...response,
        errorDetails: error,
        timestamp: new Date().toISOString(),
      });

      return response;
    }
  }

  async otpLogin() {}

  async verifyOtp() {}

  async changePassword() {}

  async forgotPassword(user, req) {
    try {
      const { email } = user;

      const User = db.models.admin;

      const activeUser = await User.findOne({ where: { email, status: 1 } });

      if (!activeUser) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "Operation failed: User not found or inactive",
          // errorMessage: error?.message,
        };

        logger.security({
          event: "password_reset_via_mail",
          ip: req.ip,
          ...response,
          timestamp: new Date().toISOString(),
        });

        return response;

        // Generate reset token and expiration
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
        const response = {
          success: false,
          status: "error",
          statusCode: 500,
          message: "Operation failed: error sending reset email",
          errorMessage: err.message,
        };
        logger.security({
          event: "password_reset_via_mail",
          ip: req.ip,
          ...response,
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      const response = {
        success: true,
        status: "success",
        statusCode: 200,
        message: "Operation successful: Password reset email sent",
        // errorMessage: error?.message,
      };

      return response;
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed: sever error",
        errorMessage: error?.message,
      };

      logger.security({
        event: "password_reset_via_mail",
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
    }
  }

  async verifyPasswordResetToken(data, token, req) {
    try {
      const User = db.models.admin;
      const { password, confirmPassword, email } = data;

      if (password !== confirmPassword) {
        const response = {
          success: false,
          status: "error",
          statusCode: 400,
          message: "Operation failed: Passwords do not match",
        };

        logger.security({
          event: "password_reset_verification",
          ip: req.ip,
          ...response,
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      const user = await User.findOne({
        where: { email },
        attributes: ["id", "email", "token_secret", "token_iv"],
      });

      if (!user) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "Operation failed: User not found",
        };

        logger.security({
          event: "password_reset_verification",
          ip: req.ip,
          ...response,
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      const secret = otpService.decryptSecret(
        user?.token_secret,
        user?.token_iv,
        UserService.ENCRYPTION_KEY
      );

      if (!secret) {
        const response = {
          success: false,
          status: "error",
          statusCode: 404,
          message: "Operation failed: User not found",
        };

        logger.security({
          event: "password_reset_verification",
          ip: req.ip,
          ...response,
          timestamp: new Date().toISOString(),
        });
        return response;
      }

      const isValid = otpService.verifyOtp(token, secret, user?.id);
      if (!isValid) {
        const response = {
          success: false,
          status: "error",
          statusCode: 400,
          message: "Operation failed: Invalid or expired token",
        };

        logger.security({
          event: "password_reset_verification",
          ip: req.ip,
          ...response,
          timestamp: new Date().toISOString(),
        });
        return response;
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

      return response;
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed: sever error",
        errorMessage: error?.message,
      };

      logger.security({
        event: "password_reset_verification",
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
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
        const response = {
          success: false,
          status: "error",
          statusCode: 401,
          message: "Invalid access token",
        };
        logger.security({
          event: "logout_user",
          ip: req.ip,
          status: "error",
          message: "Invalid access token",
          timestamp: new Date().toISOString(),
        });

        return response;
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
        event: "logout_user",
        ip: req.ip,
        status: "success",
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "User logout failed due to server error",
        errorMessage: error,
      };

      logger.security({
        event: "logout_user",
        ip: req.ip,
        ...response,
        timestamp: new Date().toISOString(),
      });

      return response;
    }
  }
}

module.exports = new UserService();
