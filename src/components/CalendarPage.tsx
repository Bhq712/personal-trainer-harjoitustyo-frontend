import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import {format} from "date-fns/format";
import {parse} from "date-fns/parse";
import {startOfWeek} from "date-fns/startOfWeek";
import {getDay} from "date-fns/getDay";
import {fi} from "date-fns/locale/fi";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getTrainings } from "../trainingApi";
import type { Training } from "../types";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";

const locales = { fi };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// ✅ Custom event-komponentti
function CustomEvent({ event }: { event: any }) {
  return (
    <div style={{ whiteSpace: "normal", lineHeight: "1.2" }}>
      <strong>{event.title}</strong>
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("week");

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const data = await getTrainings();
        const items: Training[] = data._embedded?.trainings ?? [];

        const enrichedEvents = await Promise.all(
          items.map(async (t) => {
            let customerName = "";
            const href = t._links?.customer?.href;
            if (href) {
              try {
                const res = await fetch(href);
                const json = await res.json();
                const first = json.firstname ?? json.firstName ?? json.customer?.firstname ?? "";
                const last = json.lastname ?? json.lastName ?? json.customer?.lastname ?? "";
                if (first || last) customerName = `${first} ${last}`;
              } catch (err) {
                console.error("Failed to fetch customer:", err);
              }
            }

            const start = dayjs(t.date).toDate();
            const end = dayjs(t.date).add(t.duration, "minute").toDate();

            return {
              title: `${t.activity}${customerName ? " - " + customerName : ""}`,
              start,
              end,
              tooltip: `${t.activity} (${t.duration} min) ${customerName}`,
            };
          })
        );

        setEvents(enrichedEvents);
      } catch (err) {
        console.error("Failed to fetch trainings:", err);
      }
    };

    fetchTrainings();
  }, []);

  return (
    <Box sx={{ width: "250%", height: "80vh", margin: "auto" }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Training Calendar
      </Typography>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        views={["month", "week", "day"]}
        view={view}
        onView={(newView) => setView(newView)}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        components={{ event: CustomEvent }} // ✅ custom event
        tooltipAccessor="tooltip" // ✅ näyttää täydet tiedot hoverissa
      />
    </Box>
  );
}
