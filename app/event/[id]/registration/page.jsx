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
  Loader2,
  Lock,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- inline validation errors ---
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
  });

  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });

  const showNotification = (message, isError = false) => {
    setNotification({ isVisible: true, message, isError });
    setTimeout(() => closeNotification(), 3000);
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
    if (token) fetchData();
    fetchEventDetail();
  }, [id, token]);

  // --- inline validation on blur ---
  const validateField = (name, value) => {
    if (token) return ""; // ถ้า login แล้ว ไม่ต้อง validate (disabled)
    switch (name) {
      case "firstName":
      case "lastName":
        return value.trim() ? "" : "กรุณากรอกข้อมูล";
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
          ? ""
          : "รูปแบบอีเมลไม่ถูกต้อง";
      case "dateOfBirth":
        return value ? "" : "กรุณาเลือกวันเกิด";
      default:
        return "";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // clear error เมื่อ user เริ่มพิมพ์
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (token) return;
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const validateSurveys = () => {
    const currentQuestions = surveys.pre.visitor?.questions || [];
    if (currentQuestions.length === 0) return true;
    return currentQuestions.every((q) => {
      const answer = formData.surveyAnswers.find((a) => a.questionId === q.id);
      if (!answer) return false;
      if (q.questionType === "TEXT") return answer.answers[0]?.trim().length > 0;
      return answer.answers.length > 0;
    });
  };

  const handleSubmit = async () => {
    if (!validateSurveys()) {
      showNotification("กรุณาตอบแบบสำรวจให้ครบทุกข้อ", true);
      return;
    }

    if (isSurveyOnly) {
      setIsSubmitting(true);
      try {
        await sendSurveyAnswer(formData?.surveyAnswers, id);
        showNotification("ส่งคำตอบแบบสำรวจสำเร็จ!");
        setTimeout(() => router.push("/profile?tab=events"), 1500);
      } catch {
        showNotification("เกิดข้อผิดพลาดในการส่งข้อมูล", true);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // validate all fields ก่อน submit (กรณีไม่ได้ login)
    if (!token) {
      const errors = {
        firstName: validateField("firstName", formData.firstName),
        lastName: validateField("lastName", formData.lastName),
        email: validateField("email", formData.email),
        dateOfBirth: validateField("dateOfBirth", formData.dateOfBirth),
      };
      setFieldErrors(errors);
      if (Object.values(errors).some(Boolean)) {
        showNotification("กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน", true);
        return;
      }
    }

    if (!formData.agreeTerms) {
      showNotification("กรุณากดรับทราบและยอมรับข้อกำหนดและเงื่อนไข", true);
      return;
    }

    setIsSubmitting(true);
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
          showNotification("ลงทะเบียนไม่สำเร็จ", true);
        }
      }
    } catch {
      showNotification("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์", true);
    } finally {
      setIsSubmitting(false);
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
        currentAnswers.push({ questionId, answers: [value] });
      }
      return { ...prev, surveyAnswers: currentAnswers };
    });
  };

  // --- reusable: input field สำหรับ field ที่ login แล้ว disabled ---
  const ReadonlyField = ({ label, value, icon }) => (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
      {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-700 truncate">{value || "-"}</p>
      </div>
      <Lock size={14} className="text-gray-300 flex-shrink-0" />
    </div>
  );

  // --- step number badge ---
  const StepBadge = ({ n }) => (
    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
      {n}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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

            {/* ─── Header card ─── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      {isSurveyOnly ? "แบบสำรวจก่อนงาน" : "ลงทะเบียนเข้าร่วมกิจกรรม"}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-3">
                    {isSurveyOnly
                      ? `แบบสำรวจ: ${eventDetail?.eventName || ""}`
                      : eventDetail?.eventName || "ลงทะเบียนเข้าร่วมกิจกรรม"}
                  </h1>
                  {eventDetail?.eventDesc && (
                    <p className="text-purple-100 text-base leading-relaxed max-w-2xl line-clamp-2">
                      {eventDetail.eventDesc}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-8 py-5 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">วันที่เริ่ม</p>
                      <p className="text-sm font-semibold text-gray-800">{FormatDate(eventDetail?.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">วันที่สิ้นสุด</p>
                      <p className="text-sm font-semibold text-gray-800">{FormatDate(eventDetail?.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Form fields ─── */}
            <div className="space-y-5">

              {!isSurveyOnly && (
                <>
                  {/* ถ้า login แล้ว — แสดง readonly summary card แทน 5 input แยก */}
                  {token ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Lock size={15} className="text-gray-400" />
                        <h3 className="text-sm font-semibold text-gray-500">
                          ข้อมูลจากโปรไฟล์ของคุณ — ไม่สามารถแก้ไขได้ที่นี่
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ReadonlyField label="ชื่อ" value={formData.firstName} />
                        <ReadonlyField label="นามสกุล" value={formData.lastName} />
                        <ReadonlyField label="อีเมล" value={formData.email} />
                        <ReadonlyField
                          label="เพศ"
                          value={genderOptions.find((g) => g.id === formData.gender)?.label}
                        />
                        <ReadonlyField
                          label="วันเกิด"
                          value={formData.dateOfBirth}
                        />
                        <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                          <div className="flex-1">
                            <p className="text-xs text-purple-400 mb-0.5">อายุ</p>
                            <p className="text-sm font-bold text-purple-700">
                              {calculateAge(formData.dateOfBirth)} ปี
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">
                        ต้องการแก้ไข?{" "}
                        <button
                          onClick={() => router.push("/profile")}
                          className="text-purple-600 underline font-medium"
                        >
                          ไปที่หน้าโปรไฟล์
                        </button>
                      </p>
                    </div>
                  ) : (
                    /* ถ้ายังไม่ login — แสดง input fields พร้อม validation */
                    <>
                      {/* ชื่อ */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <StepBadge n={1} />
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">ชื่อ <span className="text-sm font-normal text-gray-400">(First Name)</span></h3>
                            <span className="text-xs text-red-500">* จำเป็นต้องตอบ</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="กรอกชื่อของคุณ..."
                          className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl text-gray-700 focus:bg-white transition-all outline-none ${
                            fieldErrors.firstName
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-purple-400"
                          }`}
                        />
                        {fieldErrors.firstName && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {fieldErrors.firstName}
                          </p>
                        )}
                      </div>

                      {/* นามสกุล */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <StepBadge n={2} />
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">นามสกุล <span className="text-sm font-normal text-gray-400">(Last Name)</span></h3>
                            <span className="text-xs text-red-500">* จำเป็นต้องตอบ</span>
                          </div>
                        </div>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="กรอกนามสกุลของคุณ..."
                          className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl text-gray-700 focus:bg-white transition-all outline-none ${
                            fieldErrors.lastName
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-purple-400"
                          }`}
                        />
                        {fieldErrors.lastName && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {fieldErrors.lastName}
                          </p>
                        )}
                      </div>

                      {/* อีเมล */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <StepBadge n={3} />
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">อีเมล <span className="text-sm font-normal text-gray-400">(Email)</span></h3>
                            <span className="text-xs text-red-500">* จำเป็นต้องตอบ</span>
                          </div>
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={handleBlur}
                          placeholder="example@email.com"
                          className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl text-gray-700 focus:bg-white transition-all outline-none ${
                            fieldErrors.email
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-purple-400"
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                            <span>⚠</span> {fieldErrors.email}
                          </p>
                        )}
                      </div>

                      {/* เพศ */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <StepBadge n={4} />
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">เพศ <span className="text-sm font-normal text-gray-400">(Gender)</span></h3>
                            <span className="text-xs text-red-500">* จำเป็นต้องตอบ</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            className="w-full p-3.5 pl-11 pr-10 bg-gray-50 border-2 border-gray-200 rounded-xl appearance-none focus:bg-white focus:border-purple-400 transition-all outline-none text-gray-700"
                          >
                            {genderOptions.map((opt) => (
                              <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                      </div>

                      {/* วันเกิด */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-start gap-3 mb-4">
                          <StepBadge n={5} />
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">วันเกิด <span className="text-sm font-normal text-gray-400">(Date of Birth)</span></h3>
                            <span className="text-xs text-red-500">* จำเป็นต้องตอบ</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                              onBlur={handleBlur}
                              className={`w-full p-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white transition-all outline-none ${
                                fieldErrors.dateOfBirth
                                  ? "border-red-400 focus:border-red-400"
                                  : "border-gray-200 focus:border-purple-400"
                              }`}
                            />
                            {fieldErrors.dateOfBirth && (
                              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                <span>⚠</span> {fieldErrors.dateOfBirth}
                              </p>
                            )}
                          </div>
                          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5 flex items-center justify-center">
                            <span className="font-bold text-purple-700 text-sm">
                              อายุ: {calculateAge(formData.dateOfBirth)} ปี
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ─── Survey questions ─── */}
              {surveys.pre.visitor?.questions?.map((q, index) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <StepBadge n={!isSurveyOnly ? (token ? index + 2 : index + 6) : index + 1} />
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 leading-relaxed">{q.question}</h3>
                      {q.questionType === "MULTIPLE" && (
                        <span className="text-xs text-blue-600 font-medium">* เลือกได้หลายคำตอบ</span>
                      )}
                    </div>
                    {(q.questionType === "MULTIPLE" || q.questionType === "SINGLE") && (
                      <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg">
                        <CheckSquare className="w-4 h-4 text-green-600" />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {(q.questionType === "SINGLE" || q.questionType === "MULTIPLE") &&
                      q.choices.map((choice, cIdx) => (
                        <label
                          key={cIdx}
                          className="flex items-center gap-3 p-3.5 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-green-50 hover:border-green-300 transition-all cursor-pointer group"
                        >
                          <input
                            type={q.questionType === "MULTIPLE" ? "checkbox" : "radio"}
                            name={`question-${q.id}`}
                            value={choice}
                            onChange={() => handleSurveyChange(q.id, choice, q.questionType)}
                            checked={
                              formData.surveyAnswers
                                .find((a) => a.questionId === q.id)
                                ?.answers.includes(choice) || false
                            }
                            className="w-4 h-4 flex-shrink-0 accent-green-600"
                          />
                          <span className="text-gray-700 group-hover:text-gray-900 text-sm transition-colors">{choice}</span>
                        </label>
                      ))}

                    {q.questionType === "TEXT" && (
                      <input
                        type="text"
                        placeholder="พิมพ์คำตอบของคุณที่นี่..."
                        value={
                          formData.surveyAnswers.find((a) => a.questionId === q.id)?.answers[0] || ""
                        }
                        onChange={(e) => handleSurveyChange(q.id, e.target.value, "TEXT")}
                        className="w-full p-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white transition-all outline-none"
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* ─── Terms & Conditions ─── */}
              {!isSurveyOnly && (
                <div className={`bg-white rounded-xl border-2 p-6 shadow-sm transition-all ${formData.agreeTerms ? "border-purple-400 bg-purple-50/30" : "border-gray-200"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">ข้อกำหนดและเงื่อนไข</h3>
                    <span className="text-xs text-red-500 font-medium">* จำเป็น</span>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <ScrollText className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 mb-1">นโยบายความเป็นส่วนตัวและการใช้ข้อมูล</p>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                          ข้อมูลส่วนบุคคลของท่านจะถูกรวบรวมและใช้เพื่อวัตถุประสงค์ในการลงทะเบียนและการจัดการอีเว้นท์...
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all border border-purple-200 flex-shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" /> อ่านทั้งหมด
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData((prev) => ({ ...prev, agreeTerms: e.target.checked }))}
                      className="w-5 h-5 mt-0.5 rounded accent-purple-600 flex-shrink-0"
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

              {/* ─── Terms Modal ─── */}
              {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowTermsModal(false)}
                  />
                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
                    <div className="flex items-center justify-between px-6 py-5 border-b shrink-0">
                      <h2 className="text-lg font-bold text-gray-900">ข้อกำหนดและเงื่อนไข</h2>
                      <button onClick={() => setShowTermsModal(false)} className="text-gray-400 hover:text-gray-700 transition">
                        <X size={20} />
                      </button>
                    </div>
                    <div className="overflow-y-auto px-6 py-5 flex-1 text-sm text-gray-700 space-y-4">
                      <section>
                        <h3 className="font-bold mb-2">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</h3>
                        <p>ระบบจะเก็บรวบรวมข้อมูลส่วนบุคคลของท่านเพื่อใช้ในการดำเนินการที่เกี่ยวข้องกับการจัดงานนี้เท่านั้น</p>
                      </section>
                      <section>
                        <h3 className="font-bold mb-2">2. วัตถุประสงค์ในการใช้ข้อมูล</h3>
                        <p>เพื่อยืนยันการลงทะเบียน การสื่อสาร และการวิเคราะห์ปรับปรุงการจัดงาน</p>
                      </section>
                    </div>
                    <div className="px-6 py-4 border-t flex gap-3 shrink-0">
                      <button
                        onClick={() => setShowTermsModal(false)}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                      >
                        ปิด
                      </button>
                      <button
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, agreeTerms: true }));
                          setShowTermsModal(false);
                        }}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition"
                      >
                        ยอมรับข้อกำหนด
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Submit button ─── */}
              <div className="flex justify-center pt-2 pb-10">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full md:w-auto flex items-center justify-center gap-2 font-semibold py-4 px-12 md:px-24 rounded-full shadow-lg transition-all text-base ${
                    isSubmitting
                      ? "bg-gradient-to-r from-purple-400 to-blue-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 active:scale-95"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isSurveyOnly ? "กำลังส่งคำตอบ..." : "กำลังลงทะเบียน..."}
                    </>
                  ) : (
                    isSurveyOnly ? "ส่งคำตอบ" : "ลงทะเบียน"
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}