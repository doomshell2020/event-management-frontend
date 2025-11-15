import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initTicketDetailCancelled = (sequelize, Types) => {
    class TicketDetailCancelled extends Model { }
    TicketDetailCancelled.init(
        {
            tid: Types.STRING,
            ticket_num: Types.STRING,
            user_id: Types.STRING,
            package_id: Types.STRING,
            fname: Types.STRING,
            lname: Types.STRING,
            usedby: Types.STRING,
            qrcode: Types.STRING,
            scanner_id: Types.STRING,
            is_rsvp: Types.STRING,
            position: Types.STRING,
            divisions: Types.STRING,
            timeslot: Types.STRING,
            choosedate: Types.STRING,
            transfer_user_id: Types.STRING,
            transfer_reply: Types.STRING,
            generated_id: Types.STRING,
            name_update_count: Types.STRING,
            ticket_type: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'TicketDetailCancelled',
            tableName: 'ticketdetailcancelled',
        }
    );

    return TicketDetailCancelled;
};

export default initTicketDetailCancelled(connection, DataTypes);