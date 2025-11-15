import { useState } from 'react';
import { User } from 'lucide-react';

export default function ProfilePage({ isEditing, setIsEditing, profile, setProfile }) {
  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-8">
      <div className="flex gap-8">

        <div className="flex-shrink-0">
          <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
            <User size={96} className="text-white" strokeWidth={1.5} />
          </div>
        </div>

        <div className="flex-1 space-y-6">

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">Name :</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                  {profile.name}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Role :</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                  {profile.role}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">Email :</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                  {profile.email}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">Age :</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                  {profile.age}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Phone Number :</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
              />
            ) : (
              <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                {profile.phone}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Job Title :</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) => handleChange('jobTitle', e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
              />
            ) : (
              <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                {profile.jobTitle}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Company Name :</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
              />
            ) : (
              <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                {profile.companyName}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">Country :</label>
              {isEditing ? (
                <select
                  value={profile.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="Thailand">Thailand</option>
                  <option value="USA">USA</option>
                  <option value="Japan">Japan</option>
                  <option value="Singapore">Singapore</option>
                </select>
              ) : (
                <div className="w-full px-4 py-2 bg-gray-200 rounded text-gray-700">
                  {profile.country}
                </div>
              )}
            </div>
            <div>
              <label className="block font-semibold mb-2">City / Province / :</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
                />
              ) : (
                <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                  {profile.city}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Address :</label>
            {isEditing ? (
              <textarea
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows="3"
                className="w-full px-4 py-2 bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            ) : (
              <div className="w-full px-4 py-2 bg-gray-100 rounded text-gray-700 min-h-[80px]">
                {profile.address}
              </div>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2">Post Code :</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.postCode}
                onChange={(e) => handleChange('postCode', e.target.value)}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-purple-600"
              />
            ) : (
              <div className="w-full px-4 py-2 border-b-2 border-gray-300 text-gray-700">
                {profile.postCode}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            {isEditing ? (
              <>
                <button 
                  onClick={handleCancel}
                  className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                >
                  Save
                </button>
              </>
            ) : (
              <button 
                onClick={handleEdit}
                className="bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}