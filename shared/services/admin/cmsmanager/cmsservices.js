import { Cms, Sliders, SliderImages } from "../../../../database/models";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// Cms Added
export async function Add_Cms({ Name, VanityURL, Content }) {
  const cmsss = await Cms.create({
    Name: Name,
    VanityURL: VanityURL,
    Content: Content,
  });
  return {
    statusCode: 200,
    success: true,
    message: "Cms Added Successfully!",
    cmsss,
  };
}

// Cms View
// export async function View_Cms(req, res) {


//   console.log("_______>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>_____", req.query)   // event_id, Name 

//   const viewCms = await Cms.findAll({
//     include: [
//       {
//         model: Sliders,
//         attributes: {
//           exclude: ["createdAt", "updatedAt", "page_name", "page_id"],
//         }, // Exclude fields from Sliders
//         include: [
//           {
//             model: SliderImages,
//             attributes: ["sort_order", "image_path"],
//           },
//         ],
//       },
//     ],
//     order: [["ID", "DESC"]],
//   });

//   return {
//     statusCode: 200,
//     success: true,
//     message: "View Cms Data Successfully!",
//     viewCms,
//   };
// }

export async function View_Cms(req, res) {
  try {
    const { event_id, Name, is_published } = req.query;

    // Build dynamic filter conditions
    let whereClause = {};
    if (event_id) {
      whereClause.event_id = { [Op.like]: `%${event_id}%` };
    }
    if (Name) {
      whereClause.Name = { [Op.like]: `%${Name}%` };
    }
    if (is_published) {
      if (is_published == 1) {
        whereClause.status = "Y"; // Published
      } else if (is_published == 0) {
        whereClause.status = 'N'; // Not Published
      }
    }
    const viewCms = await Cms.findAll({
      where: whereClause, // 🔍 apply filters if present
      include: [
        {
          model: Sliders,
          attributes: {
            exclude: ["createdAt", "updatedAt", "page_name", "page_id"],
          },
          include: [
            {
              model: SliderImages,
              attributes: ["sort_order", "image_path"],
            },
          ],
        },
      ],
      order: [
        [Sequelize.literal(`CASE WHEN Status = 'Y' THEN 0 ELSE 1 END`), 'ASC'],
        ['ID', 'DESC']
      ]
      // order: [
      //   ['ID', 'DESC'],
      //   // ['updatedAt', 'DESC'],
      //   ['Status', 'ASC']
      // ]
    });

    return {
      statusCode: 200,
      success: true,
      message: "View CMS Data Successfully!",
      viewCms,
    };
  } catch (error) {
    console.error("View_Cms Error:", error);
    return {
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    };
  }
}








// // Edit Cms page content
export async function Edit_Cms({ id, Name, VanityURL, Content }, res) {
  try {
    const cmsData = await Cms.update(
      { Name, VanityURL, Content },
      {
        where: {
          id: id,
        },
      }
    );

    // Check if any rows were affected
    if (cmsData[0] > 0) {
      return {
        success: true,
        message: "The page content has been updated successfully.",
      };
    } else {
      return {
        success: false,
        message: "No changes were made. Please check the provided data.",
      };
    }
  } catch (error) {
    console.log('Error during CMS update:', error.message);
    return {
      success: false,
      message: "An error occurred while updating the page content.",
    };
  }
}


// testing
// export async function Edit_Cms({ id, Name, VanityURL, Content }, res) {
//     try {
//         const arrcheck_list = id.split(",");
//         const arrcheck_Content = Content.split(",");
//         const arrcheck_Name = Name.split(",");

//         console.log("arrcheck_Content", arrcheck_Content);

//         // Create an array of promises for each update operation
//         const updatePromises = arrcheck_list.map((checkdata, i) => {
//             const updatedContent = arrcheck_Content[i];
//             const updatedName = arrcheck_Name[i];

//             // Return the promise for each update operation
//             return Cms.update(
//                 { Name: updatedName, VanityURL, Content: updatedContent },
//                 { where: { id: checkdata } }
//             );
//         });

//         // Wait for all update operations to complete
//         await Promise.all(updatePromises);

//         // Fetch the updated data for the first id
//         const updatedData = await Cms.findOne({ where: { id: arrcheck_list[0] } });

//         return {
//             data: updatedData,
//             message: "The page content has been updated successfully."
//         };
//     } catch (error) {
//         console.error("Error:", error);
//         return { error: "An error occurred while updating the page content." };
//     }
// }

// export async function Edit_Cms({ id, Name, VanityURL, Content }, res) {
//     try {
//         const arrcheck_list = id.split(",");
//         console.log("arrcheck_Content", Content)
//         return
//         const arrcheck_Name = Name.split(",");
//         // Loop through each ID and update CMS data
//         for (let i = 0; i < arrcheck_list.length; i++) {
//             const checkdata = arrcheck_list[i];
//             const updatedContent = arrcheck_Content[i];
//             const updatedName = arrcheck_Name[i];

