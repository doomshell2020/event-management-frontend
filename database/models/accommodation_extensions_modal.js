import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import HousingInfo from './housing/housing_info';
// import User from './user';
// import Event from './events/event';
// import MyOrders from './my_orders_modal';

const initAccommodationExtension = (sequelize, Types) => {
    class AccommodationExtension extends Model { }

    AccommodationExtension.init(
        {
            id: {
                type: Types.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            user_id: {
                type: Types.INTEGER,
                allowNull: false,
            },
            event_id: {
                type: Types.INTEGER,
                allowNull: false,
            },
            accommodation_id: {
                type: Types.INTEGER,
                allowNull: false,
            },
            order_id: {
                type: Types.INTEGER,
            },
            payment_id: {
                type: Types.STRING,
                allowNull: false,
            },
            first_name: {
                type: Types.STRING,
                allowNull: false,
            },
            last_name: {
                type: Types.STRING,
                allowNull: false,
            },
            email: {
                type: Types.STRING,
                allowNull: false,
            },
            total_night_stay: {
                type: Types.INTEGER,
                allowNull: false,
            },
            check_in_date: {
                type: Types.DATE,
                allowNull: false,
            },
            check_out_date: {
                type: Types.DATE,
                allowNull: false,
            },
            status: {
                type: Types.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'Y',
            },
            is_received_property_owner_mail: {
                type: Types.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'N',
            },
            total_amount: {
                type: Types.FLOAT,
                defaultValue: 0,
            },
            transaction_id: {
                type: Types.STRING,
            },
            qr_code_image: {
                type: Types.STRING,
            },
            created_at: {
                type: Types.DATE,
                defaultValue: Types.NOW,
            },
            updated_at: {
                type: Types.DATE,
                defaultValue: Types.NOW,
            },
            is_accommodation_cancel: {
                type: Types.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'N',
            },
            cancel_date: {
                 type: Types.DATE,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'AccommodationExtension',
            tableName: 'accommodationExtensions',
            underscored: true,
            timestamps: true, // Sequelize will handle createdAt/updatedAt automatically
        }
    );

    // Associations
    // AccommodationExtension.belongsTo(User, { foreignKey: 'user_id' });
    // AccommodationExtension.belongsTo(Event, { foreignKey: 'event_id' });
    AccommodationExtension.belongsTo(HousingInfo, { foreignKey: 'accommodation_id' });

    return AccommodationExtension;
};

export default initAccommodationExtension(connection, DataTypes);