import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import Housing from "./housing";


const initEventHousingRelations = (sequelize, DataTypes) => {
    class EventHousingRelations extends Model { }

    EventHousingRelations.init(
        {
            EventID: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            HousingID: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            Status: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            InternalNotes: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            NightlyPrice: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            BaseNightlyPrice: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            NightlyPayoutAmount: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            AvailabilityStartDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            AvailabilityEndDate: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            ServiceFee: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            MexicanVAT: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            AccommodationTax: {
                type: DataTypes.STRING,
                allowNull: true,
            }, OndalindaFee: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            OwnerAmount: {
                type: DataTypes.STRING,
                allowNull: true,
            },
             outside_user_id: {
                type: DataTypes.STRING,
                allowNull: true,
            },
             outside_first_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
             outside_last_name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
             outside_email: {
                type: DataTypes.STRING,
                allowNull: true,
            },
             outside_arrival_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            outside_departure_date: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            outside_remark: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            isBooked: {
                type: DataTypes.ENUM('Y', 'N', 'P'),
                allowNull: false,
                defaultValue: 'N',
            },
            ticket_stripe_fee_percentage: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            ticket_bank_fee_percentage: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            ticket_processing_fee_percentage: {
                type: DataTypes.DECIMAL(5, 2),
                allowNull: true,
                defaultValue: 0.00,
            },

            // new..........
            ServiceFeeAmount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            MexicanVATAmount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            AccommodationTaxAmount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            OndalindaFeeAmount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            stripe_fee_amount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            ticket_bank_fee_amount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            ticket_processing_fee_amount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            ticket_stripe_fee_amount: {
                type: DataTypes.DECIMAL(8, 2),
                allowNull: true,
                defaultValue: 0.00,
            },
            totalAfterTaxes: {
                type: DataTypes.STRING,
                allowNull: true,
            },

        },
        {
            sequelize,
            modelName: 'EventHousingRelations',
            tableName: 'eventhousing',
        }
    );

    EventHousingRelations.belongsTo(Housing, {
        foreignKey: 'HousingID',
    })

    return EventHousingRelations;
};

export default initEventHousingRelations(connection, DataTypes);
