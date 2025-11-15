import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';

const ClaspColors = (sequelize, DataTypes) => {
    class ClaspColors extends Model {}
    ClaspColors.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            event_id: DataTypes.INTEGER,
            addons_types: DataTypes.STRING,
            ticket_types: DataTypes.STRING,
            color: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'ClaspColors',
            tableName: 'clasp_colors', // Adjusted table name here
            timestamps: true, // Sequelize will manage createdAt and updatedAt
            createdAt: 'createdAt', // Optional: Customize the field names if needed
            updatedAt: 'updatedAt'
        }
    );
    return ClaspColors;
};

export default ClaspColors(connection, DataTypes);
