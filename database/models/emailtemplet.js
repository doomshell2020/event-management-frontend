import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import Event from './events/event';

const initEmailTemplate = (sequelize, Types) => {
    class EmailTemplate extends Model { }
    EmailTemplate.init(
        {
            title: Types.STRING,
            subject: Types.STRING,
            type: Types.STRING,
            description: Types.STRING,
            mandril_template: Types.STRING,
            eventId: Types.STRING,
            templateId: Types.STRING,
            DisplayPriority: Types.INTEGER,
            instruction:Types.TEXT,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'EmailTemplate',
            tableName: 'templates',
        }
    );

    EmailTemplate.belongsTo(Event, {
        foreignKey: 'eventId',
    })


    return EmailTemplate;
};

export default initEmailTemplate(connection, DataTypes);