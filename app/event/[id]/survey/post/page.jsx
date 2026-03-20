"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  CheckSquare,
  Star,
  MessageSquare,
} from "lucide-react";
import {
  getData,
  getDataNoToken,
  sendSurveyAnswer,
  surveyPostValidate,
} from "@/libs/fetch";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FormatDate } from "@/utils/format";
import Cookie from "js-cookie";
import Notification from "@/components/Notification/Notification";
import SuccessPage from "@/components/Notification/SuccessSurvey";

export default function PostSurveyForm() {
  const token = Cookie.get("token");
  const { id } = useParams();
  const searchParams = useSearchParams();
  const u = searchParams.get("t");

  const [formData, setFormData] = useState({
    surveyAnswers: [],
  });
  const [eventDetail, setEventDetail] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    isError: false,
    message: "",
  });
  const [surveyData, setSurveyData] = useState(null);
  const router = useRouter();

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  // const fetchPostSurvey = async () => {
  //   let currentEvent;

  //   if (token) {
  //     console.log("Searching for eventId:", id);
  //     const res = await getData("users/me/registered-events");

  //     if (res?.statusCode === 403) {
  //       return router.push("/error");
  //     }

  //     if (res?.statusCode && res.statusCode !== 200) {
  //       setNotification({
  //         isVisible: true,
  //         isError: true,
  //         message: res?.message || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
  //       });

  //       setTimeout(() => {
  //         router.push("/home");
  //       }, 3000);
  //       return;
  //     }

  //     console.log("res?.data:", res?.data);
  //     currentEvent = res?.data?.find(
  //       (item) => String(item.eventId) === String(id),
  //     );

  //     console.log("Found currentEvent:", currentEvent);
  //   } else {
  //     if (u) {
  //       Cookie.set("accessToken", u);
  //       const res = await surveyPostValidate();

  //       if (res?.statusCode === 403) {
  //         return router.push("/error");
  //       }

  //       if (res?.statusCode && res.statusCode !== 200) {
  //         setNotification({
  //           isVisible: true,
  //           isError: true,
  //           message: res?.message || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์",
  //         });

  //         setTimeout(() => {
  //           router.push("/home");
  //         }, 3000);
  //         return;
  //       }

  //       currentEvent = res?.data;
  //     }
  //   }

  //   const eventRes = await getDataNoToken(`events/${id}`);
  //   if (eventRes?.statusCode !== 200) {
  //     setNotification({
  //       isVisible: true,
  //       isError: true,
  //       message: "ไม่พบข้อมูลกิจกรรม",
  //     });
  //     return;
  //   }

  //   setEventDetail(eventRes?.data);
  //   const hasPostSurvey = eventRes.data?.hasPostSurvey;

  //   if (!currentEvent || !hasPostSurvey) {
  //     setNotification({
  //       isVisible: true,
  //       isError: true,
  //       message: "ไม่พบ survey",
  //     });

  //     setTimeout(() => {
  //       router.push("/home");
  //     }, 3000);
  //     return;
  //   }

  //   const surveyRes = await getDataNoToken(`events/${id}/surveys/post`);
  //   if (surveyRes?.statusCode !== 200) return;

  //   const roleDataMap = {
  //     VISITOR: surveyRes.data?.visitor[0],
  //     EXHIBITOR: surveyRes.data?.exhibitor[0],
  //   };

  //   setSurveyData(roleDataMap[currentEvent.eventRole] || null);
  // };

  const fetchPostSurvey = async () => {
    let currentEvent = null;

    const cleanupToken = () => {
      Cookie.remove("accessToken");
    };

    try {
      if (u) {
        Cookie.set("accessToken", u);
        try {
          const res = await surveyPostValidate();

          currentEvent = res?.data;
          if (res?.data?.accessToken) {
            Cookie.set("accessToken", res.data.accessToken);
          }
        } catch (error) {
          cleanupToken();

          if (error.status === 403) return router.push("/error");

          setNotification({
            isVisible: true,
            isError: true,
            message: error.message || "ลิงก์ไม่ถูกต้องหรือหมดอายุ",
          });
          setTimeout(() => {
            router.push("/home");
          }, 3000);
          return;
        }
      } else if (token) {
        const res = await getData("users/me/registered-events");
        currentEvent = res?.data?.find(
          (item) => String(item.eventId) === String(id),
        );
      }

      const eventRes = await getDataNoToken(`events/${id}`);
      setEventDetail(eventRes?.data);

      if (!currentEvent || !eventRes.data?.hasPostSurvey) {
        setNotification({
          isVisible: true,
          isError: true,
          message: "คุณไม่มีสิทธิ์เข้าถึงแบบประเมินนี้ หรือไม่มีแบบประเมิน",
        });
        setTimeout(() => {
          router.push("/home");
        }, 3000);
        return;
      }

      const surveyRes = await getDataNoToken(`events/${id}/surveys/post`);
      const roleDataMap = {
        VISITOR: surveyRes.data?.visitor?.[0],
        EXHIBITOR: surveyRes.data?.exhibitor?.[0],
      };

      setSurveyData(roleDataMap[currentEvent.eventRole] || null);
    } catch (globalError) {
      console.error("Fetch Survey Error:", globalError);
      cleanupToken();
    }
  };

  useEffect(() => {
    // if (!token) {
    //   Cookie.set("surveyPost", `/event/${id}/survey/post`);
    //   return router.push("/login");
    // }
    fetchPostSurvey();
  }, [id]);

  const handleSurveyChange = (questionId, value, type) => {
    setFormData((prev) => {
      const currentAnswers = [...prev.surveyAnswers];
      const questionIndex = currentAnswers.findIndex(
        (a) => a.questionId === questionId,
      );

      let newAnswers;
      if (questionIndex > -1) {
        if (type === "MULTIPLE" || type === "checkbox") {
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

  const handleSubmit = async () => {
    if (formData.surveyAnswers.length === 0) {
      setNotification({
        isVisible: true,
        isError: true,
        message: "กรุณาตอบแบบสำรวจก่อนส่ง",
      });
      return;
    }

    try {
      const resSurvey = await sendSurveyAnswer(formData?.surveyAnswers, id);
      if (resSurvey.statusCode === 200) {
        setNotification({
          isVisible: true,
          isError: false,
          message: resSurvey?.message,
        });
        setIsSuccess(true);
        if (u) Cookie.remove("accessToken");
        // router.push("/home");
      }
    } catch (error) {
      setNotification({
        isVisible: true,
        isError: true,
        message: error?.message || "เกิดข้อผิดพลาดในการส่งข้อมูล",
      });
      if (u) Cookie.remove("accessToken");
    }
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
        <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12">
          <div className="bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl border border-gray-200 shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-10 text-white relative">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    Post-Event Survey
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {surveyData?.name || "แบบประเมินความพึงพอใจ"}
                </h1>
                <p className="text-purple-100 text-lg">
                  Event name: {eventDetail?.eventName || "Loading..."}
                </p>
              </div>
            </div>

            <div className="px-8 py-6 bg-white border-b border-gray-100">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-500 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase">
                    Event Date
                  </p>
                  <p className="text-lg font-medium text-gray-800">
                    {FormatDate(eventDetail?.startDate)} -{" "}
                    {FormatDate(eventDetail?.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {surveyData?.questions?.map((q, index) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                      {q.question}
                    </h3>
                    {q.required && (
                      <span className="text-xs text-red-500">
                        * จำเป็นต้องตอบ
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  {q.questionType === "RATING" && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const selected = formData.surveyAnswers.find(
                            (a) => a.questionId === q.id,
                          )?.answers[0] === val.toString();
                          return (
                            <button
                              key={val}
                              onClick={() =>
                                handleSurveyChange(q.id, val.toString(), "rating")
                              }
                              className={`flex-1 py-3 rounded-xl border-2 font-bold text-lg transition-all active:scale-95 ${
                                selected
                                  ? "border-purple-500 bg-purple-500 text-white shadow-md"
                                  : "border-gray-200 bg-gray-50 text-gray-400 hover:border-purple-300 hover:text-purple-500"
                              }`}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-gray-400 px-1">
                        <span>😞 น้อยที่สุด</span>
                        <span>มากที่สุด 😄</span>
                      </div>
                    </div>
                  )}

                  {(q.questionType === "MULTIPLE" ||
                    q.questionType === "SINGLE") && (
                    <div className="space-y-2">
                      {q.choices.map((choice, cIdx) => (
                        <label
                          key={cIdx}
                          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer group"
                        >
                          <input
                            type={
                              q.questionType === "MULTIPLE"
                                ? "checkbox"
                                : "radio"
                            }
                            name={`q-${q.id}`}
                            checked={
                              formData.surveyAnswers
                                .find((a) => a.questionId === q.id)
                                ?.answers.includes(choice) || false
                            }
                            onChange={() =>
                              handleSurveyChange(q.id, choice, q.questionType)
                            }
                            className="w-5 h-5 accent-purple-600"
                          />
                          <span className="text-gray-700">{choice}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.questionType === "TEXTAREA" && (
                    <div className="relative">
                      <MessageSquare className="absolute top-4 left-4 w-5 h-5 text-gray-400" />
                      <textarea
                        rows="4"
                        placeholder="พิมพ์ความเห็นเพิ่มเติมของคุณที่นี่..."
                        onChange={(e) =>
                          handleSurveyChange(q.id, e.target.value, "textarea")
                        }
                        className="w-full p-4 pl-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-700 focus:border-purple-400 focus:bg-white outline-none transition-all"
                      />
                    </div>
                  )}

                  {q.questionType === "TEXT" && (
                    <input
                      type="text"
                      placeholder="พิมพ์คำตอบของคุณที่นี่..."
                      onChange={(e) =>
                        handleSurveyChange(q.id, e.target.value, "text")
                      }
                      className="w-full p-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-400 outline-none transition-all"
                    />
                  )}
                </div>
              </div>
            ))}

            <div className="flex justify-center pt-6 pb-12">
              <button
                onClick={handleSubmit}
                className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-24 rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                ส่งแบบประเมิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}