import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import uploadBufferToS3 from "./uploadBufferToS3.js";
import path from "path"; // ✅ Node.js built-in module

// For ticket QR generation and upload
const generateTicketQrToS3 = async (params) => {
    const { userId, orderId, ticketId, ticketType } = params;
    const qrData = `${userId},${orderId},${ticketId},${ticketType}`;
    const uniqueId = uuidv4();
    const key = `qrCodes/${userId}_${orderId}_${uniqueId}.png`; // S3 key

    try {
        const qrBuffer = await QRCode.toBuffer(qrData);
        const uploadResult = await uploadBufferToS3(qrBuffer, key, "image/png");

        if (!uploadResult.success) throw new Error(uploadResult.message);

        return {
            success: true,
            filePath: path.basename(uploadResult.key), // ✅ Only filename
            fileKey: uploadResult.key,                 // Full S3 key (with folder)
            fileUrl: uploadResult.url,                 // Public S3 URL
        };
    } catch (error) {
        console.error("Error generating ticket QR Code:", error);
        return {
            success: false,
            message: "Failed to generate ticket QR Code.",
        };
    }
};

// For accommodation QR generation and upload
const generateAccommodationQrToS3 = async (bookingData) => {
    const qrPayload = {
        user_id: bookingData.user_id,
        event_id: bookingData.event_id,
        accommodation_id: bookingData.accommodation_id,
        check_in_date: bookingData.check_in_date,
        check_out_date: bookingData.check_out_date,
        order_id: bookingData.order_id,
    };

    const qrString = JSON.stringify(qrPayload);
    const uniqueId = uuidv4();
    const key = `qrCodes/accommodation/${bookingData.user_id}_${bookingData.order_id}_${uniqueId}.png`;

    try {
        const qrBuffer = await QRCode.toBuffer(qrString);
        const uploadResult = await uploadBufferToS3(qrBuffer, key, "image/png");

        if (!uploadResult.success) throw new Error(uploadResult.message);

        return {
            success: true,
            filePath: path.basename(uploadResult.key), // ✅ Only filename
            fileKey: uploadResult.key,                 // Full S3 key
            fileUrl: uploadResult.url,                 // Public URL
        };
    } catch (error) {
        console.error("Error generating accommodation QR Code:", error);
        return {
            success: false,
            message: "Failed to generate accommodation QR Code.",
        };
    }
};

module.exports = {
    generateTicketQrToS3,
    generateAccommodationQrToS3,
};
