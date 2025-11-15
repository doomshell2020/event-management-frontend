import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import User from './user';
import Event from './events/event';
import HousingInfo from './housing/housing_info';

const initBookAccommodationInfo = (sequelize, Types) => {
    class BookAccommodationInfo extends Model { }

    BookAccommodationInfo.init(
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
            total_night_stay: {
                type: Types.INTEGER,
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
            accommodation_id: {
                type: Types.INTEGER,
                allowNull: false,
            },
            accommodation_name: {
                type: Types.STRING,
            },
            check_in_date: {
                type: Types.DATE,
            },
            check_out_date: {
                type: Types.DATE,
            },
            guests_count: {
                type: Types.INTEGER,
                defaultValue: 1,
            },
            no_of_bedrooms: {
                type: Types.INTEGER,
            },
            status: {
                type: Types.ENUM('Y', 'N'),
                allowNull: false,
                defaultValue: 'Y',
            },
            total_amount: {
                type: Types.FLOAT,
                defaultValue: 0,
            },
            paid_amount: {
                type: Types.FLOAT,
                defaultValue: 0,
            },
            payment_status: {
                type: Types.ENUM('partial', 'full', 'pending'),
                allowNull: false,
                defaultValue: 'full',
            },
            payment_method: {
                type: Types.STRING,
            },
            transaction_id: {
                type: Types.STRING,
            },
            order_id: {
                type: Types.INTEGER,
            },
            payment_id: {
                type: Types.INTEGER,
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
            modelName: 'BookAccommodationInfo',
            tableName: 'accommodation_bookings_info',
            underscored: true,
            timestamps: true, // set to true if you're using Sequelize's automatic timestamps
        }
    );

    BookAccommodationInfo.belongsTo(HousingInfo, {
        foreignKey: 'accommodation_id',
    });


    return BookAccommodationInfo;
};

export default initBookAccommodationInfo(connection, DataTypes);
