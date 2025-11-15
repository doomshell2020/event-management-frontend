import { Cms_VanityURL } from "../../../../../shared/services/front/careyes/careyesmusicservices"

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                const added_cms = await Add_Cms(req.body);
                res.status(200).json(added_cms);
                break;
            }
            case "GET": {
                const { VanityURL } = query;
                if (VanityURL) {
                    const ViewCms = await Cms_VanityURL(VanityURL, res);
                    res.status(200).json(ViewCms);
                }
                else {
                    const Viewcms = await View_Cms(req);
                    res.status(200).json(Viewcms);
                }
                break;
            }
            case "PUT": {

                const Editcmss = await Edit_Cms(req.body, res);
                // console.log("Editcmss", Editcmss)
                res.status(200).json(Editcmss)
                break;
            }
            case "DELETE": {
                const { id } = query
                const Deletedcmss = await Deleted_Cms({ id }, res);
                res.status(200).json(Deletedcmss)
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