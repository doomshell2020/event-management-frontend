import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initTicketTemplate = (sequelize, Types) => {
    class TicketTemplate extends Model { }
    TicketTemplate.init(
        {
            title: Types.STRING,
            subject: Types.STRING,
            type: Types.STRING,
            eventId: Types.STRING,
            description: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'TicketTemplate',
            tableName: 'ticket_templates',
        }
    );
    return TicketTemplate;
};

export default initTicketTemplate(connection, DataTypes);