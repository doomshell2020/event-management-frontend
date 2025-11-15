import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initStates = (sequelize, Types) => {
    class States extends Model { }
    States.init(
        {
            name: Types.STRING,
            country_id: Types.STRING,
        },
        {
            sequelize,
            modelName: 'States',
            tableName: 'states',
        }
    );
    return States;
};

export default initStates(connection, DataTypes);