import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initInvitation = (sequelize, Types) => {
    class Invitation extends Model { }
    Invitation.init(
        {
            DateInvited: Types.DATE,
            DateRegistered: Types.DATE,
            EventID: Types.STRING,
            UserID: Types.STRING,
            DiscountPercentage: Types.STRING,
            EligibleHousingIDs: Types.STRING,
            NumDiscounts: Types.STRING,
            AssignedHousingRentalID: Types.STRING,
            HousingOption: Types.STRING,
            AssignedHousingID: Types.STRING,
            InternalNotes: Types.STRING,
            NumTicketsRequired: Types.STRING,
            DateExpired: Types.DATE,
            // New keys added for Preference Submitted
            ArrivalDate: Types.DATE,
            DepartureDate: Types.DATE,
            AccommodationType: Types.STRING,
            // New Keys added for expire link for property 
            expiresAt: Types.DATE,
            expire_status: { type: Types.STRING, defaultValue: 'active', },
            required_tickets: Types.STRING,
            Status: {
                type: Types.STRING,
                defaultValue: '1',
            },
        },
        {
            sequelize,
            modelName: 'Invitation',
            tableName: 'eventinvitation',
        }
    );
    return Invitation;
};

export default initInvitation(connection, DataTypes);