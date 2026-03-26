import React, { useEffect, useState } from "react";
import FrontendHeader from "@/shared/layout-components/frontelements/frontendheader";
import FrontendFooter from "@/shared/layout-components/frontelements/frontendfooter";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import api from "@/utils/api";
const localizer = momentLocalizer(moment);
import { useRouter } from "next/router";
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
  const [events, setEvents] = useState([]);
  const router = useRouter();
  /* ================= LOAD EVENTS ON MONTH CHANGE ================= */
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get(
          "/api/v1/events/calendar/event-list"
        );

        const calendarEvents =
          response?.data?.data?.events?.map((event) => {
            const startDate = new Date(event.date_from);
            const endDate = new Date(event.date_to);

            return {
              id: event.id,
              slug: event.slug,
              status: event.status,
              title: event.name,
              start: startDate,
              // end: endDate,
              end: startDate,
              realEnd: new Date(event.date_to),
            };
          }) || [];

        setEvents(calendarEvents);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEvents();
  }, [date]);

  const handleSelectEvent = (event) => {
    if (event.status === "Y") {
      router.push(`/event/${event.id}/${event.slug}`);
    }
  };

  // const CustomEvent = ({ event }) => {
  //   const isActive = event.status === "Y";

  //   return (
  //     <div
  //       title={
  //         isActive
  //           ? "Click to view event details"
  //           : "Details not available"
  //       }
  //       style={{
  //         background: isActive ? "#2563eb" : "#9ca3af",
  //         color: "#fff",
  //         borderRadius: 6,
  //         padding: "2px 6px",
  //         fontSize: 12,
  //         cursor: isActive ? "pointer" : "not-allowed",
  //         opacity: isActive ? 1 : 0.6,
  //         whiteSpace: "nowrap",
  //         overflow: "hidden",
  //         textOverflow: "ellipsis",
  //       }}
  //     >
  //       {event.title}
  //     </div>
  //   );
  // };

  const CustomEvent = ({ event }) => {
    const isActive = event.status === "Y";

    return (
      <div
        title={`📌 ${event.title}
📅 ${moment(event.start).format("DD MMM YYYY")} - ${moment(event.realEnd).format("DD MMM YYYY")}
${isActive ? "👉 Click for details" : "🚫 Not available"}`}
        style={{
          background: isActive ? "#2563eb" : "#9ca3af",
          color: "#fff",
          borderRadius: 6,
          padding: "3px 6px",
          fontSize: 11,
          cursor: isActive ? "pointer" : "not-allowed",
          opacity: isActive ? 1 : 0.7,
          transition: "0.2s",
        }}
      >
        {event.title}
      </div>
    );
  };

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
          toolbar={false}
          popup
          onSelectEvent={handleSelectEvent}
          components={{ event: CustomEvent }}
        />
        {/* <Calendar
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
          style={{ height: "auto" }}
          messages={{ noEventsInRange: "No Events" }}
        /> */}
      </div>

      <FrontendFooter />
    </>
  );
};

export default CalendarPage;