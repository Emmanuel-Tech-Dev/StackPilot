const { Op, Sequelize } = require("sequelize");
const crypto = require("crypto");

class QueryBuilder {
  constructor(query, association, config = {}) {
    this.query = query || {};
    this.association = association || {};
    this.config = {
      maxLimit: 1000,
      defaultLimit: 10,
      maxJoins: 3,
      maxFilterComplexity: 10,
      enableCache: false,
      queryTimeout: 30000,
      enableFullTextSearch: false,
      enableQueryLogging: false,
      cacheTTL: 300, // 5 minutes
      executionTimeThreshold: 1000,
      ...config,
    };

    this.excludedKeys = [
      "page",
      "limit",
      "sortBy",
      "sortOrder",
      "sort",
      "fields",
      "excludedFields",
      "q",
      "offset",
      "include",
      "aggregate",
      "groupBy",
    ];

    this.cache = new Map(); // Simple in-memory cache (use Redis in production)
    this.queryStats = {
      executionCount: 0,
      totalExecutionTime: 0,
      slowQueries: [],
    };
  }

  // Validation method to prevent query complexity explosion
  validateQuery() {
    const filterCount = Object.keys(this.Filters).length;
    if (filterCount > this.config.maxFilterComplexity) {
      throw new Error(
        `Query too complex - reduce number of filters. Maximum: ${this.config.maxFilterComplexity}`
      );
    }

    const joinCount = this.Joins.length;
    if (joinCount > this.config.maxJoins) {
      throw new Error(
        `Too many joins requested. Maximum: ${this.config.maxJoins}`
      );
    }

    // Validate pagination limits
    const { limit } = this.query;
    if (limit && parseInt(limit, 10) > this.config.maxLimit) {
      throw new Error(
        `Limit too high. Maximum allowed: ${this.config.maxLimit}`
      );
    }
  }

