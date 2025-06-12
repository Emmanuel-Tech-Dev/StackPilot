const utils = require("../../helpers/functions");
const db = require("../../dbConfig/config");
const { handleErrorResponse } = require("../../middleware/errorHandler");

const loadModels = db.models;
const getUserPermissions = require("../../services/getUserPermissions");

const authLogin = async (req, res) => {
  try {
    const { password, email } = req.body;
    const { User } = db.models;

    if (!req.body)
      return handleErrorResponse(res, 400, "Missing data fields", "error");

    const user = await User.findOne({
      where: {
        email: email,
        status: true,
      },
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    if (!user)
      return handleErrorResponse(
        res,
        404,
        "User not found or user inactive",
        "error"
      );

    const passwordMatch = password; //await comparePassword(password, user.password);

    if (!passwordMatch)
      return handleErrorResponse(res, 400, "Incorrect password", "error");

    let tokens = utils.generateTokens(user);

    const userPermissions = await getUserPermissions(user.id);

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Strict CSRF protection
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // Strict CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send success response
    res.status(200).json({
      message: "Login successful",
      status: "ok",
      data: { user, userPermissions },
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, 500, "Internal Server Error", "error");
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return handleErrorResponse(
        res,
        401,
        "Unauthorized: No refresh token provided"
      );
    }

    // Verify the refresh token
    jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          return handleErrorResponse(
            res,
            403,
            "Forbidden: Invalid refresh token"
          );
        }

        let user;

        // Check if decoded contains index_number or staff_id
        if (decoded.id) {
          // Query for Student
          user = await User.findOne({
            where: { email: decoded.email },
          });
        }

        if (!user) {
          return handleErrorResponse(res, 404, "User not found", "error");
        }

        // Determine the role and payload dynamically
        const payload = {
          id: user.id,
          email: user.email,
        };

        // Generate a new access token
        const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: "15m",
        });

        // Send new access token in an HTTP-only cookie
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Use secure in production
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000, // 15 minutes
        });

        // Send the response
        return res.status(200).json({
          message: "Access token refreshed successfully",
          status: "ok",
        });
      }
    );
  } catch (error) {
    console.log(error.message);
    return handleErrorResponse(res, 500, "Internal server error", "error");
  }
};

const logOut = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  // res.clearCookie("_csrf");
  res
    .status(200)
    .json({ message: "User logged out successfully", status: "ok" });
};

const getUsers = async (req, res) => {
  try {
    const User = db.models.users;
    const users = await User.findAll();
    res.status(200).json({ data: users, status: "ok" });
  } catch (error) {
    console.log(error.message);
    return handleErrorResponse(res, 500, "Internal server error", "error");
  }
};

const creatUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Hash password

    const passwordHash = await utils.hashPassword(password);

    const user = await User.create({
      username,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
    });

    res.status(201).json({
      userId: user.id,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const getRoles = async (req, res) => {
  try {
    const { Roles } = await loadModels();

    const roles = await Roles.findAll();
    res
      .status(200)
      .json({ message: "Operation Successfull", status: "ok", data: roles });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  authLogin,
  refreshToken,
  logOut,
  getUsers,
  creatUser,
  getRoles,
};
