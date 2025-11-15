import User from "./user";
import DeleteUserData from "./deleteuserdata";
import Cms from "./cms"
import Event from "./events/event";
import AccommodationExtension from "./accommodation_extensions_modal";

// invitation event
import InvitationEvent from "./events/invitationevent"
// new Event invitation model (25-12-24)
import Invitation from "./events/event_invitation_modal"

import EventHousingRental from "./events/eventhousingrental";
import Eventattendees from "./events/eventsattendees"
import Transaction from "./transactions/transaction"
import Housing from "./housing/housing";
import HousingInfo from "./housing/housing_info";
import HousingImage from "./housing/housingimage";
import EventHousing from "./housing/eventhousing";
import EventHousingRelations from "./housing/EventHousingRelations";
import HousingBedrooms from "./housing/housing_bedrooms";
import HousingBedType from "./housing/housing_bed_type";
import HousingNeighborhood from "./housing/housing_neighborhood";
import HousingTypes from "./housing/housing_types";
import HousingAmenities from "./housing/amenities";
import HousingEnquiry from "./housing/housing_enquiry";
import UserInterest from "./userinterest"
import Interestedevent from "./events/interestedevent";


import MembershipType from "./membershiptype"
import AccommodationBookingInfo from "./accommodation_bookings_info" // already create housing relations
import AccommodationBooking from "./accommodation_bookings" // for housing relation 
import BookAccommodationInfo from "./book_accommodation_info" // for housing relation 

import EventStaff from "./events/eventstaff";
import claspColors from "./events/claspcolors";
import memberShiptypesColor from "./events/membershiptypescolor";
import EventStaffMember from "./events/eventstaff";
import EventTicketBook from "./events/eventticketbook";
// Book accomadation
import BookAccommodation from "./accommodation/bookaccommodation";
// Email templet
import Emailtemplet from "./emailtemplet";
import TicketTemplate from "./ticket_templates";
import TemplateVersion from "./templates_versions";
// Orders managers
import Order from "./orders/order";
import Orders from "./tickets/orders";
import MyOrders from "./my_orders_modal";
import MyTicketBook from "./my_ticket_book_modal";
// Donation model
import Donation from "./donation"
// book ticket modal
import BookTicket from "./tickets/ticket_book";
import EventTicketType from "./tickets/event_ticket_type"
import AddonBook from "./tickets/addonsbook";
import Addons from "./tickets/addons";
import Currency from "./tickets/currency";
import Coupon from "./tickets/coupons";
import CouponsModel from "./coupons_modal";
import TicketDetail from "./tickets/ticketdetail";
import TicketTransfer from "./tickets/tickettansfer"
import Payment from "./tickets/payment";
import CartModel from "./cart/cart_modal";
import ErrorLogsModel from "./tbl_error_logs";
import OrderGuest from "./order_guests";


import Sliders from "./sliders_modal";
import SliderImages from "./slider_images_modal";

export { Sliders, SliderImages };

// country
import Country from "./country";
// states
import States from "./states"
// country location
import CountryLocation from "./country_location";

// /database/models/index.js
import EventOrganiser from './event_organisers';
import ApiSubscription from './api_subscription';
import ApiPlan from './api_plan';

// Define associations
EventOrganiser.belongsTo(User, { foreignKey: 'member_id', as: 'member' });
EventOrganiser.hasMany(ApiSubscription, { foreignKey: 'organiser_id', as: 'subscriptions' });
ApiSubscription.belongsTo(EventOrganiser, { foreignKey: 'organiser_id', as: 'organiser' });
ApiSubscription.belongsTo(ApiPlan, { foreignKey: 'plan_id', as: 'plan' });
Event.belongsTo(EventOrganiser, { foreignKey: 'organiser_id', as: 'organiser' });

export { EventOrganiser, ApiSubscription, ApiPlan };



export { AccommodationExtension }

// User Modal
export { User, ErrorLogsModel, AccommodationBookingInfo };
export { AccommodationBooking }
export { BookAccommodationInfo }
// DeleteUserData modal
export { DeleteUserData };
export { TicketDetail };
// Cms modal
export { Cms };
// Event Modal
export { Event };

// Event Invitations Modal
export { InvitationEvent };
// Event Invitations Modal-new(25-12-2025)
export { Invitation };


export { Eventattendees };
export { EventHousingRental };
export { Interestedevent };
export { EventStaffMember };

export { EventTicketBook };

// Transaction Modal
export { Transaction };
// Housing Modal
export { Housing };
export { HousingInfo };
// Housing Images
export { HousingImage };
//EventHousing Modal
export { EventHousing };
// send Event housing
export { EventHousingRelations }
export { HousingBedrooms }
export { HousingBedType }
export { HousingNeighborhood }
export { HousingTypes }
export { HousingAmenities }
export { HousingEnquiry }

// User Interst Modal
export { UserInterest };
// Book accomadation
export { BookAccommodation }
// Email Templet
export { Emailtemplet };
export { TicketTemplate };
export { TemplateVersion };
// Event Staff
export { EventStaff };
// membership claspColour
export { claspColors };
// membership type colour
export { memberShiptypesColor };
export { MembershipType };
// Donation model
export { Donation };
// Book Ticket Model
export { Order };
export { Orders };
export { MyOrders };
export { MyTicketBook };
export { BookTicket };
export { Addons };
export { AddonBook };
export { EventTicketType };
export { Currency };
export { Coupon };
export { CouponsModel };
export { TicketTransfer };
export { Payment };
export { CartModel };
// country
export { Country }
// states
export { States }
// country location
export { CountryLocation }
// order guest model
export { OrderGuest };

// new relationship logic(31-05-2025-kamal)
// Orders.belongsTo(AccommodationBooking, {
//     foreignKey: "accommodation_bookings_info_id",
// });
Orders.belongsTo(AccommodationBookingInfo, {
    foreignKey: "accommodation_bookings_info_id",
});
// AccommodationBooking.belongsTo(Orders, {
//     foreignKey: "accommodation_bookings_info_id",
// });

User.hasMany(MyOrders, { foreignKey: 'user_id' });
MyOrders.belongsTo(User, { foreignKey: 'user_id' });
HousingNeighborhood.hasMany(Housing, { foreignKey: 'Neighborhood', as: 'Housings' });