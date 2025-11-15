import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"
const initEventsAttendees = (sequelize, Types) => {
    class EventsAttendees extends Model { }
    EventsAttendees.init(
        {
            DateCreated: Types.DATE,
            Status: Types.STRING,
            InvitationID: Types.STRING,
            UserID: Types.STRING,
            UserID: Types.STRING,
            FirstName: Types.STRING,
            LastName: Types.STRING,
            Email: Types.STRING,
            Gender: Types.STRING,
            Cost: Types.STRING,
            DiscountPercentage: Types.STRING,
            InternalNotes: Types.STRING,
            HousingRentalID: Types.DATE,
        },
        {
            sequelize,
            modelName: 'EventsAttendees',
            tableName: 'eventattendee',
        }
    );

    EventsAttendees.belongsTo(User, {
        foreignKey: 'UserID',
    })
    return EventsAttendees;
};

export default initEventsAttendees(connection, DataTypes);