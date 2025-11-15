import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initApiPlan = (sequelize, Types) => {
    class ApiPlan extends Model {}

    ApiPlan.init(
        {
            id: {
                type: Types.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: Types.STRING,
                allowNull: false
            },
            price: {
                type: Types.DECIMAL(10, 2),
                defaultValue: 0
            },
            description: Types.TEXT,
            created_at: {
                type: Types.DATE,
                defaultValue: Types.NOW
            },
            updated_at: {
                type: Types.DATE,
                defaultValue: Types.NOW
            }
        },
        {
            sequelize,
            modelName: 'ApiPlan',
            tableName: 'api_plans',
            timestamps: false
        }
    );

    return ApiPlan;
};

export default initApiPlan(connection, DataTypes);
