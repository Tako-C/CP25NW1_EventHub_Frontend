'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, User, Calendar, Gift } from 'lucide-react';
import ProfilePage from './components/MyProfile';
import MyEventPage from './components/MyEvent';
import MyRewardPage from './components/MyReward';
import { getData } from '@/libs/fetch';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [activePage, setActivePage] = useState(
    tab === 'events' ? 'events' : tab === 'rewards' ? 'rewards' : 'account'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profile, setProfile] = useState({
    role: '',
    status: '',
    city: '',
    country: '',
    postCode: '',
    address: '',
    job: '',
    gender: 'N', 
    dateOfBirth: '', 
  });

  const [events, setEvent] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadedTabs, setLoadedTabs] = useState({
    account: true,
    events: tab === 'events',
    rewards: tab === 'rewards',
  });

  const fetchUserData = async () => {
    try {
      const res = await getData('users/me/profile');
      if (res?.statusCode === 200) {
        const userData = res.data;
        setProfile({
          id: userData?.id || '',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          email: userData?.email || '',
          phone: userData?.phone || '',
          role: userData?.role || '',
          status: userData?.status || '',
          city: userData?.city || '',
          country: userData?.country || '',
          postCode: userData?.postCode || '',
          address: userData?.address || '',
          job: userData?.job || '',
          gender: userData?.gender || 'N',
          dateOfBirth: userData?.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '',
        });
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchEventData = async () => {
    const res = await getData('users/me/registered-events');
    if (res?.statusCode === 200 && Array.isArray(res?.data)) {
      const detailedEventsPromises = res.data.map(async (registeredEvent) => {
        const eventId = registeredEvent.eventId;
        const eventRes = await getData(`/events/${eventId}`);
        if (eventRes?.statusCode === 200) {
          return { ...registeredEvent, ...eventRes.data };
        }
        return registeredEvent;
      });
      const detailedEvents = await Promise.all(detailedEventsPromises);
      setEvent(detailedEvents);
    }
  };

  const fetchRewardData = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) return;
      const decoded = jwtDecode(token);
      const userId = decoded.id || decoded.userId || decoded.sub;
      if (!userId) return;
      const res = await getData(`events/rewards/${userId}`);
      if (res?.statusCode === 200 && Array.isArray(res?.data)) {
        setRewards(res.data);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    if (activePage === 'events') fetchEventData();
    if (activePage === 'rewards') fetchRewardData();
    if (tab) {
      router.replace('/profile', { scroll: false });
    }
  }, []);

  const handleTabChange = (page) => {
    setActivePage(page);
    if (!loadedTabs[page]) {
      setLoadedTabs((prev) => ({ ...prev, [page]: true }));
      if (page === 'events') fetchEventData();
      if (page === 'rewards') fetchRewardData();
    }
  };

  const tabs = [
    { key: 'account', label: 'บัญชีของฉัน', icon: <User size={20} /> },
    { key: 'events', label: 'ประวัติ Events', icon: <Calendar size={20} /> },
    { key: 'rewards', label: 'รางวัลของฉัน', icon: <Gift size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Mobile / Tablet (< lg): tab bar แนวนอนด้านบน */}
        <div className="flex lg:hidden gap-2 mb-4 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activePage === tab.key
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="leading-tight text-center">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop (>= lg): sidebar + content แนวนอน */}
        <div className="hidden lg:flex gap-8 items-start">
          <div className="w-64 xl:w-72 flex-shrink-0 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`w-full p-4 rounded-xl flex justify-between items-center transition-all ${
                  activePage === tab.key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  <span className="font-bold">{tab.label}</span>
                </div>
                <ChevronRight size={18} className="opacity-50" />
              </button>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            {activePage === 'account' && (
              <ProfilePage
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                profile={profile}
                setProfile={setProfile}
                isLoading={isProfileLoading}
              />
            )}
            {activePage === 'events' && <MyEventPage events={events} />}
            {activePage === 'rewards' && <MyRewardPage rewards={rewards} />}
          </div>
        </div>

        {/* Mobile / Tablet content area */}
        <div className="lg:hidden">
          {activePage === 'account' && (
            <ProfilePage
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              profile={profile}
              setProfile={setProfile}
              isLoading={isProfileLoading}
            />
          )}
          {activePage === 'events' && <MyEventPage events={events} />}
          {activePage === 'rewards' && <MyRewardPage rewards={rewards} />}
        </div>

      </div>
    </div>
  );
}