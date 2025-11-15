import {
  View_InvitationsMembers,
  view_SubmitApplication,
  view_Events,
  viewEventsIsDataAvailable,
  getDashboardData,
  getTicketsSoldPerDayByEventId,
  getSalesTicTypeEventId,
  TicketsAddonsSalesMonthlyReport,
  TicketsAddonsSalesMonthly,
  TicketsAddonsSalesMonthlyTest,
  getLastHousesBookedV1,
  getRecentlyBookedTicketsUser,
  TicketsAddonsSalesSummaryReport,
} from "@/shared/services/admin/dashboardmanager/dashboard_services";


import { checkApiKey } from '@/middleware/checkApiKey';

const handler = async (req, res) => {
  return checkApiKey(req, res, async () => {
    try {
      const { method, query } = req;
      switch (method) {
        case "POST": {

          console.log('>>>>>>>>>>>>>>>>>>>>>>>', req.body);

          if (req.body.key == "dashboardData") {
            const dashboard_data = await getTicketsSoldPerDayByEventId(req.body);
            res.json(dashboard_data);
            break;
          } else if (req.body.key == "sale_ticket_reports") {
            const sale_ticket_reports = await getSalesTicTypeEventId(req.body);
            res.json(sale_ticket_reports);
            break;
          } else if (req.body.key == "tickets_addons_per_months") {
            const tickets_sales_per_months = await TicketsAddonsSalesMonthlyReport(req.body);
            res.json(tickets_sales_per_months);
            break;
          } else if (req.body.key == "tickets_addons_sales_monthly") {
            const tickets_addons_months = await TicketsAddonsSalesMonthly(req.body);
            res.json(tickets_addons_months);
            break;
          } else if (req.body.key == "tickets_addons_sales_monthly_report") {
            const tickets_addons_months_test = await TicketsAddonsSalesMonthlyTest(req.body);
            res.json(tickets_addons_months_test);
            break;
          } else if (req.body.key == "getLastHousesBooked") {
            const housesData = await getLastHousesBookedV1(req.body);
            res.json(housesData);
            break;
          } else if (req.body.key == "RecentlyBookedTicketsUser") {
            const BookedTicketsUser = await getRecentlyBookedTicketsUser(req.body);
            res.json(BookedTicketsUser);
            break;
          }
          else {
            const search_data = await Search_Transactions(req.body);
            res.status(200).json(search_data);
            break;
          }
        }
        case "GET": {
          const { key } = query;
          if (key == "submitApplication") {
            const viewUser = await view_SubmitApplication(req);
            res.status(200).json(viewUser);
          } else if (key == "allEvents") {
            const event = await viewEventsIsDataAvailable(req);
            res.status(200).json(event);
          } else {
            const InvitationsMembers = await View_InvitationsMembers(req);
            res.status(200).json(InvitationsMembers);
          }
          break;
        }
        default:
          res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
          res.status(405).end(`Method ${method} Not Allowed`);
          break;
      }
    } catch (error) {
      console.error("API Error:", error);
      return res.status(500).json({
        success: false,
        message: "Server Error",
        error: error.message || error,
      });
    }
  });
};
export default handler;
