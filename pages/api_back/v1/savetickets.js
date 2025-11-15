
import fs from 'fs';
import path from 'path';
import axios from "axios";
const handler = async (req, res) => {
    try {
        const { method, query } = req;

        switch (method) {
            case "POST": {
                try {
                    const { tickets } = req.body;
                    // console.log("tickets", tickets);
                    for (const { qrcode, qrcodename, isticket } of tickets) {
                        // if (!isticket) {
                        //     console.log('Not a ticket, skipping:', qrcodename);
                        //     continue; // Skip if not a ticket
                        // }
                        const destinationFolder = path.join(process.cwd(), 'public', 'uploads/Ondalinda');
                        const filePath = path.join(destinationFolder, qrcodename);

                        // Check if the file already exists
                        if (fs.existsSync(filePath)) {
                            console.log('File already exists:', filePath);
                            continue; // Skip if file exists
                        }
                        // If file doesn't exist, download and save it
                        try {
                            const response = await axios.get(qrcode, { responseType: 'arraybuffer' });
                            fs.writeFileSync(filePath, response.data);
                            console.log('File saved successfully:', filePath);
                        } catch (downloadError) {
                            console.error('Error downloading file:', qrcode, downloadError);
                            return res.status(500).json({ message: `Error downloading ${qrcodename}` });
                        }
                    }
                    // Send success response after processing all tickets
                    return res.status(200).json({ message: 'Tickets processed successfully.' });
                } catch (error) {
                    console.error('Error processing tickets:', error);
                    return res.status(500).json({ message: 'Error processing tickets.' });
                }
                // return false
                // const remoteFileUrl = req.body.qrcode;
                // const qrCodeName = req.body.qrcodename; // Find file in uploads/Ondalinda folder we need to find this file is exist
                // const destinationFolder = path.join(process.cwd(), 'public', 'uploads/Ondalinda');
                // const isExisting = path.join(destinationFolder, qrCodeName);
                // // Check if the file already exists
                // if (fs.existsSync(isExisting)) {
                //     console.log('File already exists:', isExisting);
                //     // return res.status(400).json({ message: 'File already exists.' });
                // }

                // const response = await axios.get(remoteFileUrl, { responseType: 'arraybuffer' });
                // console.log(destinationFolder);
                // const fileName = path.join(destinationFolder, req.body.qrcodename);
                // fs.writeFileSync(fileName, response.data);
            }
            case "GET": {
                try {
                    // Remote file URL
                    const remoteFileUrl = 'https://staging.eboxtickets.com/qrimages/Ondalinda/OND280b33620366d3069192a831605793ce.png';
                    const response = await axios.get(remoteFileUrl, { responseType: 'arraybuffer' });
                    const destinationFolder = path.join(process.cwd(), 'public', 'uploads/Ondalinda');
                    const fileName = path.join(destinationFolder, 'image.png');
                    fs.writeFileSync(fileName, response.data);

                    res.status(200).json({ message: 'Image transferred successfully' });
                } catch (error) {
                    console.error('Error transferring image:', error);
                    res.status(500).json({ message: 'Failed to transfer image' });
                }
                break;
            }
            case "PUT": {

                break;
            }
            case "DELETE": {
                break;
            }
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

export default handler;