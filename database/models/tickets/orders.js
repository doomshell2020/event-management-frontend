import { Model, DataTypes } from "sequelize";
import connection from "../../connection";
import User from "../user";
import EventStaff from "../events/eventstaff";
// import AccommodationBookingInfo from "../accommodation_bookings_info";
// import TicketBook from "./ticket_book"

const initOrders = (sequelize, Types) => {
  class Orders extends Model { }
  Orders.init(
    {
      user_id: Types.STRING,
      event_id: Types.INTEGER,
      book_accommodation_id: Types.INTEGER,
      accommodation_bookings_info_id: Types.INTEGER,
      // package_id: Types.STRING,
      total_amount: Types.STRING,
      paymenttype: Types.STRING,
      RRN: Types.STRING,
      OrderIdentifier: Types.STRING,
      OriginalTrxnIdentifier: Types.STRING,
      // TransactionIdentifier: Types.STRING,
      TransactionType: Types.STRING,
      Approved: Types.STRING,
      adminfee: Types.STRING,
      description: Types.STRING,
      couponCode: Types.STRING,
      discountType: Types.STRING,
      discountValue: Types.STRING,
      discountAmount: Types.FLOAT,
      actualamount: Types.STRING,
      is_free: Types.STRING,
      ticket_status: Types.STRING,
      ticket_cancel_id: Types.STRING,
      cancel_date: Types.DATE,
      order_cancel_id: Types.STRING,
      refund_balance_transaction: Types.STRING,
      refund_reason: Types.STRING,


      // new keys
      totalAddonAmount: Types.FLOAT,
      totalAddonTax: Types.FLOAT,
      totalTicketAmount: Types.FLOAT,
      totalTicketTax: Types.FLOAT,
      totalAccommodationAmount: Types.FLOAT,
      totalAccommodationTax: Types.FLOAT,

      ticketBankFee: Types.FLOAT,
      ticketPlatformFee: Types.FLOAT,
      ticketProcessingFee: Types.FLOAT,
      ticketStripeFee: Types.FLOAT,
      ticket_platform_fee_percentage: Types.FLOAT,
      ticket_stripe_fee_percentage: Types.FLOAT,
      ticket_bank_fee_percentage: Types.FLOAT,
      ticket_processing_fee_percentage: Types.FLOAT,


      // accommodation_nightlyRate: Types.FLOAT,
      // accommodation_basePriceHousing: Types.FLOAT,
      total_night_stay: Types.STRING,


      accommodationBankFee: Types.FLOAT,
      accommodationStripeFee: Types.FLOAT,
      accommodationProcessingFee: Types.FLOAT,
      // accommodationPropertyOwnerAmount: Types.FLOAT,

      accommodation_nightlyPerDaysRate: Types.FLOAT,
      accommodation_basePerDaysPriceHousing: Types.FLOAT,
      accommodationPerDaysPropertyOwnerAmount: Types.FLOAT,
      accommodationPerDaysServiceFeeAmount: Types.FLOAT,
      accommodationPerDaysMexicanVATAmount: Types.FLOAT,
      accommodationPerDaysTaxAmount: Types.FLOAT,
      accommodationOndalindaPerDaysFeeAmount: Types.FLOAT,
      accommodationOndalindaPerDaysTotalAfterTaxes: Types.FLOAT,



      partial_payment_amount: Types.FLOAT,
      partial_payment_tax: Types.FLOAT,
      totalCartAmount: Types.STRING,

      status: {
        type: Types.STRING,
        defaultValue: "Y",
      },
      houseOwnerEmailSent: {
        type: Types.STRING,
        defaultValue: 'N',
      },
      orderConfirmationEmailSent: {
        type: Types.STRING,
        defaultValue: 'N',
      },
      order_context: {
        type: Types.STRING,
        defaultValue: 'regular',
      }
    },
    {
      sequelize,
      modelName: "Orders",
      tableName: "orders",
    }
  );
  Orders.belongsTo(User, {
    foreignKey: "user_id",
  });
  Orders.belongsTo(EventStaff, {
    foreignKey: "user_id",
  });

  // Orders.belongsTo(AccommodationBookingInfo, {
  //   foreignKey: "order_id",
  // });

  // Orders.hasMany(TicketBook, {
  //     // foreignKey: 'order_id',  // Correct foreign key
  //     // as: 'bookedTickets',  // Optional alias
  // });
  return Orders;
};

export default initOrders(connection, DataTypes);