  get Filters() {
    const filters = {};

    for (const key in this.query) {
      if (this.excludedKeys.includes(key)) continue;

      try {
        let matched = false;

        switch (key) {
          case key.endsWith("[gte]"): {
            const field = key.replace("[gte]", "");
            this._validateFieldName(field);
            filters[field] = {
              ...filters[field],
              [Op.gte]: this._sanitizeValue(this.query[key]),
            };
            matched = true;
            break;
          }

          case key.endsWith("[lte]"): {
            const field = key.replace("[lte]", "");
            this._validateFieldName(field);
            filters[field] = {
              ...filters[field],
              [Op.lte]: this._sanitizeValue(this.query[key]),
            };
            matched = true;
            break;
          }

          case key.endsWith("[gt]"): {
            const field = key.replace("[gt]", "");
            this._validateFieldName(field);
            filters[field] = {
              ...filters[field],
              [Op.gt]: this._sanitizeValue(this.query[key]),
            };
            matched = true;
            break;
          }

          case key.endsWith("[lt]"): {
            const field = key.replace("[lt]", "");
            this._validateFieldName(field);
            filters[field] = {
              ...filters[field],
              [Op.lt]: this._sanitizeValue(this.query[key]),
            };
            matched = true;
            break;
          }

          case key.endsWith("[ne]"):
          case key.endsWith("[not]"): {
            const suffix = key.endsWith("[ne]") ? "[ne]" : "[not]";
            const field = key.replace(suffix, "");
            this._validateFieldName(field);
            filters[field] = {
              ...filters[field],
              [Op.not]: this._sanitizeValue(this.query[key]),
            };
            matched = true;
            break;
          }

          case key.endsWith("[in]"): {
            const field = key.replace("[in]", "");
            this._validateFieldName(field);
            const values = this.query[key]
              .split(",")
              .map((v) => this._sanitizeValue(v.trim()));
            if (values.length > 100) {
              throw new Error(
                `Too many values in IN clause for ${field}. Maximum: 100`
              );
            }
            filters[field] = { ...filters[field], [Op.in]: values };
            matched = true;
            break;
          }

          case key.endsWith("[between]"): {
            const field = key.replace("[between]", "");
            this._validateFieldName(field);
            const values = this.query[key]
              .split(",")
              .map((v) => this._sanitizeValue(v.trim()));
            if (values.length !== 2) {
              throw new Error(
                `Invalid BETWEEN clause for ${field}. Must be two values.`
              );
            }
            filters[field] = { [Op.between]: values };
            matched = true;
            break;
          }

          case key.endsWith("[notBetween]"): {
            const field = key.replace("[notBetween]", "");
            this._validateFieldName(field);
            const values = this.query[key]
              .split(",")
              .map((v) => this._sanitizeValue(v.trim()));
            if (values.length !== 2) {
              throw new Error(
                `Invalid NOT BETWEEN clause for ${field}. Must be two values.`
              );
            }
            filters[field] = { [Op.notBetween]: values };
            matched = true;
            break;
          }

          case key.endsWith("[like]"): {
            const field = key.replace("[like]", "");
            this._validateFieldName(field);
            filters[field] = {
              [Op.like]: `%${this._sanitizeValue(this.query[key])}%`,
            };
            matched = true;
            break;
          }

          case key.endsWith("[notLike]"): {
            const field = key.replace("[notLike]", "");
            this._validateFieldName(field);
            filters[field] = {
              [Op.notLike]: `%${this._sanitizeValue(this.query[key])}%`,
            };
            matched = true;
            break;
          }

          case key.endsWith("[iLike]"): {
            const field = key.replace("[iLike]", "");
            this._validateFieldName(field);
            filters[field] = {
              [Op.iLike]: `%${this._sanitizeValue(this.query[key])}%`,
            };
            matched = true;
            break;
          }

          case key.endsWith("[notILike]"): {
            const field = key.replace("[notILike]", "");
            this._validateFieldName(field);
            filters[field] = {
              [Op.notILike]: `%${this._sanitizeValue(this.query[key])}%`,
            };
            matched = true;
            break;
          }

          case key.endsWith("[startsWith]"): {
            const field = key.replace("[startsWith]", "");
            this._validateFieldName(field);
            filters[field] = {
              [Op.like]: `${this._sanitizeValue(this.query[key])}%`,
            };
            matched = true;
            break;
          }

          case key.endsWith("[endsWith]"): {
            const field = key.replace("[endsWith]", "");
            this._validateFieldName(field);
            filters[field] = {
              [Op.like]: `%${this._sanitizeValue(this.query[key])}`,
            };
            matched = true;
            break;
          }

          case key === "name_like": {
            filters.name = {
              [Op.like]: `${this._sanitizeValue(this.query[key])}%`,
            };
            matched = true;
            break;
          }
        }

        if (!matched && !key.includes("[") && !key.includes("]")) {
          this._validateFieldName(key);
          filters[key] = this._sanitizeValue(this.query[key]);
        }
      } catch (error) {
        if (this.config.enableQueryLogging) {
          console.warn(
            `Filter validation error for key ${key}:`,
            error.message
          );
        }
        // skip invalid filters
      }
    }

    return filters;
  }

