import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
const initDonation = (sequelize, Types) => {
    class Donation extends Model { }
    Donation.init(
        {
            name: Types.STRING,
            email: Types.STRING,
            amount: Types.STRING,
            paymentstatus: Types.STRING,
            clientsecret: Types.STRING
        },
        {
            sequelize,
            modelName: 'Donation',
            tableName: 'donation',
        }
    );
    return Donation;
};

export default initDonation(connection, DataTypes);