//             // Update CMS data
//             await Cms.update(
//                 { Name: updatedName, VanityURL, Content: updatedContent },
//                 { where: { id: checkdata } }
//             );
//         }
//         const updatedData = await Cms.findOne({ where: { id: arrcheck_list[0] } });
//         return {
//             data: updatedData,
//             message: "The page content has been updated successfully."
//         };
//     } catch (error) {
//         console.error("Error:", error);
//         return { error: "An error occurred while updating the page content." };
//     }
// }

// Cms deleted
export async function Deleted_Cms({ id }, res) {
  // console.log("ress", id);
  try {
    const cmsdata = await Cms.destroy({
      where: {
        id: id,
      },
    });
    if (cmsdata === 0) {
      return {
        message: "Cms ID not found or does not match",
      };
    }
    return {
      data: cmsdata[0],
      message: "Cms Deleted Successfully",
    };
  } catch (error) {
    return error;
  }
}

// View by id
export async function Cms_Viewbyid(ID, res) {
  try {
    // Query the CMS data based on ID
    const data = await Cms.findOne({
      where: {
        ID: ID,
      },
      include: [
        {
          model: Sliders,
          attributes: {
            exclude: ["createdAt", "updatedAt", "page_name", "page_id"],
          }, // Exclude fields from Sliders
          include: [
            {
              model: SliderImages,
              attributes: ["sort_order", "image_path"],
            },
          ],
        },
      ],
    });

    // If data is not found, throw an error
    if (!data) {
      const error = new Error("Invalid page id");
      error.StatusCodes = 404; // Set an appropriate status code
      throw error;
    }

    return {
      status: true, // Indicating success
      message: "View Cms Successfully",
      data: data, // Include the data in the response
    };
  } catch (error) {
    return {
      status: false,
      message: error.message || "An error occurred", // Error message
    };
  }
}


// get by slug name based
export async function cmsGetContentBySlug(slug, res) {
  try {
    const data = await Cms.findOne({
      where: {
        VanityURL: slug,
      },
      include: [
        {
          model: Sliders,
          attributes: {
            exclude: ["createdAt", "updatedAt", "page_name", "page_id"],
          }, // Exclude fields from Sliders
          include: [
            {
              model: SliderImages,
              attributes: ["sort_order", "image_path"],
            },
          ],
        },
      ],
    });

    if (!data) {
      const error = new Error("Based ont he slog not found");
      error.StatusCodes = 404; // You can set an appropriate status code
      throw error;
    }
    return {
      message: "View Cms Successfully",
      data: data,
    };
  } catch (error) {
    return error;
  }
}

// get all sections by slug name
export async function getAllSectionsBySlug(slug, res) {
  try {
    const data = await Cms.findAll({
      where: {
        VanityURL: slug,
      },
      include: [
        {
          model: Sliders,
          attributes: {
            exclude: ["createdAt", "updatedAt", "page_name", "page_id"],
          }, // Exclude fields from Sliders
          include: [
            {
              model: SliderImages,
              attributes: ["sort_order", "image_path"],
            },
          ],
        },
      ],
    });

    if (!data) {
      const error = new Error("Based ont he slog not found");
      error.StatusCodes = 404; // You can set an appropriate status code
      throw error;
    }
    return {
      message: "View Cms Successfully",
      data: data,
    };
  } catch (error) {
    return error;
  }
}





// view All Active pages(02-06-2025-kamal)
export async function getAllActivePages(req, res) {
  const findPages = await Cms.findAll({
    where: { status: "Y" },
    attributes: ["ID", "VanityURL", "status", "event_id", 'title', "sort_order", "is_parent"],
    order: [["sort_order", "ASC"]],
  });

  return {
    statusCode: 200,
    success: true,
    message: "View Active pages successfully!!",
    data: findPages
  };
}


// ......cms page status update active and inactive(02-06-2025)
export async function updateStatus(req, res) {
  try {
    const { id } = req;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Page ID is required.",
      });
    }

    const pageStatus = await Cms.findOne({
      where: { id },
      attributes: ['id', 'status'],
    });

    if (!pageStatus) {
      return res.status(404).json({
        success: false,
        message: "Page not found.",
      });
    }

    const newStatus = pageStatus.status === "Y" ? "N" : "Y";

    await Cms.update({ status: newStatus }, { where: { id } });

    return res.status(200).json({
      success: true,
      message: "Page status updated successfully.",
    });

  } catch (error) {
    console.error("Error updating page status:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the page status.",
      error: error.message,
    });
  }
}



// search Event and pages 
export async function searchEventAndPages({ event_id, Name }) {
  // console.log("<<<<<<<<<<<<<<<<<<<<object>>>>>>>>>>>>>>>>>>>>", event_id, Name)
  try {
    let newObject = {};
    if (event_id) {
      newObject.event_id = { [Op.like]: `%${event_id}%` }
    }
    if (Name) {
      newObject.Name = { [Op.like]: `%${Name}%` }
    }
    const searchResults = await Cms.findAll({
      where: newObject,
      // include: { model: Event }
    });
    return {
      statusCode: 200,
      success: true,
      message: 'Search Pages  Successfully!',
      searchResults
    };
  } catch (error) {
    console.log("error")
  }
}
