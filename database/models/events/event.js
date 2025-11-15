import { Model, DataTypes } from "sequelize";
import connection from "../../connection";
import User from "../user";
import Currency from "../tickets/currency";
import EventTicketType from "../tickets/event_ticket_type";
import Addons from "../tickets/addons";

const initEvent = (sequelize, Types) => {
  class Event extends Model { }
  Event.init(
    {
      Name: {
        type: Types.STRING,
        allowNull: false, // Required field, cannot be null
      },
      ShortName: {
        type: Types.STRING,
        allowNull: false, // This allows ShortName to accept null values
      },
      event_menu_name: {
        type: Types.STRING,
        allowNull: true, // This allows ShortName to accept null values
      },
      EventName: {
        type: Types.STRING,
        allowNull: true, // This allows EventName to accept null values
      },
      EventTimeZone: {
        type: Types.STRING,
        allowNull: true, // This allows TimeZone to accept null values
      },
      Venue: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      Address: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      City: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      State: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      Country: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      PostalCode: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      ImageURL: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      videoUrl: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      Price: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      Summary: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      // New keys add (28-01-2025)
      ticket_description: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      addon_description: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      other_description: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      // New keys add (28-01-2025)
      ListPrice: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      EventType: {
        type: Types.STRING,
        allowNull: true, // Required field
      },
      payment_currency: {
        type: Types.STRING,
        allowNull: false, // Required field
      },
      StartDate: {
        type: Types.DATE,
        allowNull: false, // Required field
      },
      EndDate: {
        type: Types.DATE,
        allowNull: false, // Required field
      },
      isAllAddonsAllowed: {
        type: Types.STRING,
        allowNull: true, // This can be null
      },
      status: {
        type: Types.STRING,
        defaultValue: "Y", // Default value is 'Y'
        allowNull: true, // This can be null if needed
      },
      isSaleStart: {
        type: Types.STRING,
        defaultValue: "Y", // Default value is 'Y'
        allowNull: true, // This can be null if needed
      },
      // Inside Event.init()
      ticket_platform_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      ticket_stripe_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      ticket_bank_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      ticket_processing_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },

      accommodation_stripe_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      accommodation_bank_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      accommodation_processing_fee_percentage: {
        type: Types.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0.00,
      },
      // New keys added(05-02-2025)
      ServiceFee: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // ServiceFee: {
      //   type: DataTypes.DECIMAL(5, 2), // Change from STRING to DECIMAL
      //   allowNull: true, // Allow NULL values
      //   defaultValue: 0.00, // Default NULL
      // },// Change from STRING to DECIMAL
      MexicanVAT: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      AccommodationTax: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      OndalindaFee: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      strip_fee: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // New keys added accommodation request expiry duration
      expiry_duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      partial_payment_duration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reminder_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Event",
      tableName: "event",
    }
  );

  Event.belongsTo(Currency, {
    foreignKey: "payment_currency",
  });

  // Event.belongsTo(EventTicketType, {
  //     foreignKey: 'id',
  // })
  Event.hasMany(EventTicketType, { foreignKey: "eventid" });
  Event.hasMany(Addons, { foreignKey: "event_id" });

  return Event;
};

export default initEvent(connection, DataTypes);
