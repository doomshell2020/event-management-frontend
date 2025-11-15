import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import EventHousing from "./eventhousing"
import HousingImage from "./housingimage"
import HousingBedrooms from "./housing_bedrooms"
import HousingNeighborhood from "./housing_neighborhood"
import HousingTypes from "./housing_types";

const initHousingInfo = (sequelize, Types) => {
    class HousingInfo extends Model { }
    HousingInfo.init(
        {
            Name: Types.STRING,
            Neighborhood: Types.STRING,
            Type: Types.STRING,
            MaxOccupancy: Types.INTEGER,
            NumBedrooms: Types.INTEGER,
            Pool: Types.STRING,
            Distance: Types.STRING,
            ImageURL: Types.STRING,
            WebsiteURL: Types.STRING,
            ManagerName: Types.STRING,
            ManagerEmail: Types.STRING,
            ManagerMobile: Types.STRING, // new keys added
            NumCaliforniaKingBeds: Types.INTEGER,
            NumKingBeds: Types.INTEGER,
            NumQueenBeds: Types.INTEGER,
            NumFullBeds: Types.INTEGER,
            NumTwinBeds: Types.INTEGER,
            NumSofaBeds: Types.INTEGER,
            NumBunkBeds: Types.INTEGER,
            NumDayBeds: Types.INTEGER,
            NumCots: Types.INTEGER,
            Description: Types.STRING,
            OwnerID: Types.INTEGER,
            location: Types.STRING,
            // new keys added
            OwnerName: Types.STRING,
            OwnerEmail: Types.STRING,
            OwnerMobile: Types.STRING,
            amenities: Types.STRING,
            admin_notes: Types.STRING,
            google_map: Types.STRING,
            booking_notes: Types.STRING,
            terms_and_conditions: Types.TEXT,
            Status: {
                type: Types.STRING,
                defaultValue: '1',
            },
            bookingStatus: {
                type: Types.STRING,
                defaultValue: 'N',
            },
        },
        {
            sequelize,
            modelName: 'Housing',
            tableName: 'housing',
        }
    );

    HousingInfo.hasMany(EventHousing, {
        foreignKey: 'HousingID',
    })

    HousingInfo.hasMany(HousingImage, {
        foreignKey: 'HousingID',
    })
    HousingInfo.hasMany(HousingBedrooms, {
        foreignKey: 'HousingID',
    })
    HousingInfo.belongsTo(HousingNeighborhood, {
        foreignKey: 'Neighborhood',
    })
    HousingInfo.belongsTo(HousingTypes, {
        foreignKey: 'Type',
    })

    return HousingInfo;
};

export default initHousingInfo(connection, DataTypes);
