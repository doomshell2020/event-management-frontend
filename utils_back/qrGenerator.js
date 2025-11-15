// utils/qrGenerator.js

import QRCode from "qrcode";
import fs from "fs";
import path from "path";
const { v4: uuidv4 } = require("uuid"); // Import UUID for unique filenames

const generateQR = async (params) => {
  const { userId, orderId, ticketId, ticketType } = params;

  const qrData = `${userId},${orderId},${ticketId},${ticketType}`;
  const outputPath = path.join(process.cwd(), "public", "qrCodes");
  const uniqueId = uuidv4(); // Use UUID for uniqueness
  const fileName = `${userId}_${orderId}_${uniqueId}.png`;
  //   const fileName = `${userId}_${orderId}.png`;
  const filePath = path.join(outputPath, fileName);
  try {
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }
    await QRCode.toFile(filePath, qrData);
    return {
      success: true,
      filePath: `${fileName}`,
    };
  } catch (error) {
    console.error("Error generating QR Code:", error);
    return {
      success: false,
      message: "Failed to generate QR Code.",
    };
  }
};

const generateAccommodationQR = async (bookingData) => {
  const qrPayload = {
    user_id: bookingData.user_id,
    event_id: bookingData.event_id,
    accommodation_id: bookingData.accommodation_id,
    check_in_date: bookingData.check_in_date,
    check_out_date: bookingData.check_out_date,
    order_id: bookingData.order_id,
  };

  const qrString = JSON.stringify(qrPayload);
  const outputPath = path.join(process.cwd(), "public", "qrCodes", "accommodation");
  const uniqueId = uuidv4();
  const fileName = `accommodation_${bookingData.user_id}_${bookingData.order_id}_${uniqueId}.png`;
  const filePath = path.join(outputPath, fileName);

  try {
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    await QRCode.toFile(filePath, qrString);

    return {
      success: true,
      fileName, // relative name to store in DB
      fullPath: filePath, // absolute (optional)
    };
  } catch (error) {
    console.error("Error generating accommodation QR Code:", error);
    return {
      success: false,
      message: "Failed to generate accommodation QR Code.",
    };
  }
};

module.exports = { generateQR, generateAccommodationQR };
