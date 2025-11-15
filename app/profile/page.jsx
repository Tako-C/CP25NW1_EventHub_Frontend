"use client"

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import ProfilePage from './components/MyProfile';
import MyEventPage from './components/MyEvent';

export default function Page() {
    const [activePage, setActivePage] = useState('events');
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'John Doe',
        role: 'Developer',
        email: 'john.doe@example.com',
        age: '30',
        phone: '081-234-5678',
        jobTitle: 'Senior Developer',
        companyName: 'Tech Company',
        country: 'Thailand',
        city: 'Bangkok',
        address: '123 Main Street, Downtown',
        postCode: '10110'
    });

    const [events] = useState([
        {
            name: 'Event Name 1',
            dateStart: '11/11/01 | 10:00:00',
            isEnded: false,
            feedbackSubmitted: false
        },
        {
            name: 'Event Name 2',
            dateStart: '',
            isEnded: true,
            feedbackSubmitted: true
        },
        {
            name: 'Event Name 3',
            dateStart: '15/11/01 | 10:00:00',
            isEnded: false,
            feedbackSubmitted: false
        }
    ]);

    return (
        <div className="min-h-screen bg-gray-50 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-6">
                    <div className="w-80 space-y-4">
                        <button 
                            onClick={() => setActivePage('account')}
                            className={`w-full p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow ${
                                activePage === 'account' ? 'bg-gray-300' : 'bg-white'
                            }`}
                        >
                            <span className="font-semibold text-lg">My Account</span>
                            <ChevronRight size={24} />
                        </button>

                        <button 
                            onClick={() => setActivePage('events')}
                            className={`w-full p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow ${
                                activePage === 'events' ? 'bg-gray-300' : 'bg-white'
                            }`}
                        >
                            <span className="font-semibold text-lg">My Events</span>
                            <ChevronRight size={24} />
                        </button>

                        <button 
                            onClick={() => setActivePage('rewards')}
                            className={`w-full p-4 rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition-shadow ${
                                activePage === 'rewards' ? 'bg-gray-300' : 'bg-white'
                            }`}
                        >
                            <span className="font-semibold text-lg">My Rewards</span>
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {activePage === 'account' && (
                        <ProfilePage 
                            isEditing={isEditing}
                            setIsEditing={setIsEditing}
                            profile={profile}
                            setProfile={setProfile}
                        />
                    )}

                    {activePage === 'events' && (
                        <MyEventPage events={events} />
                    )}

                    {/* {activePage === 'rewards' && (
                        <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
                            <h2 className="text-2xl font-bold">My Rewards</h2>
                            <p className="text-gray-500 mt-4">Coming soon...</p>
                        </div>
                    )} */}
                </div>
            </div>
        </div>
    );
}