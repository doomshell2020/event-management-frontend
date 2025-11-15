import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initEventTicketType = (sequelize, Types) => {
    class EventTicketType extends Model { }
    EventTicketType.init(
        {
            eventid: Types.STRING,
            userid: Types.STRING,
            title: Types.STRING,
            ticket_name: Types.STRING,
            question_id: Types.STRING,
            quantity: Types.STRING,
            count: Types.STRING,
            price: Types.STRING,
            // type: Types.STRING,
            // hidden: Types.STRING,
            sold_out: Types.STRING,
            description: Types.STRING,
            ticket_image: Types.STRING,
            display_order: Types.STRING,
            ticket_sort_name: Types.STRING,
            type: {
                type: Types.STRING,
                defaultValue: 'open_sales',
            },
            hidden: {
                type: Types.STRING,
                defaultValue: 'N',
            },
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
            modelName: 'EventTicketType',
            tableName: 'event_ticket_type',
        }
    );

    return EventTicketType;
};

export default initEventTicketType(connection, DataTypes);