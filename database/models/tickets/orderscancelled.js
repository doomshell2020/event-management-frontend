import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initOrdersCancelled = (sequelize, Types) => {
    class OrdersCancelled extends Model { }
    OrdersCancelled.init(
        {
            user_id: Types.STRING,
            package_id: Types.STRING,
            total_amount: Types.STRING,
            card_holder_name: Types.STRING,
            card_number: Types.STRING,
            month_year: Types.STRING,
            paymenttype: Types.STRING,
            RRN: Types.STRING,
            IsoResponseCode: Types.STRING,
            OrderIdentifier: Types.STRING,
            OriginalTrxnIdentifier: Types.STRING,
            TransactionType: Types.STRING,
            Approved: Types.STRING,
            is_free: Types.STRING,
            adminfee: Types.STRING,
            description: Types.STRING,
            couponCode: Types.STRING,
            discountType: Types.STRING,
            discountValue: Types.STRING,
            actualamount: Types.STRING,

            status: {
                type: Types.STRING,
                defaultValue: "Y",
            },
        },
        {
            sequelize,
            modelName: 'OrdersCancelled',
            tableName: 'orderscancelled',
        }
    );

    return OrdersCancelled;
};

export default initOrdersCancelled(connection, DataTypes);