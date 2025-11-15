import { memberShiptypesColor, claspColors } from "../../../../database/models";
import { StatusCodes } from "http-status-codes";

// Add Events
// export async function addColorCombinations(req, res) {
//   try {
//     const { membership_type_data } = req.body;
//     console.log("membership_type_data", membership_type_data)

//     const membershipTypesColorData = await memberShiptypesColor.create({
//       event_id: membership_type_data.event_id,
//       color: membership_type_data.color,
//       membership_type_id: membership_type_data.membership_type_id,
//     });

//     return {
//       statusCode: StatusCodes.OK,
//       status: true,
//       message: "Successfully created membership type color.",
//       data: membershipTypesColorData
//     };
//   } catch (error) {
//     return {
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//       status: false,
//       error: "hello" + error.message // Return only the error message to avoid exposing sensitive information
//     };
//   }
// }

// Unified function to add color combinations and clasp colors
export async function addBothColorAndClasp({
  event_id,
  membership_type_color,
  clasp_colors,
}) {
  try {
    // Check if event_id already exists in memberShiptypesColor table
    const existingMembershipTypesColor = await memberShiptypesColor.findOne({
      where: { event_id },
    });

    // Check if event_id already exists in claspColors table
    const existingClaspColors = await claspColors.findOne({
      where: { event_id },
    });

    if (existingMembershipTypesColor || existingClaspColors) {
      return {
        statusCode: StatusCodes.CONFLICT,
        success: false,
        message:
          "You have already created wristbands for this event, so you cannot create them again.",
      };
    }

    // return false
    // Save membership type colors to memberShiptypesColor table
    const membershipTypesColorPromises = membership_type_color.map(
      async (item) => {
        return await memberShiptypesColor.create({
          event_id,
          color: item.color,
          // membership_type_id: item.type // Assuming you have a type field in your membership types table
          membership_type_id: item.id, // Assuming you have a type field in your membership types table
        });
      }
    );

    // Save clasp colors to claspColors table
    const claspColorsPromises = clasp_colors.map(async (item) => {
      return await claspColors.create({
        event_id,
        // addons_types: item.addons,
        // ticket_types: item.ticketType,
        color: item.color,
      });
    });

    // Wait for all promises to resolve
    const membershipTypesColorData = await Promise.all(
      membershipTypesColorPromises
    );
    const claspColorsData = await Promise.all(claspColorsPromises);

    return {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Successfully created membership type and clasp colors.",
      data: {
        membershipTypesColor: membershipTypesColorData,
        claspColors: claspColorsData,
      },
    };
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error.message, // Return only the error message to avoid exposing sensitive information
    };
  }
}

// View color combinations and clasp colors

export async function getEventColors({ event_id }, res) {
  try {
    // Fetch membership type colors for the event
    const membershipTypesColor = await memberShiptypesColor.findAll({
      where: { event_id },
      attributes: ["membership_type_id", "color"],
    });

    // Fetch clasp colors for the event
    const fetchedClaspColors = await claspColors.findAll({
      where: { event_id },
      attributes: ["ticket_types", "addons_types", "color"],
    });

    if (!membershipTypesColor.length && !fetchedClaspColors.length) {
      return {
        statusCode: StatusCodes.NOT_FOUND,
        success: false,
        message: "No data found for the provided event ID.",
      };
    }

    // Format the membership type colors data
    const membershipTypeColorData = membershipTypesColor.map((item) => ({
      type: item.membership_type_id.toString(), // Convert to string if necessary
      color: item.color,
    }));

    // Format the clasp colors data
    const claspColorData = fetchedClaspColors.map((item) => ({
      ticketType: item.ticket_types,
      addons: item.addons_types,
      color: item.color,
    }));

    return {
      statusCode: StatusCodes.OK,
      success: true,
      data: {
        event_id,
        membership_type_color: membershipTypeColorData,
        clasp_colors: claspColorData,
      },
    };
  } catch (error) {
    return {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      error: error.message, // Return only the error message to avoid exposing sensitive information
    };
  }
}

