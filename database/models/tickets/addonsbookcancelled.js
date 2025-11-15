import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initAddonsBookCancelled = (sequelize, Types) => {
    class AddonsBookCancelled extends Model { }
    AddonsBookCancelled.init(
        {
            order_id: Types.STRING,
            user_id: Types.STRING,
            addons_id: Types.STRING,
            price: Types.STRING,
            addon_qrcode: Types.STRING,
            event_id: Types.STRING,
            transfer_user_id: Types.STRING,
            transfer_reply: Types.STRING,
            fname: Types.STRING,
            lname: Types.STRING,
            scannedstatus: Types.STRING,
            scanner_id: Types.STRING,
            usedby: Types.STRING,
            generated_id: Types.STRING,
            name_update_count: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'AddonsBookCancelled',
            tableName: 'addonsbookcancelled',
        }
    );

    return AddonsBookCancelled;
};

export default initAddonsBookCancelled(connection, DataTypes);