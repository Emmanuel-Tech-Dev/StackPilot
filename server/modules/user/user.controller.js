const Utilities = require("../../shared/helpers/functions");
const UserService = require("./user.service");

class UserController {
  async createUserAccount(req, res) {
    try {
      const data = req.body;
      //   console.log(data);
      //   return;
      const response = await UserService.createUserAccount(data, req);
      res.status(response?.statusCode).json({ ...response });
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed! ",
        errorMessage: error.message,
        errorDetails: error,
      };
      //   logger.error({ ...response, errorDetails: error });
      res.status(response?.statusCode).json({ ...response });
    }
  }

  async authenticate(req, res) {
    try {
      const data = req.body;
      const response = await UserService.authenticate(data, req);

      res.cookie("refreshToken", response?.token?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Strict CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      //   res.cookie("refreshToken", response?.refreshToken, { httpOnly: true });
      res.status(response?.statusCode).json({ ...response });
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed! ",
        errorMessage: error.message,
        errorDetails: error,
      };
      //   logger.error({ ...response, errorDetails: error });
      res.status(response?.statusCode).json({ ...response });
    }
  }

  async refreshAuthToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      let oldAccessToken = req.headers.authorization;

      //   console.log(req.headers.authorization);
      //   return;
      //   if (oldAccessToken && oldAccessToken.startsWith("Bearer ")) {
      //     oldAccessToken = oldAccessToken.slice(7).trim();
      //     Utilities.tokenBlacklist.add(oldAccessToken); // Blacklist the old access token
      //   }
      const response = await UserService.refreshAuthtoken(refreshToken, req);
      //   console.log("RefreshAuthToken: ", response);
      //   return;
      if (!response) return;
      res.clearCookie("refreshToken");

      res.cookie("refreshToken", response?.token?.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        sameSite: "strict", // Strict CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(response?.statusCode).json({ ...response });
    } catch (error) {
      const response = {
        success: false,
        status: "error",
        statusCode: 500,
        message: "Operation failed! ",
        errorMessage: error.message,
        // errorDetails:error
      };

      res.status(response?.statusCode).json({ ...response });
    }
  }
}

module.exports = new UserController();
