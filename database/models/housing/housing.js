import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"
import EventHousing from "./eventhousing"
import HousingImage from "./housingimage"
import HousingBedrooms from "./housing_bedrooms"
import HousingNeighborhood from "./housing_neighborhood"
import HousingTypes from "./housing_types";
import AccommodationBooking from "../accommodation_bookings";

const initHousing = (sequelize, Types) => {
    class Housing extends Model { }
    Housing.init(
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

    Housing.belongsTo(User, {
        foreignKey: 'OwnerID',
    })

    Housing.hasMany(EventHousing, {
        foreignKey: 'HousingID',
    })

    Housing.hasMany(HousingImage, {
        foreignKey: 'HousingID',
    })
    Housing.hasMany(HousingBedrooms, {
        foreignKey: 'HousingID',
    })
    Housing.belongsTo(HousingNeighborhood, {
        foreignKey: 'Neighborhood',
    })
    Housing.belongsTo(HousingTypes, {
        foreignKey: 'Type',
    })
    Housing.hasMany(AccommodationBooking, {
        foreignKey: 'accommodation_id',
    })
    return Housing;
};

export default initHousing(connection, DataTypes);
