"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, Info } from "lucide-react";
import { getData, regisEvents } from "@/libs/fetch";
import { useParams } from "next/navigation";
import SuccessPage from "@/components/Notification/Success_Regis_Page";
import { FormatDate } from "@/utils/format";

export default function ExpoRegisterForm() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    products: [],
    source: [],
    agreeTerms: false,
  });
  const [eventDetail, setEventDetail] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchData = async () => {
    const res = await getData(`users/me/profile`);
    console.log(res);
    if (res?.statusCode === 200) {
      setFormData({
        firstName: res?.data?.firstName,
        lastName: res?.data?.lastName,
        email: res?.data?.email,
        products: [],
        source: [],
        agreeTerms: false,
      });
    }
  };

  const fetchEventDetail = async () => {
    const res = await getData(`events/${id}`);
    console.log(res);
    setEventDetail(res?.data);
  };

  useEffect(() => {
    fetchData();
    fetchEventDetail();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (category, value) => {
    setFormData((prev) => {
      const currentArray = prev[category];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [category]: newArray,
      };
    });
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }
    if (!formData.agreeTerms) {
      alert("Please agree to the terms");
      return;
    }
    console.log("Form submitted:", formData);
    const res = await regisEvents(`events/${id}/register`);
    console.log(res);
    setIsSuccess(true)
  };

  return (
    <div className="min-h-screen bg-red-500">
      {isSuccess ? (<SuccessPage detail={eventDetail} />) :
      (<div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-gray-100 bg-opacity-20"></div>

        <div className="relative max-w-4xl mx-auto px-4 py-12 mt-18">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-gray-100 overflow-hidden relative">

            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/10 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10">
              <div className="flex flex-col items-center mb-8">
                <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                  Registration Open
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center leading-tight">
                  Register for
                </h1>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mt-2 text-center">
                  {eventDetail?.eventName || "-"}
                </h2>
              </div>

              <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-500 mx-auto rounded-full mb-8"></div>

              <div className="space-y-6">
                {eventDetail?.eventDesc && (
                  <div className="flex items-start gap-4 bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Info className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        About Event
                      </p>
                      <p className="text-lg text-gray-800 leading-relaxed">
                        {eventDetail.eventDesc}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Start Date
                      </p>
                      <p className="text-lg font-medium text-gray-800">
                        {FormatDate(eventDetail?.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-100">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        End Date
                      </p>
                      <p className="text-lg font-medium text-gray-800">
                        {FormatDate(eventDetail?.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
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

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-4">
                Please select product that you are looking for – Select all that
                applies (กลุ่มสินค้าที่ท่านสนใจหาในงาน - เลือกได้หลายตัว
              </label>
              <div className="space-y-3">
                {["Multiple 1", "Multiple 2", "Multiple 3", "Multiple 4"].map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.products.includes(option)}
                        onChange={() =>
                          handleCheckboxChange("products", option)
                        }
                        className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-8">
              <label className="block text-gray-900 font-medium mb-4">
                How did you hear about the show?
              </label>
              <div className="space-y-3">
                {["Multiple 1", "Multiple 2", "Multiple 3", "Multiple 4"].map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.source.includes(option)}
                        onChange={() => handleCheckboxChange("source", option)}
                        className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="flex items-start px-4">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    agreeTerms: e.target.checked,
                  }))
                }
                className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600 mt-1"
              />
              <label className="ml-3 text-gray-700">
                By checking this box, I hereby agree that my{" "}
                <span className="underline">information</span> will be shared to
                our website.
              </label>
            </div>

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
      </div>)}
    </div>
  );
}
