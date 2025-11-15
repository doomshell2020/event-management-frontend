import { Model, DataTypes } from 'sequelize';
import connection from '../connection';

const initRole = (sequelize, Types) => {
  class Role extends Model {}
  Role.init(
    {
        title: Types.STRING,
        alias: Types.STRING,
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'cms_roles',
    }
  );
  return Role;
};

export default initRole(connection, DataTypes);