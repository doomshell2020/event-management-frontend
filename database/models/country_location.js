import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initCountryLocation = (sequelize, Types) => {
    class CountryLocation extends Model { }
    CountryLocation.init(
        {
            name: Types.STRING,
            country_id: Types.STRING,
            location_id: Types.STRING
        },
        {
            sequelize,
            modelName: 'CountryLocation',
            tableName: 'country_location',
        }
    );
    return CountryLocation;
};

export default initCountryLocation(connection, DataTypes);