import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initInterestedevent = (sequelize, Types) => {
    class Interestedevent extends Model { }
    Interestedevent.init(
        {
            UserID: Types.STRING,
            EventID: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'Interestedevent',
            tableName: 'interested_event',
        }
    );

    return Interestedevent;
};

export default initInterestedevent(connection, DataTypes);