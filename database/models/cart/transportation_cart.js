import { Model, DataTypes } from "sequelize";
import connection from "../../connection";

import EventTicketType from "../tickets/event_ticket_type"
import Addons from "../tickets/addons"
import Event from "../events/event"

const initTransportationCart = (sequelize, Types) => {
  class TransportationCartModel extends Model {}

  TransportationCartModel.init(
    {
      user_id: {
        type: Types.STRING,
        allowNull: false,
      },
      event_id: {
        type: Types.STRING,
        allowNull: false,
      },
      addons_id: {
        type: Types.STRING,
        allowNull: true,
      },
      ticket_id: {
        type: Types.STRING,
        allowNull: true,
      },
      ticket_type: {
        type: Types.STRING,
        allowNull: false,
      },
      no_tickets: {
        type: Types.STRING,
        allowNull: true,
      },
      description: {
        type: Types.STRING,
      },
      status: {
        type: Types.STRING,
        defaultValue: "Y",
      }
    },
    {
      sequelize,
      modelName: "TransportationCart",
      tableName: "transportation_cart",
      timestamps: true,
    }
  );

    // Associations with EventTicketType and Addons
    TransportationCartModel.belongsTo(EventTicketType, { foreignKey: "ticket_id" });
    TransportationCartModel.belongsTo(Addons, { foreignKey: "addons_id" });
    TransportationCartModel.belongsTo(Event, { foreignKey: "event_id" });

  return TransportationCartModel;
};

export default initTransportationCart(connection, DataTypes);
