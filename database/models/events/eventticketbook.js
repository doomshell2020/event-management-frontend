import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import eventStaff from "../events/eventstaff"

import EventTicketType from "../tickets/event_ticket_type"
import TicketDetail from "../tickets/ticketdetail"
const initEventTicketBook = (sequelize, Types) => {
    class EventTicketBook extends Model { }
    EventTicketBook.init(
        {
            order_id: Types.STRING,
            event_id: Types.STRING,
            package_id: Types.STRING,
            event_ticket_id: Types.STRING,
            cust_id: Types.STRING,
            ticket_buy: Types.STRING,
            amount: Types.STRING,
            mobile: Types.STRING,
            CheckoutRequestID: Types.STRING,
            when_added: Types.STRING,
            event_admin: Types.STRING,
            adminfee: Types.STRING,
            committee_user_id: Types.STRING,
            user_desc: Types.STRING,
            currency_rate: Types.STRING,
            transfer_user_id: Types.STRING,
            transfer_reply: Types.STRING,
            transfer_status: Types.STRING,
            generated_id: Types.STRING,
            ticket_type: Types.STRING,
            created: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'EventTicketBook',
            tableName: 'ticket_book',
        }
    );

    EventTicketBook.belongsTo(EventTicketType, {
        foreignKey: 'event_ticket_id',
    })
      
    EventTicketBook.hasMany(TicketDetail, {
        foreignKey: 'tid',
    })

    return EventTicketBook;
};

export default initEventTicketBook(connection, DataTypes);