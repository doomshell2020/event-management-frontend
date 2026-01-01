import React, { useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import TicketCountTabs from "@/pages/components/Event/TicketCountTabs";
import api from "@/utils/api";

const showQuestions = (questionsList = []) => {
    if (!questionsList.length) return;

    const html = `
        <div style="max-height:55vh;overflow-y:auto;">
            ${questionsList.map((q, index) => {
        const options = q.question.questionItems?.length
            ? `
                        <span style="font-size:11px;color:#6b7280;">
                            | ${q.question.questionItems.map(i => i.items).join(", ")}
                        </span>
                    `
            : "";

        return `
                    <div style="
                        border-bottom:1px solid #e5e7eb;
                        padding:6px 4px;
                    ">
                        <div style="
                            display:flex;
                            align-items:flex-start;
                            gap:6px;
                        ">
                            <div style="
                                font-size:11px;
                                font-weight:600;
                                color:#2563eb;
                                min-width:18px;
                            ">
                                ${index + 1}.
                            </div>

                            <div style="flex:1;">
                                <div style="
                                    font-size:13px;
                                    font-weight:600;
                                    line-height:1.3;
                                ">
                                    ${q.question.question}
                                </div>

                                <div style="
                                    font-size:11px;
                                    color:#6b7280;
                                ">
                                    ${q.question.type}${options}
                                </div>

                                <div style="
                                    font-size:12px;
                                    margin-top:2px;
                                ">
                                    <span style="color:#6b7280;">Reply:</span>
                                    <span style="font-weight:500;">
                                        ${q.user_reply ?? "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
    }).join("")}
        </div>
    `;

    Swal.fire({
        title: `Questions (${questionsList.length})`,
        html,
        width: "520px",
        showCloseButton: true,
        confirmButtonText: "Close",
        padding: "12px",
    });
};


const CommitteePending = ({ pendingRequests, counts, assets }) => {
    const [activeTab, setMyActiveTab] = useState("pending");
    const [requests, setRequests] = useState(pendingRequests); // local state to update list
    const router = useRouter();

    const setActiveTab = (tab) => {
        setMyActiveTab(tab);
        router.push(`/committee/${tab}`);
    };

    const pendingList = requests.filter(item => item.status == "N");

    // ✅ Handle Approve / Ignore
    const handleAction = async (itemId, actionType) => {
        // console.log('itemId, actionType :', itemId, actionType);
        // return false

        const actionText = actionType == "approve" ? "Approve" : "Ignore";

        const result = await Swal.fire({
            title: `Are you sure you want to ${actionText} this request?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: actionText,
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (result.isConfirmed) {
            try {
                Swal.fire({
                    title: `${actionText}ing...`,
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const res = await api.post(`/api/v1/committee/action`, {
                    cart_id: itemId,
                    action: actionType, // "approve" or "ignore"
                });

                Swal.close();

                if (res.data.success) {
                    Swal.fire({
                        icon: "success",
                        title: `${actionText} Successful`,
                        text: `The request has been ${actionText.toLowerCase()}d.`,
                    });

                    // Update local state to remove handled item
                    setRequests(prev => prev.filter(item => item.id !== itemId));
                }
            } catch (error) {
                Swal.close();
                Swal.fire({
                    icon: "error",
                    title: "Action Failed",
                    text: error?.response?.data?.error?.message || "Something went wrong",
                });
            }
        }
    };

    return (
        <>
            <FrontendHeader backgroundImage="/assets/front-images/about-slider_bg.jpg" />

            <section className="mt-5 mb-5">
                <div className="container">
                    <div className="section-heading">
                        <h1>Committee</h1>
                        <h2 className="mt-4">Committee</h2>
                        <p className="mb-4 text-center">
                            Manage your committee ticket requests easily.
                        </p>
                    </div>

                    <div className="profil_deaile mx-auto">
                        <TicketCountTabs
                            active={activeTab}
                            onChange={setActiveTab}
                            counts={counts}
                        />

                        <div className="table-responsive mt-4">
                            <table className="table table-hover align-middle">
                                <thead className="bg-dark text-white">
                                    <tr>
                                        <th>Sr No.</th>
                                        <th>Image</th>
                                        <th>Name</th>
                                        <th>Ticket</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pendingList.length > 0 ? (
                                        pendingList.map((item, index) => {
                                            const user = item.user || {};
                                            const ticket = item.TicketType || {};
                                            const profileImage = user.profile_image
                                                ? `${assets.profile_image_path}/${user.profile_image}`
                                                : "/assets/front-images/no-image.png";


                                            return (
                                                <tr key={item.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <img
                                                            src={profileImage}
                                                            alt="User"
                                                            style={{
                                                                width: "60px",
                                                                height: "60px",
                                                                objectFit: "cover",
                                                                borderRadius: "6px",
                                                                border: "1px solid #ddd",
                                                            }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 600 }}>
                                                            {user.first_name} {user.last_name}
                                                        </div>
                                                        <div className="text-muted fs-13">{user.email}</div>
                                                    </td>
                                                    <td>
                                                        <div>{ticket.title}</div>
                                                        <div className="text-muted fs-13">
                                                            {item?.events?.currencyName?.Currency_symbol}{ticket.price} × {item.no_tickets}
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        
                                                        <span className="me-2">
                                                            {item.questionsList?.length > 0 ? (
                                                                <i
                                                                    className="bi bi-question-circle-fill text-primary"
                                                                    style={{ fontSize: "18px", cursor: "pointer" }}
                                                                    title="View Questions"
                                                                    onClick={() => showQuestions(item.questionsList)}
                                                                ></i>
                                                            ) : (
                                                                <span className="text-muted">—</span>
                                                            )}

                                                        </span>

                                                        <button
                                                            className="btn btn-success btn-sm me-2"
                                                            onClick={() => handleAction(item.id, "approve")}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleAction(item.id, "ignore")}
                                                        >
                                                            Ignore
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center py-4">
                                                No pending requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <FrontendFooter />
        </>
    );
};

export default CommitteePending;


export async function getServerSideProps(context) {
    try {
        const token = context.req.cookies?.userAuthToken || null;

        if (!token) {
            return {
                redirect: {
                    destination: "/login",
                    permanent: false,
                },
            };
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/committee/requests/N`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const json = await res.json();
        const list = json?.data?.list || [];
        const assets = json?.data?.assets || {};

        const counts = { pending: 0, approved: 0, ignored: 0 };

        list.forEach(item => {
            if (item.status == "N") counts.pending++;
            if (item.status == "Y") counts.approved++;
            if (item.status == "I") counts.ignored++;
        });

        return {
            props: {
                pendingRequests: list,
                counts,
                assets,
            },
        };

    } catch (error) {
        console.error("SSR Error:", error);

        return {
            props: {
                pendingRequests: [],
                counts: { pending: 0, approved: 0, ignored: 0 },
                assets: {},
            },
        };
    }
}


