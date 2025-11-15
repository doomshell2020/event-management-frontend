import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';

const initPayment = (sequelize, Types) => {
    class Payment extends Model { }
    Payment.init(
        {
            user_id: Types.STRING,
            amount: Types.STRING,
            event_id: Types.STRING,
            name: Types.STRING,
            email: Types.STRING,
            totalticket: Types.STRING,
            totaladdon: Types.STRING,
            clientsecret: Types.STRING,
            payment_intent: Types.STRING,
            paymentstatus: Types.STRING,
            couponCode: Types.STRING,
            discountType: Types.STRING,
            discountValue: Types.STRING,
            discountAmount: Types.FLOAT,

            adminfee: Types.FLOAT,
            totalDueAmountWithTax: Types.FLOAT,

            ticketPlatformFee: Types.FLOAT,
            ticketBankFee: Types.FLOAT,
            ticketStripeFee: Types.FLOAT,
            ticketProcessingFee: Types.FLOAT,

            ticket_platform_fee_percentage: Types.FLOAT,
            ticket_stripe_fee_percentage: Types.FLOAT,
            ticket_bank_fee_percentage: Types.FLOAT,
            ticket_processing_fee_percentage: Types.FLOAT,

            totalCartAmount: Types.FLOAT,
            totalTaxes: Types.FLOAT,
            accommodationAmount: Types.FLOAT,
            isAccommodation: Types.STRING,
            paymentOption: Types.STRING,
            order_items: Types.STRING,
            // new keys
            totalAddonAmount: Types.FLOAT,
            totalAddonTax: Types.FLOAT,
            totalTicketAmount: Types.FLOAT,
            totalTicketTax: Types.FLOAT,
            totalAccommodationAmount: Types.FLOAT,
            totalAccommodationTax: Types.FLOAT,

            partial_payment_amount: Types.FLOAT,
            partial_payment_tax: Types.FLOAT,

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
            fee_details_json: Types.TEXT,

            status: {
                type: Types.STRING,
                defaultValue: "Y",
            },
        },
        {
            sequelize,
            modelName: 'Payment',
            tableName: 'payment',
        }
    );
    return Payment;
};

export default initPayment(connection, DataTypes);