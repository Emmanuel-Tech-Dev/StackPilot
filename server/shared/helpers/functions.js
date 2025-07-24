const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("../dbConfig/config.js");
const NodeCache = require("node-cache");
const { v4: uuidv4 } = require("uuid");
const otp = require("otp");

const { Model, DataTypes, Sequelize } = require("sequelize");
const { add } = require("winston");

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY,
  process.env.KEY_HOOK
); // Must be 32 bytes
const IV_LENGTH = 16;

const cache = new NodeCache({ stdTTL: 3600 }); // 5 mins TTL
const tokenBlacklistSet = new Set();

const Utilities = {
  encrypt: (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  },

  decrypt: (encryptedText) => {
    const [iv, encrypted] = encryptedText.split(":");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      ENCRYPTION_KEY,
      Buffer.from(iv, "hex")
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  },

  generateCustomId(prefix = "USR", length = 6) {
    const uuid = uuidv4().replace(/-/g, "");
    const hexPart = uuid.slice(0, 12); // take first 12 hex characters
    const numeric = parseInt(hexPart, 16).toString().slice(0, length); // convert to number, take first N digits

    return `${prefix}-${numeric}`;
  },

  generateToken: (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
  },

  generateAuthTokens: (user) => {
    const payload = {
      id: user.id,
      custom_id: user.custom_id,
      email: user.email,
    };

    return {
      accessToken: Utilities.generateToken(
        payload,
        process.env.JWT_SECRET,
        "15m"
      ),
      refreshToken: Utilities.generateToken(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        "7d"
      ),
    };
  },

  generateStudentTokens: (student) => {
    const payload = {
      id: student.id,
      name: student.name,
      index_number: student.index_number,
      hall_id: student.hall_affiliate, // Include hall_id if necessary
      role: process.env.STUDENT_ROLE,
    };

    return {
      accessToken: Utilities.generateToken(
        payload,
        process.env.JWT_SECRET,
        "15m"
      ),
      refreshToken: Utilities.generateToken(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        "7d"
      ),
    };
  },

  verifyToken: (token) =>
    new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      });
    }),

  verifyRefereshToken: (token) =>
    new Promise((resolve, reject) => {
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (error, decoded) => {
        if (error) {
          reject(error);
        } else {
          resolve(decoded);
        }
      });
    }),

  blackList() {
    const tokenBlacklist = {
      add(token) {
        tokenBlacklistSet.add(token);
      },
      has(token) {
        return tokenBlacklistSet.has(token);
      },
      remove(token) {
        tokenBlacklistSet.delete(token);
      },
    };

    return tokenBlacklist;
  },

  sendResetLink: async (email, html, subject) => {
    const transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of recipients
      subject: subject,
      html: html,
    };

    await transpoter.sendMail(mailOptions);
  },

  modelColumnDescription: async (tableName, ModelName, db, DataTypes) => {
    try {
      const attributes = await db.getQueryInterface().describeTable(tableName);

      const typeMapping = {
        INT: DataTypes.INTEGER,
        BIGINT: DataTypes.BIGINT,
        SMALLINT: DataTypes.SMALLINT,
        TINYINT: DataTypes.TINYINT,
        DECIMAL: DataTypes.DECIMAL,
        FLOAT: DataTypes.FLOAT,
        DOUBLE: DataTypes.DOUBLE,
        CHAR: DataTypes.CHAR,
        VARCHAR: DataTypes.STRING,
        TEXT: DataTypes.TEXT,
        DATE: DataTypes.DATE,
        DATETIME: DataTypes.DATE,
        TIMESTAMP: DataTypes.DATE,
        BOOLEAN: DataTypes.BOOLEAN,
      };

      Object.entries(attributes).forEach(([column, details]) => {
        const sqlType = details.type.split("(")[0].toUpperCase(); // Extract base type (e.g., "VARCHAR" from "VARCHAR(255)")
        const sequelizeType = typeMapping[sqlType] || DataTypes.STRING; // Default to STRING if unknown type

        if (!ModelName.rawAttributes[column]) {
          ModelName.rawAttributes[column] = { type: sequelizeType };
        }
      });

      ModelName.refreshAttributes(); // Ensure Sequelize recognizes the attributes
    } catch (error) {
      console.error(`Error loading columns for ${tableName} table:`, error);
    }
  },

  hashPassword: async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  },

  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  generateOtpSecret() {
    const secret = otp.utils.generateKey();
    return secret;
  },
  generateOtpCode(secret) {
    const code = otp.totp.gen(secret);
    return code;
  },
  verifyOtp(inputCode, secret) {
    const isValidOtp = otp.totp.check(inputCode, secret);
    return isValidOtp;
  },

  sendOtpPin: async (email, html, subject) => {
    const transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: email, // List of recipients
      subject: subject,
      html: html,
    };

    await transpoter.sendMail(mailOptions);
  },

  getDynamicAssociation: async (model) => {
    try {
      if (!model || !model.sequelize) {
        // console.log("Model or database connection not available");
        return {};
      }

      // Modified query to return results directly
      const foreignKeys = await model.sequelize.query(
        `
        SELECT 
          COLUMN_NAME as columnName,
          REFERENCED_TABLE_NAME as referenceTable,
          REFERENCED_COLUMN_NAME as referenceColumn
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `,
        {
          replacements: [model.sequelize.config.database, model.tableName],
          type: model.sequelize.QueryTypes.SELECT, // This returns array of objects directly
        }
      );

      const associationConfig = {};

      // Debug log to see what we're getting
      // console.log(`Found foreign keys for ${model.tableName}:`, foreignKeys);

      // Process each foreign key
      foreignKeys.forEach((fk) => {
        const referencedModel = model.sequelize.models[fk.referenceTable];
        if (referencedModel) {
          associationConfig[fk.referenceTable] = {
            model: referencedModel,
            foreignKey: fk.columnName,
            as: fk.referenceTable,
            updateFields: ["progress"],
          };
        }
      });

      // console.log(
      //   `Built associations for ${model.tableName}:`,
      //   Object.keys(associationConfig)
      // );
      return associationConfig;
    } catch (error) {
      console.error(
        `Error loading associations for ${
          model?.tableName || "unknown"
        } table:`,
        error
      );
      return {};
    }
  },

  loadDynamicModels: async (db) => {
    try {
      // Get tables using raw query
      const [tables] = await db.query(`
        SELECT TABLE_NAME 
        FROM information_schema.tables 
        WHERE table_schema = '${db.config.database}'
        AND table_type = 'BASE TABLE'
      `);

      const models = {};

      for (const table of tables) {
        const tableName = table.TABLE_NAME;

        // Get table structure
        const [columns] = await db.query(`
          SHOW COLUMNS FROM ${tableName}
        `);

        // Create model with columns
        class DynamicModel extends Model {}
        DynamicModel.init(
          columns.reduce(
            (acc, col) => ({
              ...acc,
              [col.Field]: {
                type: Utilities.getDataType(col),
                allowNull: col.Null === "YES",
                primaryKey:
                  col.Key === "PRI" || col.Field.toLowerCase() === "id",
                autoIncrement: col.Extra === "auto_increment",
                defaultValue: Utilities.setDefaultValue(col.Default, col.Type),
              },
            }),
            {}
          ),
          {
            sequelize: db,
            modelName: tableName,
            tableName: tableName,
            timestamps: true,
            freezeTableName: true,
          }
        );

        models[tableName] = DynamicModel;
      }

      // console.log("Models loaded:", Object.keys(models));
      return models;
    } catch (error) {
      console.error("Error loading models:", error);
      throw error;
    }
  },

  getDataType: (column) => {
    const type = column?.Type?.toLowerCase();

    if (type.includes("datetime")) {
      return DataTypes.DATE;
    }
    if (type.includes("timestamp")) {
      return DataTypes.DATE;
    }
    if (type.includes("date")) {
      return DataTypes.DATEONLY;
    }
    // ... handle other types
    return DataTypes.STRING;
  },

  setDefaultValue: (defaultValue, columnType) => {
    if (defaultValue) return null;

    // Handle CURRENT_TIMESTAMP and similar defaults
    if (defaultValue?.toUpperCase() === "CURRENT_TIMESTAMP") {
      return Sequelize.literal("CURRENT_TIMESTAMP");
    }

    // Handle other date/time defaults
    if (
      columnType?.toLowerCase().includes("datetime") ||
      columnType?.toLowerCase().includes("timestamp")
    ) {
      return defaultValue === "NULL" ? null : Sequelize.literal(defaultValue);
    }

    return defaultValue;
  },

  parseValue(value) {
    if (value === "true") return true;
    if (value === "false") return false;

    // Handle number
    if (!isNaN(value) && value.trim() !== "") return Number(value);

    // Handle array (comma-separated)
    if (value.includes(",")) return value.split(",").map((v) => v.trim());

    // Return as string by default
    return value;
  },

  async getConfigSettings(modelName = "") {
    try {
      const SETTINGS = db.models[modelName];
      const response = await SETTINGS.findAll();
      const obj = {};
      for (const item of response) {
        let value = JSON.parse(item.value); // Utilities.parseValue(item.value;
        obj[item.key] = value;
      }
      return obj;
    } catch (error) {
      throw new Error(`Operation failed!: ${error.message}`);
    }
  },

  async cacheConfigSettings(modelName = "") {
    if (cache.has(modelName)) {
      const config = cache.get(modelName);
      // console.log("Cache hit", config);
      return config;
    }

    const config = await Utilities.getConfigSettings(modelName);
    cache.set(modelName, config);
    return config;
  },

  invalidateCache(key) {
    cache.del(key);
  },

  asyncHandler() {},
};

module.exports = Utilities;
