const { Op, Sequelize } = require("sequelize");

class QueryBuilder {
  constructor(query, association, config) {
    this.query = query || {};
    this.association = association || {};
    this.config = config || {};
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
    ];
  }

  get Filters() {
    const filters = {};

    for (const key in this.query) {
      if (this.excludedKeys.includes(key)) continue; // Skip non-filterable keys

      if (key.endsWith("[gte]")) {
        const field = key.replace("[gte]", "");
        filters[field] = { ...filters[field], [Op.gte]: this.query[key] };
      } else if (key.endsWith("[lte]")) {
        const field = key.replace("[lte]", "");
        filters[field] = { ...filters[field], [Op.lte]: this.query[key] };
      } else if (key.endsWith("[ne]")) {
        const field = key.replace("[ne]", "");
        filters[field] = { ...filters[field], [Op.ne]: this.query[key] };
      } else if (key.endsWith("[in]")) {
        const field = key.replace("[in]", "");
        filters[field] = {
          ...filters[field],
          [Op.in]: this.query[key].split(","),
        };
      } else if (key === "name_like") {
        filters.name = { [Op.like]: `%${this.query[key]}%` };
      } else if (!key.includes("[") && !key.includes("]")) {
        filters[key] = this.query[key];
      }
    }

    return filters;
  }

  get Search() {
    const { q } = this.query; // Safe destructuring
    if (!q) return {}; // If no search term, return an empty object
    return {
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ],
    };
  }

  get Sorting() {
    const { sortBy = null, sortOrder = null, sort = null } = this.query;
    if (sortBy && sortOrder) {
      const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";
      return [[sortBy, order]];
    }

    if (sort) {
      return sort.split(",").map((field) => {
        return field.startsWith("-")
          ? [field.substring(1), "DESC"]
          : [field, "ASC"];
      });
    }

    return [];
  }

  get Attributes() {
    const { fields, excludedFields } = this.query;
    if (fields) {
      return fields.split(",").map((attr) => attr.trim());
    }
    if (excludedFields) {
      return {
        exclude: excludedFields.split(",").map((attr) => attr.trim()),
      };
    }

    return null;
  }

  get Pagination() {
    const { page = 1, limit = 10, offset = null } = this.query;
    let offsetValue;

    // Ensure page and limit are positive integers
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);

    if (offset) {
      // Ensure offset is never negative
      offsetValue = Math.max(0, parseInt(offset, 10));
    } else {
      // Calculate offset ensuring it's never negative
      offsetValue = (pageNum - 1) * limitNum;
    }

    return {
      limit: limitNum,
      offset: offsetValue,
    };
  }

  get Aggregations() {
    const { aggregate } = this.query;
    if (!aggregate) return null;
    const fields = aggregate.split(",").map((field) => {
      const [func, col] = field.split("(").map((item) => item.replace(")", ""));
      return [func.trim(), col.trim()];
    });

    return fields.map(([func, col]) => Sequelize.fn(func, Sequelize.col(col)));
  }

  get Joins() {
    const { include } = this.query;
    if (!include) return [];

    const reqAssociation = include.split(",").map((assoc) => assoc.trim());

    return reqAssociation
      .filter((assoc) => this.association[assoc])
      .map((assoc) => this.association[assoc]);
  }

  build() {
    const options = {
      where: { ...this.Filters, ...this.Search },
      order: this.Sorting,
      limit: this.Pagination.limit || 10,
      offset: this.Pagination.offset,
      //   attributes,
      include: this.Joins,
    };

    if (this.Attributes) {
      options.attributes = this.Attributes;
    }

    Object.keys(options).forEach((key) => {
      if (!options[key] === undefined || options[key] === null)
        delete options[key];
    });

    return options;
  }
}

module.exports = QueryBuilder;
