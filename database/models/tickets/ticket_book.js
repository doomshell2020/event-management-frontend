import { Model, DataTypes } from "sequelize";
import connection from "../../connection";
import User from "../user";
import Event from "../events/event";
import EventStaffMember from "../events/eventstaff";
import EventTicketType from "./event_ticket_type";
import TicketDetail from "./ticketdetail";
import Orders from "./orders";
// import MyOrders from "../my_orders_modal";
const initTicketBook = (sequelize, Types) => {
  class TicketBook extends Model { }
  TicketBook.init(
    {
      order_id: Types.STRING,
      event_id: Types.STRING,
      package_id: Types.STRING,
      event_ticket_id: Types.STRING,
      cust_id: Types.STRING,
      ticket_buy: Types.STRING,
      amount: Types.STRING,
      mobile: Types.STRING,
      CheckoutRequestID: Types.STRING,
      when_added: Types.STRING,
      event_admin: Types.STRING,
      adminfee: Types.STRING,
      committee_user_id: Types.STRING,
      user_desc: Types.STRING,
      currency_rate: Types.STRING,
      transfer_user_id: Types.STRING,
      transfer_reply: Types.STRING,
      transfer_status: Types.STRING,
      generated_id: Types.STRING,
      ticket_type: Types.STRING,
      created: Types.STRING,
      ticket_status: Types.STRING,
      ticket_cancel_id: Types.STRING,
      cancel_date: Types.DATE,
      addon_eligible_ids: Types.STRING,
      is_buy_addons_ids: Types.STRING,
      status: {
        type: Types.STRING,
        defaultValue: "Y",
      },
    },
    {
      sequelize,
      modelName: "TicketBook",
      tableName: "ticket_book",
    }
  );
  TicketBook.belongsTo(User, {
    foreignKey: "cust_id",
  });
  TicketBook.belongsTo(Event, {
    foreignKey: "event_id",
  });
  TicketBook.belongsTo(EventTicketType, {
    foreignKey: "event_ticket_id",
  });
  TicketBook.belongsTo(EventStaffMember, {
    foreignKey: "cust_id",
  });
  TicketBook.hasMany(TicketDetail, {
    foreignKey: "tid",
  });
  TicketBook.belongsTo(Orders, {
    foreignKey: "order_id",
  });
  //   TicketBook.belongsTo(MyOrders, {
  //     foreignKey: "order_id",
  //   });

  return TicketBook;
};

export default initTicketBook(connection, DataTypes);
