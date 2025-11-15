import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import EventOrganiser from '@/database/models/event_organisers';

const initApiKey = (sequelize, Types) => {
    class ApiKey extends Model { }

    ApiKey.init(
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
            key_hash: {
                type: Types.CHAR(64),
                allowNull: false,
                unique: true
            },
            allowed_domains: {
                type: DataTypes.STRING,
                allowNull: true
            },
            status: {
                type: Types.ENUM('active', 'inactive', 'revoked'),
                defaultValue: 'active'
            },
            last_used: Types.DATE,
            created_at: {
                type: Types.DATE,
                defaultValue: Types.NOW
            }
        },
        {
            sequelize,
            modelName: 'ApiKey',
            tableName: 'api_keys',
            timestamps: false
        }
    );

    // ApiKey.belongsTo(EventOrganiser, {
    //     foreignKey: 'organiser_id',
    //     as: 'organiser'
    // });

    return ApiKey;
};

export default initApiKey(connection, DataTypes);
