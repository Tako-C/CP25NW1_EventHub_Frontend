'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, User, Calendar } from 'lucide-react';
import ProfilePage from './components/MyProfile';
import MyEventPage from './components/MyEvent';
import { getData } from '@/libs/fetch';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');

  const [activePage, setActivePage] = useState(
    tab === 'events' ? 'events' : 'account'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    role: '',
    status: '',
    city: '',
    country: '',
    postCode: '',
    address: '',
    job: '',
    totalPoint: '',
  });

  const [events, setEvent] = useState([]);

  const fetchUserData = async () => {
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
        totalPoint: userData?.totalPoint || '',
      });
    }
  };

  const fetchEventData = async () => {
    const res = await getData('users/me/registered-events');
    if (res?.statusCode === 200) {
      setEvent(res?.data);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchEventData();
    if (tab) {
      router.replace('/profile', { scroll: false });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-16 md:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:space-y-4">
              <button
                onClick={() => setActivePage('account')}
                className={`w-full p-3 md:p-4 rounded-xl shadow-sm flex justify-center lg:justify-between items-center hover:shadow-md transition-all ${
                  activePage === 'account'
                    ? 'bg-purple-600 text-white lg:bg-gray-200 lg:text-gray-900'
                    : 'bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User size={20} className="lg:hidden" />
                  <span className="font-semibold text-sm md:text-lg">
                    My Account
                  </span>
                </div>
                <ChevronRight size={24} className="hidden lg:block" />
              </button>

              <button
                onClick={() => setActivePage('events')}
                className={`w-full p-3 md:p-4 rounded-xl shadow-sm flex justify-center lg:justify-between items-center hover:shadow-md transition-all ${
                  activePage === 'events'
                    ? 'bg-purple-600 text-white lg:bg-gray-200 lg:text-gray-900'
                    : 'bg-white text-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="lg:hidden" />
                  <span className="font-semibold text-sm md:text-lg">
                    Events History
                  </span>
                </div>
                <ChevronRight size={24} className="hidden lg:block" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {activePage === 'account' && (
              <ProfilePage
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                profile={profile}
                setProfile={setProfile}
              />
            )}

            {activePage === 'events' && <MyEventPage events={events} />}
          </div>
        </div>
      </div>
    </div>
  );
}
