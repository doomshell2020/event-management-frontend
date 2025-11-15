import {
    View_Members, View_MembersByid, Search_Members, Edit_Member, Edit_Member_Interest, mailchimp, sendEmailUpdateProfile, Update_Status, Member_Add, Search_LastName, Member_Interest, View_Invitedmember, View_MembersEmail, Delete_Member, viewCurrentAndFeatureEvents, viewPastEvents
} from "@/shared/services/admin/membermanager/memberservices"
import { imageUpload } from "@/utils_back/fileUpload";
import { uploadToS3 } from '@/utils_back/s3Uploader';
import { s3FileUpload } from "@/utils_back/s3FileUpload";
import { deleteFromS3 } from '@/utils_back/s3Delete';
import fs from 'fs';
// Set bodyParser to false to handle it manually
export const config = {
    api: {
        bodyParser: false,
    },
};
const handler = async (req, res) => {
    try {

        const { method, query } = req;
        switch (method) {
            case "POST": {
                try {
                    s3FileUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.error('Error uploading image:', err);
                            return res.status(400).json({ message: 'Error uploading image', error: err.message });
                        }

                        if (req.body.key == "searchLastName") {
                            const search_data = await Search_LastName(req.body);
                            res.status(200).json(search_data);
                        } else if (req.body.key == "sendEmailUpdateProfiles") {
                            const UpdateProfileEmail = await sendEmailUpdateProfile(req.body, res);
                            res.json(UpdateProfileEmail);
                        } else if (req.body.key == "CurrentAndFeatureEvents") {
                            const eventNames = await viewCurrentAndFeatureEvents(req.body, res);
                            res.json(eventNames);
                        } else if (req.body.key == "PastEvents") { //past events
                            const pastEvents = await viewPastEvents(req.body, res);
                            res.json(pastEvents);
                        } else {
                            
                            if (req.file) {
                                const file = req.file;

                                const fileForS3 = {
                                    originalFilename: file.originalname,
                                    mimetype: file.mimetype,
                                    filepath: file.path,
                                };

                                const targetFolder = 'profiles';
                                const uploaded = await uploadToS3(fileForS3, targetFolder);
                                const imageFilename = uploaded?.[0]?.filename;

                                if (!imageFilename) {
                                    return res.status(500).json({ message: 'Image upload failed' });
                                }

                                // Add member with uploaded filename
                                const member_add = await Member_Add(req.body, imageFilename, res);
                                const User_ID = member_add.id;

                                if (!member_add?.success && imageFilename) {
                                    await deleteFromS3(targetFolder, imageFilename); // clean up
                                    return res.status(400).json({ message: 'Member creation failed' });
                                }

                                if (req.body.Interest) {
                                    await Member_Interest(req.body, User_ID, res);
                                }

                                res.status(200).json({ member_add });
                            } else {
                                const member_add = await Member_Add(req.body, '', res);
                                const User_ID = member_add.id;
                                if (req.body.Interest) {
                                    const Memberinterest = await Member_Interest(req.body, User_ID, res);
                                }
                                res.status(200).json({ member_add });
                            }
                        }


                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case "GET": {
                const { id, key, userId, status, member_status, eventid, email } = query; // Extract 'id' from query parameters

                if (userId && status) {
                    const StatusChange = await Update_Status({ userId, status }, res);
                    res.status(200).json(StatusChange);
                } else if (id) {
                    const Viewmemberbyid = await View_MembersByid({ id }, res);
                    res.status(200).json(Viewmemberbyid);
                }
                else if (key == "search") {

                    let search_data = await Search_Members(query);

                    const invitationMemberArr = await View_Invitedmember({ eventid: 108, isInterested: true }, res);

                    if (invitationMemberArr.success) {
                        // Filter here those member is invited or not 
                        search_data = search_data.searchResults.map((member) => {
                            const memberId = member.dataValues.id;

                            if (invitationMemberArr.data.includes(memberId)) {
                                return {
                                    ...member.dataValues,
                                    isInvited: true // Member is invited
                                };

                            } else {
                                return {
                                    ...member.dataValues,
                                    isInvited: false // Member is not invited
                                };
                            }
                        });
                    } else {
                        search_data = search_data.data;
                    }

                    res.status(200).json({ ...search_data, searchResults: search_data });
                    // res.status(200).json(search_data);

                } else if (key == "mailchimp") {
                    const mailchimddp = await mailchimp();
                    res.status(200).json(mailchimddp);
                } else if (eventid) {
                    const ViewInvitedmember = await View_Invitedmember({ eventid }, res);
                    res.status(200).json(ViewInvitedmember);
                } else if (email) {
                    const Viewmemberemail = await View_MembersEmail({ email }, res);
                    res.status(200).json(Viewmemberemail);
                } else {
                    // If 'id' is not available, call the View_Members function
                    // const ViewAllMembers = await View_Members(req.query, res);
                    // const invitationMemberOxMonteagro = await View_Invitedmember({ eventid: 108, isInterested: true }, res);
                    // const invitationMemberArrOxCarries = await View_Invitedmember({ eventid: 109, isInterested: true }, res);

                    // let getAllMember;
                    // if (invitationMemberOxMonteagro.success) {
                    //     // Filter here those member is invited or not 
                    //     getAllMember = ViewAllMembers.data.map((member,index) => {
                    //         const memberId = member.dataValues.id; // Assuming id is available in dataValues

                    //         if (invitationMemberOxMonteagro.data.includes(memberId)) {
                    //             return {
                    //                 ...member.dataValues,
                    //                 SNO:index+1,
                    //                 isInvited: true // Member is invited
                    //             };

                    //         } else {
                    //             return {
                    //                 ...member.dataValues,
                    //                 SNO:index+1,
                    //                 isInvited: false // Member is not invited
                    //             };
                    //         }
                    //     });
                    // } else {
                    //     getAllMember = ViewAllMembers.data;
                    // }

                    // res.status(200).json({ ...ViewAllMembers, data: getAllMember });


                    const allMembersResult = await View_Members(req.query, res);
                    // const invitedToOxMonteagroResult = await View_Invitedmember({ eventid: 108, isInterested: true }, res);
                    const invitedToOxCarriesResult = await View_Invitedmember({ eventid: 109, isInterested: true }, res);
                    // const invitedToOxCarriesResult = await View_Invitedmember({ eventid: 110, isInterested: true }, res); //kamal(07-11-2024)

                    let allMembers;
                    // if (invitedToOxMonteagroResult.success && invitedToOxCarriesResult.success) {
                    if (invitedToOxCarriesResult.success) {
                        allMembers = allMembersResult.data.map((member, index) => {
                            const memberId = member.dataValues.id; // Assuming id is available in dataValues

                            // const isInvitedToOxMonteagro = invitedToOxMonteagroResult.data.includes(memberId) ? true : false;
                            const isInvitedToOxCarries = invitedToOxCarriesResult.data.includes(memberId) ? true : false;
                            // const isInvited = isInvitedToOxMonteagro && isInvitedToOxCarries;
                            const isInvited = isInvitedToOxCarries;


                            return {
                                ...member.dataValues,
                                SNO: index + 1,
                                // isInvitedToOxMonteagro, // Member is invited to OxMonteagro
                                isInvitedToOxCarries, // Member is invited to OxCarries
                                isInvited // Member is invited to both events
                            };
                        });
                    } else {
                        allMembers = allMembersResult.data.map((member, index) => ({
                            ...member.dataValues,
                            SNO: index + 1,
                            // isInvitedToOxMonteagro: false, // Default to false if the result is not successful
                            isInvitedToOxCarries: false, // Default to false if the result is not successful
                            isInvited: false // Default to false if the result is not successful
                        }));
                    }

                    res.status(200).json({ ...allMembersResult, data: allMembers });

                }
                break;
            }
            case 'PUT': {
                try {
                    s3FileUpload.single('ImageURL')(req, res, async (err) => {
                        if (err) {
                            console.error('Error uploading image:', err);
                            return res.status(400).json({ message: 'Error uploading image', error: err.message });
                        }

                        const { id } = req.query;
                        let imageFilename = null;

                        if (req.file) {
                            const file = req.file;

                            const fileForS3 = {
                                originalFilename: file.originalname,
                                mimetype: file.mimetype,
                                filepath: file.path,
                            };

                            const targetFolder = 'profiles';
                            const uploaded = await uploadToS3(fileForS3, targetFolder);
                            imageFilename = uploaded?.[0]?.filename;

                            if (!imageFilename) {
                                return res.status(500).json({ message: 'Image upload failed' });
                            }

                            // Call Edit_Member with uploaded filename
                            const Editmember = await Edit_Member({ id, filename: imageFilename }, req, res);

                            // If update failed, delete image from S3
                            if (Editmember?.success == false) {
                                await deleteFromS3(targetFolder, imageFilename);
                                return res.status(400).json({ message: 'Member update failed', Editmember });
                            }
                            const EditmemberInterest = await Edit_Member_Interest({ id }, req, res);
                            return res.status(200).json({ Editmember, EditmemberInterest });
                        } else {
                            // No file uploaded, update without image
                            const Editmember = await Edit_Member({ id }, req, res);
                            const EditmemberInterest = await Edit_Member_Interest({ id }, req, res);
                            return res.status(200).json({ Editmember, EditmemberInterest });
                        }
                    });
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            // case 'PUT': {
            //     try {
            //         imageUpload.single('ImageURL')(req, res, async (err) => {
            //             if (err) {
            //                 console.error('Error uploading image:', err);
            //                 return res.status(400).json({ message: 'Error uploading image', error: err.message });
            //             }
            //             const { id, userId } = query;
            //             if (req.file) {
            //                 const { filename } = req.file;
            //                 const Editmember = await Edit_Member({ id, filename }, req, res);
            //                 const EditmemberInterest = await Edit_Member_Interest({ id }, req, res);
            //                 res.status(200).json({ Editmember, EditmemberInterest });
            //             } else {
            //                 const Editmember = await Edit_Member({ id, }, req, res);
            //                 const EditmemberInterest = await Edit_Member_Interest({ id }, req, res);
            //                 res.status(200).json({ Editmember, EditmemberInterest });
            //             }
            //         });
            //     } catch (error) {
            //         console.error('Error processing request:', error);
            //         res.status(500).json({ error: 'Internal Server Error' });
            //     }
            //     break;
            // }
            case 'DELETE': {
                const { id } = query;
                const deletionResult = await Delete_Member({ id }, res);
                res.status(200).json(deletionResult);
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
const saveFile = async (file) => {
    const data = fs.readFileSync(file.path);
    fs.writeFileSync(`./public/${file.name}`, data);
    await fs.unlinkSync(file.path);
};

export default handler;