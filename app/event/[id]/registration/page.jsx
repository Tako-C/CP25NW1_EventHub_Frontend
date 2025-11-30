"use client";

import { useState, useEffect } from "react";
import { Calendar, Info } from "lucide-react";
import { getData, regisEvents, getDataNoToken } from "@/libs/fetch";
import { useParams, useRouter } from "next/navigation";
import SuccessPage from "@/components/Notification/Success_Regis_Page";
import { FormatDate } from "@/utils/format";
import Cookies from "js-cookie";
import Notification from "@/components/Notification/Notification";

const MOCK_OPTIONS = {
  sources: [
    "Facebook / Instagram",
    "Email Newsletter (จดหมายข่าวทางอีเมล)",
    "Friend or Colleague (เพื่อนหรือเพื่อนร่วมงานแนะนำ)",
    "Search Engine / Google (ค้นหาผ่าน Google)",
    "Online Advertisement (โฆษณาออนไลน์)",
    "Other (อื่นๆ)",
  ],
  expectations: [
    "Collect information on innovative products, technologies, and solutions for placing orders (รวบรวมข้อมูลสินค้า เทคโนโลยี และบริการโซลูชั่นใหม่เพื่อสั่งซื้อ)",
    "Explore product/Technology offerings and trends in the market (สำรวจสินค้า เทคโนโลยีและแนวโน้มในตลาด)",
    "Extend my network (ขยายเครือข่ายทางธุรกิจ)",
    "Evaluate the show for future participation (ศึกษาข้อมูลเพื่อร่วมออกบูธในงานครั้งต่อไป)",
    "Meet existing suppliers (พบปะเยี่ยมตัวแทนที่ติดต่อกันอยู่แล้ว)",
    "Establish new contacts /Seek representative (หาตัวแทน คู่ค้าพันธมิตรรายใหม่)",
    "Other, please specify (อื่น ๆ - โปรดระบุ)",
  ],
};

export default function ExpoRegisterForm() {
  const token = Cookies.get("token");
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    expectations: [],
    source: [],
    agreeTerms: false,
  });
  const [eventDetail, setEventDetail] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const fetchData = async () => {
    const res = await getData(`users/me/profile`);
    if (res?.statusCode === 200) {
      setFormData({
        firstName: res?.data?.firstName,
        lastName: res?.data?.lastName,
        email: res?.data?.email,
        expectations: [],
        source: [],
        agreeTerms: false,
      });
    }
  };

  const fetchEventDetail = async () => {
    const res = await getDataNoToken(`events/${id}`);
    console.log(res);
    setEventDetail(res?.data);
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
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
      setNotification({
        isVisible: true,
        isError: true,
        message: "Please fill in all required fields",
      });
      return;
    }
    if (!formData.agreeTerms) {
      setNotification({
        isVisible: true,
        isError: true,
        message: "Please agree to the terms",
      });
      return;
    }
    if (!token) {
      console.log(formData);
      router.push("/sign-up");
      const signupData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        eventId: id,
      };
      Cookies.set("signupDataFromRegis", JSON.stringify(signupData));
    }
    if (token) {
      console.log("Form submitted:", formData);
      const res = await regisEvents(`events/${id}/register`);
      console.log(res);
      if (res.statusCode === 200) {
        setIsSuccess(true);
      } else {
        setNotification({
          isVisible: true,
          isError: true,
          message: res?.message,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
      {isSuccess ? (
        <SuccessPage detail={eventDetail} />
      ) : (
        <div className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed">
          <div className="absolute inset-0 bg-gray-100 bg-opacity-30"></div>

          <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-6 md:p-12 mb-6 md:mb-8 border border-gray-100 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-400/10 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="flex flex-col items-center mb-6 md:mb-8">
                  <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-4 md:mb-6">
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                    Registration Open
                  </div>

                  <h1 className="text-2xl md:text-4xl font-bold text-gray-900 text-center leading-tight">
                    Register for
                  </h1>
                  <h2 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mt-2 text-center break-words max-w-full">
                    {eventDetail?.eventName || "-"}
                  </h2>
                </div>

                <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-blue-500 mx-auto rounded-full mb-6 md:mb-8"></div>

                <div className="space-y-4 md:space-y-6">
                  {eventDetail?.eventDesc && (
                    <div className="flex flex-col sm:flex-row items-start gap-4 bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-gray-100">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <Info className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          About Event
                        </p>
                        <p className="text-sm md:text-lg text-gray-800 leading-relaxed">
                          {eventDetail.eventDesc}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-4 bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-gray-100">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Start Date
                        </p>
                        <p className="text-base md:text-lg font-medium text-gray-800">
                          {FormatDate(eventDetail?.startDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 bg-white/50 backdrop-blur-sm p-4 md:p-5 rounded-2xl border border-gray-100">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          End Date
                        </p>
                        <p className="text-base md:text-lg font-medium text-gray-800">
                          {FormatDate(eventDetail?.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                <label className="block text-gray-900 font-medium mb-3">
                  First Name / ชื่อ
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Your Answer"
                  className="w-full border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-2 text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                <label className="block text-gray-900 font-medium mb-3">
                  Last Name / นามสกุล
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Your Answer"
                  className="w-full border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-2 text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>

              <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                <label className="block text-gray-900 font-medium mb-3">
                  Email / อีเมล
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your Answer"
                  className="w-full border-b-2 border-gray-300 focus:border-purple-600 outline-none pb-2 text-gray-700 placeholder-gray-400 bg-transparent"
                />
              </div>

              {/* ส่วนที่ 1: Source */}
              <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                <label className="block text-gray-900 font-medium mb-4">
                  How did you hear about the show? (คุณรู้จักงานนี้ได้อย่างไร)
                </label>
                <div className="space-y-3">
                  {MOCK_OPTIONS.sources.map((option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.source.includes(option)}
                        onChange={() => handleCheckboxChange("source", option)}
                        className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600 flex-shrink-0"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ส่วนที่ 2: Product Expect */}
              <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
                <label className="block text-gray-900 font-medium mb-4 leading-relaxed">
                  What do you expect from this event? – Select all that applies{" "}
                  <br className="hidden md:block" /> (คุณคาดหวังอะไรจากงานนี้ -
                  เลือกได้หลายตัว)
                </label>
                <div className="space-y-3">
                  {MOCK_OPTIONS.expectations.map((option) => (
                    <label
                      key={option}
                      className="flex items-center cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.expectations.includes(option)}
                        onChange={() =>
                          handleCheckboxChange("expectations", option)
                        }
                        className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600 flex-shrink-0"
                      />
                      <span className="ml-3 text-gray-700 group-hover:text-gray-900">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-start px-2 md:px-4">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      agreeTerms: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 border-2 border-gray-400 rounded cursor-pointer accent-purple-600 mt-1 flex-shrink-0"
                />
                <label className="ml-3 text-sm md:text-base text-gray-700">
                  By checking this box, I hereby agree that my{" "}
                  <span className="underline">information</span> will be shared
                  to our website.
                </label>
              </div>

              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-green-400 hover:bg-gray-500 text-white font-semibold py-4 md:px-24 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
