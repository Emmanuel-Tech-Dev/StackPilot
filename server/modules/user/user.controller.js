const Utilities = require("../../shared/helpers/functions");
const UserService = require("./user.service");

class UserController {
  async createUserAccount(req, res) {
    const data = req.body;

    const userService = UserService.logEvent("user_account_creation_failed");
    const response = await userService.createUserAccount(data, req);

    res.status(response?.statusCode).json({ ...response });
  }

  async authenticate(req, res) {
    const data = req.body;
    const userService = UserService.logEvent("user_authentication_failed");
    const response = await userService.authenticate(data, req);

    res.cookie("refreshToken", response?.token?.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Strict CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    //   res.cookie("refreshToken", response?.refreshToken, { httpOnly: true });
    res.status(response?.statusCode).json({ ...response });
  }

  async refreshAuthToken(req, res) {
    const refreshToken = req.cookies.refreshToken;
    let oldAccessToken = req.headers.authorization;
    const blackList = Utilities.blackList();
    // console.log(req.headers.authorization);
    // return;
    if (oldAccessToken && oldAccessToken.startsWith("Bearer ")) {
      oldAccessToken = oldAccessToken.slice(7).trim();

      blackList.add(oldAccessToken); // Blacklist the old access token
    }

    const userService = UserService.logEvent("REFRESH_TOKEN_FAILED");
    const response = await userService.refreshAuthtoken(refreshToken, req);
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
  }

  async forgetPassword(req, res) {
    const data = req.body;
    const userService = UserService.logEvent("PASSWORD_RESET_REQUEST_FAILED");
    const response = await userService.forgotPassword(data, req);
    res.status(response?.statusCode).json({ ...response });
  }

  async verifyPasswordRestToken(req, res) {
    const data = req.body;
    const { token } = req.params;
    const userService = UserController.logEvent(
      "PASSWORD_RESET_TOKEN_VERIFICATION_FAILED"
    );
    const response = await userService.verifyPasswordResetToken(
      data,
      token,
      req
    );
    res.status(response?.statusCode).json({ ...response });
  }

  async logoutUser(req, res) {
    const tokens = {
      accessToken: req.headers.authorization?.replace("Bearer ", ""),
      // refreshToken: req.cookies.refreshToken,
    };

    res.clearCookie("refreshToken");
    const userService = UserService.logEvent("USER_LOGOUT_FAILED");
    const response = await userService.logout(tokens, req);
    res.status(response.statusCode).json(response);
  }
}

module.exports = new UserController();
