import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import EventOrganiser from '@/database/models/event_organisers';
// import ApiPlan from '@/database/models/api_plan';

const initApiSubscription = (sequelize, Types) => {
    class ApiSubscription extends Model {}

    ApiSubscription.init(
        {
            id: {
                type: Types.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },
            organiser_id: {
                type: Types.INTEGER,
                allowNull: false
            },
            plan_id: {
                type: Types.BIGINT,
                allowNull: false
            },
            start_date: {
                type: Types.DATEONLY,
                allowNull: false
            },
            end_date: {
                type: Types.DATEONLY,
                allowNull: true
            },
            status: {
                type: Types.ENUM('active', 'expired', 'cancelled'),
                defaultValue: 'active'
            },
            // New fields from api_keys
            key_hash: {
                type: Types.STRING,
                allowNull: false
            },
            last_used: {
                type: Types.DATE,
                allowNull: true
            },
            allowed_domains: {
                type: Types.TEXT,
                allowNull: true
            },
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
            modelName: 'ApiSubscription',
            tableName: 'api_subscriptions',
            timestamps: false
        }
    );

    return ApiSubscription;
};

export default initApiSubscription(connection, DataTypes);
