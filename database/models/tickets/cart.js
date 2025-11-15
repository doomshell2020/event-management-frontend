import { Model, DataTypes } from "sequelize";
import connection from "../../connection";
const initCart = (sequelize, Types) => {
  class Cart extends Model {}
  Cart.init(
    {
      user_id: Types.STRING,
      event_id: Types.STRING,
      addons_id: Types.STRING,
      ticket_id: Types.STRING,
      package_id: Types.STRING,
      no_tickets: Types.STRING,
      ticket_type: Types.STRING,
      description: Types.STRING,
      commitee_user_id: Types.STRING,
      checkout_data: Types.STRING,
      browser_id: Types.STRING,

      status: {
        type: Types.STRING,
        defaultValue: "Y",
      },
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "cart",
    }
  );

  return Cart;
};

export default initCart(connection, DataTypes);
