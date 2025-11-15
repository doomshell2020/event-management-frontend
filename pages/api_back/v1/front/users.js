import {
  User_Registration,
  UserLogin,
  UserProfile_View,
  sendEmailCastleVillaOrHotels,
  User_Interest,
  User_ProfileEdit,
  Edit_User_Interest,
  view_Users,
  Change_Password,
  Forgot_password,
  viewUser,
  fireBaseApi,
  sendEmailTicketAcceptTermsConditions,
  UserLoginWeb,
  ReplaceData,
} from "@/shared/services/front/userservices";
import { imageUpload } from "@/utils_back/fileUpload";
export const config = {
  api: {
    bodyParser: false,
  },
};

import { parse } from 'cookie';


const handler = async (req, res) => {
  try {
    const { method, query } = req;

    // console.log('>>>>>>>>>>>>>>>>>>>>>',req.body);
    // return false    

    switch (method) {
      case "POST": {
        try {
          imageUpload.single("ImageURL")(req, res, async (err) => {
            if (err) {
              return res.status(400).json({ error: "File upload error" });
            }
            if (req.body.key == "userlogin") {
              var userLogin = await UserLogin(req.body, res);
              res.status(200).json(userLogin);
            } else if (req.body.key == "userLoginWeb") {
              const userData = await UserLoginWeb(req.body, res);
              res.json(userData);
            } else if (req.body.key == "updateToken") {
              const updateTokenData = await fireBaseApi(req.body, res);
              res.status(200).json(updateTokenData);
            } else if (req.body.key == "transferTicketAcceptTermsConditions") {
              const sendEmailData = await sendEmailTicketAcceptTermsConditions(
                req,
                res
              );
              res.status(200).json(sendEmailData);
            } else if (
              req.body.key == "castleVilla" ||
              req.body.key == "hotelRoom"
            ) {
              const sendEmailData = await sendEmailCastleVillaOrHotels(
                req,
                res
              );
              res.json(sendEmailData);
            } else if (req.body.key == "DataReplace") {
              const replaceData = await ReplaceData(req, res);
              res.json(replaceData);
            } else {
              if (req.file) {
                const { filename } = req.file;
                const registration_add = await User_Registration(req, req.body, filename, res);
                if (registration_add.success) {
                  const User_ID = registration_add.id;
                  if (req.body.Interest) {
                    await User_Interest(req.body, User_ID, res);
                  }
                  res
                    .status(registration_add.statusCode)
                    .json({ registration_add });
                } else {
                  res.status(404).json({ success: false, message: registration_add.message });
                }
              } else {
                const registration_add = await User_Registration(req, req.body, "", res);

                if (registration_add.success) {
                  const User_ID = registration_add.id;
                  if (req.body.Interest) {
                    await User_Interest(req.body, User_ID, res);
                  }
                  res
                    .status(registration_add.statusCode)
                    .json({ registration_add });
                } else {
                  res.status(404).json({ success: false, message: registration_add.message });
                }
              }
            }
          });
        } catch (error) {
          // console.error('Error processing POST request:', error);
          res.status(500).json({ success: false, error: "Internal Server Error" });
        }
        break;
      }
      case "GET": {
        const { key, id } = query; // Extract 'id' from query parameters
        if (key == "viewUsers") {
          const userData = await viewUser(req);
          res.status(200).json(userData);
          break;
        } else if (id) {
          const userData = await view_Users({ id });
          res.status(200).json(userData);
          break;
        } else {
          const ViewProfile = await UserProfile_View(req);
          res.status(200).json(ViewProfile);
          break;
        }
      }
      case "PUT": {
        try {
          imageUpload.single("ImageURL")(req, res, async (err) => {
            if (err) {
              console.error("Error uploading image:", err);
              return res
                .status(400)
                .json({ message: "Error uploading image", error: err.message });
            }

            const { id } = query;
            if (req.body.key == "changePassword") {
              const Editpassword = await Change_Password({ id }, req, res);
              res.status(200).json(Editpassword);
            } else if (req.body.key == "forgetpassword") {
              const Forgotpassword = await Forgot_password(req.body, res);
              res.status(200).json(Forgotpassword);
            } else {
              if (req.file) {
                const { filename } = req.file;
                // console.log(filename, "filenamefilenamefilename");
                const Edituser = await User_ProfileEdit(
                  { id, filename },
                  req,
                  res
                );
                if (req.body.Interest) {
                  const EdituserInterest = await Edit_User_Interest(
                    { id },
                    req,
                    res
                  );
                }
                res.status(200).json(Edituser);
              } else {
                const Edituser = await User_ProfileEdit({ id }, req, res);
                // console.log("Edituser", Edituser)
                const EdituserInterest = await Edit_User_Interest(
                  { id },
                  req,
                  res
                );
                res.status(200).json({ Edituser, EdituserInterest });
              }
            }
          });
        } catch (error) {
          console.error("Error processing request:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
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