  get Search() {
    const { q } = this.query;
    if (!q || typeof q !== "string") return {};
    const sanitizedQuery = this._sanitizeValue(q);

    // Define available columns for this table
    const availableColumns = ["name", "description", "custom_id"]; // Add actual columns from goals table

    if (this.config.enableFullTextSearch) {
      try {
        // Only use columns that exist
        const columnsForFullText = availableColumns.filter(
          (col) => ["name", "description"].includes(col) // Only text columns suitable for full-text
        );

        return {
          [Op.and]: [
            Sequelize.where(
              Sequelize.fn(
                "MATCH",
                ...columnsForFullText.map((col) => Sequelize.col(col))
              ),
              {
                [Op.eq]: Sequelize.literal(
                  `AGAINST(${Sequelize.escape(sanitizedQuery)} IN BOOLEAN MODE)`
                ),
              }
            ),
          ],
        };
      } catch (error) {
        if (this.config.enableQueryLogging) {
          console.warn(
            "Full-text search failed, falling back to LIKE:",
            error.message
          );
        }
      }
    }

    // Build OR conditions only for existing columns
    const searchConditions = [];

    if (availableColumns.includes("name")) {
      searchConditions.push({ name: { [Op.like]: `${sanitizedQuery}%` } });
    }

    if (availableColumns.includes("description")) {
      searchConditions.push({
        description: { [Op.like]: `%${sanitizedQuery}%` },
      });
    }

    if (availableColumns.includes("custom_id")) {
      searchConditions.push({ custom_id: { [Op.like]: `${sanitizedQuery}%` } });
    }

    return searchConditions.length > 0 ? { [Op.or]: searchConditions } : {};
  }

  get Sorting() {
    const { sortBy = null, sortOrder = null, sort = null } = this.query;

    if (sortBy && sortOrder) {
      this._validateFieldName(sortBy);
      const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
      return [[sortBy, order]];
    }

    if (sort) {
      const sortFields = sort.split(",").map((field) => {
        const isDesc = field.startsWith("-");
        const fieldName = isDesc ? field.substring(1) : field;
        this._validateFieldName(fieldName);
        return [fieldName, isDesc ? "DESC" : "ASC"];
      });

      // Limit number of sort fields to prevent query complexity
      return sortFields.slice(0, 3);
    }

    return [];
  }

  get Attributes() {
    const { fields, excludedFields } = this.query;

    // Handle include fields - FIXED: Better validation and handling
    if (fields) {
      const fieldList = fields
        .split(",")
        .map((attr) => attr.trim())
        .filter((attr) => {
          // Filter out empty strings
          if (!attr) return false;

          try {
            this._validateFieldName(attr);
            return true;
          } catch (error) {
            if (this.config.enableQueryLogging) {
              console.warn(
                `Invalid field name in fields: ${attr}`,
                error.message
              );
            }
            return false;
          }
        })
        .slice(0, 50); // Limit selected fields

      // FIXED: Return null if no valid fields, otherwise Sequelize will return empty result
      if (fieldList.length === 0) {
        if (this.config.enableQueryLogging) {
          console.warn("No valid fields found in 'fields' parameter");
        }
        return null;
      }

      return fieldList;
    }

    // Handle exclude fields - FIXED: Better validation
    if (excludedFields) {
      const excludeList = excludedFields
        .split(",")
        .map((attr) => attr.trim())
        .filter((attr) => {
          if (!attr) return false;

          try {
            this._validateFieldName(attr);
            return true;
          } catch (error) {
            if (this.config.enableQueryLogging) {
              console.warn(
                `Invalid field name in excludedFields: ${attr}`,
                error.message
              );
            }
            return false;
          }
        })
        .slice(0, 20); // Limit excluded fields

      // FIXED: Only return exclude object if there are valid fields to exclude
      if (excludeList.length === 0) {
        if (this.config.enableQueryLogging) {
          console.warn("No valid fields found in 'excludedFields' parameter");
        }
        return null;
      }

      return {
        exclude: excludeList,
      };
    }

    return null;
  }

  get Pagination() {
    const {
      page = 1,
      limit = this.config.defaultLimit,
      offset = null,
    } = this.query;
    let offsetValue;

    // Ensure page and limit are positive integers with upper bounds
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(
      this.config.maxLimit,
      Math.max(1, parseInt(limit, 10) || this.config.defaultLimit)
    );

    if (offset !== null && offset !== undefined) {
      offsetValue = Math.max(0, parseInt(offset, 10) || 0);
    } else {
      offsetValue = (pageNum - 1) * limitNum;
    }

    // Prevent extremely large offsets that can cause performance issues
    const maxOffset = this.config.maxLimit * 1000;
    if (offsetValue > maxOffset) {
      throw new Error(`Offset too large. Maximum allowed: ${maxOffset}`);
    }

    return {
      limit: limitNum,
      offset: offsetValue,
    };
  }

