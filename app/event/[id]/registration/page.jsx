"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  CheckSquare,
  X,
  ScrollText,
  Shield,
  Eye,
  Users,
  ChevronDown,
} from "lucide-react";
import {
  getData,
  postEventRegister,
  getDataNoToken,
  requestEmailOTP,
  sendSurveyAnswer,
} from "@/libs/fetch";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import SuccessPage from "@/components/Notification/Success_Regis_Page";
import { FormatDate } from "@/utils/format";
import Cookie from "js-cookie";
import Notification from "@/components/Notification/Notification";

export default function ExpoRegisterForm() {
  const token = Cookie.get("token");
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const isSurveyOnly = searchParams.get("mode") === "survey-only";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "N",
    dateOfBirth: "",
    surveyAnswers: [],
    agreeTerms: false,
  });

  const [eventDetail, setEventDetail] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [surveys, setSurveys] = useState({
    pre: { visitor: null, exhibitor: null },
  });
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (message, isError = false) => {
    setNotification({
      isVisible: true,
      message: message,
      isError: isError,
    });
    setTimeout(() => {
      closeNotification();
    }, 3000);
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  const calculateAge = (dob) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const genderOptions = [
    { id: "M", label: "ชาย" },
    { id: "F", label: "หญิง" },
    { id: "U", label: "เพศที่สาม" },
    { id: "N", label: "ไม่ระบุ" },
  ];

  const fetchData = async () => {
    try {
      const res = await getData(`users/me/profile`);
      if (res?.statusCode === 200) {
        const u = res.data;
        setFormData((prev) => ({
          ...prev,
          firstName: u?.firstName || "",
          lastName: u?.lastName || "",
          email: u?.email || "",
          gender: u?.gender || "N",
          dateOfBirth: u?.dateOfBirth ? u.dateOfBirth.split("T")[0] : "",
        }));
      }
    } catch (error) {
      console.error("Fetch profile error", error);
    }
  };

  const fetchEventDetail = async () => {
    try {
      const res = await getDataNoToken(`events/${id}`);
      let preRes = null;

      if (res?.statusCode === 200) {
        setEventDetail(res?.data);
        if (res?.data?.hasPreSurvey === true) {
          preRes = await getDataNoToken(`/events/${id}/surveys/pre`);
        }
        setSurveys({
          pre: {
            visitor: preRes?.data?.visitor[0] || null,
            exhibitor: preRes?.data?.exhibitor[0] || null,
          },
        });
      }
    } catch (error) {
      showNotification("ไม่สามารถโหลดข้อมูลกิจกรรมได้", true);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
    fetchEventDetail();
  }, [id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!validateSurveys()) {
      showNotification("กรุณาตอบแบบสำรวจให้ครบทุกข้อ", true);
      return;
    }

    if (isSurveyOnly) {
      try {
        await sendSurveyAnswer(formData?.surveyAnswers, id);
        showNotification("ส่งคำตอบแบบสำรวจสำเร็จ!");
        setTimeout(() => router.push("/profile?tab=events"), 1500);
      } catch (error) {
        // showNotification(error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล", true);
        showNotification("เกิดข้อผิดพลาดในการส่งข้อมูล", true);
      }
      return;
    }

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.gender ||
      !formData.dateOfBirth
    ) {
      showNotification("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", true);
      return;
    }

    if (!formData.agreeTerms) {
      showNotification("กรุณากดรับทราบและยอมรับข้อกำหนดและเงื่อนไข", true);
      return;
    }

    try {
      if (!token) {
        const signupData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          eventId: id,
        };

        const res = await requestEmailOTP(signupData?.eventId, {
          email: signupData?.email,
          firstName: signupData?.firstName,
          lastName: signupData?.lastName,
          gender: signupData?.gender,
          dateOfBirth: signupData?.dateOfBirth,
        });

        if (res?.statusCode === 200) {
          const cookieName = res?.message.includes("Registration")
            ? "signupDataFromRegis"
            : "signinDataFromRegis";
          Cookie.set(cookieName, JSON.stringify(signupData));
          showNotification("ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว");
          setTimeout(() => router.push("/login/otp"), 1000);
          return;
        } else {
          // showNotification(res?.message || "เกิดข้อผิดพลาดในการขอรหัส OTP", true);
          showNotification("เกิดข้อผิดพลาดในการขอรหัส OTP", true);
        }
      }

      if (token) {
        const registerRes = await postEventRegister(`events/${id}/register`);

        if (registerRes?.statusCode === 200) {
          if (surveys.pre.visitor || surveys.pre.exhibitor) {
            try {
              await sendSurveyAnswer(formData?.surveyAnswers, id);
            } catch (error) {
              console.error("Survey submission failed", error);
            }
          }
          showNotification("ลงทะเบียนเข้าร่วมกิจกรรมสำเร็จ!");
          setIsSuccess(true);
        } else {
          // showNotification(registerRes?.message || "ลงทะเบียนไม่สำเร็จ", true);
          showNotification("ลงทะเบียนไม่สำเร็จ", true);
        }
      }
    } catch (error) {
      // showNotification(error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
    }
  };

  const validateSurveys = () => {
    const currentQuestions = surveys.pre.visitor?.questions || [];
    if (currentQuestions.length === 0) return true;

    // ตรวจสอบว่าทุกคำถามมีคำตอบอย่างน้อย 1 อย่าง (และกรณี Text ต้องไม่เป็นค่าว่าง)
    return currentQuestions.every((q) => {
      const answer = formData.surveyAnswers.find((a) => a.questionId === q.id);
      if (!answer) return false;

      // ถ้าเป็น Text field ต้องเช็คว่าไม่ได้พิมพ์แค่ space
      if (q.questionType === "TEXT") {
        return answer.answers[0]?.trim().length > 0;
      }

      // ถ้าเป็น Single/Multiple ต้องมีอย่างน้อย 1 คำตอบ
      return answer.answers.length > 0;
    });
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
                      {isSurveyOnly
                        ? "แบบสำรวจก่อนงาน"
                        : "ลงทะเบียนเข้าร่วมกิจกรรม"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {isSurveyOnly
                      ? `แบบสำรวจ: ${eventDetail?.eventName || ""}`
                      : eventDetail?.eventName || "ลงทะเบียนเข้าร่วมกิจกรรม"}
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
                        วันที่เริ่ม
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
                        วันที่สิ้นสุด
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
              {!isSurveyOnly && (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        1
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                          ชื่อ (First Name)
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
                        placeholder="กรอกชื่อของคุณ..."
                        disabled={token}
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
                          นามสกุล (Last Name)
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
                        placeholder="กรอกนามสกุลของคุณ..."
                        disabled={token}
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
                          อีเมล (Email)
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
                        placeholder="example@email.com"
                        disabled={token}
                        className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        4
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          เพศ (Gender)
                        </h3>
                        <span className="text-xs text-red-500">* จำเป็น</span>
                      </div>
                    </div>
                    <div className="relative mt-4">
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        disabled={token}
                        className={`w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none ${token ? "opacity-70 cursor-not-allowed bg-gray-100" : "focus:bg-white focus:border-purple-400"}`}
                      >
                        {genderOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <Users
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                      <ChevronDown
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        5
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          วันเกิด (Date of Birth)
                        </h3>
                        <span className="text-xs text-red-500">* จำเป็น</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="md:col-span-2">
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={token}
                          className={`w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl ${token ? "opacity-70 cursor-not-allowed bg-gray-100" : "focus:bg-white focus:border-purple-400"}`}
                        />
                      </div>
                      <div className="bg-purple-50 border-2 border-purple-100 rounded-xl p-4 flex items-center justify-center">
                        <span className="font-bold text-purple-700">
                          อายุ: {calculateAge(formData.dateOfBirth)} ปี
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {surveys.pre.visitor?.questions?.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {!isSurveyOnly ? index + 6 : index + 1}
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

              {!isSurveyOnly && (
                <div
                  className={`bg-white rounded-xl border-2 p-6 shadow-sm transition-all ${formData.agreeTerms ? "border-purple-400 bg-purple-50/30" : "border-purple-200"}`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      ข้อกำหนดและเงื่อนไข
                    </h3>
                    <span className="text-xs text-red-500 font-medium">
                      * จำเป็น
                    </span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <ScrollText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          นโยบายความเป็นส่วนตัวและการใช้ข้อมูล
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          ข้อมูลส่วนบุคคลของท่านจะถูกรวบรวมและใช้เพื่อวัตถุประสงค์ในการลงทะเบียนและการจัดการอีเว้นท์...
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all border border-purple-200"
                      >
                        <Eye className="w-3.5 h-3.5" /> อ่านทั้งหมด
                      </button>
                    </div>
                  </div>

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
                      className="w-5 h-5 mt-0.5 rounded border-2 border-gray-400 accent-purple-600"
                    />
                    <span className="text-sm text-gray-700 leading-relaxed">
                      ฉันได้อ่านและยอมรับ{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-purple-600 underline font-semibold"
                      >
                        ข้อกำหนดและเงื่อนไข
                      </button>{" "}
                      ทั้งหมด
                    </span>
                  </label>
                </div>
              )}

              {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowTermsModal(false)}
                  />
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
                    <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">
                      <h2 className="text-lg font-bold text-gray-900">
                        ข้อกำหนดและเงื่อนไข
                      </h2>
                      <button
                        onClick={() => setShowTermsModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X />
                      </button>
                    </div>
                    <div className="overflow-y-auto px-6 py-5 flex-1 text-sm text-gray-700 space-y-4">
                      <section>
                        <h3 className="font-bold mb-2">
                          1. การเก็บรวบรวมข้อมูลส่วนบุคคล
                        </h3>
                        <p>
                          ระบบจะเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อใช้ในการดำเนินการที่เกี่ยวข้องกับการจัดงานนี้เท่านั้น
                        </p>
                      </section>
                      <section>
                        <h3 className="font-bold mb-2">
                          2. วัตถุประสงค์ในการใช้ข้อมูล
                        </h3>
                        <p>
                          เพื่อยืนยันการลงทะเบียน การสื่อสาร
                          และการวิเคราะห์ปรับปรุงการจัดงาน
                        </p>
                      </section>
                    </div>
                    <div className="px-6 py-4 border-t flex gap-3">
                      <button
                        onClick={() => setShowTermsModal(false)}
                        className="flex-1 py-3 rounded-xl border text-gray-700 font-semibold"
                      >
                        ปิด
                      </button>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            agreeTerms: true,
                          }));
                          setShowTermsModal(false);
                        }}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold"
                      >
                        ยอมรับข้อกำหนด
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center pt-4 pb-8">
                <button
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-12 md:px-24 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 text-lg"
                >
                  {isSurveyOnly ? "ส่งคำตอบ" : "ลงทะเบียน"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
