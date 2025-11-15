import { Model, DataTypes } from "sequelize";
import connection from "../connection";

const initCoupons = (sequelize, Types) => {
  class CouponsModel extends Model {}

  CouponsModel.init(
    {
      id: {
        type: Types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      event: {
        type: Types.INTEGER,
        allowNull: false,
      },
      discount_type: {
        type: Types.ENUM("percentage", "fixed_amount"),
        allowNull: false,
      },
      code: {
        type: Types.STRING(50),
        allowNull: false,
        unique: true, // Ensuring coupon code is unique
      },
      discount_value: {
        type: Types.DECIMAL(12, 5),
        allowNull: false,
      },
      max_redeems: {
        type: Types.INTEGER,
        allowNull: true,
      },
      applicable_for: {
        type: Types.ENUM("all", "ticket", "addon"),
        allowNull: true,
      },
      validity_period: {
        type: Types.ENUM("specific_date", "specified_date"),
        allowNull: false,
      },
      specific_date_from: {
        type: Types.DATE,
        allowNull: true,
      },
      specific_date_to: {
        type: Types.DATE,
        allowNull: true,
      },
      status: {
        type: Types.ENUM("Y", "N"),
        allowNull: true,
      },
      createdAt: {
        type: Types.DATE,
        allowNull: false,
        defaultValue: Types.NOW,
      },
      updatedAt: {
        type: Types.DATE,
        allowNull: false,
        defaultValue: Types.NOW,
      },
    },
    {
      sequelize,
      modelName: "Coupons",
      tableName: "coupons",
      timestamps: true, // Enable createdAt and updatedAt fields
    }
  );

  return CouponsModel;
};

export default initCoupons(connection, DataTypes);
