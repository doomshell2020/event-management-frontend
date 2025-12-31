import React, { useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";


const localizer = momentLocalizer(moment);

/* ================= CUSTOM HEADER ================= */
const CustomCalendarHeader = ({ date, onNavigate }) => {
  return (
    <div className="calendar-header">
      <div className="header-left">
        <div className="calendar-icon">📅</div>
        <div>
          <h2>{moment(date).format("MMMM")}</h2>
          <span>{moment(date).format("YYYY")}</span>
        </div>
      </div>

      <div className="header-right">
        <button onClick={() => onNavigate("TODAY")}>Today</button>
        <button onClick={() => onNavigate("PREV")}>‹</button>
        <button onClick={() => onNavigate("NEXT")}>›</button>
      </div>
    </div>
  );
};

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());

  const events = [
    {
      title: "Team Sync",
      start: new Date(2025, 11, 26, 10, 0),
      end: new Date(2025, 11, 26, 11, 0),
    },
    {
      title: "Design Review",
      start: new Date(2025, 11, 26, 14, 0),
      end: new Date(2025, 11, 26, 15, 0),
    },
  ];

  return (
    <>
      <FrontendHeader />

      <div className="calendar-wrapper">
        <CustomCalendarHeader
          date={date}
          onNavigate={(action) => {
            if (action === "TODAY") setDate(new Date());
            if (action === "PREV")
              setDate(moment(date).subtract(1, "month").toDate());
            if (action === "NEXT")
              setDate(moment(date).add(1, "month").toDate());
          }}
        />

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={date}
          onNavigate={setDate}
          views={["month"]}
          defaultView="month"
          toolbar={false}
          popup
          style={{ height: "auto" }}   // 🔥 IMPORTANT
          messages={{ noEventsInRange: "No Events" }}
        />
      </div>

      <FrontendFooter />
    </>
  );
};

export default CalendarPage;
