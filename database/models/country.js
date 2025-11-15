import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initCountries = (sequelize, Types) => {
    class Countries extends Model { }
    Countries.init(
        {
            name: Types.STRING,
            phonecode: Types.STRING,
        },
        {
            sequelize,
            modelName: 'Countries',
            tableName: 'countries',
        }
    );
    return Countries;
};

export default initCountries(connection, DataTypes);