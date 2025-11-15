import { Model, DataTypes } from "sequelize";
import connection from "../../connection";

import EventTicketType from "../tickets/event_ticket_type"
import Addons from "../tickets/addons"
import Event from "../events/event"

const initCart = (sequelize, Types) => {
  class CartModel extends Model {}

  CartModel.init(
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
      modelName: "Cart",
      tableName: "cart",
      timestamps: true,
    }
  );

    // Associations with EventTicketType and Addons
    CartModel.belongsTo(EventTicketType, { foreignKey: "ticket_id" });
    CartModel.belongsTo(Addons, { foreignKey: "addons_id" });
    CartModel.belongsTo(Event, { foreignKey: "event_id" });

  return CartModel;
};

export default initCart(connection, DataTypes);
