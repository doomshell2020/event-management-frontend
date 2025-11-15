import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import {
  Button,
  Form,
  Modal,
  Table,
  Card,
  Row,
  Col,
  Breadcrumb,
} from "react-bootstrap";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";
import { useRouter } from "next/router";

import Seo from "@/shared/layout-components/seo/seo";
import Swal from "sweetalert2";
import "jspdf-autotable";
import Link from "next/link";
import Moment from "react-moment";
import "moment-timezone";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";
import DataTable from "react-data-table-component";
import dynamic from "next/dynamic";
// Dynamically import the DataTableExtensions component with SSR disabled
const DataTableExtensions = dynamic(
  () => import("react-data-table-component-extensions"),
  {
    ssr: false,
    // loading: () => <div>Loading DataTable ...</div>,
  }
);

export const COLUMNS = [
  {
    name: "S.No",
    selector: (row) => [row.SNO],
    sortable: true,
    width: "6%", // Optional
  },
  // {
  //   name: "Event Name",
  //   selector: (row) => row.EventName,
  //   sortable: true,
  //   width: "14%",
  // },
  {
    name: "Promotion Code",
    selector: (row) => row.PromoCode,
    sortable: true,
    width: "14%", // Optional
  },
  {
    name: "Discount",
    selector: (row) => row.Discount,
    sortable: true,
  },
  {
    name: "Duration (Days)",
    selector: (row) => row.Duration,
    sortable: true,
  },
  {
    name: "Applicable",
    selector: (row) => row.ApplicableFor,
    sortable: true,
  },
  {
    name: "Start On",
    selector: (row) =>
      row.Duration === "Unlimited" ? (
        "N/A"
      ) : (
        <Moment format="DD-MMMM-YYYY">{row.StartOn}</Moment>
      ),
    sortable: true,
    width: "12%",
  },
  {
    name: "Expires On",
    selector: (row) =>
      row.Duration === "Unlimited" ? (
        "N/A"
      ) : (
        <Moment format="DD-MMMM-YYYY">{row.ExpiresOn}</Moment>
      ),
    sortable: true,
    width: "12%",
  },
  {
    name: "Created On",
    selector: (row) => <Moment format="DD-MMMM-YYYY">{row.CreatedOn}</Moment>,
    width: "12%",
    sortable: true,
  },
  {
    name: "Usage",
    selector: (row) => row.Usage,
    sortable: true,
    // width: "5%",
  },
];

// CSV conversion
function convertArrayOfObjectsToCSV(array) {
  let result = "";

  const columnDelimiter = ",";
  const lineDelimiter = "\n";

  // Filter out the 'id' field from the keys
  const keys = Object.keys(array[0]).filter((key) => key !== "id");

  // Add headers to the CSV (excluding 'id')
  result += keys.join(columnDelimiter);
  result += lineDelimiter;

  // Iterate through each row and exclude 'id' values
  array.forEach((item) => {
    let ctr = 0;
    keys.forEach((key) => {
      if (ctr > 0) result += columnDelimiter;

      // If the value is null or undefined, show an empty string
      result += item[key] === null || item[key] === undefined ? "" : item[key];

      ctr++;
    });
    result += lineDelimiter;
  });

  return result;
}

// CSV download
function downloadCSV(array, eventName) {
  const csv = convertArrayOfObjectsToCSV(array);
  if (csv == null) return;
  // Get the current date in the format DD-MM-YYYY
  const currentDate = new Date()
    .toLocaleDateString("en-GB")
    .split("/")
    .join("_");

  // Generate the filename using eventName and current date
  const filename = `${eventName}_${currentDate}_export.csv`;
  const csvData = `data:text/csv;charset=utf-8,${csv}`;

  // Create download link and trigger download
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvData));
  link.setAttribute("download", filename);
  link.click();
}

const Export = ({ onExport }) => (
  <Button className="btn-sm" onClick={onExport}>
    Export CSV
  </Button>
);

const PromotionCodes = () => {
  const [DATATABLE, setDATATABLE] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [toggleCleared, setToggleCleared] = useState(false);
  const [eventName, setEventName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Only run this effect on the client-side
    if (typeof window !== "undefined") {
      const getEventNameFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return decodeURIComponent(urlParams.get("event"));
      };

      const eventFromURL = getEventNameFromURL();
      setEventName(eventFromURL);
      getAllCoupons(eventFromURL);
    }
  }, []);

  const actionsMemo = useMemo(
    () => <Export onExport={() => downloadCSV(DATATABLE, eventName)} />,
    [DATATABLE, eventName]
  );

  const contextActions = useMemo(() => {
    const handleExportSelectedRows = () => {
      if (
        window.confirm(
          `Download selected rows: ${selectedRows
            .map((r) => r.SNO)
            .join(", ")}?`
        )
      ) {
        const selectData = DATATABLE.filter((item) =>
          selectedRows.some((row) => row.id === item.id)
        );
        downloadCSV(selectData, eventName);
      }
    };

    return <Export onExport={handleExportSelectedRows} />;
  }, [DATATABLE, selectedRows, eventName]);

  const handleRowSelected = useCallback((state) => {
    setSelectedRows(state.selectedRows);
  }, []);

  const tableInstance = {
    columns: COLUMNS,
    data: DATATABLE,
  };

  const getAllCoupons = async (eventName) => {
    const API_URL = `/api/v1/orders`;

    try {
      const body = {
        key: "PromotionCodes",
        eventName: eventName,
      };
      const response = await axios.post(API_URL, body);
      setDATATABLE(response.data.coupon);
      setIsLoading(false);
    } catch (error) {
      console.error("There was a problem with your Axios request:", error);
    }
  };

  // Handler for the "Add" button click
  const handleAddClick = () => {
    const encodedName = encodeURIComponent(eventName);
    router.push(`/admin/promotioncodes/add?event=${encodedName}`);
  };

  return (
    <>
      <Seo title={"Promotion Codes Manager"} />

      <Row className="row-sm mt-4">
        <Col xl={12}>
          <Card>
            <Card.Header className=" ">
              <div className="d-flex justify-content-between">
                <h4 className="card-title mg-b-5">
                  Promotion Codes || {eventName}
                </h4>
                {/* <Button
                  onClick={handleAddClick}
                  className="btn btn-sm"
                  style={{
                    background: "#4ec2f0",
                    color: "white",
                    margin: "0 0",
                  }}
                >
                  <span className="d-flex align-items-center">
                    <i className="bi bi-gift-fill pe-1"></i>
                    Create Promotion Codes
                  </span>{" "}
                </Button> */}
              </div>
            </Card.Header>

            <Card.Body className="">
              <span className="datatable">
                <div className="Promotion-Dtbl">
                  <DataTableExtensions {...tableInstance}>
                    <DataTable
                      columns={COLUMNS}
                      data={DATATABLE}
                      actions={actionsMemo}
                      contextActions={contextActions}
                      onSelectedRowsChange={handleRowSelected}
                      clearSelectedRows={toggleCleared}
                      selectableRows
                      pagination
                    />
                  </DataTableExtensions>
                </div>
              </span>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

PromotionCodes.layout = "Contentlayout";
export default PromotionCodes;