// Events View
// export async function addColorCombinations(req,res) {
//   const viewCms = await Event.findAll({
//     order: [["id", "DESC"]],
//   });
//   return {
//     statusCode: 200,
//     success: true,
//     message: 'View Events Successfully!',
//     viewCms
//   };
// }

// Search Events
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
export async function Search_Events({ Name }) {
  // const { Name } = req.body; // Assuming the search query parameter is "Name"
  try {
    const searchResults = await Event.findAll({
      where: {
        name: {
          [Op.like]: `%${Name}%`,
        },
      },
      order: [["id", "DESC"]],
    });
    return {
      statusCode: 200,
      success: true,
      message: "Search Events Successfully!",
      searchResults,
    };
  } catch (error) {
    console.log("error");
    //   res.status(500).json({ error: 'Internal Server Error' });
  }
}

// View events by id
export async function View_EventsByid({ id }, res) {
  try {
    const data = await Event.findOne({
      where: {
        id: id,
      },
    });
    if (!data) {
      const error = new Error("ID not found");
      error.StatusCodes = 404; // You can set an appropriate status code
      throw error;
    }
    return {
      data: data,
      message: "Events View Successfully",
    };
  } catch (error) {
    return error;
  }
}

// Updatee Events
// export async function UpdateEvent({
//   Name,
//   Venue,
//   Address,
//   City,
//   State,
//   Country,
//   PostalCode,
//   Price,
//   Summary,
//   ListPrice,
//   StartDate,
//   EndDate,
//   id,
// }, filename, res) {

//   try {
//     const Eventdata = await Event.update({
//       Name,
//       Venue,
//       Address,
//       City,
//       State,
//       Country,
//       PostalCode,
//       Price,
//       Summary,
//       ListPrice,
//       StartDate,
//       EndDate,
//       ImageURL: filename
//     },
//       {
//         where: {
//           id: id,
//         },
//       },
//     );
//     console.log("Eventdata", Eventdata)
//     if (Eventdata == 1) {
//       return {
//         statusCode: StatusCodes.OK,
//         success: true,
//         message: "Event Update Successfully"
//       };
//     } else {
//       return {
//         statusCode: StatusCodes.BAD_REQUEST,
//         success: false,
//         message: "data not found"
//       };
//     }
//   } catch (error) {
//     return {
//       statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
//     };
//   }
// }
export async function UpdateEvent({ id, filename }, req) {
  const {
    Name,
    Venue,
    Address,
    City,
    State,
    Country,
    PostalCode,
    Price,
    Summary,
    ListPrice,
    StartDate,
    EndDate,
    EventType,
  } = req.body;
  const updateData = {
    Name,
    Venue,
    Address,
    City,
    State,
    Country,
    PostalCode,
    Price,
    Summary,
    ListPrice,
    StartDate,
    EndDate,
    EventType,
    ImageURL: filename,
  };
  const UpdateMember = await Event.update(updateData, {
    where: { id: id },
  });
  return {
    statusCode: 200,
    success: true,
    message: "Events Update Successfully!",
  };
}

// Events Invited
export async function View_EventInvite(req) {
  const viewCms = await InvitationEvent.findAll({
    order: [["id", "DESC"]],
  });
  return {
    statusCode: 200,
    success: true,
    message: "View Invited Events Successfully!",
    viewCms,
  };
}

// View Active Event List with valid Date Range
// View Active Event List with valid Date Range
export async function viewActiveEventList({ id }, res) {
  try {
    const currentDate = new Date(); // Get current date and time
    // console.log("🚀 ~ viewActiveEventList ~ currentDate:", currentDate);

    const data = await Event.findAll({
      where: {
        StartDate: { [Op.lte]: currentDate },
        EndDate: { [Op.gte]: currentDate },
      },
    });

    if (data.length === 0) {
      return res.status(404).json({ message: "No active events found" });
    }

    return res
      .status(200)
      .json({
        data: data,
        message: "Active event list retrieved successfully",
      });
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
