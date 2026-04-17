"use client";
import { useState, useEffect, useMemo } from "react";
import { getData, getDataNoToken } from "@/libs/fetch";
import OrganizerEvents from "./components/OrganizerEvents";

export default function Page() {
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allEventsRes, registeredRes] = await Promise.all([
        getDataNoToken("events"),
        getData("users/me/registered-events"),
      ]);

      const allEvents = allEventsRes.data || [];
      const registeredData = registeredRes.data || [];

      const organizerEventIds = registeredData
        .filter((item) => item.eventRole === "ORGANIZER")
        .map((item) => item.eventId);

      const fetchedEvents = allEvents.filter((event) =>
        organizerEventIds.includes(event.id),
      );

      setEventData(fetchedEvents);
    } catch (error) {
      console.error("Error fetching data:", error);
      setEventData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        id="organizer-section"
        className="bg-gray-50 border-t border-gray-200"
      >
        <OrganizerEvents events={eventData} />
      </section>
    </div>
  );
}
