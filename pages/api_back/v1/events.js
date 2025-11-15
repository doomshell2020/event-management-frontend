import {
  View_Events,
  getAllCurrency,
  Search_Events,
  Add_Events,
  View_EventsByid,
  UpdateEvent,
  viewActiveEventList,
  eventTicketSoldDetails,
  eventOrder,
  searchOrder,
  getTotalOrders,
  searchOrderDetails,
  viewCompletedEventDetails,
  getAllEventsWithData,
  getEventSaleSummary,
  getEventSaleSummaryByEventId,
  eventCancelOrder,
  viewEventDetailsAdminPreview,
  addTicketsAddons,
  findCompleteOrderListByEvent,
  updateEventStatus //update event status
} from "@/shared/services/admin/eventmanager/eventservices";
import fs from "fs";
export const config = {
  api: {
    bodyParser: false,
  },
};

import { imageUpload } from "@/utils_back/fileUpload";
import { uploadToS3 } from '@/utils_back/s3Uploader';
import { s3FileUpload } from "@/utils_back/s3FileUpload";
import { deleteFromS3 } from '@/utils_back/s3Delete';

export default async function handler(req, res) {
  try {
    const { method, query } = req;

    switch (method) {
      case "POST": {
        try {
          imageUpload.single('ImageURL')(req, res, async (err) => {

            let imageFilename = null;
            const targetFolder = 'profiles';

            if (err) {
              console.error("Multer Error:", err);
              return res.status(500).json({
                success: false,
                error: err.message,
                message: "File upload failed: " + err.message,
              });
            }

            if (req.file) {
              imageFilename = req.file.filename;
              // const fileForS3 = {
              //   originalFilename: req.file.originalname,
              //   mimetype: req.file.mimetype,
              //   filepath: req.file.path,
              // };

              // const uploaded = await uploadToS3(fileForS3, targetFolder);

              // imageFilename = uploaded?.[0]?.filename;

              // if (!imageFilename) {
              //   return res.status(500).json({ success: false, message: 'Image upload to S3 failed' });
              // }
            }

            if (req.body.key == "eventdetails") {
              const event_add = await eventTicketSoldDetails(req.body, res);
              // console.log("event_add", res)
              res.json(event_add);
            } else if (req.body.key == "eventorder") {
              // console.log(req.body.key);
              // const event_add = await eventOrder(req.body, res);
              const event_add = await getTotalOrders(req.body, res);
              res.json(event_add);
            } else if (req.body.key == "searchorder") {
              const event_add = await searchOrder(req.body, res);
              res.json(event_add);
            } else if (req.body.key == "searchorderdetails") {
              const orderDetails = await searchOrderDetails(req.body, res);
              res.json(orderDetails);
            } else if (req.body.key == "viewCancelOrder") {
              const cancel_orders = await eventCancelOrder(req.body, res);
              res.json(cancel_orders);
            } else if (req.body.key == "update_event_status") {
              const update_status = await updateEventStatus(req.body, res);
              res.json(update_status);
            } else {
              if (imageFilename) {
                const event_add = await Add_Events(req.body, { filename: imageFilename }, res);
                res.status(200).json(event_add);
              } else {
                const event_add = await Add_Events(req.body);
                res.status(200).json(event_add);
              }
            }
          });
        } catch (error) {
          console.error("Error processing request:", error);
          if (imageFilename) {
            try {
              await deleteFromS3(targetFolder, imageFilename);
            } catch (deleteErr) {
              console.error("S3 Delete Error:", deleteErr.message);
            }
          }

          return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
          res.status(500).json({ error: "Internal Server Error" });
        }
        break;
      }
      case "GET": {
        const { id, active, key, event_id } = query; // Extract 'id' from query parameters

        if (key == "get_summary") {
          let getResponse;
          if (event_id) {
            getResponse = await getEventSaleSummaryByEventId(req, res);
          } else {
            getResponse = await getEventSaleSummary(req, res);
          }
          res.json(getResponse);
        } else if (key == "event_details") {
          const data = await viewCompletedEventDetails({ id }, res);
          return res.status(200).json(data);
        } else if (key == "event_detailsAdminPreview") {
          const data = await viewEventDetailsAdminPreview({ id }, res);
          return res.status(200).json(data);
        }
        else if (active == 1) {
          const eventList = await viewActiveEventList({ id }, res);
          res.status(200).json(eventList);
        } else if (id) {
          const ViewEventsbyid = await View_EventsByid({ id }, res);
          res.status(200).json(ViewEventsbyid);
        } else if (key == "specificType") {
          const ViewEvents = await getAllEventsWithData(req);
          res.status(200).json(ViewEvents);
        } else if (key == "getCurrency") {
          const getResponse = await getAllCurrency(req, res);
          res.json(getResponse);
        } else {
          const ViewEvents = await View_Events(req);
          res.status(200).json(ViewEvents);
        }
        break;
      }
      case "PUT": {
        imageUpload.single("eventImage")(req, res, async (err) => {
          let imageFilename = null;
          const targetFolder = "profiles"; // change if dynamic

          try {
            if (err) {
              console.error("Multer Error:", err);
              return res.status(400).json({
                success: false,
                message: "File upload failed",
                error: err.message,
              });
            }

            const { id } = query;
            // console.log('>>>>>>>>>>',req.file);

            // ✅ If file uploaded, send to S3
            if (req.file) {
              imageFilename = req.file.filename;

              // const fileForS3 = {
              //   originalFilename: req.file.originalname,
              //   mimetype: req.file.mimetype,
              //   filepath: req.file.path,
              // };

              // const uploaded = await uploadToS3(fileForS3, targetFolder);
              // imageFilename = uploaded?.[0]?.filename;

              // if (!imageFilename) {
              //   return res.status(500).json({
              //     success: false,
              //     message: "Image upload to S3 failed",
              //   });
              // }

              // ✅ Update event with image
              const EdiEvents = await UpdateEvent({ id, filename: imageFilename }, req, res);
              return res.status(200).json({ EdiEvents });
            } else {
              // ✅ Update event without image
              const EdiEvents = await UpdateEvent({ id }, req, res);
              return res.status(200).json({ EdiEvents });
            }
          } catch (error) {
            console.error("Error processing PUT request:", error);

            // ❌ If error occurred, delete uploaded file from S3
            if (imageFilename) {
              try {
                await deleteFromS3(targetFolder, imageFilename);
              } catch (deleteErr) {
                console.error("S3 Delete Error:", deleteErr.message);
              }
            }
            return res.status(500).json({
              success: false,
              message: "Internal Server Error",
              error: error.message,
            });
          }
        });
        break;
      }
      // case "PUT": {
      //   try {
      //     imageUpload.single("ImageURL")(req, res, async (err) => {
      //       if (err) {
      //         console.error("Error uploading image:", err);
      //         return res
      //           .status(400)
      //           .json({ message: "Error uploading image", error: err.message });
      //       }
      //       const { id } = query;
      //       if (req.file) {
      //         const { filename } = req.file;
      //         const EdiEvents = await UpdateEvent({ id, filename }, req, res);
      //         res.status(200).json({ EdiEvents });
      //       } else {
      //         // console.log("rewiuofr", req.body);
      //         const EdiEvents = await UpdateEvent({ id }, req, res);
      //         res.status(200).json({ EdiEvents });
      //       }
      //     });
      //   } catch (error) {
      //     console.error("Error processing request:", error);
      //     res.status(500).json({ error: "Internal Server Error" });
      //   }
      //   break;
      // }

      default:
        res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (err) {
    res.status(400).json({
      error_code: "api_one",
      message: err.message,
    });
  }
};
const saveFile = async (file) => {
  const data = fs.readFileSync(file.path);
  fs.writeFileSync(`./public/${file.name}`, data);
  await fs.unlinkSync(file.path);
};
// export default handler;
