import { Sliders, SliderImages, Cms } from "../../../database/models";
import { sliderImageUpload } from "../../../utils_back/fileUpload";
import fs from "fs";
const path = require("path");
const destination = "public/uploads/sliders";

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  try {
    const { method, query } = req;

    switch (method) {
      case "GET": {
        const { page, limit, key, page_id } = query;

        if (key === "get_page_list") {
          try {
            const pageList = await Cms.findAll({
              attributes: ["ID", "Name", "VanityURL", "status"],
              include: [
                {
                  model: Sliders,
                  attributes: ["id", "slider_name", "page_id"],
                  required: false,
                  include: [
                    {
                      model: SliderImages,
                      attributes: ["image_path", "sort_order"],
                      order: [["sort_order", "ASC"]],
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            // If records are found
            if (pageList.length > 0) {
              return res.status(200).json({
                success: true,
                message: "Page list retrieved successfully.",
                data: pageList,
              });
            }

            // If no records are found
            return res.status(404).json({
              success: false,
              message: "No pages found.",
            });
          } catch (error) {
            // Handle errors during database operation
            return res.status(500).json({
              success: false,
              message:
                "An error occurred while retrieving the page list Error:" +
                error.message,
              error: error.message,
            });
          }
        } else if (key === "get_page_details" && page_id) {
          try {
            const slidersDetails = await Sliders.findAll({
              where: { page_id },
              attributes: ["id", "slider_name", "page_id", "page_name"],
              include: [
                {
                  model: SliderImages,
                  attributes: ["id", "image_path", "sort_order"],
                  order: [["sort_order", "ASC"]],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            if (slidersDetails) {
              return res.status(200).json({
                success: true,
                message: "Page details retrieved successfully.",
                data: slidersDetails,
              });
            } else {
              return res.status(404).json({
                success: false,
                message: "No page found with the given ID.",
              });
            }
          } catch (error) {
            // Handle errors during database operation
            return res.status(500).json({
              success: false,
              message:
                "An error occurred while retrieving the page list Error:" +
                error.message,
              error: error.message,
            });
          }
        } else if (key === "get_page_is_sliders") {
          try {
            const pageList = await Cms.findAll({
              attributes: ["ID", "Name", "VanityURL", "status"],
              include: [
                {
                  model: Sliders,
                  attributes: ["id", "slider_name", "page_id"],
                  required: true,
                  include: [
                    {
                      model: SliderImages,
                      attributes: ["image_path", "sort_order"],
                      order: [["sort_order", "ASC"]],
                    },
                  ],
                },
              ],
              order: [["updatedAt", "DESC"]],
            });

            // If records are found
            if (pageList.length > 0) {
              return res.status(200).json({
                success: true,
                message: "Page list retrieved successfully.",
                data: pageList,
              });
            }

            // If no records are found
            return res.status(404).json({
              success: false,
              message: "No pages found.",
            });
          } catch (error) {
            // Handle errors during database operation
            return res.status(500).json({
              success: false,
              message:
                "An error occurred while retrieving the page list Error:" +
                error.message,
              error: error.message,
            });
          }
        }
        // Default response for unsupported keys
        return res.status(400).json({
          success: false,
          message: "Invalid key provided in the request.",
        });
      }
      case "POST": {
        // Handle image upload for the slider
        sliderImageUpload.array("slider_images", 25)(req, res, async (err) => {
          if (err) {
            console.error("Error uploading image:", err);
            return res.status(400).json({
              success: false,
              message: "Error uploading image: " + err.message,
            });
          }
          const {
            slider_name,
            slider_id,
            pageId,
            page_name,
            SliderImagesArray,
            key,
          } = req.body;

          if (key === "update_slider_order") {
            try {

              const parsedSliderImages = JSON.parse(SliderImagesArray);

              // Check if it's an array after parsing
              if (!Array.isArray(parsedSliderImages)) {
                return res.status(400).json({
                  success: false,
                  message: "Invalid data for updating slider order.",
                });
              }
            
              const updatePromises = parsedSliderImages.map(async (image) => {
                try {
                  await SliderImages.update(
                    { sort_order: image.sort_order },
                    {
                      where: { id: image.image_id }
                    }
                  );
                } catch (error) {
                  console.error(`Error updating image with id ${image.image_id}:`, error);
                }
              });
              
              await Promise.all(updatePromises);
              

              return res.status(200).json({
                success: true,
                message: "Slider order updated successfully.",
              });
            } catch (error) {
              console.error("Error updating slider order:", error);
              return res.status(500).json({
                success: false,
                message:
                  "An error occurred while updating the slider order. Error: " +
                  error.message,
              });
            }
          } else if (key === "create_slider") {
            try {
              // Ensure slider_id exists and is valid before proceeding
              const isExist = await Sliders.findOne({
                where: { slider_name: slider_name, page_id: pageId },
              });

              if (isExist) {
                return res.status(400).json({
                  success: false,
                  message: "Slider Name is already exist",
                });
              }

              if (!slider_name) {
                return res.status(400).json({
                  success: false,
                  message: "Slider Name is required for creating a slider.",
                });
              }

              // Create the slider
              const slider = await Sliders.create({
                slider_name,
                page_id: pageId,
                page_name,
              });

              if (req.files && req.files.length > 0) {
                const uploadedFiles = req.files;

                if (!slider) {
                  uploadedFiles.forEach((file) => {
                    const filePath = path.join(
                      process.cwd(),
                      "public",
                      "uploads",
                      "sliders",
                      file.filename
                    );
                    if (fs.existsSync(filePath)) {
                      fs.unlinkSync(filePath); // Delete the file from the folder
                    }
                  });

                  return res.status(404).json({
                    success: false,
                    message:
                      "Slider not found, uploaded files have been deleted.",
                  });
                }

                // Save image data with sort_order
                const sliderImages = uploadedFiles.map((file, index) => ({
                  slider_id: slider.id,
                  image_path: file.filename,
                  uploaded_by: "admin",
                  sort_order: index + 1,
                }));

                // Store image data in the SliderImages table
                await SliderImages.bulkCreate(sliderImages);
              }

              return res.status(201).json({
                message: "Slider created successfully.",
                success: true,
                slider,
              });
            } catch (error) {
              console.error("Error during slider creation:", error);

              // In case of any error, delete the uploaded files if they were already uploaded
              if (req.files && req.files.length > 0) {
                req.files.forEach((file) => {
                  const filePath = path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "sliders",
                    file.filename
                  );
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Delete the file from the folder
                  }
                });
              }

              return res.status(500).json({
                success: false,
                message: "Error creating slider. Files have been deleted.",
              });
            }
          } else if (key === "slider_image_upload" && slider_id) {
            if (!slider_id) {
              return res.status(400).json({
                success: false,
                message: "Slider ID is required.",
              });
            }

            if (req.files && req.files.length > 0) {
              const uploadedFiles = req.files;

              // Ensure slider_id exists and is valid before proceeding
              const slider = await Sliders.findOne({
                where: { id: slider_id },
              });
              if (!slider) {
                // If slider doesn't exist, unlink uploaded files and return error
                uploadedFiles.forEach((file) => {
                  const filePath = path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "sliders",
                    file.filename
                  );
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Delete the file from the folder
                  }
                });

                return res.status(404).json({
                  success: false,
                  message:
                    "Slider not found, uploaded files have been deleted.",
                });
              }

              // Fetch the current maximum sort_order for the slider
              const lastSortOrder = await SliderImages.max('sort_order', {
                where: { slider_id },
              });

              // Set the starting sort_order for new images
              let currentSortOrder = lastSortOrder || 0; // Defaults to 0 if no images exist


              const sliderImages = uploadedFiles.map((file) => ({
                slider_id,
                sort_order:++currentSortOrder,
                image_path: file.filename,
                uploaded_by: "admin",
              }));

              try {
                // Store image data in the SliderImages table
                await SliderImages.bulkCreate(sliderImages);

                return res.status(201).json({
                  success: true,
                  message: "Slider image(s) uploaded successfully.",
                });
              } catch (error) {
                // In case of any error, unlink uploaded files
                uploadedFiles.forEach((file) => {
                  const filePath = path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "sliders",
                    file.filename
                  );
                  if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Delete the file from the folder
                  }
                });

                return res.status(500).json({
                  success: false,
                  message:
                    "Error storing images in the database, uploaded files have been deleted: " +
                    error.message,
                });
              }
            } else {
              return res.status(400).json({
                success: false,
                message: "No images provided for upload.",
              });
            }
          } else {
            return res.status(400).json({
              success: false,
              message: "Invalid request key or missing slider_id.",
            });
          }
        });
        break;
      }
      case "DELETE": {
        const { key, slider_id,id } = req.query; // Expecting key, image_id or slider_id in the query params
        try {
        if (key === 'delete_slider_images') {
          try {
            const existSliderImage = await SliderImages.findOne({
              where: {
                id: id,
                }
              });
            if (!existSliderImage) {
            return res.status(404).json({
            success: false,
            message: "Slider image not found.",
            });
            }
          // delete the slider image
            await SliderImages.destroy({
              where: { id },
            });
        
              const filePath = path.join(process.cwd(), 'public', 'uploads', 'sliders', existSliderImage.image_path);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); 
                console.log(`Deleted image file: ${filePath}`); 
              } else {
                console.warn(`Image file not found at: ${filePath}`);
              }  
                           

              // Fetch remaining images for the slider
              const remainingImages = await SliderImages.findAll({
                where: { slider_id: existSliderImage.slider_id },
                order: [['sort_order', 'ASC']],
              });

              // Only update sort_order if there are remaining images
              if (remainingImages.length > 0) {
                let newSortOrder = 1;
                for (const image of remainingImages) {
                  await SliderImages.update(
                    { sort_order: newSortOrder },
                    { where: { id: image.id } }
                  );
                  newSortOrder++;
                }
              }

    
              // Send a successful response
              return res.status(200).json({
                success: true,
                message: 'Slider image deleted successfully.',
              });
            
          } catch (error) {
            console.error('Error deleting image:', error.message); // Optional logging for debugging
            return res.status(500).json({
              success: false,
              message: 'An error occurred while deleting the slider image. Error: ' + error.message,
              error: error.message,
            });
          }
        }else if (key === "slider" && slider_id) {
            const images = await SliderImages.findAll({ where: { slider_id } });
            if (images.length > 0) {
              images.forEach((image) => {
                const imagePath = path.join(
                  process.cwd(),
                  destination,
                  image.image_path
                );
                if (fs.existsSync(imagePath)) {
                  fs.unlinkSync(imagePath);
                }
              });

              await SliderImages.destroy({ where: { slider_id } });
            }

            const isExist = await Sliders.findOne({ where: { id: slider_id } });
            if (isExist) {
              await Sliders.destroy({ where: { id: slider_id } });
              return res.status(200).json({
                success: true,
                message:
                  "Slider and associated images deleted successfully",
              });
            } else {
              return res.status(404).json({
                success: false,
                message: "Slider not found.",
              });
            }
        } else {
            return res.status(400).json({
              success: false,
              message:
                "Invalid key or missing parameters. Use 'slider' or 'slider_image'.",
            });
        }
        } catch (error) {
          console.error("Error deleting slider or image:", error);
          return res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message,
          });
        }
      }
      default:
        res.setHeader("Allow", ["POST", "GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${method} Not Allowed`);
        break;
    }
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export default handler;
