import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import EventInvitation from './invitationevent';
// import Housing from './housing/housing';


const initEventHousingRental = (sequelize, Types) => {
    class EventHousingRental extends Model { }
    EventHousingRental.init(
        {
            DateCreated: Types.DATE,
            InvitationID: Types.STRING,
            HousingID: Types.STRING,
            Cost: Types.STRING,
            StartDate: Types.DATE,
            EndDate: Types.DATE,
            AmountPaid: Types.STRING,
            PayoutAmount: Types.STRING,
            Status: {
                type: Types.STRING,
                defaultValue: '1',
            }
        },
        {
            sequelize,
            modelName: 'EventHousingRental',
            tableName: 'eventhousingrental',
        }
    );

    EventHousingRental.belongsTo(EventInvitation, {
        foreignKey: 'InvitationID',
    });

    // EventHousingRental.belongsTo(Housing, {
    //     foreignKey: 'InvitationID',
    // });

    return EventHousingRental;
   
};

export default initEventHousingRental(connection, DataTypes);