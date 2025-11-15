import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initCartAddons = (sequelize, Types) => {
    class CartAddons extends Model { }
    CartAddons.init(
        {
            user_id: Types.STRING,
            addon_id: Types.STRING,

            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'CartAddons',
            tableName: 'cartaddons',
        }
    );

    return CartAddons;
};

export default initCartAddons(connection, DataTypes);