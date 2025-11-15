import { existsSync } from "fs";
import {
  CartModel,
  EventTicketType,
  Addons,
  BookTicket,
  AddonBook,
  Event,
  Currency,
  TransportationCart,
} from "../../../../database/models";
import { Op } from "sequelize";
import moment from "moment-timezone";


// export async function addToCart({ userId, eventId, ticketId, ticket_type, symbol }) {
//   try {
//     const whereCondition = {
//       user_id: userId,
//       event_id: eventId,
//       ticket_type: ticket_type,
//     };

//     if (ticket_type === "ticket") {
//       whereCondition.ticket_id = ticketId;
//     } else if (ticket_type === "addon") {
//       whereCondition.addons_id = ticketId;
//     }

//     const totalAlreadyTicket = await BookTicket.count({
//       where: {
//         cust_id: userId,
//         event_id: eventId,
//       },
//     });

//     const totalAlreadyAddon = await AddonBook.count({
//       where: {
//         user_id: userId,
//         event_id: eventId,
//       },
//     });

//     const totalTicketsInCart = await CartModel.sum('no_tickets', {
//       where: {
//         user_id: userId,
//         event_id: eventId,
//         ticket_type: 'ticket',
//       },
//     }) || 0;

//     const totalAlreadyAddonsInCart = await CartModel.sum('no_tickets', {
//       where: {
//         user_id: userId,
//         event_id: eventId,
//         ticket_type: 'addon',
//       },
//     }) || 0;

//     const existCart = await CartModel.findOne({
//       where: whereCondition,
//     });

//     const deleteCondition = {
//       user_id: userId,
//       event_id: eventId,
//       ticket_type: ticket_type,
//     };

//     if (ticket_type === "ticket") {
//       deleteCondition.ticket_id = { [Op.ne]: ticketId };
//     } else if (ticket_type === "addon") {
//       deleteCondition.addons_id = { [Op.ne]: ticketId };
//     }

//     await CartModel.destroy({ where: deleteCondition });

//     if (ticket_type === "addon") {

//       if (totalAlreadyTicket == 0) {
//         return { action: "none", message: "You must purchase a ticket before adding addons." };
//       }

//       const maxAllowedAddons = (totalTicketsInCart + totalAlreadyTicket) - totalAlreadyAddonsInCart;

//       if (existCart) {
//         const newAddonCount = existCart.no_tickets + (symbol === "+" ? 1 : -1);
//         if (newAddonCount > maxAllowedAddons) {
//           return { action: "none", message: "You cannot add more addons than the total number of tickets in the cart." };
//         }
//       } else if (symbol === "+") {
//         // Check if adding this addon exceeds the number of allowed addons
//         if (totalAlreadyAddonsInCart + 1 > maxAllowedAddons) {
//           return { action: "none", message: "You cannot add more addons than the total number of tickets in the cart." };
//         }
//       }
//     }

//     if (existCart) {
//       if (ticket_type === "ticket" && symbol === "+") {
//         existCart.no_tickets += 1;
//         await existCart.update({ no_tickets: existCart.no_tickets });
//         const newMaxAllowedAddons = (totalTicketsInCart + 1 + totalAlreadyTicket) - totalAlreadyAddonsInCart;
//         if (totalAlreadyAddonsInCart < newMaxAllowedAddons) {
//         }

//         return { action: "added", message: "Item quantity increased in cart" };
//       } else if (ticket_type === "ticket" && symbol === "-") {
//         if (existCart.no_tickets === 1) {
//           await existCart.destroy();
//           return { action: "removed", message: "Item removed from cart" };
//         } else {
//           existCart.no_tickets -= 1;
//           await existCart.update({ no_tickets: existCart.no_tickets });
//           return { action: "decreased", message: "Item quantity decreased in cart" };
//         }
//       } else if (ticket_type === "addon") {
//         if (symbol === "+") {
//           existCart.no_tickets += 1;
//           await existCart.update({ no_tickets: existCart.no_tickets });
//           return { action: "added", message: "Addon quantity increased in cart" };
//         } else if (symbol === "-") {
//           if (existCart.no_tickets === 1) {
//             await existCart.destroy();
//             return { action: "removed", message: "Addon removed from cart" };
//           } else {
//             existCart.no_tickets -= 1;
//             await existCart.update({ no_tickets: existCart.no_tickets });
//             return { action: "decreased", message: "Addon quantity decreased in cart" };
//           }
//         }
//       }
//     } else if (symbol === "+") {
//       // Add new record if no existing item found
//       const newCartItem = await CartModel.create({
//         ...whereCondition,
//         no_tickets: 1,
//       });
//       return { action: "added", message: "Item added to cart successfully" };
//     }

//     return { action: "none", message: "No action performed" };
//   } catch (error) {
//     console.error("Error adding to cart:", error.message);
//     throw new Error("Error adding to cart");
//   }
// }







