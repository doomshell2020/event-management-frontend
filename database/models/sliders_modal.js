import { Model, DataTypes } from "sequelize";
import connection from "../connection";
import SliderImages from "./slider_images_modal"; // Import SliderImages model

const initSliders = (sequelize, Types) => {
  class Sliders extends Model {  }

  Sliders.init(
    {
      id: {
        type: Types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      slider_name: {
        type: Types.STRING,
        allowNull: false, // Slider name is required
      },
      page_id: {
        type: Types.INTEGER,
        allowNull: false, // Page ID is required
      },
      page_name: {
        type: Types.STRING,
        allowNull: false, // Page name is required
      },
      createdAt: {
        type: Types.DATE,
        allowNull: false,
        defaultValue: Types.NOW, // Default to the current timestamp
      },
      updatedAt: {
        type: Types.DATE,
        allowNull: false,
        defaultValue: Types.NOW, // Default to the current timestamp
      },
    },
    {
      sequelize,
      modelName: "Sliders",
      tableName: "tbl_sliders",
      timestamps: true, // Enable automatic handling of createdAt and updatedAt
    }
  );

  Sliders.hasMany(SliderImages, {
    foreignKey: 'slider_id',
})

  return Sliders;
};

export default initSliders(connection, DataTypes);
