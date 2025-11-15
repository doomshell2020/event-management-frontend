import { Model, DataTypes } from 'sequelize';
import connection from '../../connection';
// import Event from '../../event';
const membershipTypesColor = (sequelize, DataTypes) => {
    class membershipTypesColor extends Model { }
    membershipTypesColor.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            event_id: DataTypes.INTEGER,
            membership_type_id: DataTypes.INTEGER,
            color: DataTypes.STRING
        },
        {
            sequelize,
            modelName: 'membershipTypesColor',
            tableName: 'membership_types_color', // Adjusted table name here
            timestamps: true, // Sequelize will manage createdAt and updatedAt
            createdAt: 'createdAt', // Optional: Customize the field names if needed
            updatedAt: 'updatedAt'
        },
    );

    // membershipTypesColor.belongsTo(Event, {
    //     foreignKey: 'event_id',
    // });

    return membershipTypesColor;
};

export default membershipTypesColor(connection, DataTypes);






// import { Model, DataTypes } from 'sequelize';
// import connection from '../../connection';
// const membershipTypesColor = (sequelize, Types) => {
//     class membershipTypesColor extends Model { }
//     membershipTypesColor.init(
//         {
//             event_id: Types.INTEGER,
//             membership_type_id: Types.INTEGER,
//             color: Types.STRING,
//         },
//         {
//             sequelize,
//             modelName: 'membershipTypesColor',
//             tableName: 'membership_types_color',
//         }
//     );

//     return membershipTypesColor;
// };

// export default membershipTypesColor(connection, DataTypes);








