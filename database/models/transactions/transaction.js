import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from '../user';
const initTransaction = (sequelize, Types) => {
    class Transaction extends Model { }
    Transaction.init(
        {
            UserID: Types.STRING,
            Description: Types.STRING,
            PaymentAmount: Types.STRING,
            StripePaymentID: Types.STRING,
            DateCreated: Types.DATE,
            status: {
                type: Types.STRING,
                defaultValue: '0',
            },
        },
        {
            sequelize,
            modelName: 'Transaction',
            tableName: 'transaction',
        }
    );
    Transaction.belongsTo(User, {
        foreignKey: 'UserID',
    })
    return Transaction;
};

export default initTransaction(connection, DataTypes);
