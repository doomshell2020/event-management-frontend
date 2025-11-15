import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initCurrency = (sequelize, Types) => {
    class Currency extends Model { }
    Currency.init(
        {

            Currency_symbol: Types.STRING,
            Currency: Types.STRING,
            conversion_rate: Types.STRING,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'Currency',
            tableName: 'currency',
        }
    );

    return Currency;
};

export default initCurrency(connection, DataTypes);