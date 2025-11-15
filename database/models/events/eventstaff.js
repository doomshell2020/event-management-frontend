import { Model, DataTypes } from "sequelize";
import connection from "../../connection";
import TicketDetail from "../tickets/ticketdetail";
import Event from "./event";

const initeventStaff = (sequelize, Types) => {
  class eventStaff extends Model {}
  eventStaff.init(
    {
      EventID: Types.STRING,
      FirstName: Types.STRING,
      LastName: Types.STRING,
      Email: Types.STRING,
      Department: Types.STRING,
      WaiverFlag: Types.STRING,
      Wristband: Types.STRING,
      DateWaiverSent: Types.DATE,
      DateWaiverSigned: Types.DATE,
      token: Types.STRING,
      // status: {
      //     type: Types.STRING,
      //     defaultValue: 'Y',
      // },
    },
    {
      sequelize,
      modelName: "eventStaff",
      tableName: "eventstaffmember",
    }
  );

  // eventStaff.belongsTo(Event, {
  //   foreignKey: "EventID",
  // });

  eventStaff.hasMany(TicketDetail, {
    foreignKey: "user_id",
  });

  return eventStaff;
};

export default initeventStaff(connection, DataTypes);
