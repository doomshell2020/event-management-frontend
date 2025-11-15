// import { Admin_Signup, Profile_View, AdminLogin, Edit_Profile } from "../../service/dbservice";
import {
  PromotionCodes,
  Search_orders,
  changeTicketName,
  transferTicket,
  ticketExport,
  myTickets,
  orderSuccess,
  transferTicketCheck,
  eventOrderList,
  findCompleteOrderListByEvent,
  findAddons,
  transferOneAddon,
  SendRemainingAmountEmail,
  findDueAmount
} from "@/shared/services/admin/ordermanager/orderservices";
import {
  searchOrderDetails,
  searchOrderDetailsForSales,
  searchOrder,
  viewCancelTickets,
  searchCancelOrder
} from "@/shared/services/admin/eventmanager/eventservices";
const handler = async (req, res) => {
  try {
    const { method, query } = req;
    switch (method) {
      case "POST": {
        try {
          if (req.body.key == "order_list") {
            const orderList = await findCompleteOrderListByEvent(
              req.body,
              res
            );
            res.json(orderList);
          } else if (req.body.key == "search_order") {
            const dataView = await searchOrder(req.body, res);
            res.json(dataView);
          } else if (req.body.key == "get_sales_data") {
            const dataView = await searchOrderDetailsForSales(req.body, res);
            res.json(dataView);
          } else if (req.body.key == "searchOrderDetails") {
            const dataView = await searchOrderDetails(req.body, res);
            res.json(dataView);
          } else if (req.body.key === "Search_orders") {
            const dataView = await Search_orders(req.body, res);
            res.json(dataView);
          } else if (req.body.key == "PromotionCodes") {
            const promotionCodes = await PromotionCodes(req.body, res);
            res.json(promotionCodes);
          } else if (req.body.key == "changeTicketName") {
            const ticketNameChange = await changeTicketName(req.body, res);
            res.json(ticketNameChange);
          } else if (req.body.key == "transferTicket") {
            const ticketTransfer = await transferTicket(req.body, res);
            res.json(ticketTransfer);
          } else if (req.body.key == "transferAddon") {
            const addonTransfer = await transferOneAddon(req.body, res);
            res.json(addonTransfer);
          }
          else if (req.body.key == "ticketExport") {
            const ticketScanned = await ticketExport(req.body, res);
            res.json(ticketScanned);
          } else if (req.body.key == "myTickets") {
            const MyTickets = await myTickets(req.body, res);
            res.json(MyTickets);
          } else if (req.body.key == "orderSuccess") {
            const successOrder = await orderSuccess(req.body, res);
            res.json(successOrder);
          } else if (req.body.key == "cancel_tickets") {
            const cancelList = await viewCancelTickets(req.body, res);
            res.json(cancelList);
          } else if (req.body.key == "eventOrdersList") {
            const ordersList = await eventOrderList(req.body, res);
            res.json(ordersList);
          } else if (req.body.key == "searchCancelOrders") {
            const cancelOrdersList = await searchCancelOrder(req.body, res);
            res.json(cancelOrdersList);
          } else if (req.body.key == "find_addon") {
            const find_addons = await findAddons(req.body, res);
            res.json(find_addons);
          } else if (req.body.key == "remaining_amount_email") {
            const remaining_amount = await SendRemainingAmountEmail(req.body, res);
            res.json(remaining_amount);
          }
          else if (req.body.key == "transferTicketCheck") {
            const ticketTransferCheck = await transferTicketCheck(
              req.body,
              res
            );
            res.json(ticketTransferCheck);
          }
        } catch (error) {
          console.error("Error processing POST request:", error);
          res.status(500).json({ error: "Error :" + error.message });
        }
        break;
      }
      case "GET": {
        const { eventId, transactionId } = query;
        if (eventId) {
          const promotionCodes = await PromotionCodes({ eventId }, req);
          res.json(promotionCodes);
        } else if (transactionId) {
          const due_amount = await findDueAmount({ transactionId }, req);
          res.json(due_amount);
        }

        break;
      }
      default:
        res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (err) {
    console.error("Error:", err); // Debugging any unexpected error
    res.status(400).json({
      error_code: "api_error",
      message: "Error :" + err.message,
    });
  }
};

export default handler;
