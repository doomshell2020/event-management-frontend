import {View_Members,View_InvitedMember} from "@/shared/services/admin/membermanager/getAllMembersService"
const handler = async (req, res) => {
    try {
        const {method} = req;
        switch (method) {
            case "POST": {
                try {} catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case "GET": {
                    const allMembersResult = await View_Members(req.query, res);
                    const invitedToOxCarriesResult = await View_InvitedMember({ eventid: 109, isInterested: true }, res);
                    let allMembers;
                    if (invitedToOxCarriesResult.success) {
                        allMembers = allMembersResult.data.map((member, index) => {
                            const memberId = member.dataValues.id;
                            const isInvitedToOxCarries = invitedToOxCarriesResult.data.includes(memberId) ? true : false;
                            const isInvited = isInvitedToOxCarries;
                            return {
                                ...member.dataValues,
                                SNO: index + 1,
                                isInvitedToOxCarries, // Member is invited to OxCarries
                                isInvited // Member is invited to both events
                            };
                        });
                    } else {
                        allMembers = allMembersResult.data.map((member, index) => ({
                            ...member.dataValues,
                            SNO: index + 1,
                            isInvitedToOxCarries: false, // Default to false if the result is not successful
                            isInvited: false // Default to false if the result is not successful
                        }));
                    }
                    res.status(200).json({ ...allMembersResult, data: allMembers });
                break;
            }
            case 'PUT': {
                try {
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
                break;
            }
            case 'DELETE': {
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