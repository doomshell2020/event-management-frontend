import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initHousingBedType = (sequelize, Types) => {
    class HousingBedType extends Model { }
    HousingBedType.init(
        {
            name: Types.STRING,
            imageUrl: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'HousingBedType',
            tableName: 'housing_bed_type',
        }
    );
    return HousingBedType;
};

export default initHousingBedType(connection, DataTypes);
