import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initHousingNeighborhood = (sequelize, Types) => {
    class HousingNeighborhood extends Model { }
    HousingNeighborhood.init(
        {
            name: Types.STRING,
            location: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'HousingNeighborhood',
            tableName: 'housing_neighborhood',
        }
    );
    return HousingNeighborhood;
};

export default initHousingNeighborhood(connection, DataTypes);