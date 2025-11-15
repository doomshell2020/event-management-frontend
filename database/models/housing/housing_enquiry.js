import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"

const initHousingEnquiry = (sequelize, Types) => {
    class HousingEnquiry extends Model { }
    HousingEnquiry.init(
        {
            user_id: Types.INTEGER,
            event_id: Types.INTEGER,
            ArrivalDate: Types.DATE,
            DepartureDate: Types.DATE,
            AccommodationType: Types.STRING,
            Status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'HousingEnquiry',
            tableName: 'housing_enquiry',
        }
    );
    HousingEnquiry.belongsTo(User, {
        foreignKey: 'user_id',
    })
    return HousingEnquiry;
};

export default initHousingEnquiry(connection, DataTypes);
