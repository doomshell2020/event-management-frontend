import { Model, DataTypes } from 'sequelize';
import connection from '../connection';
const bcrypt = require('bcryptjs');
import Userinterest from "./userinterest"
import Invitation from "./events/event_invitation_modal";
import Event from "./events/event";



const initUser = (sequelize, Types) => {
    class User extends Model { }
    User.init(
        {
            FirstName: Types.STRING,
            LastName: Types.STRING,
            Email: Types.STRING,
            Password: Types.STRING,
            PhoneNumber: Types.STRING,
            Gender: Types.STRING,
            dob: Types.DATE,
            AddressLine1: Types.STRING,
            CompanyName: Types.STRING,
            CompanyTitle: Types.STRING,
            ImageURL: Types.STRING,
            City: Types.STRING,
            State: Types.STRING,
            PostalCode: Types.STRING,
            Country: Types.STRING,
            AddressLine2: Types.STRING,
            InternalNotes: Types.STRING,
            WebsiteURL: Types.STRING,
            InstagramURL: Types.STRING,
            TwitterURL: Types.STRING,
            LinkedInURL: Types.STRING,
            AssistantName: Types.STRING,
            MembershipLevel: Types.STRING,
            AssistantEmail: Types.STRING,
            AssistantPhoneNumber: Types.STRING,
            ClubhouseURL: Types.STRING,
            DiscordURL: Types.STRING,
            PhoneCountry: Types.STRING,
            FounderFlag: Types.STRING,
            CareyesHomeownerFlag: Types.STRING,
            FilippoReferralFlag: Types.INTEGER,
            CompedFlag: Types.STRING,
            ArtistType: Types.STRING,
            city_country_birth: Types.STRING,
            city_country_live: Types.STRING,
            social_media_platform: Types.STRING,
            are_you_member: Types.STRING,
            attended_festival_before: Types.STRING,
            attended_festival_before_old: Types.STRING,
            not_attendedfestival: Types.STRING,
            offer_ticket_packages: Types.STRING,
            most_interested_festival: Types.STRING,
            favourite_music: Types.STRING,
            sustainable_planet: Types.STRING,
            advocate_for_harmony: Types.STRING,
            core_values: Types.STRING,
            appreciate_your_honesty: Types.STRING,
            handles: Types.STRING,
            tier: Types.STRING,
            party_people: Types.STRING,
            comments: Types.STRING,
            linkdin_profile_link: Types.STRING,
            instagram_handle: Types.STRING,
            facebook_profile_link: Types.STRING,
            link_tree_link: Types.STRING,
            planet_buy_back: Types.STRING,
            country_group: Types.STRING,
            DateCreated: Types.DATE,
            refference1_first_name: Types.STRING,
            refference1_last_name: Types.STRING,
            refference1_email: Types.STRING,
            refference2_first_name: Types.STRING,
            refference2_last_name: Types.STRING,
            refference2_email: Types.STRING,
            mythical_and_mystical: Types.STRING,
            Role: Types.STRING,
            MasterPassword: Types.STRING,
            isMailSent: Types.STRING,
            most_interested_other: Types.STRING,
            sustainable_planet_other: Types.STRING,
            attended_festival_before_other: Types.STRING,
            are_you_member_other: Types.STRING,
            recently_approved: Types.DATE,
            admin_notes: Types.STRING,
            MembershipTypes: Types.STRING,
            token: Types.STRING,
            device_Id: Types.STRING,
            isoxcareyes: Types.STRING,
            admin_fees: DataTypes.FLOAT,
            States: DataTypes.STRING,
            test_email: DataTypes.STRING,
            donation_fees: DataTypes.FLOAT,
            IsVerified: Types.INTEGER,
            VerificationToken: Types.STRING,
            // member_status: Types.INTEGER,
            member_status: {
                type: Types.STRING,
                defaultValue: '0',
            },
            Status: {
                type: Types.STRING,
                defaultValue: '0',
            },
            is_suspend: {
                type: Types.STRING,
                defaultValue: 'Y',
            },
        }, {
        sequelize,
        modelName: 'User',
        tableName: 'user',
        // hooks: {
        //     beforeCreate: (user, options) => {
        //         if (user.Password) {
        //             user.Password = bcrypt.hashSync(user.Password, 10);
        //         }
        //     },
        // },
    },
    );
    User.hasMany(Userinterest, {
        foreignKey: 'UserID',
    })
    User.hasMany(Invitation, {
        foreignKey: 'UserID',
    })

    // new added relation attended_festival_before display event name 
    // User.belongsTo(Event, { foreignKey: 'attended_festival_before' })


    return User;
};

export default initUser(connection, DataTypes);













// module.exports = (sequelize, DataTypes) => {
//     const Role = sequelize.define('Role', {
//       title: DataTypes.STRING,
//       alias: DataTypes.STRING,
//       status: { type: DataTypes.STRING,
//           defaultValue: "Y"},
//     },
//      {
//       tableName: 'cms_roles',
//     });
//     return Role;
//   };



