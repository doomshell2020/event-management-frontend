import {
  User,
  MembershipType,
  memberShiptypesColor,
  claspColors,
  TicketDetail,
  EventStaffMember,
  AddonBook,
  Addons,
} from "@/database/models";

import moment from "moment";

export async function scanTicket(
  { user_id, order_id, ticketdetail_id, tickettype, scannerId },
  res
) {
  try {
    const nowdate = new Date();
    const optionsdate = {
      timeZone: "America/Mexico_City", // Timezone for Jalisco, Mexico
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedUsedate = new Intl.DateTimeFormat(
      "en-US",
      optionsdate
    ).format(nowdate);
    // Check if the user is suspended
    const userCheck = await User.findOne({
      where: { id: scannerId, is_suspend: "Y" },
    });

    if (userCheck) {
      return {
        success: false,
        message: "You are suspended from scanning the QR code!",
      };
    }
    const membershipTypeData = await MembershipType.findAll({
      attributes: ["id", "title", "sub_title"],
    });

    const membershipType = {};
    membershipTypeData.forEach((type) => {
      membershipType[type.id] = type.title;
    });

    const membershipTypeColorData = await memberShiptypesColor.findAll({
      attributes: ["id", "event_id", "membership_type_id", "color"],
      // where: { event_id: 109 },
      where: { event_id: 110 },
    });

    const membershipBasedWristBandColor = {};
    membershipTypeColorData.forEach((colorData) => {
      membershipBasedWristBandColor[colorData.membership_type_id] =
        colorData.color;
    });

    const colorOfStaff = {
      CORE: "#B163A3",
      STAFF: "#FEDF00",
      COMP: "#FF6F61",
      "PRESS/DJS": "#FF6F61",
    };

    let tick_details,
      ticketusedemail,
      ticketname,
      ticketBackground,
      response = {};

    if (["CORE", "COMP", "STAFF", "PRESS/DJS"].includes(tickettype)) {
      tick_details = await TicketDetail.findOne({
        where: { id: ticketdetail_id },
      });

      if (!tick_details) {
        return { success: false, message: "Ticket is cancelled or not found!" };
      }
      const existingStaff = await EventStaffMember.findOne({
        where: { id: tick_details.user_id },
      });
      if (!existingStaff) {
        return { success: false, message: "Staff member not found!" };
      }

      ticketname = `${existingStaff.FirstName} ${existingStaff.LastName}`;
      ticketBackground = colorOfStaff[existingStaff.Department];
      response = {
        ticketBackground,
        ticketid: `T${tick_details.id}`,
        ticketTypeName:
          tickettype === "COMP" ? "THE ONDALINDA EXPERIENCE" : tickettype,
        membershipType: existingStaff.Department,
      };
    } else if (tickettype === "ticket") {
      tick_details = await TicketDetail.findOne({
        where: { tid: ticketdetail_id },
        include: [User],
      });
      if (
        tick_details?.transfer_user_id &&
        tick_details.transfer_user_id != user_id
      ) {
        return {
          success: false,
          status: "Invalid ticket!",
          ticketBackground: "#FF6F61",
        };
      }
      if (tick_details?.transfer_user_id) {
        const tick_details_transfer_user = await User.findOne({
          where: { id: tick_details?.transfer_user_id }, // Assuming 'id' is of type INTEGER
        });
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details_transfer_user.FirstName} ${tick_details_transfer_user.LastName}`;

        ticketusedemail = tick_details_transfer_user.Email;
      } else {
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details.User.FirstName} ${tick_details.User.LastName}`;
        ticketusedemail = tick_details.User.Email;
      }

      const memberType = tick_details.User.membership_type;
      response = {
        ticketBackground: "#FF6F61",
        ticketTypeName: "THE ONDALINDA EXPERIENCE",
        ticketid: `T${tick_details.id}`,
        membershipType: membershipType[memberType],
      };
    } else if (tickettype === "addon") {
      tick_details = await AddonBook.findOne({
        where: { id: ticketdetail_id },
        include: [{ model: Addons }, { model: User }],
      });

      // return { success: false, message:tick_details};
      if (
        tick_details?.transfer_user_id &&
        tick_details.transfer_user_id != user_id
      ) {
        return {
          success: false,
          status: "Invalid addon!",
          ticketBackground: "#FF6F61",
        };
      }

      if (tick_details?.transfer_user_id) {
        const tick_details_transfer_user = await User.findOne({
          where: { id: tick_details?.transfer_user_id }, // Assuming 'id' is of type INTEGER
        });
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details_transfer_user.FirstName} ${tick_details_transfer_user.LastName}`;

        ticketusedemail = tick_details_transfer_user.Email;
      } else {
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details.User.FirstName} ${tick_details.User.LastName}`;
        ticketusedemail = tick_details.User.Email;
      }

      const memberType = tick_details.User.membership_type;
      response = {
        ticketBackground: "#000000", // Black Color
        ticketTypeName: tick_details.Addon.name,
        ticketid: `A${tick_details.id}`,
        membershipType: membershipType[memberType],
      };
    } else {
      return { success: false, message: "Invalid ticket type!" };
    }

    if (tick_details.status == "1" || tick_details.scannedstatus == "1") {
      response.ticketname = ticketname;
      response.usedBy = tick_details.usedby;
      response.ticketname = ticketname;
      response.useDate = moment(tick_details.usedate).format(
        "MMM DD, YYYY hh:mm:ss A"
      );
      response.ticketBackground = "#E4002B"; // Red Color
      return {
        success: false,
        message: "Ticket Already Scanned !",
        getAlldata: response,
      };
    }
    // cancel ticket not scanned
    else if (tick_details.ticket_status == "cancel") {
      response.ticketname = ticketname;
      // response.usedBy = tick_details.usedby;
      response.ticketname = ticketname;
      // response.useDate = moment(tick_details.usedate).format(
      //   "MMM DD, YYYY hh:mm:ss A"
      // );
      response.ticketBackground = "#E4002B"; // Red Color
      return {
        success: false,
        message: "This ticket has been canceled and cannot be used.",
        getAlldata: response,
      };
    }
    else {
      if (
        tickettype == "CORE" ||
        tickettype == "COMP" ||
        tickettype == "STAFF" ||
        tickettype == "PRESS/DJS"
      ) {
        const existingStaff = await EventStaffMember.findOne({
          where: { id: tick_details.user_id },
        });

        const updateData = {
          status: "1",
          usedate: formattedUsedate,
          scanner_id: scannerId,
          usedby: existingStaff.Email,
        };
        await TicketDetail.update(updateData, {
          where: { id: ticketdetail_id },
        });
        response.ticketname = ticketname;
        response.usedBy = updateData.usedby;
        response.useDate = formattedUsedate.toLocaleString();
        return {
          success: true,
          message: "Successfully Scan",
          getAlldata: response,
        };
      } else if (tickettype == "ticket") {
        const updateData = {
          status: "1",
          usedate: formattedUsedate,
          scanner_id: scannerId,
          usedby: ticketusedemail,
        };
        await TicketDetail.update(updateData, {
          where: { id: ticketdetail_id },
        });
        response.ticketname = ticketname;
        response.ticketBackground = "#FF6F61";
        response.usedBy = updateData.usedby;
        response.ticketid = `T${tick_details.id}`;
        response.useDate = formattedUsedate.toLocaleString();
        return {
          success: true,
          message: "Successfull Scan",
          getAlldata: response,
        };
      } else if (tickettype == "addon") {
        const updateData = {
          scannedstatus: "1",
          usedate: formattedUsedate,
          scanner_id: scannerId,
          usedby: ticketusedemail,
        };

        await AddonBook.update(updateData, { where: { id: ticketdetail_id } });
        const existingaddoon = await AddonBook.findOne({
          where: { id: ticketdetail_id },
        });

        response.ticketname = ticketname;
        response.usedBy = updateData.usedby;
        response.ticketid = `A${existingaddoon.id}`;
        response.useDate = formattedUsedate.toLocaleString();
        return {
          success: true,
          message: "Successfully Scan",
          getAlldata: response,
        };
      }
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function scanTicketV3(req, res) {
  const { user_id, order_id, ticketdetail_id, tickettype, scannerId } = req.body;
  console.log('>>>>>>>>>', req.body);

  // return res.json({
  //   success: false,
  //   message: req.body,
  // });

  try {

    const nowdate = new Date();
    const optionsdate = {
      timeZone: "America/Mexico_City", // Timezone for Jalisco, Mexico
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedUsedate = new Intl.DateTimeFormat(
      "en-US",
      optionsdate
    ).format(nowdate);


    // Check if the user is suspended
    const userCheck = await User.findOne({
      where: { id: scannerId, is_suspend: "Y" },
      attributes: ['id', 'FirstName', 'LastName', 'Email']
    });

    if (!userCheck) {
      return res.json({
        success: false,
        message: "User not found!",
      });
    }

    if (userCheck.isSuspended) {
      return res.json({
        success: false,
        message: "You are suspended from scanning the QR code!",
      });
    }

    const membershipTypeData = await MembershipType.findAll({
      attributes: ["id", "title", "sub_title"],
    });

    const membershipType = {};
    membershipTypeData.forEach((type) => {
      membershipType[type.id] = type.title;
    });

    const membershipTypeColorData = await memberShiptypesColor.findAll({
      attributes: ["id", "event_id", "membership_type_id", "color"],
      // where: { event_id: 109 },
      where: { event_id: 111 },
    });

    // console.log('>>>>>>>>>>>>>', membershipTypeColorData);
    // return membershipTypeData
    const membershipBasedWristBandColor = {};
    membershipTypeColorData.forEach((colorData) => {
      membershipBasedWristBandColor[colorData.membership_type_id] =
        colorData.color;
    });
    // console.log('>>>>>>>>>>>>>', membershipBasedWristBandColor);
    // return membershipBasedWristBandColor
    const colorOfStaff = {
      CORE: "#B163A3",
      STAFF: "#FEDF00",
      COMP: "#FF6F61",
      "PRESS/DJS": "#FF6F61",
    };

    let tick_details, ticketusedemail, ticketname,   ticketBackground,
      response = {};

    if (["CORE", "COMP", "STAFF", "PRESS/DJS"].includes(tickettype)) {
      tick_details = await TicketDetail.findOne({
        where: { id: ticketdetail_id },
      });

      if (!tick_details) {
        return { success: false, message: "Ticket is cancelled or not found!" };
      }
      const existingStaff = await EventStaffMember.findOne({
        where: { id: tick_details.user_id },
      });
      if (!existingStaff) {
        return { success: false, message: "Staff member not found!" };
      }

      ticketname = `${existingStaff.FirstName} ${existingStaff.LastName}`;
      ticketBackground = colorOfStaff[existingStaff.Department];
      response = {
        ticketBackground,
        ticketid: `T${tick_details.id}`,
        ticketTypeName:
          tickettype == "COMP" ? "THE ONDALINDA EXPERIENCE" : tickettype,
        membershipType: existingStaff.Department,
      };
    } else if (tickettype === "ticket") {
      tick_details = await TicketDetail.findOne({
        where: { tid: ticketdetail_id },
        include: [User],
      });
      if (
        tick_details?.transfer_user_id &&
        tick_details.transfer_user_id != user_id
      ) {
        return {
          success: false,
          status: "Invalid ticket!",
          ticketBackground: "#FF6F61",
        };
      }
      if (tick_details?.transfer_user_id) {
        const tick_details_transfer_user = await User.findOne({
          where: { id: tick_details?.transfer_user_id }, // Assuming 'id' is of type INTEGER
        });
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details_transfer_user.FirstName} ${tick_details_transfer_user.LastName}`;

        ticketusedemail = tick_details_transfer_user.Email;
      } else {
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details.User.FirstName} ${tick_details.User.LastName}`;
        ticketusedemail = tick_details.User.Email;
      }

      const memberType = tick_details.User.membership_type;
      response = {
        ticketBackground: "#FF6F61",
        ticketTypeName: "THE ONDALINDA EXPERIENCE",
        ticketid: `T${tick_details.id}`,
        membershipType: membershipType[memberType],
      };
    } else if (tickettype === "addon") {
      tick_details = await AddonBook.findOne({
        where: { id: ticketdetail_id },
        include: [{ model: Addons }, { model: User }],
      });

      // return { success: false, message:tick_details};
      if (
        tick_details?.transfer_user_id &&
        tick_details.transfer_user_id != user_id
      ) {
        return {
          success: false,
          status: "Invalid addon!",
          ticketBackground: "#FF6F61",
        };
      }

      if (tick_details?.transfer_user_id) {
        const tick_details_transfer_user = await User.findOne({
          where: { id: tick_details?.transfer_user_id }, // Assuming 'id' is of type INTEGER
        });
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details_transfer_user.FirstName} ${tick_details_transfer_user.LastName}`;

        ticketusedemail = tick_details_transfer_user.Email;
      } else {
        ticketname = tick_details.fname
          ? `${tick_details.fname} ${tick_details.lname}`
          : `${tick_details.User.FirstName} ${tick_details.User.LastName}`;
        ticketusedemail = tick_details.User.Email;
      }

      const memberType = tick_details.User.membership_type;
      response = {
        ticketBackground: "#000000", // Black Color
        ticketTypeName: tick_details.Addon.name,
        ticketid: `A${tick_details.id}`,
        membershipType: membershipType[memberType],
      };
    } else {
      return { success: false, message: "Invalid ticket type!" };
    }

    if (tick_details.status == "1" || tick_details.scannedstatus == "1") {
      response.ticketname = ticketname;
      response.usedBy = tick_details.usedby;
      response.ticketname = ticketname;
      response.useDate = moment(tick_details.usedate).format(
        "MMM DD, YYYY hh:mm:ss A"
      );
      response.ticketBackground = "#E4002B"; // Red Color
      return {
        success: false,
        message: "Ticket Already Scanned !",
        getAlldata: response,
      };
    }
    // cancel ticket not scanned
    else if (tick_details.ticket_status == "cancel") {
      response.ticketname = ticketname;
      // response.usedBy = tick_details.usedby;
      response.ticketname = ticketname;
      // response.useDate = moment(tick_details.usedate).format(
      //   "MMM DD, YYYY hh:mm:ss A"
      // );
      response.ticketBackground = "#E4002B"; // Red Color
      return {
        success: false,
        message: "This ticket has been canceled and cannot be used.",
        getAlldata: response,
      };
    }
    else {
      if (
        tickettype == "CORE" ||
        tickettype == "COMP" ||
        tickettype == "STAFF" ||
        tickettype == "PRESS/DJS"
      ) {
        const existingStaff = await EventStaffMember.findOne({
          where: { id: tick_details.user_id },
        });

        const updateData = {
          status: "1",
          usedate: formattedUsedate,
          scanner_id: scannerId,
          usedby: existingStaff.Email,
        };
        await TicketDetail.update(updateData, {
          where: { id: ticketdetail_id },
        });
        response.ticketname = ticketname;
        response.usedBy = updateData.usedby;
        response.useDate = formattedUsedate.toLocaleString();
        return {
          success: true,
          message: "Successfully Scan",
          getAlldata: response,
        };
      } else if (tickettype == "ticket") {
        const updateData = {
          status: "1",
          usedate: formattedUsedate,
          scanner_id: scannerId,
          usedby: ticketusedemail,
        };
        await TicketDetail.update(updateData, {
          where: { id: ticketdetail_id },
        });
        response.ticketname = ticketname;
        response.ticketBackground = "#FF6F61";
        response.usedBy = updateData.usedby;
        response.ticketid = `T${tick_details.id}`;
        response.useDate = formattedUsedate.toLocaleString();
        return {
          success: true,
          message: "Successfull Scan",
          getAlldata: response,
        };
      } else if (tickettype == "addon") {
        const updateData = {
          scannedstatus: "1",
          usedate: formattedUsedate,
          scanner_id: scannerId,
          usedby: ticketusedemail,
        };

        await AddonBook.update(updateData, { where: { id: ticketdetail_id } });
        const existingaddoon = await AddonBook.findOne({
          where: { id: ticketdetail_id },
        });

        response.ticketname = ticketname;
        response.usedBy = updateData.usedby;
        response.ticketid = `A${existingaddoon.id}`;
        response.useDate = formattedUsedate.toLocaleString();
        return {
          success: true,
          message: "Successfully Scan",
          getAlldata: response,
        };
      }
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function scanTicketV1(req, res) {
  const { user_id, order_id, ticketdetail_id, tickettype, scannerId } =
    req.body;
}
