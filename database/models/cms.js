import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
import Sliders from './sliders_modal';
const initCms = (sequelize, Types) => {
    class Cms extends Model { }
    Cms.init(
        {
            Name: Types.STRING,
            VanityURL: Types.STRING,
            Content: Types.STRING,
            title: Types.STRING,
            event_id: Types.INTEGER,
            sort_order: Types.INTEGER,
            status: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
            is_parent: {
                type: Types.STRING,
                defaultValue: 'N',
            },
        },
        {
            sequelize,
            modelName: 'Cms',
            tableName: 'cmspage',
        }
    );
    Cms.hasMany(Sliders, {
        foreignKey: "page_id", // Ensures the `page_id` column in `Sliders` references `Cms`
    });

    return Cms;
};

export default initCms(connection, DataTypes);
