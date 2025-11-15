import {
  CouponsModel,
  Order,
  CartModel,
  EventTicketType,
  Addons,
  TransportationCart
} from "@/database/models";
import { Op } from "sequelize";

export async function isCouponEligible(couponCode, userId, eventId) {
  try {
    const coupon = await CouponsModel.findOne({
      where: {
        code: couponCode,
        event: eventId,
        status: "Y",
        // specific_date_from: {
        //   [Op.lte]: new Date(),
        // },
        // specific_date_to: {
        //   [Op.gte]: new Date(),
        // },
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!coupon) {
      return {
        success: false,
        status: 404,
        message: "Invalid or expired STAFF ID.",
      };
    } else {
      // Check validity period if necessary
      if (coupon.validity_period === "specified_date") {
        const currentDate = new Date();
        const specificDateFrom = new Date(coupon.specific_date_from);
        const specificDateTo = new Date(coupon.specific_date_to);
      
        // console.log('Current Date:', currentDate);
        // console.log('Specific Date From:', specificDateFrom);
        // console.log('Specific Date To:', specificDateTo);
      
        if (
          (specificDateFrom && specificDateFrom.getTime() > currentDate.getTime()) ||
          (specificDateTo && specificDateTo.getTime() < currentDate.getTime())
        ) {
          return {
            success: false,
            status: 404,
            message: "This STAFF ID is not valid for the current date.",
          };          
        }
      }
      

      const redemptionCount = await Order.count({
        where: { couponCode: couponCode, Approved: "succeeded" },
      });
      
      if (redemptionCount >= parseInt(coupon.max_redeems, 10)) {
        return {
          success: false,
          status: 403,
          message: "STAFF ID has reached its maximum redemption limit.",
        };
      }

      let discountPrice = 0;
      let couponType = coupon.applicable_for;

      if (couponType == "all") {
        // Fetch all tickets for the user
        const tickets = await CartModel.findAll({
          where: {
            ticket_type: "ticket",
            user_id: userId,
          },
          include: [
            {
              model: EventTicketType,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Fetch all addons for the user
        const addons = await CartModel.findAll({
          where: {
            ticket_type: "addon",
            user_id: userId,
          },
          include: [
            {
              model: Addons,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Check if there are tickets and addons
        if (tickets.length == 0 && addons.length == 0) {
          return {
            success: false,
            status: 403,
            message: "Your cart is empty.",
          };
        }

        // Calculate total ticket price
        let totalTicketPrice = tickets.reduce((total, ticket) => {
          return total + ticket.EventTicketType.price * ticket.no_tickets; // Multiply by count if necessary
        }, 0);

        // Calculate total addon price
        let totalAddonPrice = addons.reduce((total, addon) => {
          return total + addon.Addon.price * addon.no_tickets; // Multiply by count if necessary
        }, 0);

        // Calculate total price
        let totalPrice = totalTicketPrice + totalAddonPrice;

        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (totalPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      } else if (couponType == "ticket") {
        const cartData = await CartModel.findOne({
          where: {
            ticket_type: "ticket",
            user_id: userId,
          },
          include: [
            {
              model: EventTicketType,
              attributes: ["title", "price", "count"], // Fields from EventTicketType
              required: false, // Ensure the join still works if no ticket is present
            },
          ],
        });

        if (!cartData) {
          return {
            success: false,
            status: 403,
            message: "This STAFF ID only valid for tickets",
          };
        }

        let singleTicPrice = cartData.EventTicketType.price;
        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (singleTicPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      } else if (couponType == "addon") {
        const cartData = await CartModel.findOne({
          where: {
            ticket_type: "addon",
            user_id: userId,
          },
          include: [
            {
              model: Addons,
              attributes: ["name", "price", "count"],
              required: false,
            },
          ],
        });

        if (!cartData) {
          return {
            success: false,
            status: 403,
            message: "This STAFF ID only valid for addon",
          };
        }

        let singleTicPrice = cartData.Addon.price;
        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (singleTicPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      } else if (couponType == "ticket_addon") {
        // Fetch all tickets for the user
        const tickets = await CartModel.findAll({
          where: {
            ticket_type: "ticket",
            user_id: userId,
          },
          include: [
            {
              model: EventTicketType,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Fetch all addons for the user
        const addons = await CartModel.findAll({
          where: {
            ticket_type: "addon",
            user_id: userId,
          },
          include: [
            {
              model: Addons,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Check if there are tickets and addons
        if (tickets.length === 0 || addons.length === 0) {
          return {
            success: false,
            status: 403,
            message: "This STAFF ID only valid for ticket with addon",
          };
        }

        // Calculate total ticket price
        let totalTicketPrice = tickets.reduce((total, ticket) => {
          return total + ticket.EventTicketType.price * ticket.count; // Multiply by count if necessary
        }, 0);

        // Calculate total addon price
        let totalAddonPrice = addons.reduce((total, addon) => {
          return total + addon.Addon.price * addon.count; // Multiply by count if necessary
        }, 0);

        // Calculate total price
        let totalPrice = totalTicketPrice + totalAddonPrice;

        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (totalPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      }

      // Assuming coupon is already defined with dataValues
      const cleanCouponData = {
        id: coupon.id,
        event: coupon.event,
        discount_type: coupon.discount_type,
        code: coupon.code,
        discount_value: coupon.discount_value,
        max_redeems: coupon.max_redeems,
        applicable_for: coupon.applicable_for,
        validity_period: coupon.validity_period,
        specific_date_from: coupon.specific_date_from,
        specific_date_to: coupon.specific_date_to,
        status: coupon.status,
        discountAmt: discountPrice, // Add the discount amount
      };

      return {
        success: true,
        status: 200,
        message: "STAFF ID APPLIED SUCCESSFULLY!",
        data: cleanCouponData, // Return only the cleaned data
      };
    }
  } catch (error) {
    console.error("Error validating STAFF ID:", error);
    return {
      success: false,
      status: 500,
      message: "Server error. Please try again later.",
    };
  }
}

// new api for couponEligible for transportation pass
export async function isCouponTransportationEligible(couponCode, userId, eventId) {
  try {
    const coupon = await CouponsModel.findOne({
      where: {
        code: couponCode,
        event: eventId,
        status: "Y",
        // specific_date_from: {
        //   [Op.lte]: new Date(),
        // },
        // specific_date_to: {
        //   [Op.gte]: new Date(),
        // },
      },
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    if (!coupon) {
      return {
        success: false,
        status: 404,
        message: "Invalid or expired STAFF ID.",
      };
    } else {
      // Check validity period if necessary
      if (coupon.validity_period === "specified_date") {
        const currentDate = new Date();
        const specificDateFrom = new Date(coupon.specific_date_from);
        const specificDateTo = new Date(coupon.specific_date_to);
      
        // console.log('Current Date:', currentDate);
        // console.log('Specific Date From:', specificDateFrom);
        // console.log('Specific Date To:', specificDateTo);
      
        if (
          (specificDateFrom && specificDateFrom.getTime() > currentDate.getTime()) ||
          (specificDateTo && specificDateTo.getTime() < currentDate.getTime())
        ) {
          return {
            success: false,
            status: 404,
            message: "This STAFF ID is not valid for the current date.",
          };          
        }
      }
      

      const redemptionCount = await Order.count({
        where: { couponCode: couponCode, Approved: "succeeded" },
      });
      
      if (redemptionCount >= parseInt(coupon.max_redeems, 10)) {
        return {
          success: false,
          status: 403,
          message: "STAFF ID has reached its maximum redemption limit.",
        };
      }

      let discountPrice = 0;
      let couponType = coupon.applicable_for;

      if (couponType == "all") {
        // Fetch all tickets for the user
        const tickets = await TransportationCart.findAll({
          where: {
            ticket_type: "ticket",
            user_id: userId,
          },
          include: [
            {
              model: EventTicketType,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Fetch all addons for the user
        const addons = await TransportationCart.findAll({
          where: {
            ticket_type: "addon",
            user_id: userId,
          },
          include: [
            {
              model: Addons,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Check if there are tickets and addons
        if (tickets.length == 0 && addons.length == 0) {
          return {
            success: false,
            status: 403,
            message: "Your cart is empty.",
          };
        }

        // Calculate total ticket price
        let totalTicketPrice = tickets.reduce((total, ticket) => {
          return total + ticket.EventTicketType.price * ticket.no_tickets; // Multiply by count if necessary
        }, 0);

        // Calculate total addon price
        let totalAddonPrice = addons.reduce((total, addon) => {
          return total + addon.Addon.price * addon.no_tickets; // Multiply by count if necessary
        }, 0);

        // Calculate total price
        let totalPrice = totalTicketPrice + totalAddonPrice;

        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (totalPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      } else if (couponType == "ticket") {
        const cartData = await TransportationCart.findOne({
          where: {
            ticket_type: "ticket",
            user_id: userId,
          },
          include: [
            {
              model: EventTicketType,
              attributes: ["title", "price", "count"], // Fields from EventTicketType
              required: false, // Ensure the join still works if no ticket is present
            },
          ],
        });

        if (!cartData) {
          return {
            success: false,
            status: 403,
            message: "This STAFF ID only valid for tickets",
          };
        }

        let singleTicPrice = cartData.EventTicketType.price;
        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (singleTicPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      } else if (couponType == "addon") {
        const cartData = await TransportationCart.findOne({
          where: {
            ticket_type: "addon",
            user_id: userId,
          },
          include: [
            {
              model: Addons,
              attributes: ["name", "price", "count"],
              required: false,
            },
          ],
        });

        if (!cartData) {
          return {
            success: false,
            status: 403,
            message: "This STAFF ID only valid for addon",
          };
        }

        let singleTicPrice = cartData.Addon.price;
        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (singleTicPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      } else if (couponType == "ticket_addon") {
        // Fetch all tickets for the user
        const tickets = await TransportationCart.findAll({
          where: {
            ticket_type: "ticket",
            user_id: userId,
          },
          include: [
            {
              model: EventTicketType,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Fetch all addons for the user
        const addons = await TransportationCart.findAll({
          where: {
            ticket_type: "addon",
            user_id: userId,
          },
          include: [
            {
              model: Addons,
              attributes: ["price"],
              required: false,
            },
          ],
        });

        // Check if there are tickets and addons
        if (tickets.length === 0 || addons.length === 0) {
          return {
            success: false,
            status: 403,
            message: "This STAFF ID only valid for ticket with addon",
          };
        }

        // Calculate total ticket price
        let totalTicketPrice = tickets.reduce((total, ticket) => {
          return total + ticket.EventTicketType.price * ticket.count; // Multiply by count if necessary
        }, 0);

        // Calculate total addon price
        let totalAddonPrice = addons.reduce((total, addon) => {
          return total + addon.Addon.price * addon.count; // Multiply by count if necessary
        }, 0);

        // Calculate total price
        let totalPrice = totalTicketPrice + totalAddonPrice;

        let discount_value = Math.floor(coupon.discount_value);
        let discount_type = coupon.discount_type;

        if (discount_type == "percentage") {
          discountPrice = (totalPrice * discount_value) / 100;
        } else if (discount_type == "fixed_amount") {
          discountPrice = discount_value;
        }
      }

      // Assuming coupon is already defined with dataValues
      const cleanCouponData = {
        id: coupon.id,
        event: coupon.event,
        discount_type: coupon.discount_type,
        code: coupon.code,
        discount_value: coupon.discount_value,
        max_redeems: coupon.max_redeems,
        applicable_for: coupon.applicable_for,
        validity_period: coupon.validity_period,
        specific_date_from: coupon.specific_date_from,
        specific_date_to: coupon.specific_date_to,
        status: coupon.status,
        discountAmt: discountPrice, // Add the discount amount
      };

      return {
        success: true,
        status: 200,
        message: "STAFF ID APPLIED SUCCESSFULLY!",
        data: cleanCouponData, // Return only the cleaned data
      };
    }
  } catch (error) {
    console.error("Error validating STAFF ID:", error);
    return {
      success: false,
      status: 500,
      message: "Server error. Please try again later.",
    };
  }
}

export async function handleCouponCreation(req, res) {
  try {
    const {
      couponPrefix,
      couponCount,
      selectedEvent,
      discountType,
      discountValue,
      validityPeriod,
      validFromDate,
      validToDate,
      applicableFor,
    } = req.body;

    const generatedCoupons = new Set();

    while (generatedCoupons.size < parseInt(couponCount)) {
      // Generate a 6-digit random number (e.g., 123456)
      const randomSuffix = Math.floor(
        100000 + Math.random() * 900000
      ).toString(); // Ensures a 6-digit number
      const couponCode = `${couponPrefix}${randomSuffix}`;

      // Check if the coupon code already exists in the database
      const existingCoupon = await CouponsModel.findOne({
        where: { code: couponCode },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });

      if (!existingCoupon && !generatedCoupons.has(couponCode)) {
        // Create a new coupon if it doesn't exist in the database and hasn't been generated already
        const newCoupon = await CouponsModel.create({
          code: couponCode,
          event: selectedEvent,
          discount_type: discountType,
          discount_value: discountValue,
          applicable_for: applicableFor,
          validity_period: validityPeriod,
          specific_date_from: validFromDate || null,
          specific_date_to: validToDate || null,
        });

        // Add the newly created coupon to the result set
        generatedCoupons.add(couponCode);
      }
    }

    // Convert the set of generated coupons into an array of objects for the response
    const couponsArray = Array.from(generatedCoupons).map((code) => ({
      code,
      event: selectedEvent,
      discount_type: discountType,
      discount_value: discountValue,
      applicable_for: applicableFor,
      validity_period: validityPeriod,
      specific_date_from: validFromDate || null,
      specific_date_to: validToDate || null,
    }));

    // Return the response
    return res.status(201).json({
      success: true,
      message: `${couponsArray.length} coupons created successfully!`,
      // coupons: couponsArray,
    });
  } catch (error) {
    // Handle errors
    console.error("Error during coupon processing:", error);
    return res.status(500).json({
      success: false,
      message:
        "An error occurred while processing the coupons. Error: " + error,
    });
  }
}

//   export async function addToCart({ userId, ticketId, ticket_type, symbol }) {
//     try {
//       // Define condition based on ticket type
//       const whereCondition = {
//         user_id: userId,
//         event_id: 109,
//         ticket_type: ticket_type,
//       };

//       if (ticket_type == "ticket") {
//         whereCondition.ticket_id = ticketId;
//       } else if (ticket_type == "addon") {
//         whereCondition.addons_id = ticketId;
//       }

//       // Find the existing cart item
//       const existCart = await CouponsModel.findOne({
//         where: whereCondition,
//       });

//       const deleteCondition = {
//         user_id: userId,
//         event_id: 109,
//         ticket_type: ticket_type,
//       };

//       if (ticket_type == "ticket") {
//         deleteCondition.ticket_id = { [Op.ne]: ticketId };
//       } else if (ticket_type == "addon") {
//         deleteCondition.addons_id = { [Op.ne]: ticketId };
//       }

//       // Remove other cart items with the same ticket_type
//       await CouponsModel.destroy({ where: deleteCondition });

//       if (existCart) {
//         // Update existing cart item
//         if (symbol === "+") {
//           existCart.no_tickets += 1;
//           await existCart.update({ no_tickets: existCart.no_tickets });
//           return { action: "added", message: "Item quantity increased in cart" };
//         } else if (symbol === "-") {
//           if (existCart.no_tickets === 1) {
//             await existCart.destroy();
//             return { action: "removed", message: "Item removed from cart" };
//           } else {
//             existCart.no_tickets -= 1;
//             await existCart.update({ no_tickets: existCart.no_tickets });
//             return {
//               action: "decreased",
//               message: "Item quantity decreased in cart",
//             };
//           }
//         }
//       } else if (symbol === "+") {
//         // Add new record if no existing item found
//         const newCartItem = await CouponsModel.create({
//           ...whereCondition,
//           no_tickets: 1,
//         });
//         return { action: "added", message: "Item added to cart successfully" };
//       }

//       return { action: "none", message: "No action performed" };
//     } catch (error) {
//       console.error("Error adding to cart:", error.message);
//       throw new Error("Error adding to cart");
//     }
//   }

// Function to get cart data for a specific user
