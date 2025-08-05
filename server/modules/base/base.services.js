const db = require("../../shared/dbConfig/config");
const QueryBuilder = require("../../shared/helpers/queryUtils");
// const ResponseHandler = require("../../shared/middleWare/responseHandler");
const Utilities = require("../../shared/helpers/functions");
const logger = require("../../shared/middleWare/logger");
const AppError = require("../../shared/helpers/appError");
class CrudOperation {
  static apisettings = "apisettings";

  constructor(data, config = {}) {
    this.queryString = config?.queryString;
    this.tableModel = config?.tableModel;
    this.association = config?.association || {};
    this.data = data || {};
    this.id = config?.id;
    this.authID = config?.authID;
    this.userTableModel = config?.userTableModel;
    this.modelconfig = config?.config;
    this.sequelize = db.sequelize || db;
    // this.req = req;
    // this.apiSettingsCache = new Map();
    // this.apisettings = "apisettings";
  }

  async readService(req) {
    try {
      const SETTINGS_KEY = CrudOperation.apisettings;
      let getApiQueryConfig;

      if (SETTINGS_KEY) {
        getApiQueryConfig = await Utilities.cacheConfigSettings(SETTINGS_KEY);
      }

      const query = new QueryBuilder(
        this.queryString,
        this.association,
        getApiQueryConfig || {}
      );
      // query.configSettings = getApiQueryConfig;

      const options = query.build(this.tableModel);

      const start = Date.now();

      const { count, rows } = await this.tableModel.findAndCountAll(options);
      const end = Date.now();
      const totalPages = Math.ceil(count / options.limit);
      if (this.queryString.page > totalPages && count > 0) {
        options.offset = (totalPages - 1) * options.limit;
      }
      const currentPage = Math.floor(options.offset / options.limit) + 1;

      query._recordQueryStats(end - start);
      const response = {
        success: true,
        message: count === 0 ? "No data found" : "Data successfully fetched",
        status: "ok",
        statusCode: 200,
        data: rows,
        meta: {
          pagination: {
            totalItems: count,
            totalPages,
            currentPage,
            limit: options.limit,
          },
          filters: count === 0 ? {} : query.query,
        },
        //queryStats: query.getStats(),
      };

      logger.query({
        timestamp: new Date().toISOString(),
        event: "QUERY_LOGS",
        statusCode: response?.statusCode,
        type: "query",
        message: "Query executed successfully",
        meta: {
          qeuryString: this.queryString,
          filter: response?.meta?.filters,
          queryStats: response.queryStats,
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
        "QueryError",
        {
          user: {
            email: req?.user?.email,
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

  async readAService(req) {
    try {
      const record = await this.tableModel.findByPk(this.id);
      //   console.log("A single read:", record);
      if (!record) {
        throw new AppError(
          `Data not found with ID - ${this.id}`,
          404,
          "ValidationError",
          {
            item: { id: this.id },
            request: {
              userAgent: req.headers["user-agent"],
              ip: req.ip,
              method: req.method,
              path: req.path,
            },
          }
        );
      }

      const response = {
        message: "Data successfully fetched",
        status: "Ok",
        data: record,
        statusCode: 200,
      };
      return response;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        "Operation failed!: Service Worker Error ",
        500,
        "QueryError",
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

  async readAuthUserService(req) {
    try {
      const user = await this.userTableModel.findByPk(this.authID);

      if (!user) {
        throw new AppError(
          "Operation failed!: user not found",
          404,
          "QueryError",
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

      const query = new QueryBuilder(
        queryString
        //association
      );

      const options = query.build();
      const { count, rows } = await tableModel.findAndCountAll(options);

      const totalPages = Math.ceil(count / options.limit);
      if (queryString.page > totalPages && count > 0) {
        options.offset = (totalPages - 1) * options.limit;
      }
      const currentPage = Math.floor(options.offset / options.limit) + 1;

      const formattedRows = rows.map((row) => row.get({ plain: true }));

      const response = {
        success: true,
        message: count === 0 ? "No data found" : "Data successfully fetched",
        status: "Ok",
        data: formattedRows,
        meta: {
          pagination: {
            totalItems: count,
            totalPages,
            currentPage,
            limit: options.limit,
          },
          filters: count === 0 ? {} : query.query,
        },
      };

      logger.query({
        timestamp: new Date().toISOString(),
        event: "QUERY_LOGS",
        statusCode: response?.statusCode,
        type: "query",
        message: "Query executed successfully",
        meta: {
          user: {
            email: user?.email,
          },
          qeuryString: this.queryString,
          filter: response?.meta?.filters,
          queryStats: response.queryStats,
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
        "QueryError",
        {
          user: {
            email: req.user?.email,
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

  async createService(req) {
    let dbTransaction;
    try {
      const {
        mainModel, // The model we're creating a record for
        userModel, // User model for validation
        associationConfig, // Configuration for associated models
        customFields = {}, // Custom field mappings
      } = this.modelconfig;

      const { user_custom_id, assoc_custom_id, ...recordData } = this.data;
      // console.log("data from postman", this.data);
      let user;

      dbTransaction = await this.sequelize.transaction();

      // 1. Validate user
      if (user_custom_id) {
        user = await userModel.findOne({
          where: { custom_id: user_custom_id },
          attributes: ["custom_id"],
          // dbTransaction,
        });

        if (!user) {
          if (dbTransaction) await dbTransaction.rollback();
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
      }

      // 2. Prepare base record data
      const baseRecordData = {
        ...recordData,
        user_custom_id: user?.custom_id,
        // description: customFields.defaultDescription || "incomplete",
      };

      // 3. Handle associated record if provided
      if (assoc_custom_id && associationConfig) {
        const {
          model: associatedModelPromise,
          customIdField,
          updateFields = [],
        } = associationConfig;

        try {
          const associatedModel = await associatedModelPromise;
          const associatedRecord = await associatedModel.findOne({
            where: {
              custom_id: assoc_custom_id,
            },
            attributes: ["id", "custom_id"],
            dbTransaction,
          });

          //   console.log(associatedRecord);
          if (!associatedRecord) {
            if (dbTransaction) await dbTransaction.rollback();

            throw new AppError(
              "Operation failed!: records not found",
              404,
              "AccessError",
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

          // Update associated record if needed
          if (updateFields.length > 0) {
            const updateData = {};
            updateFields.forEach((field) => {
              if (data[field] !== undefined) {
                updateData[field] = data[field];
              }
            });

            if (Object.keys(updateData).length > 0) {
              await associatedModel.update(updateData, {
                where: { custom_id: associatedRecord.custom_id },
                dbTransaction,
              });
            }
          }

          // Add association custom ID to base record
          if (customIdField) {
            baseRecordData[customIdField] = associatedRecord.custom_id;
          }
        } catch (assocError) {
          if (dbTransaction) await dbTransaction.rollback();
          throw new AppError(
            "Operation failed!: Service Worker Error ",
            500,
            "AccessError",
            {
              user: {
                email: req?.user?.email,
              },
              request: {
                userAgent: req.headers["user-agent"],
                ip: req.ip,
                method: req.method,
                path: req.path,
              },
              serviceErrorMessage: assocError?.message,
            },
            { event: this.event }
          );
        }
      }

      // 4. Create the record
      const record = await mainModel.create(baseRecordData, { dbTransaction });

      if (!record) {
        if (dbTransaction) await dbTransaction.rollback(); // <-- Add this check

        throw new AppError(
          "Operation failed!: Data not created",
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
      if (dbTransaction) await dbTransaction.commit(); // <-- Add this check
      return {
        message: "Data successfully created",
        status: "Ok",
        data: record,
        statusCode: 201,
      };
    } catch (error) {
      console.error("Error creating record:", error);
      if (dbTransaction) await dbTransaction.rollback(); // <-- Add this check
      throw new AppError(
        "Operation failed!: Service Worker Error ",
        500,
        "AccessError",
        {
          user: {
            email: req?.user?.email,
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

  async updateService(req) {
    try {
      const user = await this.userTableModel.findOne({
        where: { custom_id: this.data.user_custom_id },
        attribuites: ["id", "custom_id"],
      });
      if (!user) {
        return (data = {
          message: "User not found",
          status: "error",
          statusCode: 404,
        });
      }
      const updatedRecord = await this.tableModel.update(
        { ...this.data },
        {
          where: { id: this.id, user_custom_id: user.custom_id },
        }
      );

      if (!updatedRecord) {
        return (data = {
          message: "Data not updated",
          status: "error",
          statusCode: 400,
        });
      }
      return (data = {
        message: "Data successfully updated",
        status: "Ok",
        // statusCode: 200,
      });
    } catch (error) {
      throw new AppError(
        "Operation failed!: Service Worker Error ",
        500,
        "AccessError",
        {
          user: {
            email: req?.user?.email,
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
  async deleteService() {
    try {
      // const user = await this.userTableModel.findOne({
      //   where: { id: this.authID },
      //   attribuites: ["id", "custom_id"],
      // });
      // if (!user) {
      //   return (data = {
      //     message: "User not found",
      //     status: "error",
      //     statusCode: 404,
      //   });
      // }

      const deletedRecord = await this.tableModel.destroy({
        where: { id: this.id /*user_custom_id: user.custom_id */ },
      });
      if (!deletedRecord) {
        const response = {
          message: "Operation failed! data not found",
          status: "error",
          statusCode: 404,
        };
        return response;
      }
      const response = {
        message: "Data successfully deleted",
        status: "Ok",
        statusCode: 201,
      };
      return response;
    } catch (error) {
      throw new AppError(
        "Operation failed!: Service Worker Error ",
        500,
        "AccessError",
        {
          user: {
            email: req?.user?.email,
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
}

module.exports = CrudOperation;
