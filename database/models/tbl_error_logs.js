import { Model, DataTypes } from "sequelize";
import connection from "../connection";

const initErrorLogsModel = (sequelize, Types) => {
  class ErrorLogsModel extends Model {}

  ErrorLogsModel.init(
    {
      id: {
        type: Types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      error_message: {
        type: Types.TEXT,
        allowNull: false,
      },
      request_data: {
        type: Types.TEXT,
        allowNull: false,
      },
      error_stack: {
        type: Types.TEXT,
        allowNull: true,
      },
      error_location: {
        type: Types.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: Types.DATE,
        allowNull: false,
        defaultValue: Types.NOW,
      },
    },
    {
      sequelize,
      modelName: "ErrorLogsModel",
      tableName: "tbl_error_logs",
      timestamps: false,
    }
  );

  return ErrorLogsModel;
};

export default initErrorLogsModel(connection, DataTypes);
