const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { db } = require("../dbConfig/config");
const { Model, DataTypes } = require("sequelize");

const utils = {
  generateToken: (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
  },

  generateTokens: (user) => {
    const payload = {
      id: user.id,
      email: user.email,
    };

    return {
      accessToken: utils.generateToken(payload, process.env.JWT_SECRET, "15m"),
      refreshToken: utils.generateToken(
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
      accessToken: utils.generateToken(payload, process.env.JWT_SECRET, "15m"),
      refreshToken: utils.generateToken(
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
                type: DataTypes[col.Type.toUpperCase()] || DataTypes.STRING,
                allowNull: col.Null === "YES",
                primaryKey:
                  col.Key === "PRI" || col.Field.toLowerCase() === "id",

                autoIncrement: col.Extra === "auto_increment",
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

      console.log("Models loaded:", Object.keys(models));
      return models;
    } catch (error) {
      console.error("Error loading models:", error);
      throw error;
    }
  },
};

module.exports = utils;
