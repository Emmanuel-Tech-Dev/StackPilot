const modelColumnDescription = async (tableName, ModelName, db, DataTypes) => {
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
};

module.exports = modelColumnDescription;