  get Aggregations() {
    const { aggregate } = this.query;
    if (!aggregate) return null;

    const allowedFunctions = ["COUNT", "SUM", "AVG", "MIN", "MAX"];

    try {
      const fields = aggregate.split(",").map((field) => {
        const [func, col] = field
          .split("(")
          .map((item) => item.replace(")", "").trim().toUpperCase());

        if (!allowedFunctions.includes(func)) {
          throw new Error(`Unsupported aggregation function: ${func}`);
        }

        this._validateFieldName(col);

        return [
          Sequelize.fn(func, Sequelize.col(col)),
          `${func.toLowerCase()}_${col}`,
        ];
      });

      return fields.slice(0, 5); // Limit number of aggregations
    } catch (error) {
      if (this.config.enableQueryLogging) {
        console.warn("Aggregation parsing error:", error.message);
      }
      return null;
    }
  }

  get Joins() {
    const { include } = this.query;
    if (!include) return [];

    const reqAssociation = include.split(",").map((assoc) => assoc.trim());

    const validAssociations = reqAssociation
      .filter((assoc) => {
        if (!this.association[assoc]) {
          if (this.config.enableQueryLogging) {
            console.warn(`Invalid association requested: ${assoc}`);
          }
          return false;
        }
        return true;
      })
      .slice(0, this.config.maxJoins);
    console.log(validAssociations);
    return validAssociations.map((assoc) => ({
      ...this.association[assoc],
      required: false, // Use LEFT JOIN to avoid filtering results
      separate: this._shouldUseSeparateQuery(assoc),
    }));
  }

  get GroupBy() {
    const { groupBy } = this.query;
    if (!groupBy) return null;

    return groupBy
      .split(",")
      .map((field) => {
        const trimmed = field.trim();
        this._validateFieldName(trimmed);
        return trimmed;
      })
      .slice(0, 5); // Limit group by fields
  }

  // Generate cache key for query caching
  get CacheKey() {
    const queryString = JSON.stringify({
      query: this.query,
      association: Object.keys(this.association),
    });
    return crypto.createHash("md5").update(queryString).digest("hex");
  }

  // Get recommended database indexes based on query patterns
  getRecommendedIndexes() {
    const indexes = [];
    const filters = this.Filters;
    const sorting = this.Sorting;

    // Single field indexes for filters
    Object.keys(filters).forEach((field) => {
      indexes.push({
        name: `idx_${field}`,
        fields: [field],
        type: "BTREE",
      });
    });

    // Composite indexes for filtering + sorting
    if (sorting.length > 0) {
      const sortField = sorting[0][0];
      const filterFields = Object.keys(filters);

      if (filterFields.length > 0) {
        indexes.push({
          name: `idx_composite_${filterFields.join("_")}_${sortField}`,
          fields: [...filterFields.slice(0, 3), sortField], // Limit composite index size
          type: "BTREE",
        });
      }
    }

    // Full-text search indexes
    if (this.query.q && this.config.enableFullTextSearch) {
      indexes.push({
        name: "idx_fulltext_search",
        fields: ["name", "description"],
        type: "FULLTEXT",
      });
    }

    return indexes;
  }

