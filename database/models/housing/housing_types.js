import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initHousingTypes = (sequelize, Types) => {
    class HousingTypes extends Model { }
    HousingTypes.init(
        {
            name: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'HousingTypes',
            tableName: 'housing_types',
        }
    );
    return HousingTypes;
};

export default initHousingTypes(connection, DataTypes);