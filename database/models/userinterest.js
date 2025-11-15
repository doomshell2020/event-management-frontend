import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initUserinterest = (sequelize, Types) => {
    class Userinterest extends Model { }
    Userinterest.init(
        {
            UserID: Types.STRING,
            Interest: Types.STRING,
        },
        {
            sequelize,
            modelName: 'Userinterest',
            tableName: 'userinterest',
        }
    );
    return Userinterest;
};

export default initUserinterest(connection, DataTypes);