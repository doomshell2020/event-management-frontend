import { Model, DataTypes } from "sequelize";
import connection from "../connection";
import User from "./user";

const initOrderGuest = (sequelize, Types) => {
    class OrderGuestModel extends Model { }

    OrderGuestModel.init(
        {
            id: {
                type: Types.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            order_id: {
                type: Types.STRING,
                allowNull: false,
            },
            guest_user_id: {
                type: Types.INTEGER,
                allowNull: false,
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
            modelName: "OrderGuest",
            tableName: "order_guests",
            timestamps: true, // Enable createdAt and updatedAt fields
        }
    );
    OrderGuestModel.belongsTo(User, {
        foreignKey: 'guest_user_id',
    })



    return OrderGuestModel;
};

export default initOrderGuest(connection, DataTypes);
