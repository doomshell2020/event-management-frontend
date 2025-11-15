import { Model, DataTypes } from "sequelize";
import connection from "../connection";

const initSliderImages = (sequelize, Types) => {
  class SliderImages extends Model {
    static associate(models) {
      // Define inverse relationship: SliderImages -> Sliders
      this.belongsTo(models.Sliders, {
        foreignKey: "slider_id", // Foreign key in SliderImages
        as: "slider", // Alias for related slider
      });
    }
  }

  SliderImages.init(
    {
      id: {
        type: Types.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      slider_id: {
        type: Types.INTEGER,
        allowNull: false,
        references: {
          model: "tbl_sliders", // Foreign key references `tbl_sliders`
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      sort_order: {
        type: Types.INTEGER,
        allowNull: true,
      },
      image_path: {
        type: Types.STRING,
        allowNull: false, // Image path is required
      },
      uploaded_by: {
        type: Types.STRING,
        allowNull: false, // Uploader's information is required
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
      modelName: "SliderImages",
      tableName: "tbl_slider_images",
      timestamps: true, // Enable automatic handling of createdAt and updatedAt
    }
  );

  return SliderImages;
};

export default initSliderImages(connection, DataTypes);
