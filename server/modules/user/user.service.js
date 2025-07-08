const db = require("../../shared/dbConfig/config");
const Utilities = require("../../shared/helpers/functions");
const logger = require("../../shared/middleWare/logger");

class UserService {
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

  async logout() {}
}

module.exports = new UserService();
