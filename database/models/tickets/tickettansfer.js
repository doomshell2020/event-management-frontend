import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initTicketTransfer = (sequelize, Types) => {
    class TicketTransfer extends Model { }
    TicketTransfer.init(
        {
            user_id_to: Types.STRING,
            user_id_from: Types.STRING,
            user_id_to_qrcode: Types.STRING,
            user_id_from_qrcode: Types.STRING,
            typeofticket: Types.STRING,
        },
        {
            sequelize,
            modelName: 'TicketTransfer',
            tableName: 'tickettansfer',
        }
    );

    return TicketTransfer;
};

export default initTicketTransfer(connection, DataTypes);