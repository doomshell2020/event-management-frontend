import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initTicketBookCancelled = (sequelize, Types) => {
    class TicketBookCancelled extends Model { }
    TicketBookCancelled.init(
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
            when_added: Types.DATE,
            event_admin: Types.STRING,
            committee_user_id: Types.STRING,
            user_desc: Types.STRING,
            currency_rate: Types.STRING,
            adminfee: Types.STRING,
            transfer_user_id: Types.STRING,
            transfer_reply: Types.STRING,
            generated_id: Types.STRING,
            ticket_type: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'TicketBookCancelled',
            tableName: 'ticket_book_cancelled',
        }
    );

    return TicketBookCancelled;
};

export default initTicketBookCancelled(connection, DataTypes);