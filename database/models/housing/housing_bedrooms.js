import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import HousingBedType from "./housing_bed_type"
const initHousingBedrooms = (sequelize, Types) => {
    class HousingBedrooms extends Model { }
    HousingBedrooms.init(
        {
            HousingID: Types.INTEGER,
            bedroom_number: Types.INTEGER,
            bed_number: Types.INTEGER,
            bed_type: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'Housing',
            tableName: 'housing_bedrooms',
        }
    );

    HousingBedrooms.belongsTo(HousingBedType, {
        foreignKey: 'bed_type',
    })
    return HousingBedrooms;
};

export default initHousingBedrooms(connection, DataTypes);
