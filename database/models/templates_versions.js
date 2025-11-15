import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initTemplateVersion = (sequelize, Types) => {
    class TemplateVersion extends Model { }
    TemplateVersion.init(
        {
            name: Types.STRING,
        },
        {
            sequelize,
            modelName: 'TemplateVersion',
            tableName: 'templates_versions',
        }
    );
    return TemplateVersion;
};

export default initTemplateVersion(connection, DataTypes);