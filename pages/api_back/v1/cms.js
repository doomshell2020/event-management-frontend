import { Add_Cms, View_Cms, Edit_Cms, Deleted_Cms, Cms_Viewbyid, cmsGetContentBySlug, getAllSectionsBySlug, getAllActivePages, updateStatus, searchEventAndPages } from "@/shared/services/admin/cmsmanager/cmsservices"
import { imageUpload } from "@/utils_back/fileUpload";
import util from 'util';

export const config = {
    api: {
        bodyParser: false,
    },
};



const uploadAsync = util.promisify(imageUpload.single('image'));

const handler = async (req, res) => {
    try {
        const { method, query } = req;
        switch (method) {
            case "POST": {
                await uploadAsync(req, res);
                if (req.body.key == "update_page_status") {
                    const update_status = await updateStatus(req.body, res);
                    res.json(update_status);
                    break;
                } else if (req.body.key == "search_pages") {
                    const search_data = await searchEventAndPages(req.body, res);
                    res.json(search_data);
                    break;
                }
                if (query.key == 'add') {
                    const all_users = await Add_Cms(req.body, res);
                    res.status(200).json(all_users);
                    break;
                }
                else {
                    if (req.file) {
                        const { filename } = req.file;
                        res.status(200).json(filename);
                        break;
                    } else {
                        res.status(400).json("errr");
                        break;
                    }
                }
            }
            case "GET": {
                const { ID, slug, key, is_published } = query;

                if (slug && key == 1) {
                    const getContents = await getAllSectionsBySlug(slug, res);
                    res.status(200).json(getContents);
                } else if (slug) {
                    const getContents = await cmsGetContentBySlug(slug, res);
                    res.status(200).json(getContents);

                } else if (ID) {
                    const ViewCms = await Cms_Viewbyid(ID, res);
                    res.status(200).json(ViewCms);
                } else if (key === "ActivePages") {
                    const data = await getAllActivePages(res);
                    res.status(200).json(data);
                }
                else {
                    const Viewcms = await View_Cms(req);
                    res.status(200).json(Viewcms);
                }
                break;
            }
            case "PUT": {
                await uploadAsync(req, res);
                const Editcmss = await Edit_Cms(req.body, res);
                // console.log("Editcmss", Editcmss)
                res.json(Editcmss)
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