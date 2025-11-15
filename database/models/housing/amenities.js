import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initAmenities = (sequelize, Types) => {
    class Amenities extends Model { }
    Amenities.init(
        {
            name: Types.STRING,
            category: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'Amenities',
            tableName: 'amenities',
        }
    );
    return Amenities;
};

export default initAmenities(connection, DataTypes);