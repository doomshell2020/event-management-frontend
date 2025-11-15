import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
import User from "../user"
const inithousingImage = (sequelize, Types) => {
    class housingImage extends Model { }
    housingImage.init(
        {
            HousingID: Types.STRING,
            URL: Types.STRING,
            Ordering: Types.STRING,
        },
        {
            sequelize,
            modelName: 'housingImage',
            tableName: 'housingimage',
        }
    );
    return housingImage;
};

export default inithousingImage(connection, DataTypes);
