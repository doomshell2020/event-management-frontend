import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import Event from "../events/event"
const initCoupon = (sequelize, Types) => {
    class Coupon extends Model { }
    Coupon.init(
        {
            event: Types.STRING,
            discount_type: Types.STRING,
            code: Types.STRING,
            discount_value: Types.STRING,
            max_redeems: Types.STRING,
            applicable_for: Types.STRING,
            validity_period: Types.STRING,
            specific_date_from: Types.STRING,
            specific_date_to: Types.STRING,
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
            status: {
                type: Types.STRING,
                defaultValue: "Y",
            },
        },
        {
            sequelize,
            modelName: 'Coupon',
            tableName: 'coupons',
        }
    );
    // Coupon.hasMany(Event, {
    //     foreignKey: 'event',
    // })
    Coupon.belongsTo(Event, {
        foreignKey: 'event',
    })
    return Coupon;
};

export default initCoupon(connection, DataTypes);