import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"
import Event from "../events/event"
import Addons from "./addons"
import Orders from "./orders"

const initAddonBook = (sequelize, Types) => {
    class AddonBook extends Model { }
    AddonBook.init(
        {
            order_id: Types.STRING,
            user_id: Types.STRING,
            addons_id: Types.STRING,
            price: Types.STRING,
            addon_qrcode: Types.STRING,
            event_id: Types.STRING,
            usedate: Types.DATE,
            transfer_user_id: Types.STRING,
            transfer_reply: Types.STRING,
            fname: Types.STRING,
            lname: Types.STRING,
            scannedstatus: Types.STRING,
            scanner_id: Types.STRING,
            usedby: Types.STRING,
            generated_id: Types.STRING,
            name_update_count: Types.STRING,
            ticket_id: Types.STRING,
            ticket_status: Types.STRING,
            ticket_cancel_id: Types.STRING,
            cancel_date: Types.DATE,
            created: Types.DATE,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'AddonBook',
            tableName: 'addonsbook',
        }
    );
    AddonBook.belongsTo(User, {
        foreignKey: 'user_id',
    })
    AddonBook.belongsTo(Event, {
        foreignKey: 'event_id',
    })
    AddonBook.belongsTo(Addons, {
        foreignKey: 'addons_id',
    })
    AddonBook.belongsTo(Orders, {
        foreignKey: 'order_id',
    })

    return AddonBook;
};

export default initAddonBook(connection, DataTypes);