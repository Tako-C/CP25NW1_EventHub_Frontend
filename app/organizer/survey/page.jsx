"use client"

import { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function Page() {
  const [feedbacks, setFeedbacks] = useState([
    { id: 1, title: 'Feedback Event 1', description: 'Feedback Event Des...', enabled: false },
    { id: 2, title: 'Feedback Event 2', description: 'Feedback Event Des...', enabled: false }
  ]);

  const addFeedback = () => {
    const newId = feedbacks.length > 0 ? Math.max(...feedbacks.map(f => f.id)) + 1 : 1;
    setFeedbacks([...feedbacks, {
      id: newId,
      title: `Feedback Event ${newId}`,
      description: 'Feedback Event Des...',
      enabled: false
    }]);
  };

  const removeFeedback = (id) => {
    setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  const toggleFeedback = (id) => {
    setFeedbacks(feedbacks.map(f => 
      f.id === id ? { ...f, enabled: !f.enabled } : f
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">My Feedback</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map(feedback => (
            <div key={feedback.id} className="bg-white rounded-2xl shadow-lg p-6 relative">
              <button
                onClick={() => removeFeedback(feedback.id)}
                className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-md"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 64 64" className="w-16 h-16">
                      <path d="M10 20 L35 20 L35 35 L20 35 L10 45 Z" fill="#3B82F6" />
                      <rect x="12" y="24" width="18" height="2" fill="white" />
                      <rect x="12" y="28" width="18" height="2" fill="white" />
                      <rect x="12" y="32" width="12" height="2" fill="white" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-white">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  </div>
                </div>

                <h3 className="text-gray-800 font-medium mb-1">{feedback.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{feedback.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFeedback(feedback.id)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      feedback.enabled 
                        ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                        : 'bg-red-400 text-white hover:bg-red-500'
                    }`}
                  >
                    Disable
                  </button>
                  <button
                    onClick={() => toggleFeedback(feedback.id)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                      feedback.enabled
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addFeedback}
            className="bg-gray-200 rounded-2xl shadow-lg p-6 flex items-center justify-center hover:bg-gray-300 transition-colors min-h-[280px]"
          >
            <Plus size={48} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}