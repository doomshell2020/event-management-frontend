import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
const initBookAccommodation = (sequelize, Types) => {
    class BookAccommodation extends Model { }
    BookAccommodation.init(
        {
            HousingID: Types.STRING,
            userId: Types.INTEGER,
            eventId: Types.INTEGER,
            Email: Types.STRING,
            bedrooms: Types.STRING,
            ArrivalDate: Types.DATE,
            DepartureDate: Types.DATE,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        },
        {
            sequelize,
            modelName: 'BookAccommodation',
            tableName: 'book_accommodation',
        }
    );
    return BookAccommodation;
};

export default initBookAccommodation(connection, DataTypes);
