import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"
import Event from './event';
import Housing from '../housing/housing';

// import BookTicket from '../tickets/ticket_book';

const initEventInvitation = (sequelize, Types) => {
    class EventInvitation extends Model { }
    EventInvitation.init(
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
            // new keys added Accommodations status
            accommodation_status: Types.STRING,
            required_tickets: Types.STRING,
            Status: {
                type: Types.STRING,
                defaultValue: '1',
            },
            is_preference_submitted: {
                type: Types.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'N',
            },
            is_booking_status: {
                type: Types.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'N',
            },
        },
        {
            sequelize,
            modelName: 'EventInvitation',
            tableName: 'eventinvitation',
        }
    );

    EventInvitation.belongsTo(User, {
        foreignKey: 'UserID',
    })
    EventInvitation.belongsTo(Event, {
        foreignKey: 'EventID',
    });

    EventInvitation.belongsTo(Housing, {
        foreignKey: 'EligibleHousingIDs',
    });
    return EventInvitation;
};

export default initEventInvitation(connection, DataTypes);