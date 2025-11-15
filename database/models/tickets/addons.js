import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initAddons = (sequelize, Types) => {
    class Addons extends Model { }
    Addons.init(
        {
            event_id: Types.STRING,
            name: Types.STRING,
            addon_name: Types.STRING,
            sortName: Types.STRING,
            price: Types.STRING,
            count: Types.STRING,
            hidden: Types.STRING,
            addon_day: Types.STRING,
            addon_time: Types.STRING,
            addon_location: Types.STRING,
            addon_dress_code: Types.STRING,
            description: Types.STRING,
            addon_image: Types.STRING,
            addon_type: Types.STRING,
            sort_day: Types.STRING,
            display_order: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
            sale_start_date: {
                type: Types.DATE, // This is actually used for datetime in most DBMS
                allowNull: true,  // You can set this to false if it's required
            },
            sale_end_date: {
                type: Types.DATE, // This is used for datetime in most DBMS
                allowNull: true,  // You can set this to false if it's required
            },
        },
        {
            sequelize,
            modelName: 'Addons',
            tableName: 'addons',
        }
    );

    return Addons;
};

export default initAddons(connection, DataTypes);