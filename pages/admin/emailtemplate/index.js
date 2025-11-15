import React, { useState, useEffect } from "react";
import {
  Breadcrumb,
  Dropdown,
  Modal,
  Card,
  Form,
  Col,
  Row,
  Table,
  Button,
  Spinner,
  Alert,
  Collapse,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { CCol, CFormLabel, CFormInput } from "@coreui/react";
import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import axios from "axios";
import Moment from "react-moment";

import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

export const EmailTemplate = () => {
  const [COLUMNS, setCOLUMNS] = useState([
    {
      Header: "S.No",
      accessor: (row, index) => index + 1,
      className: "borderrigth",
    },
    {
      Header: "Title",
      accessor: "title",
      className: "borderrigth",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center gap-2">
          <span>{row.original.title}</span>

          <button
            type="button"
            onClick={() => viewDemoShow("lgShow", row.original)}
            className="btn btn-link p-0 m-0"
            style={{ color: "#136fc0ff", background: "transparent", border: "none" }}
            title="View Template"
          >
            <i className="bi bi-eye-fill"></i>
            {/* <i className="bi bi-box-arrow-up-right"></i> */}
          </button>
        </div>
      ),
    },

    {
      Header: "Event Name",
      accessor: "eventName",
      className: "wd-20p borderrigth",
      Cell: ({ row }) => (
        <div>
          {row.original.Event ? row.original.Event.Name : "---"}
        </div>
      ),
    },
    {
      Header: "Subject",
      accessor: "subject",
      className: "wd-30p borderrigth",
    },
    {
      Header: "Action",
      accessor: "action",
      className: "wd-15p borderrigth",
      Cell: ({ row }) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Edit Button */}
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "#20c997", color: "white" }}
            type="button"
            onClick={() => handleEdit(row.original.id)}
          >
            <i className="bi bi-pencil-square"></i>
          </button>

          {/* Send Test Email Button */}
          <button
            className="btn btn-sm"
            style={{ backgroundColor: "#008000", color: "white" }}
            type="button"
            title="Send Test Email"
            onClick={() => sendTestEmail(row.original.id)}
          >
            <i className="fas fa-envelope"></i>
          </button>
        </div>
      ),
    },
  ]);



  let navigate = useRouter();
  const [EmailTemplateList, setEmailTemplateList] = useState([]);
  const [lgShow, setLgShow] = useState(false);
  const [modalData, setModalData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [title, setTitle] = useState("");

  // Alert messages
  const [openAlert, setOpenAlert] = useState(false);
  const [staticAdded, setStaticAdded] = useState("");

  var StaticMessage = "";
  useEffect(() => {
    if (typeof window !== "undefined") {
      var StaticMessage = localStorage.getItem("staticAdded");

      if (StaticMessage != null && StaticMessage !== "") {
        setOpenAlert(true);
        setStaticAdded(StaticMessage);
        setTimeout(() => {
          localStorage.setItem("staticAdded", "");
          setOpenAlert(false);
        }, 5000);
      } else {
        setOpenAlert(false);
        setStaticAdded("");
      }
    }
  }, [StaticMessage]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("/api/v1/emailtemplets");
        setEmailTemplateList(res.data.data);
      } catch (error) {
        console.error("Error fetching email templates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  let viewDemoClose = (modal) => {
    switch (modal) {
      case "lgShow":
        setLgShow(false);
        setModalData("");
        break;
    }
  };

  const tableInstance = useTable(
    {
      columns: COLUMNS,
      data: EmailTemplateList,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const {
    getTableProps, // table props from react-table
    headerGroups, // headerGroups, if your table has groupings
    getTableBodyProps, // table body props from react-table
    prepareRow, // Prepare the row (this function needs to be called for each row before getting the row props)
    state,
    setGlobalFilter,
    page, // use, page or rows
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
  } = tableInstance;

  const { globalFilter, pageIndex, pageSize } = state;
  useEffect(() => { setPageSize(50) }, []);
  const Warningalert = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const apiurl = `/api/v1/emailtemplets?id=${id}`;
        await axios.delete(apiurl);
        const viewapi = `/api/v1/emailtemplets`;
        const response = await axios.get(viewapi);
        setEmailTemplateList(response.data.data);
        Swal.fire("Deleted!", "Your file has been deleted.", "success");
      }
    });
  };

  // const sendTestEmail = async (id) => {
  //   const confirmationResult = await Swal.fire({
  //     title: "Are you sure you want to Send Test Email?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonText: "Yes,Send!",
  //     cancelButtonText: "No,Cancel",
  //   });
  //   if (confirmationResult.isConfirmed) {
  //     const EmailUrl = "/api/v1/emailtemplets";
  //     const body = {
  //       key: "sendTestEmail",
  //       template_id: id,
  //     };
  //     await axios
  //       .post(EmailUrl, body)
  //       .then((res) => {
  //         const msg = res.data.message;
  //         Swal.fire({
  //           title: "Done!",
  //           text: msg,
  //           icon: "success",
  //         });
  //       })
  //       .catch((err) => {
  //         setIsLoading(false);
  //         Swal.fire({
  //           title: "Oops!",
  //           text: err.message,
  //           icon: "error",
  //         });
  //       });
  //   }
  // };

  // search email templates

  const sendTestEmail = async (templateId) => {
    const { value: email, isConfirmed } = await Swal.fire({
      title: "Send Test Email",
      input: "email",
      inputLabel: "Enter recipient email address",
      inputPlaceholder: "someone@example.com",
      showCancelButton: true,
      confirmButtonText: "Send Email",
      cancelButtonText: "Cancel",
      inputValidator: (value) => {
        if (!value) {
          return "Email is required!";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Please enter a valid email address!";
        }
        return null;
      },
    });

    if (isConfirmed && email) {
      // Show loading popup immediately
      Swal.fire({
        title: "Sending...",
        text: "Please wait while we send the test email.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const EmailUrl = "/api/v1/emailtemplets";
      const body = {
        key: "sendTestEmail",
        template_id: templateId,
        email: email,
      };

      try {
        const res = await axios.post(EmailUrl, body);
        const msg = res.data.message;

        Swal.fire({
          title: "Success!",
          text: msg,
          icon: "success",
        });
      } catch (err) {
        Swal.fire({
          title: "Oops!",
          text: err.response?.data?.message || err.message,
          icon: "error",
        });
      }
    }
  };



  // search data
  const searchEmailTemplate = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const ApiUrl = "/api/v1/emailtemplets";
    const body = {
      key: "searchTemplates",
      eventId: selectedEvent,
      title: title,
    };

    try {
      const { data } = await axios.post(ApiUrl, body);

      if (data.success) {
        setEmailTemplateList(data.searchResults || []);
      } else {
        console.warn("Search failed:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error searching templates:", error.message);
    } finally {
      setIsLoading(false);
    }
  };


  // Reset form
  const HandleResetData = async () => {
    try {
      setIsLoading(true);
      setSelectedEvent("");
      setTitle("");

      const response = await axios.get("/api/v1/emailtemplets");
      setEmailTemplateList(response.data.data || []);
    } catch (error) {
      console.error("Failed to reset and fetch templates:", error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const [event, setEvent] = useState([]);
  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/v1/emailtemplets/?key=findEvents");
      if (response.data && response.data.success) {
        setEvent(response.data.data); // Adjust the key based on API response structure
        // console.log("fetchEvents-----", response.data.data)
      } else {
        console.error("Failed to fetch currencies:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const viewDemoShow = (modal, rowa) => {
    switch (modal) {
      case "lgShow":
        setModalData(rowa);
        setLgShow(true);
        break;
    }
  };

  const handleEdit = (id) => {
    navigate.push({
      pathname: "/admin/emailtemplate/edit",
      query: {
        id: id,
      },
    });
  };
  const [selectedIds, setSelectedIds] = useState([]);
  const [templateIds, setTemplateIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const handleCheckboxChange = (row, isChecked) => {
    if (isChecked) {
      setSelectedIds((prev) => [...prev, row.id]); // Add ID to array
      setTemplateIds((prev) => [...prev, row.templateId]); // Add ID to array
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== row.id)); // Remove ID from array
      setTemplateIds((prev) => prev.filter((selectedId) => selectedId !== row.templateId)); // Remove ID from array
    }
  };

  const handleSelectAllChange = (isChecked) => {
    if (isChecked) {
      // Select all row IDs
      const allIds = page.map((row) => row.original.id);
      const allTemplatedId = page.map((row) => row.original.templateId);
      setTemplateIds(allTemplatedId)
      setSelectedIds(allIds);
    } else {
      // Deselect all
      setSelectedIds([]);
      setTemplateIds([]);
    }
    setSelectAll(isChecked); // Update Select All state
  };

  const isRowSelected = (id) => selectedIds.includes(id);
  const CloneTemplate = async () => {
    const response = await axios.get("/api/v1/events?active=1");
    const events = response.data.data;

    const dropdownHtml = `
      <option value="" selected>Select Event</option>
      ${events
        .map((event) => `<option value="${event.id}">${event.Name}</option>`)
        .join("")}
    `;
    let selectedEventId;
    // Prompt user to select the event for cloning
    const confirmationResult = await Swal.fire({
      title: "Clone Email Template",
      html: `
        <div>
          <p>Select an event to clone the template to:</p>
          <select id="eventDropdown" class="swal2-select">
            ${dropdownHtml}
          </select>
        </div>
        <p>Are you sure you want to clone the email template to this event?</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, clone template!",
      cancelButtonText: "No, cancel",
      preConfirm: () => {
        selectedEventId = document.getElementById("eventDropdown").value;

        if (!selectedEventId) {
          Swal.showValidationMessage("Please select an event to clone the template.");
          return false; // Prevent submission
        }

        // Show processing popup
        Swal.fire({
          title: "Processing...",
          text: "Please wait while we clone the email template.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        return true; // Proceed with the form submission
      },
    });

    if (confirmationResult.isConfirmed) {
      setIsLoading(true);

      try {
        const cloneUrl = "/api/v1/emailtemplets";
        const body = {
          EventID: selectedEventId, // Target event to clone the template
          Ids: selectedIds,
          template_ids: templateIds,
          key: "CloneTemplate",
        };

        const response = await axios.post(cloneUrl, body);
        Swal.close();
        if (response.data.clonedCount == 0) {
          Swal.fire({
            title: "Oops!",
            text: "Template already cloned.",
            icon: "error",
          })
        } else {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: response?.data?.message || "Template cloned successfully.",
            confirmButtonText: "OK",
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        }
      } catch (err) {
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || "An error occurred while cloning the template.",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <div>
      <Seo title={"Email Template Manager"} />
      <Row className="row-sm mt-4">
        <Col xl={2}>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between">
                <h4 className="card-title mg-b-0">Filters</h4>
              </div>
            </Card.Header>
            <Card.Body className="">
              <Form onSubmit={searchEmailTemplate} onReset={HandleResetData}>
                <CCol md={12}>
                  <CFormLabel htmlFor="validationDefault04">Event</CFormLabel>
                  <Form.Select
                    aria-label="Default select example"
                    className="admn-slct"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                  >
                    <option value="">--Select-Event--</option>
                    {event &&
                      event.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.event_menu_name}
                        </option>
                      ))}
                  </Form.Select>

                  <CFormLabel htmlFor="validationDefault01">Title</CFormLabel>
                  <CFormInput
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </CCol>
                <div className="d-flex  mt-2">
                  <Button variant="primary me-3" type="submit">
                    Submit
                  </Button>
                  <Button variant="secondary" type="reset">
                    Reset
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={10}>
          <Card>
            {staticAdded != null && openAlert === true && (
              <Collapse in={openAlert}>
                <Alert aria-hidden={true} severity="success">
                  {staticAdded}
                </Alert>
              </Collapse>
            )}

            <Card.Header className="">
              <div className="d-flex justify-content-between">
                <h4 className="card-title mg-b-0">Email Templates</h4>
                <div>

                  {selectedIds.length >= 1 && (
                    <button
                      className="btn ripple btn-info btn-sm"
                      onClick={CloneTemplate}
                    >
                      Clone Template
                    </button>
                  )}
                  {/* <Link
                                        className="btn ripple btn-info btn-sm"
                                        href="/admin/emailtemplate/add"
                                    >
                                        Add Email Template
                                    </Link> */}
                </div>
              </div>
            </Card.Header>

            <div className="table-responsive mt-4">
              {isLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "33vh",
                  }}
                >
                  <Spinner
                    animation="border"
                    role="status"
                    variant="primary"
                    style={{ width: "30px", height: "30px" }}
                  >
                    <span className="sr-only">Loading...</span>
                  </Spinner>
                </div>
              ) : (
                <table
                  {...getTableProps()}
                  className="table table-bordered table-hover mb-0 text-md-nowrap"
                >
                  <thead>
                    <tr>
                      <th className="wd-3p borderrigth">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={(e) => handleSelectAllChange(e.target.checked)}
                        />
                      </th>
                      {headerGroups.map((headerGroup) => (
                        <React.Fragment key={Math.random()}>
                          {headerGroup.headers.map((column) => (
                            <th
                              key={Math.random()}
                              {...column.getHeaderProps(
                                column.getSortByToggleProps()
                              )}
                              className={column.className}
                            >
                              <span className="tabletitle">
                                {column.render("Header")}
                              </span>
                              <span>
                                {column.isSorted ? (
                                  column.isSortedDesc ? (
                                    <i className="fa fa-angle-down"></i>
                                  ) : (
                                    <i className="fa fa-angle-up"></i>
                                  )
                                ) : (
                                  ""
                                )}
                              </span>
                            </th>
                          ))}
                          {/* <th>Actions</th> */}
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody {...getTableBodyProps()}>
                    {page.map((row) => {
                      prepareRow(row);
                      const rowId = row.original.id; // Assuming `id` is present in row.original
                      const rowData = row.original; // Assuming `id` is present in row.original
                      return (
                        <tr key={Math.random()} {...row.getRowProps()}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isRowSelected(rowId)}
                              onChange={(e) =>
                                handleCheckboxChange(rowData, e.target.checked)
                              }
                            />
                          </td>
                          {row.cells.map((cell) => {
                            return (
                              <td
                                key={Math.random()}
                                className="borderrigth"
                                {...cell.getCellProps()}
                              >
                                {cell.render("Cell")}
                              </td>
                            );
                          })}

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="d-block d-sm-flex mt-4 ">
              <span className="">
                Page{" "}
                <strong>
                  {pageIndex + 1} of {pageOptions.length}
                </strong>{" "}
              </span>

              <span className="ms-sm-auto ">
                <Button
                  variant=""
                  className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                  onClick={() => gotoPage(0)}
                  disabled={!canPreviousPage}
                >
                  {" Previous "}
                </Button>
                <Button
                  variant=""
                  className="btn-default tablebutton me-2 my-1"
                  onClick={() => {
                    previousPage();
                  }}
                  disabled={!canPreviousPage}
                >
                  {" << "}
                </Button>
                <Button
                  variant=""
                  className="btn-default tablebutton me-2 my-1"
                  onClick={() => {
                    previousPage();
                  }}
                  disabled={!canPreviousPage}
                >
                  {" < "}
                </Button>
                <Button
                  variant=""
                  className="btn-default tablebutton me-2 my-1"
                  onClick={() => {
                    nextPage();
                  }}
                  disabled={!canNextPage}
                >
                  {" > "}
                </Button>
                <Button
                  variant=""
                  className="btn-default tablebutton me-2 my-1"
                  onClick={() => {
                    nextPage();
                  }}
                  disabled={!canNextPage}
                >
                  {" >> "}
                </Button>
                <Button
                  variant=""
                  className="btn-default tablebutton me-2 d-sm-inline d-block my-1"
                  onClick={() => gotoPage(pageCount - 1)}
                  disabled={!canNextPage}
                >
                  {" Next "}
                </Button>
              </span>
            </div>
          </Card>
        </Col>
      </Row>


      <>
        <Modal
          size="lg"
          show={lgShow}
          aria-labelledby="example-modal-sizes-title-sm"
        >
          <Modal.Header>
            {/* set here title  */}
            <Modal.Title id="example-modal-sizes-title-sm">
              <h6><strong>Email Subject: </strong>{modalData.subject && modalData.subject}</h6>
            </Modal.Title>
            <Button
              variant=""
              className="btn btn-close ms-auto"
              onClick={() => {
                viewDemoClose("lgShow");
              }}
            >
              x
            </Button>
          </Modal.Header>
          <Modal.Body>
            <div dangerouslySetInnerHTML={{ __html: modalData.description }} />
          </Modal.Body>
        </Modal>
      </>


    </div>
  );
};

EmailTemplate.layout = "Contentlayout";

export default EmailTemplate;