// old functionality this api(09-04-2025)
export async function addToCart({
  userId,
  eventId,
  ticketId,
  ticket_type,
  symbol,
}) {
  try {
    // Define condition based on ticket type
    const whereCondition = {
      user_id: userId,
      event_id: eventId,
      ticket_type: ticket_type,
    };

    // Retrieve only the 'isAllAddonsAllowed' field for the specified event
    const result = await Event.findOne({
      where: {
        id: eventId,
        isAllAddonsAllowed: "Y",
      },
      attributes: ["isAllAddonsAllowed"], // Specify the field you want to retrieve
    });

    if (ticket_type == "ticket") {
      whereCondition.ticket_id = ticketId;
    } else if (ticket_type == "addon") {
      whereCondition.addons_id = ticketId;
    }

    if (!result) {
      const deleteCondition = {
        user_id: userId,
        event_id: eventId,
        ticket_type: ticket_type,
      };

      if (ticket_type == "ticket") {
        deleteCondition.ticket_id = { [Op.ne]: ticketId };
      } else if (ticket_type == "addon") {
        deleteCondition.addons_id = { [Op.ne]: ticketId };
      }
      // Remove other cart items with the same ticket_type
      await CartModel.destroy({ where: deleteCondition });
    }

    // find total ticket already purchase Booked
    const totalAlreadyTicket = await BookTicket.count({
      where: {
        cust_id: userId,
        transfer_user_id: null, // new added
        event_id: eventId,
      },
    });
    // find transfer ticket (04-04-2025)
    const transferTicket = await BookTicket.count({
      where: {
        transfer_user_id: userId,
        event_id: eventId,
      },
    });

    // find total ticket already purchase Booked
    const totalAlreadyAddons = await AddonBook.count({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    const totalTicketsInCart =
      (await CartModel.sum("no_tickets", {
        where: {
          user_id: userId,
          event_id: eventId,
          ticket_type: "ticket",
        },
      })) || 0;

    const totalAlreadyAddonsInCart =
      (await CartModel.sum("no_tickets", {
        where: {
          user_id: userId,
          event_id: eventId,
          ticket_type: "addon",
        },
      })) || 0;

    // Find the existing cart item
    const existCart = await CartModel.findOne({
      where: whereCondition,
    });

    // if cart item exist update it not transfer tickets (comment-04-04-2025)
    // let maxAllowedAddons = Math.round(totalTicketsInCart) + Math.round(totalAlreadyTicket);
    // const alreadyHaveAddons = Math.round(totalAlreadyAddons) + Math.round(totalAlreadyAddonsInCart);
    // maxAllowedAddons = maxAllowedAddons - alreadyHaveAddons;

    // Calculate max allowed addons considering BOTH kept and transferred tickets(04-04-2025)
    let maxAllowedAddons = Math.round(totalTicketsInCart) +
      Math.round(totalAlreadyTicket) +
      Math.round(transferTicket);

    const alreadyHaveAddons = Math.round(totalAlreadyAddons) +
      Math.round(totalAlreadyAddonsInCart);

    maxAllowedAddons = maxAllowedAddons - alreadyHaveAddons;



    // >>>>>>>>>>>>>>>>>>>>>>>>>New Implementation>>>>>>>>>>>>>>>>>>>
    if (result) {
      // let totalAllowedAddons = Math.round(totalTicketsInCart) + Math.round(totalAlreadyTicket);
      // // new updated transfer tickets (04-04-2025)
      let totalAllowedAddons = Math.round(totalTicketsInCart) + Math.round(totalAlreadyTicket) + Math.round(transferTicket);


      // Determine addon eligibility based on tickets
      if (totalAllowedAddons > 0) {
        if (ticket_type == "addon") {
          // Already book addon
          const totalAlreadyAddons = await AddonBook.count({
            where: {
              user_id: userId,
              event_id: eventId,
              addons_id: whereCondition.addons_id,
            },
          });

          // Already in cart
          const totalAlreadyAddonsInCart =
            (await CartModel.sum("no_tickets", {
              where: whereCondition,
            })) || 0;
          const alreadyHaveAddons =
            Math.round(totalAlreadyAddons) +
            Math.round(totalAlreadyAddonsInCart);
          maxAllowedAddons = totalAllowedAddons - alreadyHaveAddons;

          if (symbol == "-") {
            let newAddonCount =
              existCart.no_tickets + (symbol === "+" ? 1 : -1);

            if (existCart) {
              if (newAddonCount == 0) {
                await existCart.destroy();
                return {
                  action: "delete",
                  message: "All addons have been removed.",
                };
              }

              await existCart.update({
                no_tickets: newAddonCount,
              });
              return {
                action: "added",
                message: "Item quantity decreased in cart",
              };
            } else {
              return false;
            }
          }

          if (maxAllowedAddons > 0) {
            if (existCart) {
              await existCart.update({
                no_tickets: existCart.no_tickets + 1,
              });
              return {
                action: "added",
                message: "Item quantity increased in cart",
              };
            } else {
              await CartModel.create({
                user_id: userId,
                event_id: eventId,
                ticket_type: ticket_type,
                addons_id: ticketId,
                no_tickets: 1,
              });
              return {
                action: "added",
                message: "Item added to cart successfully",
              };
            }
          } else {
            return {
              action: "failed",
              message: "Maximum allowed addons reached",
            };
          }
        } else if (ticket_type == "ticket") {
          if (existCart) {
            let newTicketCount =
              existCart.no_tickets + (symbol === "+" ? 1 : -1);
            const updatedMaxAllowedAddons = Math.round(newTicketCount);

            if (newTicketCount <= 0) {
              await existCart.destroy();
              await CartModel.destroy({
                where: { user_id: existCart.user_id, ticket_type: "addon" },
              });
              return { action: "removed", message: "Item removed from cart" };
            } else {
              // Update the ticket count
              await existCart.update({ no_tickets: newTicketCount });
              const existingAddons = await CartModel.findAll({
                where: { ticket_type: "addon", user_id: existCart.user_id },
              });

              for (const addon of existingAddons) {
                if (addon.no_tickets > updatedMaxAllowedAddons) {
                  await addon.update({ no_tickets: updatedMaxAllowedAddons });
                }
              }
              return {
                action: "added",
                message: "Item quantity increased in cart",
              };
            }
          } else if (symbol === "+") {
            // Add a new ticket to the cart
            const newCartItem = await CartModel.create({
              ...whereCondition,
              no_tickets: 1,
            });
            return {
              action: "added",
              message: "Item added to cart successfully",
            };
          }
        }
      }
    }
    // >>>>>>>>>>>>>>>>>>>>>>>>>New Implementation>>>>>>>>>>>>>>>>>>>

    // console.log(">>>>>>>>>>>>>> maxAllowedAddons ", maxAllowedAddons);

    if (ticket_type == "addon") {
      if (symbol == "-") {
        let newAddonCount = existCart.no_tickets + (symbol === "+" ? 1 : -1);

        if (existCart) {
          if (newAddonCount == 0) {
            await existCart.destroy();
            return {
              action: "delete",
              message: "All addons have been removed.",
            };
          }

          await existCart.update({
            no_tickets: newAddonCount,
          });
          return {
            action: "added",
            message: "Item quantity decreased in cart",
          };
        } else {
          return false;
        }
      }

      if (maxAllowedAddons > 0) {
        if (existCart) {
          await existCart.update({
            no_tickets: existCart.no_tickets + 1,
          });
          return {
            action: "added",
            message: "Item quantity increased in cart",
          };
        } else {
          await CartModel.create({
            user_id: userId,
            event_id: eventId,
            ticket_type: ticket_type,
            addons_id: ticketId,
            no_tickets: 1,
          });
          return {
            action: "added",
            message: "Item added to cart successfully",
          };
        }
      } else {
        return { action: "failed", message: "Maximum allowed addons reached" };
      }

      if (existCart) {
        let newAddonCount = existCart.no_tickets + (symbol === "+" ? 1 : -1);

        maxAllowedAddons =
          Math.round(totalTicketsInCart) +
          Math.round(totalAlreadyTicket) -
          Math.round(totalAlreadyAddons);

        // If maxAllowedAddons is 0, delete the addon from the cart
        if (maxAllowedAddons === 0) {
          await CartModel.destroy({ where: { id: existCart.id } });
          return {
            action: "delete",
            message:
              "All addons have been removed from the cart because no tickets are allowed.",
          };
        }

        // If newAddonCount exceeds maxAllowedAddons, set it to maxAllowedAddons
        if (newAddonCount > maxAllowedAddons) {
          existCart.no_tickets = maxAllowedAddons; // Update no_tickets to maxAllowedAddons
          await existCart.update({ no_tickets: maxAllowedAddons });
          return {
            action: "update",
            message: `The number of addons maximum allowed: ${maxAllowedAddons}.`,
            updatedCart: existCart, // Include the updated cart in the response
          };
        }

        // If newAddonCount is less than maxAllowedAddons and greater than 0, update the addon count
        if (newAddonCount > 0 && newAddonCount <= maxAllowedAddons) {
          existCart.no_tickets = newAddonCount; // Update no_tickets
          await existCart.update({ no_tickets: newAddonCount });
          return {
            action: "update",
            message: `Addon count has been updated to ${newAddonCount}.`,
            updatedCart: existCart,
          };
        }

        // If newAddonCount is 0 or less, delete the addon from the cart
        if (newAddonCount <= 0) {
          await existCart.destroy();
          newAddonCount;
          return {
            action: "delete",
            message: "Addon has been removed from the cart.",
          };
        }
      } else if (symbol === "+") {
        maxAllowedAddons = maxAllowedAddons - Math.round(totalAlreadyAddons);

        // Check if adding this addon exceeds the number of allowed addons
        if (totalAlreadyAddonsInCart + 1 > maxAllowedAddons) {
          return {
            action: "none",
            message:
              "You cannot add more addons than the total number of tickets in the cart.",
          };
        }
      }
    } else if (ticket_type == "ticket") {
      if (existCart) {
        let newTicketCount = existCart.no_tickets + (symbol === "+" ? 1 : -1);
        const updatedMaxAllowedAddons = Math.round(newTicketCount);

        if (newTicketCount <= 0) {
          await existCart.destroy();
          await CartModel.destroy({
            where: { user_id: existCart.user_id, ticket_type: "addon" },
          });
          return { action: "removed", message: "Item removed from cart" };
        } else {
          // Update the ticket count
          await existCart.update({ no_tickets: newTicketCount });
          const existingAddons = await CartModel.findAll({
            where: { ticket_type: "addon", user_id: existCart.user_id },
          });

          for (const addon of existingAddons) {
            if (addon.no_tickets > updatedMaxAllowedAddons) {
              await addon.update({ no_tickets: updatedMaxAllowedAddons });
            }
          }
          return {
            action: "added",
            message: "Item quantity increased in cart",
          };
        }
      } else if (symbol === "+") {
        // Add a new ticket to the cart
        const newCartItem = await CartModel.create({
          ...whereCondition,
          no_tickets: 1,
        });
        return { action: "added", message: "Item added to cart successfully" };
      }
    }

    if (existCart) {
      // Update existing cart item
      if (symbol === "+") {
        existCart.no_tickets += 1;
        await existCart.update({ no_tickets: existCart.no_tickets });
        return { action: "added", message: "Item quantity increased in cart" };
      } else if (symbol === "-") {
        if (existCart.no_tickets === 1) {
          await existCart.destroy();
          return { action: "removed", message: "Item removed from cart" };
        } else {
          existCart.no_tickets -= 1;
          await existCart.update({ no_tickets: existCart.no_tickets });
          return {
            action: "decreased",
            message: "Item quantity decreased in cart",
          };
        }
      }
    } else if (symbol === "+") {
      // Add new record if no existing item found
      const newCartItem = await CartModel.create({
        ...whereCondition,
        no_tickets: 1,
      });
      return { action: "added", message: "Item added to cart successfully" };
    }

    return { action: "none", message: "No action performed" };
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    throw new Error("Error adding to cart");
  }
}

export async function addTicketForAccommodation({
  userId,
  eventId,
  noOfTick,
}) {
  try {
    const event = await Event.findOne({
      where: { id: eventId },
      include: {
        model: EventTicketType,
        required: false, // to include all types
      },
    });

    if (!event) {
      return {
        message: "Invalid Event Id",
        success: false,
      };
    }

    const timezone = event.EventTimeZone || "UTC";

    if (!moment.tz.zone(timezone)) {
      return {
        message: "Invalid timezone in event details",
        success: false,
      };
    }

    const currentDate = moment().tz(timezone);
    // console.log('>>>>>>>>>>', timezone);

    const validTickets = (event.EventTicketTypes || []).filter((ticket) => {
      if (
        ticket.type !== "open_sales" ||
        ticket.hidden !== "N" || // only visible tickets
        !ticket.sale_start_date ||
        !ticket.sale_end_date
      ) {
        return false;
      }

      const start = moment.tz(ticket.sale_start_date, timezone);
      const end = moment.tz(ticket.sale_end_date, timezone).endOf('day'); // 👈 key fix
      // console.log("Ticket:", ticket.title);
      console.log("Start:", start.format(), "End:", end.format(), "Now:", currentDate.format());
      // return currentDate
      return (
        start.isValid() &&
        end.isValid() &&
        currentDate.isSameOrAfter(start) &&
        currentDate.isSameOrBefore(end)
      );
    });

    if (validTickets.length == 0) {
      return {
        message: "No active ticket types found for this event.",
        success: false,
      };
    }

    await CartModel.destroy({
      where: {
        user_id: userId,
        event_id: eventId,
      },
    });

    const selectedTicketType = validTickets[0];

    await CartModel.create({
      user_id: userId,
      event_id: eventId,
      ticket_type: "ticket",
      ticket_id: selectedTicketType.id,
      no_tickets: noOfTick,
    });

    return {
      message: "Ticket is added into the cart",
      success: true,
    };
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    return {
      message: "Error adding to cart: " + error.message,
      success: false,
    };
  }
}


// new functionality this api(09-04-2025)
// export async function addToCart({
//   userId,
//   eventId,
//   ticketId,
//   ticket_type,
//   symbol,
// }) {
//   try {
//     // Define condition based on ticket type
//     const whereCondition = {
//       user_id: userId,
//       event_id: eventId,
//       ticket_type: ticket_type,
//     };

//     // Retrieve only the 'isAllAddonsAllowed' field for the specified event
//     const result = await Event.findOne({
//       where: {
//         id: eventId,
//         isAllAddonsAllowed: "Y",
//       },
//       attributes: ["isAllAddonsAllowed"], // Specify the field you want to retrieve
//     });

//     if (ticket_type == "ticket") {
//       whereCondition.ticket_id = ticketId;
//     } else if (ticket_type == "addon") {
//       whereCondition.addons_id = ticketId;
//     }

//     if (!result) {
//       const deleteCondition = {
//         user_id: userId,
//         event_id: eventId,
//         ticket_type: ticket_type,
//       };

//       if (ticket_type == "ticket") {
//         deleteCondition.ticket_id = { [Op.ne]: ticketId };
//       } else if (ticket_type == "addon") {
//         deleteCondition.addons_id = { [Op.ne]: ticketId };
//       }
//       // Remove other cart items with the same ticket_type
//       await CartModel.destroy({ where: deleteCondition });
//     }

//     // find total ticket already purchase Booked
//     const totalAlreadyTicket = await BookTicket.count({
//       where: {
//         cust_id: userId,
//         transfer_user_id: null, // new added
//         event_id: eventId,
//       },
//     });

//     // find transfer ticket (04-04-2025)
//     const transferTicket = await BookTicket.count({
//       where: {
//         transfer_user_id: userId,
//         event_id: eventId,
//       },
//     });


//     // find total ticket already purchase Booked
//     const totalAlreadyAddons = await AddonBook.count({
//       where: {
//         user_id: userId,
//         event_id: eventId,
//       },
//     });

//     const totalTicketsInCart =
//       (await CartModel.sum("no_tickets", {
//         where: {
//           user_id: userId,
//           event_id: eventId,
//           ticket_type: "ticket",
//         },
//       })) || 0;

//     const totalAlreadyAddonsInCart =
//       (await CartModel.sum("no_tickets", {
//         where: {
//           user_id: userId,
//           event_id: eventId,
//           ticket_type: "addon",
//         },
//       })) || 0;

//     // Find the existing cart item
//     const existCart = await CartModel.findOne({
//       where: whereCondition,
//     });


//     // <<<<<<<<<<<<<<<<<<<<<<<<<<Start>>>>>>>>>>>>>>>>>>>>>>>>>>>
//     // transfer ticket
//     const transferTicket2 = await BookTicket.findAll({
//       where: {
//         transfer_user_id: userId,
//         event_id: eventId,
//       },
//     });

//     // purchase tickets
//     const purchaseTicket = await BookTicket.findAll({
//       where: {
//         cust_id: userId,
//         event_id: eventId,

//       },
//     });
//     // console.log("purchaseTicket", purchaseTicket)

//     // Fetch the existing addon data from the CartModel for the given user and event
//     const cartData = await CartModel.findAll({
//       where: {
//         user_id: userId,
//         event_id: eventId,
//         ticket_type: 'addon',
//       },
//     });

//     // Initialize an object to store the count of each addon_id
//     let addonCountInCart = {};

//     // Loop through the fetched cart data to count the addons
//     cartData.forEach(item => {
//       const addonId = item.addons_id;
//       const noTickets = item.no_tickets;
//       if (!addonCountInCart[addonId]) {
//         addonCountInCart[addonId] = 0;
//       }
//       addonCountInCart[addonId] += noTickets;
//     });


//     let is_already_buy_addonIds = [];
//     let addon_eligible_addonIds = [];
//     let total_num_of_trans_tick = 0;


//     transferTicket2.forEach((each) => {
//       total_num_of_trans_tick += 1;
//       if (each.is_buy_addons_ids) {
//         const ids = each.is_buy_addons_ids.split(',').map(id => id.trim());
//         is_already_buy_addonIds = is_already_buy_addonIds.concat(ids);
//       }

//       if (each.addon_eligible_ids) {
//         const eli_ids = each.addon_eligible_ids.split(',').map(id => id.trim());
//         addon_eligible_addonIds = addon_eligible_addonIds.concat(eli_ids);
//       }
//     });

//     // Process purchased tickets (same logic as transferred tickets)
//     purchaseTicket.forEach((each) => {
//       total_num_of_trans_tick += 1;
//       if (each.is_buy_addons_ids) {
//         const ids = each.is_buy_addons_ids.split(',').map(id => id.trim());
//         is_already_buy_addonIds = is_already_buy_addonIds.concat(ids);
//       }

//       if (each.addon_eligible_ids) {
//         const eli_ids = each.addon_eligible_ids.split(',').map(id => id.trim());
//         addon_eligible_addonIds = addon_eligible_addonIds.concat(eli_ids);
//       }

//     });

//     addon_eligible_addonIds = [...new Set(addon_eligible_addonIds)];

//     console.log('Eligible addon IDs:', addon_eligible_addonIds); // e.g., [4, 6, 7]
//     console.log('Bought addon IDs:', is_already_buy_addonIds); // e.g., [4,6,7,6]
//     // console.log('Eligible total_num ticket:', total_num_of_trans_tick); // e.g., 2
//     // console.log('totalAlreadyTicket:', totalAlreadyTicket); // e.g., 2
//     // Initialize addonCount with totalEligibleAddon
//     let addonCount = {};
//     let totalEligibleAddon = total_num_of_trans_tick + Number(totalTicketsInCart);

//     addon_eligible_addonIds.forEach(addonId => {
//       const id = Number(addonId);
//       addonCount[id] = totalEligibleAddon;
//     });

//     // Count how many times each addon was bought
//     const boughtCountMap = {};
//     is_already_buy_addonIds.forEach(id => {
//       const addonId = Number(id);
//       if (!boughtCountMap[addonId]) boughtCountMap[addonId] = 0;
//       boughtCountMap[addonId]++;
//     });

//     // Subtract bought addon counts
//     for (let id in addonCount) {
//       const bought = boughtCountMap[id] || 0;
//       addonCount[id] -= bought;
//       if (addonCount[id] < 0) addonCount[id] = 0;
//     }

//     // Subtract addons already in the cart
//     for (let id in addonCount) {
//       if (addonCount[id] > 0 && addonCountInCart[id]) {
//         addonCount[id] -= addonCountInCart[id];
//         if (addonCount[id] < 0) addonCount[id] = 0;
//       }
//     }

//     // Log the final addon count after adjustments
//     console.log('>>>>>>>>>>>>>', addonCountInCart);
//     console.log("Final Addon Count after adjustments:", addonCount);
//     console.log('>>>>>>>>>>>>>>', addonCount[Number(ticketId)]);
//     // return false

//     if (symbol == '+' && whereCondition.ticket_type == 'addon' && addonCount[Number(ticketId)] == 0) {
//       console.log('>>>>>>Your are not eligible for this addon');
//       return {
//         action: "failed",
//         message: "You are not eligible for this addon ",
//       };
//     }
//     // return false;

//     // <<<<<<<<<<<<<<<<<<<<<<<<<<End>>>>>>>>>>>>>>>>>>>>>>>>>>>

//     // Calculate max allowed addons considering BOTH kept and transferred tickets(04-04-2025)
//     let maxAllowedAddons = Math.round(totalTicketsInCart) +
//       Math.round(totalAlreadyTicket)
//       + Math.round(transferTicket);

//     const alreadyHaveAddons = Math.round(totalAlreadyAddons) +
//       Math.round(totalAlreadyAddonsInCart);
//     maxAllowedAddons = maxAllowedAddons - alreadyHaveAddons;

//     // >>>>>>>>>>>>>>>>>>>>>>>>>New Implementation>>>>>>>>>>>>>>>>>>>
//     if (result) {
//       // let totalAllowedAddons = Math.round(totalTicketsInCart) + Math.round(totalAlreadyTicket);
//       let totalAllowedAddons = Math.round(totalTicketsInCart) + Math.round(totalAlreadyTicket) + Math.round(transferTicket);
//       // Determine addon eligibility based on tickets
//       if (totalAllowedAddons > 0) {
//         if (ticket_type == "addon") {
//           // Already book addon
//           const totalAlreadyAddons = await AddonBook.count({
//             where: {
//               user_id: userId,
//               event_id: eventId,
//               addons_id: whereCondition.addons_id,
//             },
//           });

//           // Already in cart
//           const totalAlreadyAddonsInCart =
//             (await CartModel.sum("no_tickets", {
//               where: whereCondition,
//             })) || 0;
//           const alreadyHaveAddons =
//             Math.round(totalAlreadyAddons) +
//             Math.round(totalAlreadyAddonsInCart);
//           maxAllowedAddons = totalAllowedAddons - alreadyHaveAddons;

//           if (symbol == "-") {
//             let newAddonCount =
//               existCart.no_tickets + (symbol === "+" ? 1 : -1);

//             if (existCart) {
//               if (newAddonCount == 0) {
//                 await existCart.destroy();
//                 return {
//                   action: "delete",
//                   message: "All addons have been removed.",
//                 };
//               }

//               await existCart.update({
//                 no_tickets: newAddonCount,
//               });
//               return {
//                 action: "added",
//                 message: "Item quantity decreased in cart",
//               };
//             } else {
//               return false;
//             }
//           }

//           if (maxAllowedAddons > 0) {
//             if (existCart) {
//               await existCart.update({
//                 no_tickets: existCart.no_tickets + 1,
//               });
//               return {
//                 action: "added",
//                 message: "Item quantity increased in cart",
//               };
//             } else {
//               await CartModel.create({
//                 user_id: userId,
//                 event_id: eventId,
//                 ticket_type: ticket_type,
//                 addons_id: ticketId,
//                 no_tickets: 1,
//               });
//               return {
//                 action: "added",
//                 message: "Item added to cart successfully",
//               };
//             }
//           } else {
//             return {
//               action: "failed",
//               message: "Maximum allowed addons reached",
//             };
//           }
//         } else if (ticket_type == "ticket") {
//           if (existCart) {
//             let newTicketCount =
//               existCart.no_tickets + (symbol === "+" ? 1 : -1);
//             const updatedMaxAllowedAddons = Math.round(newTicketCount);

//             if (newTicketCount <= 0) {
//               await existCart.destroy();
//               await CartModel.destroy({
//                 where: { user_id: existCart.user_id, ticket_type: "addon" },
//               });
//               return { action: "removed", message: "Item removed from cart" };
//             } else {
//               // Update the ticket count
//               await existCart.update({ no_tickets: newTicketCount });
//               const existingAddons = await CartModel.findAll({
//                 where: { ticket_type: "addon", user_id: existCart.user_id },
//               });

//               for (const addon of existingAddons) {
//                 if (addon.no_tickets > updatedMaxAllowedAddons) {
//                   await addon.update({ no_tickets: updatedMaxAllowedAddons });
//                 }
//               }
//               return {
//                 action: "added",
//                 message: "Item quantity increased in cart",
//               };
//             }
//           } else if (symbol === "+") {
//             // Add a new ticket to the cart
//             const newCartItem = await CartModel.create({
//               ...whereCondition,
//               no_tickets: 1,
//             });
//             return {
//               action: "added",
//               message: "Item added to cart successfully",
//             };
//           }
//         }
//       }
//     }
//     // >>>>>>>>>>>>>>>>>>>>>>>>>New Implementation>>>>>>>>>>>>>>>>>>>

//     // console.log(">>>>>>>>>>>>>> maxAllowedAddons ", maxAllowedAddons);

//     if (ticket_type == "addon") {
//       if (symbol == "-") {
//         let newAddonCount = existCart.no_tickets + (symbol === "+" ? 1 : -1);

//         if (existCart) {
//           if (newAddonCount == 0) {
//             await existCart.destroy();
//             return {
//               action: "delete",
//               message: "All addons have been removed.",
//             };
//           }

//           await existCart.update({
//             no_tickets: newAddonCount,
//           });
//           return {
//             action: "added",
//             message: "Item quantity decreased in cart",
//           };
//         } else {
//           return false;
//         }
//       }

//       if (maxAllowedAddons > 0) {
//         if (existCart) {
//           await existCart.update({
//             no_tickets: existCart.no_tickets + 1,
//           });
//           return {
//             action: "added",
//             message: "Item quantity increased in cart",
//           };
//         } else {
//           await CartModel.create({
//             user_id: userId,
//             event_id: eventId,
//             ticket_type: ticket_type,
//             addons_id: ticketId,
//             no_tickets: 1,
//           });
//           return {
//             action: "added",
//             message: "Item added to cart successfully",
//           };
//         }
//       } else {
//         return { action: "failed", message: "Maximum allowed addons reached" };
//       }
//     } else if (ticket_type == "ticket") {
//       if (existCart) {
//         let newTicketCount = existCart.no_tickets + (symbol === "+" ? 1 : -1);
//         const updatedMaxAllowedAddons = Math.round(newTicketCount);

//         if (newTicketCount <= 0) {
//           await existCart.destroy();
//           await CartModel.destroy({
//             where: { user_id: existCart.user_id, ticket_type: "addon" },
//           });
//           return { action: "removed", message: "Item removed from cart" };
//         } else {
//           // Update the ticket count
//           await existCart.update({ no_tickets: newTicketCount });
//           const existingAddons = await CartModel.findAll({
//             where: { ticket_type: "addon", user_id: existCart.user_id },
//           });

//           for (const addon of existingAddons) {
//             if (addon.no_tickets > updatedMaxAllowedAddons) {
//               await addon.update({ no_tickets: updatedMaxAllowedAddons });
//             }
//           }
//           return {
//             action: "added",
//             message: "Item quantity increased in cart",
//           };
//         }
//       } else if (symbol === "+") {
//         // Add a new ticket to the cart
//         const newCartItem = await CartModel.create({
//           ...whereCondition,
//           no_tickets: 1,
//         });
//         return { action: "added", message: "Item added to cart successfully" };
//       }
//     }

//     if (existCart) {
//       // Update existing cart item
//       if (symbol === "+") {
//         existCart.no_tickets += 1;
//         await existCart.update({ no_tickets: existCart.no_tickets });
//         return { action: "added", message: "Item quantity increased in cart" };
//       } else if (symbol === "-") {
//         if (existCart.no_tickets === 1) {
//           await existCart.destroy();
//           return { action: "removed", message: "Item removed from cart" };
//         } else {
//           existCart.no_tickets -= 1;
//           await existCart.update({ no_tickets: existCart.no_tickets });
//           return {
//             action: "decreased",
//             message: "Item quantity decreased in cart",
//           };
//         }
//       }
//     } else if (symbol === "+") {
//       // Add new record if no existing item found
//       const newCartItem = await CartModel.create({
//         ...whereCondition,
//         no_tickets: 1,
//       });
//       return { action: "added", message: "Item added to cart successfully" };
//     }

//     return { action: "none", message: "No action performed" };
//   } catch (error) {
//     console.error("Error adding to cart:", error.message);
//     throw new Error("Error adding to cart");
//   }
// }







// Function to get cart data for a specific user
export async function getCartByUserId(userId) {
  try {
    const cartData = await CartModel.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: EventTicketType,
          attributes: ["title", "price", "count"], // Fields from EventTicketType
          required: false, // Ensure the join still works if no ticket is present
        },
        {
          model: Addons,
          attributes: ["name", "price", "count"], // Fields from Addons
          required: false, // Ensure the join still works if no addon is present
        },
        {
          model: Event,
          attributes: ["Name", "ImageURL", "StartDate", "EndDate"], // Fields from Addons
          required: false, // Ensure the join still works if no addon is present
          include: [
            {
              model: Currency,
              attributes: ["Currency", "Currency_symbol"],
            },
          ],
        },
      ],
    });

    return cartData;
  } catch (error) {
    console.error("Error fetching cart data:", error);
    throw new Error("Failed to retrieve cart data");
  }
}

