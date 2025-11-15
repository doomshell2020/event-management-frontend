import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const membershipType = (sequelize, DataTypes) => {
    class membershipType extends Model { }
    membershipType.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            title: DataTypes.STRING,
            sub_title: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'membershipType',
            tableName: 'membership_type', // Adjusted table name here
            timestamps: true, // Sequelize will manage createdAt and updatedAt
            createdAt: 'createdAt', // Optional: Customize the field names if needed
            updatedAt: 'updatedAt'
        }
    );
    return membershipType;
};

export default membershipType(connection, DataTypes);
