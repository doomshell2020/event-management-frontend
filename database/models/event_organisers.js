import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import User from '@/database/models/user'; // assuming your User model is exported from user.js
import ApiKey from '@/database/models/api_key';
import ApiSubscription from '@/database/models/api_subscription';

const initEventOrganiser = (sequelize, Types) => {
    class EventOrganiser extends Model { }

    EventOrganiser.init(
        {
            id: {
                type: Types.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            member_id: {
                type: Types.INTEGER,
                allowNull: false
            },
            organisation_name: Types.STRING,
            contact_person: Types.STRING,
            contact_email: Types.STRING,
            phone: Types.STRING,
            website: Types.STRING,
            address: Types.TEXT,
            logo_url: Types.STRING,
            status: {
                type: Types.ENUM('active', 'inactive', 'suspended'),
                defaultValue: 'active'
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
            modelName: 'EventOrganiser',
            tableName: 'event_organisers',
            timestamps: false // We already have created_at / updated_at
        }
    );

    // Relationships
    // EventOrganiser.belongsTo(User, {
    //     foreignKey: 'member_id',
    //     as: 'member'
    // });

    // EventOrganiser.hasMany(ApiKey, {
    //     foreignKey: 'organiser_id',
    //     as: 'apiKeys'
    // });

    // EventOrganiser.hasMany(ApiSubscription, {
    //     foreignKey: 'organiser_id',
    //     as: 'subscriptions'
    // });

    return EventOrganiser;
};

export default initEventOrganiser(connection, DataTypes);
