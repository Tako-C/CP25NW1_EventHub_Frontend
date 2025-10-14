"use client"

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function ExpoRegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    products: [],
    source: [],
    agreeTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category, value) => {
    setFormData(prev => {
      const currentArray = prev[category];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [category]: newArray
      };
    });
  };

  const handleSubmit = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }
    if (!formData.agreeTerms) {
      alert('Please agree to the terms');
      return;
    }
    console.log('Form submitted:', formData);
    alert('Registration submitted successfully!');
  };

  return (
    <div className="min-h-screen bg-red-500">
      {/* Hero Background */}
      <div 
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600')"
        }}
      >
        <div className="absolute inset-0 bg-gray-100 bg-opacity-70"></div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-12 mt-18">
          {/* Title Card */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Register<br />
              FOODS AND BEVERAGES ASIA EXPO
            </h1>
          </div>

          {/* Registration Form */}
          <div className="space-y-6">
            {/* First Name */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-3">
                First Name / ชื่อ
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Your Answer"
                className="w-full border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-2 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Last Name */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-3">
                Last Name / นามสกุล
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Your Answer"
                className="w-full border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-2 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Email */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-3">
                Email / อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your Answer"
                className="w-full border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-2 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-4">
                Please select product that you are looking for – Select all that applies (กลุ่มสินค้าที่ท่านสนใจหาในงาน - เลือกได้หลายตัว
              </label>
              <div className="space-y-3">
                {['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.products.includes(option)}
                      onChange={() => handleCheckboxChange('products', option)}
                      className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* How did you hear */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-4">
                How did you hear about the show?
              </label>
              <div className="space-y-3">
                {['Multiple 1', 'Multiple 2', 'Multiple 3', 'Multiple 4'].map((option) => (
                  <label key={option} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.source.includes(option)}
                      onChange={() => handleCheckboxChange('source', option)}
                      className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600"
                    />
                    <span className="ml-3 text-gray-700 group-hover:text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start px-4">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData(prev => ({ ...prev, agreeTerms: e.target.checked }))}
                className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600 mt-1"
              />
              <label className="ml-3 text-gray-700">
                By checking this box, I hereby agree that my <span className="underline">information</span> will be shared to our website.
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4 pb-8">
              <button
                onClick={handleSubmit}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold px-24 py-4 rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}