  // Build the final Sequelize query options
  build() {
    this.validateQuery();
    // console.log("this.config", this.config);
    const queryObj = { ...this.query };
    this.excludedKeys.forEach((key) => delete queryObj[key]);

    const options = {
      where: { ...this.Filters, ...this.Search },
      order: this.Sorting,
      ...this.Pagination,
      include: this.Joins,
    };

    if (this.Attributes) {
      options.attributes = this.Attributes;
    }

    // Handle aggregations
    const aggregations = this.Aggregations;
    const groupFields = this.GroupBy;

    if (aggregations) {
      if (groupFields && groupFields.length > 0) {
        options.attributes = [...groupFields, ...aggregations];
        options.group = groupFields;
        // Remove pagination for aggregated queries to avoid issues
        delete options.limit;
        delete options.offset;
      } else {
        // If no groupBy specified, this is a simple aggregation
        options.attributes = aggregations;
        delete options.limit;
        delete options.offset;
      }
    }

    // Add any remaining filters from queryObj
    Object.entries(queryObj).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && !this._isExcludedKey(key)) {
        try {
          this._validateFieldName(key);
          options.where[key] = this._sanitizeValue(value);
        } catch (error) {
          if (this.config.enableQueryLogging) {
            console.warn(`Skipping invalid filter ${key}:`, error.message);
          }
        }
      }
    });

    return options;
  }

  // Execute query with caching support
  async executeWithCache(model) {
    const cacheKey = this.CacheKey;

    // Check cache first
    if (this.config.enableCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.config.cacheTTL * 1000) {
        return cached.data;
      } else {
        this.cache.delete(cacheKey); // Remove expired cache
      }
    }

    const startTime = Date.now();

    try {
      const options = this.build();
      const result = await model.findAndCountAll(options);

      const executionTime = Date.now() - startTime;
      this._recordQueryStats(executionTime);

      // Cache successful results
      if (this.config.enableCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
      }

      return result;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      this._recordQueryStats(executionTime, error);
      throw error;
    }
  }

  // Performance benchmarking
  async benchmark(model, iterations = 10) {
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      try {
        await model.findAndCountAll(this.build());
        times.push(Date.now() - start);
      } catch (error) {
        times.push(-1); // Mark failed queries
      }
    }

    const validTimes = times.filter((t) => t > 0);

    if (validTimes.length === 0) {
      return { error: "All queries failed" };
    }

    validTimes.sort((a, b) => a - b);

    return {
      iterations,
      successRate: (validTimes.length / iterations) * 100,
      avg: validTimes.reduce((a, b) => a + b, 0) / validTimes.length,
      min: validTimes[0],
      max: validTimes[validTimes.length - 1],
      median: validTimes[Math.floor(validTimes.length / 2)],
      p95: validTimes[Math.floor(validTimes.length * 0.95)],
    };
  }

  // Get query execution statistics
  getStats() {
    return {
      ...this.queryStats,
      avgExecutionTime:
        this.queryStats.executionCount > 0
          ? this.queryStats.totalExecutionTime / this.queryStats.executionCount
          : 0,
      cacheSize: this.cache.size,
    };
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Private helper methods
  _validateFieldName(fieldName) {
    if (!fieldName || typeof fieldName !== "string") {
      throw new Error("Invalid field name");
    }

    // Prevent SQL injection through field names
    if (
      !/^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/.test(fieldName)
    ) {
      throw new Error(`Invalid field name: ${fieldName}`);
    }
  }

  _sanitizeValue(value) {
    if (value === null || value === undefined) {
      return value;
    }

    // Convert to string and trim
    const stringValue = String(value).trim();

    // Basic XSS prevention
    return stringValue.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      ""
    );
  }

  _shouldUseSeparateQuery(associationName) {
    // Use separate queries for associations that might return many records
    const complexAssociations = ["orders", "transactions", "logs", "history"];
    return complexAssociations.includes(associationName.toLowerCase());
  }

  _isExcludedKey(key) {
    return (
      this.excludedKeys.includes(key) || key.includes("[") || key.includes("]")
    );
  }

  _recordQueryStats(executionTime, error = null) {
    this.queryStats.executionCount++;
    this.queryStats.totalExecutionTime += executionTime;

    if (
      executionTime > this.executionTimeThreshold &&
      this.queryStats.slowQueries.length < 100
    ) {
      this.queryStats.slowQueries.push({
        query: this.query,
        executionTime,
        timestamp: new Date(),
        error: error ? error.message : null,
      });
    }
  }
}

module.exports = QueryBuilder;
