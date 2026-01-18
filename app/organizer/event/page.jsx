'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Pause,
  Play,
} from 'lucide-react';
import Cookies from 'js-cookie'; // เพิ่ม
import { jwtDecode } from 'jwt-decode'; // เพิ่ม

import { FormatDate } from '@/utils/format';
import { getDataNoToken } from '@/libs/fetch';
import EventCard from '@/components/Card/EventCard';
import { EventCardImage } from '@/utils/getImage';
import OrganizerEvents from './components/OrganizerEvents';

const mockFeedbackData = [];

export default function Page() {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [eventData, setEventData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- เพิ่ม State สำหรับ Organizer ---
  const [userRole, setUserRole] = useState('GUEST');
  const [userId, setUserId] = useState(null); // เก็บ ID ของคน Login
  // ---------------------------------

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [feedbackData, setFeedbackData] = useState([]);

  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();

  // === Scroll to Hash on Load ===
  useEffect(() => {
    const handleScrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    handleScrollToHash();
    const timer1 = setTimeout(handleScrollToHash, 500);
    const timer2 = setTimeout(handleScrollToHash, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    fetchData();
    checkUserToken();
  }, []);

  useEffect(() => {
    if (!isAutoPlay || isHovered || eventData.length === 0) return;

    const interval = setInterval(() => {
      setCurrentEventIndex((prev) => (prev + 1) % eventData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, eventData.length]);

  const checkUserToken = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const rawRole =
          decoded.role || decoded.auth || decoded.authorities || 'guest';
        const role = String(rawRole).toUpperCase();
        const id = decoded.id || decoded.userId || decoded.sub;

        setUserRole(role);
        setUserId(id);

        // console.log('Decoded Token:', { rawRole, role, id });
      } catch (error) {
        console.error('Token decode error', error);
      }
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDataNoToken('events');
      const fetchedEvents = res.data || [];
      setEventData(fetchedEvents);
      setFeedbackData(mockFeedbackData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setEventData([]);
      setFeedbackData([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const types = eventData
      .map((event) => event.eventTypeId?.eventTypeName)
      .filter((type) => type);

    return ['All', ...new Set(types)];
  }, [eventData]);

  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'All') return eventData;

    return eventData.filter(
      (event) => event.eventTypeId?.eventTypeName === selectedCategory
    );
  }, [selectedCategory, eventData]);

  // --- Organizer's Events (Filtered by userId) ---
  const myOrganizedEvents = useMemo(() => {
    if (!userId || !eventData.length) return [];

    const myEvents = eventData.filter((event) => {
      if (typeof event.createdBy !== 'object') {
        return event.createdBy == userId;
      }
      return event.createdBy?.id == userId;
    });

    console.log(
      `📋 Found ${myEvents.length} events for Organizer ID ${userId}`
    );
    return myEvents;
  }, [userId, eventData]);

  const nextEvent = () => {
    if (eventData.length === 0) return;
    setCurrentEventIndex((prev) => (prev + 1) % eventData.length);
  };

  const prevEvent = () => {
    if (eventData.length === 0) return;
    setCurrentEventIndex(
      (prev) => (prev - 1 + eventData.length) % eventData.length
    );
  };

  const goToSlide = (index) => {
    setCurrentEventIndex(index);
  };

  const currentEvent = eventData[currentEventIndex];

  return (
    <div className="min-h-screen bg-gray-50">


      {/* ----------------------------------------------------------------------- */}
      {/* --- Organizer Section --- */}
      {/* ----------------------------------------------------------------------- */}

      {userId && (userRole === 'ORGANIZER' || userRole === 'ADMIN') && (
        <section
          id="organizer-section"
          className="bg-gray-50 border-t border-gray-200"
        >
          <OrganizerEvents events={myOrganizedEvents} />
        </section>
      )}
    </div>
  );
}