export async function deleteCartItem(cartId) {
  try {
    const existCart = await CartModel.findOne({
      where: { id: cartId },
    });

    if (!existCart) {
      throw new Error("Cart item not found");
    }

    // Delete the cart item with the given cartId
    await CartModel.destroy({ where: { id: cartId } });

    // If the deleted item was a ticket, check if any tickets are left for that user
    if (existCart.ticket_type === "ticket") {
      const remainingTickets = await CartModel.count({
        where: {
          user_id: existCart.user_id,
          ticket_type: "ticket",
        },
      });

      // If no tickets left, remove all addons for that user
      if (remainingTickets === 0) {
        await CartModel.destroy({
          where: {
            user_id: existCart.user_id,
            ticket_type: "addon",
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting cart item:", error.message);
    throw new Error("Failed to delete cart item");
  }
}


export async function deleteCartItemv1(cartId) {
  try {
    const existCart = await CartModel.findOne({
      where: {
        id: cartId,
      },
    });
    let newTicketCount = existCart.no_tickets - 1;
    if (newTicketCount == 0 && existCart.ticket_type == "ticket") {
      await CartModel.destroy({
        where: { user_id: existCart.user_id, ticket_type: "addon" },
      });
    }

    // Delete the cart item with the given cartId
    const deletedCart = await CartModel.destroy({ where: { id: cartId } });

    if (deletedCart) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching cart data:", error.message);
    throw new Error("Failed to delete cart item");
  }
}


// Test cart new testcart.js
// Function to get cart data for a specific user+Event id
export async function getCartByUserIdTest(userId, event_id) {
  try {
    const cartData = await CartModel.findAll({
      where: {
        user_id: userId,
        event_id: event_id
      },
      include: [
        {
          model: EventTicketType,
          attributes: ["title", "price", "count"], // Fields from EventTicketType
          required: false, // Ensure the join still works if no ticket is present
        },
        {
          model: Addons,
          attributes: ["name", "price", "count"], // Fields from Addons
          required: false, // Ensure the join still works if no addon is present
        },
        {
          model: Event,
          attributes: ["Name", "ImageURL", "StartDate", "EndDate"], // Fields from Addons
          required: false, // Ensure the join still works if no addon is present
          include: [
            {
              model: Currency,
              attributes: ["Currency", "Currency_symbol"],
            },
          ],
        },
      ],
    });

    return cartData;
  } catch (error) {
    console.error("Error fetching cart data:", error);
    throw new Error("Failed to retrieve cart data");
  }
}





// New Functionality add to cart for only transportation-cart - (25-08-2025)
export async function addToCarTransportationPass({
  userId,
  eventId,
  ticketId,
  ticket_type,
  symbol,
}) {
  try {
    // ✅ Only addons are allowed
    if (ticket_type !== "addon") {
      return { action: "failed", message: "Only addons are allowed in cart" };
    }
    // ✅ Count purchased tickets (own tickets, not transferred away)
    const totalOwnTickets = await BookTicket.count({
      where: {
        cust_id: userId,
        transfer_user_id: null,
        event_id: eventId,
      },
    });
    // ✅ Count tickets transferred TO this user
    const totalTransferredTickets = await BookTicket.count({
      where: {
        transfer_user_id: userId,
        event_id: eventId,
      },
    });
    // ✅ Total tickets user currently holds (own + transferred)
    const totalTickets = totalOwnTickets + totalTransferredTickets;
    // console.log('>>>>>>>>>>>>>>',totalTickets);
    if (totalTickets <= 0) {
      return {
        action: "failed",
        success: false,
        message: "You must have at least 1 ticket to purchased transportation pass",
      };
    }
    // ✅ Check existing addon in cart
    const whereCondition = {
      user_id: userId,
      event_id: eventId,
      ticket_type: "addon",
      addons_id: ticketId,
    };
    const existCart = await TransportationCart.findOne({ where: whereCondition });
    // 🔽 Decrease addon
    if (symbol === "-") {
      if (existCart) {
        const newCount = existCart.no_tickets - 1;

        if (newCount <= 0) {
          await existCart.destroy();
          return { action: "delete", message: "Addon removed from cart" };
        } else {
          await existCart.update({ no_tickets: newCount });
          return {
            action: "decreased",
            message: "Addon quantity decreased in cart",
          };
        }
      } else {
        return { action: "none", message: "Addon not found in cart" };
      }
    }

    // 🔼 Increase addon
    if (symbol === "+") {
      if (existCart) {
        await existCart.update({
          no_tickets: existCart.no_tickets + 1,
        });
        return { action: "added", message: "Addon quantity increased in cart" };
      } else {
        await TransportationCart.create({
          user_id: userId,
          event_id: eventId,
          ticket_type: "addon",
          addons_id: ticketId,
          no_tickets: 1,
        });
        return { action: "added", message: "Addon added to cart successfully" };
      }
    }

    return { action: "none", message: "No action performed" };
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    throw new Error("Error adding to cart");
  }
}


// new Api get cart only for addons transportation - pass
export async function getCartByUserIdTransportationPass(userId) {
  try {
    const cartData = await TransportationCart.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Event,
          attributes: ["Name", "ImageURL", "StartDate", "EndDate"], // Fields from Addons
          required: false, // Ensure the join still works if no addon is present
          include: [
            {
              model: Currency,
              attributes: ["Currency", "Currency_symbol"],
            },
          ],
        },
        {
          model: Addons,
          attributes: ["name", "price", "count"],
          required: true,
        },
      ],
    });
    return cartData;
  } catch (error) {
    console.error("Error fetching cart data:", error);
    throw new Error("Failed to retrieve cart data");
  }
}