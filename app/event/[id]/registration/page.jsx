"use client";

import { useState, useEffect } from "react";
import { Calendar, Info, FileText, CheckSquare } from "lucide-react";
import {
  getData,
  postEventRegister,
  getDataNoToken,
  requestEmailOTP,
  sendSurveyAnswer,
} from "@/libs/fetch";
import { useParams, useRouter } from "next/navigation";
import SuccessPage from "@/components/Notification/Success_Regis_Page";
import { FormatDate } from "@/utils/format";
import Cookie from "js-cookie";
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
  const token = Cookie.get("token");
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    surveyAnswers: [],
    agreeTerms: false,
  });
  const [eventDetail, setEventDetail] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });
  const [surveys, setSurveys] = useState({
    pre: { visitor: null, exhibitor: null },
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
        // expectations: [],
        // source: [],
        surveyAnswers: [],
        agreeTerms: false,
      });
    }
  };

  const fetchEventDetail = async () => {
    const res = await getDataNoToken(`events/${id}`);
    let preRes = null;

    if (res?.statusCode === 200) setEventDetail(res?.data);
    if (res?.data?.hasPreSurvey === true) {
      preRes = await getDataNoToken(`/events/${id}/surveys/pre`);
    }
    console.log(preRes);
    setSurveys({
      pre: {
        visitor: preRes?.data?.visitor[0] || null,
        exhibitor: preRes?.data?.exhibitor[0] || null,
      },
    });
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
    try {
      if (!token) {
        const signupData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          eventId: id,
        };

        const res = await requestEmailOTP(signupData?.eventId, {
          email: signupData?.email,
          firstName: signupData?.firstName,
          lastName: signupData?.lastName,
        });

        console.log(res);

        if (res?.statusCode === 200) {
          const cookieName = res?.message.includes("Registration")
            ? "signupDataFromRegis"
            : "signinDataFromRegis";
          Cookie.set(cookieName, JSON.stringify(signupData));
          return router.push("/login/otp");
        }
      }
      if (token) {
        const registerRes = await postEventRegister(`events/${id}/register`);

        if (registerRes?.statusCode === 200) {
          if (surveys.pre.visitor || surveys.pre.exhibitor) {
            try {
              await sendSurveyAnswer(formData?.surveyAnswers, id);
            } catch (error) {
              setNotification({
                isVisible: true,
                isError: true,
                message: error.message || "Something went wrong",
              });
            }
          }
          setIsSuccess(true);
        }
      }
    } catch (error) {
      setNotification({
        isVisible: true,
        isError: true,
        message: error.message || "Something went wrong",
      });
    }
  };

  const handleSurveyChange = (questionId, value, type) => {
    setFormData((prev) => {
      const currentAnswers = [...prev.surveyAnswers];
      const questionIndex = currentAnswers.findIndex(
        (a) => a.questionId === questionId,
      );

      let newAnswers;
      if (questionIndex > -1) {
        if (type === "MULTIPLE") {
          const prevSelected = currentAnswers[questionIndex].answers;
          newAnswers = prevSelected.includes(value)
            ? prevSelected.filter((item) => item !== value)
            : [...prevSelected, value];
        } else {
          newAnswers = [value];
        }
        currentAnswers[questionIndex] = {
          ...currentAnswers[questionIndex],
          answers: newAnswers,
        };
      } else {
        currentAnswers.push({
          questionId: questionId,
          answers: [value],
        });
      }

      return { ...prev, surveyAnswers: currentAnswers };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 mt-20">
      <Notification
        isVisible={notification.isVisible}
        isError={notification.isError}
        message={notification.message}
        onClose={closeNotification}
      />
      {isSuccess ? (
        <SuccessPage detail={eventDetail} />
      ) : (
        <div className="relative min-h-screen">
          <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
            <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-6 h-6" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      Event Registration
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {eventDetail?.eventName || "Event Registration"}
                  </h1>
                  {eventDetail?.eventDesc && (
                    <p className="text-purple-100 text-lg leading-relaxed max-w-2xl">
                      {eventDetail.eventDesc}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-8 py-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                        Start Date
                      </p>
                      <p className="text-lg font-medium text-gray-800">
                        {FormatDate(eventDetail?.startDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
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

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      First Name / ชื่อ
                    </h3>
                    <span className="inline-block mt-1 text-xs text-red-500 font-medium">
                      * จำเป็นต้องตอบ
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      Last Name / นามสกุล
                    </h3>
                    <span className="inline-block mt-1 text-xs text-red-500 font-medium">
                      * จำเป็นต้องตอบ
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      Email / อีเมล
                    </h3>
                    <span className="inline-block mt-1 text-xs text-red-500 font-medium">
                      * จำเป็นต้องตอบ
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {surveys.pre.visitor?.questions?.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {index + 4}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                        {q.question}
                      </h3>
                      {q.questionType === "MULTIPLE" && (
                        <span className="text-xs text-blue-600 font-medium italic">
                          * เลือกได้หลายคำตอบ
                        </span>
                      )}
                    </div>
                    {(q.questionType === "MULTIPLE" ||
                      q.questionType === "SINGLE") && (
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <CheckSquare className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    {(q.questionType === "SINGLE" ||
                      q.questionType === "MULTIPLE") &&
                      q.choices.map((choice, cIdx) => (
                        <label
                          key={cIdx}
                          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer group"
                        >
                          <input
                            type={
                              q.questionType === "MULTIPLE"
                                ? "checkbox"
                                : "radio"
                            }
                            name={`question-${q.id}`}
                            value={choice}
                            onChange={() =>
                              handleSurveyChange(q.id, choice, q.questionType)
                            }
                            checked={
                              formData.surveyAnswers
                                .find((a) => a.questionId === q.id)
                                ?.answers.includes(choice) || false
                            }
                            className="w-5 h-5 rounded border-2 border-gray-400 group-hover:border-green-500 flex-shrink-0 transition-colors accent-green-600"
                          />
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            {choice}
                          </span>
                        </label>
                      ))}

                    {q.questionType === "TEXT" && (
                      <input
                        type="text"
                        placeholder="พิมพ์คำตอบของคุณที่นี่..."
                        value={
                          formData.surveyAnswers.find(
                            (a) => a.questionId === q.id,
                          )?.answers[0] || ""
                        }
                        onChange={(e) =>
                          handleSurveyChange(q.id, e.target.value, "TEXT")
                        }
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white transition-all outline-none"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.agreeTerms}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeTerms: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 mt-1 rounded border-2 border-gray-400 group-hover:border-purple-500 flex-shrink-0 transition-colors accent-purple-600"
                  />
                  <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                    By checking this box, I hereby agree that my{" "}
                    <span className="underline font-medium">information</span>{" "}
                    will be shared to our website.
                  </span>
                </label>
              </div>

              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-12 md:px-24 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
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
