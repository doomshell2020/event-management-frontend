import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"
// import EventStaffMember from "../events/eventstaff"


const initTicketDetail = (sequelize, Types) => {
    class TicketDetail extends Model { }
    TicketDetail.init(
        {
            // tid: Types.STRING,
            tid: Types.INTEGER,
            ticket_num: Types.STRING,
            user_id: Types.STRING,
            package_id: Types.STRING,
            fname: Types.STRING,
            lname: Types.STRING,
            usedby: Types.STRING,
            usedate: Types.DATE,
            qrcode: Types.STRING,
            scanner_id: Types.STRING,
            is_rsvp: Types.STRING,
            position: Types.STRING,
            divisions: Types.STRING,
            timeslot: Types.STRING,
            choosedate: Types.STRING,
            transfer_user_id: Types.STRING,
            transfer_reply: Types.STRING,
            transfer_status: Types.STRING,
            name_update_count: Types.STRING,
            ticket_type: Types.STRING,
            ticket_status: Types.STRING,
            ticket_cancel_id: Types.STRING,
            cancel_date: Types.DATE,
            status: {
                type: Types.STRING,
                defaultValue: 0,
            },
        },
        {
            sequelize,
            modelName: 'TicketDetail',
            tableName: 'ticketdetail',
        }
    );

    TicketDetail.belongsTo(User, {
        foreignKey: 'user_id',
    });
    // TicketDetail.belongsTo(EventStaffMember, {
    //     foreignKey: 'user_id',
    // });


    return TicketDetail;
};

export default initTicketDetail(connection, DataTypes);