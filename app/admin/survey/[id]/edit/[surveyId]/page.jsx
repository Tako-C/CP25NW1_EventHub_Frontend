"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Plus, Edit3 } from "lucide-react";
import { notification, Tabs } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getDataNoToken, updateSurvey } from "@/libs/fetch";
import QuestionEditor from "../../../components/QuestionEditor";
import SurveyPreview from "../../../components/SurveyPreview";

export default function EditAdminSurveyPage() {
  const { id: eventId, surveyId } = useParams();
  const searchParams = useSearchParams();
  const [surveyData, setSurveyData] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");

  useEffect(() => {
    const fetchSurveyData = async () => {
      const type = searchParams.get("type");
      const role = searchParams.get("role");
      const res = await getDataNoToken(`/events/${eventId}/surveys/${type}`);

      const data = res.data;
      const surveyData = data?.[role];
      const formatData = surveyData.find((item) => item.id == surveyId);
      console.log(formatData);
      setSurveyData(formatData);
    };
    if (eventId) fetchSurveyData();
  }, []);

  return (
    <div className="min-h-screen bg-white pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <button
            onClick={() => window.history.back()}
            className="font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
          >
            <ArrowLeft size={18} /> Cancel Changes
          </button>

          <div className="flex gap-4">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "edit",
                  label: (
                    <span className="font-bold">
                      <Edit3 size={16} className="inline mr-2" />
                      Editor
                    </span>
                  ),
                },
                {
                  key: "preview",
                  label: (
                    <span className="font-bold">
                      <Eye size={16} className="inline mr-2" />
                      Preview
                    </span>
                  ),
                },
              ]}
              className="mb-0"
            />
            <button className="bg-indigo-600 text-white px-8 py-2.5 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Save size={18} /> SAVE CHANGES
            </button>
          </div>
        </div>

        {activeTab === "edit" ? (
          <div className="space-y-10 animate-in fade-in duration-500">
            {/* General Info Card */}
            <div className="bg-slate-50 rounded-[2.5rem] p-10 border-2 border-dashed border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                    Survey Name
                  </label>
                  <input
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                    value={surveyData?.eventName}
                    onChange={(e) =>
                      setSurveyData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                    Reward Points
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all"
                    value={surveyData?.points}
                    onChange={(e) =>
                      setSurveyData((prev) => ({
                        ...prev,
                        points: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-white border-2 border-transparent rounded-2xl p-4 font-bold text-slate-800 shadow-sm focus:border-indigo-500 outline-none transition-all min-h-[100px]"
                  value={surveyData?.description}
                  onChange={(e) =>
                    setSurveyData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800">
                Questions ({surveyData?.questions.length})
              </h3>
              {surveyData?.questions.map((q, idx) => (
                <QuestionEditor
                  key={idx}
                  index={idx}
                  questions={q}
                  onUpdate={(i, f, v) => {}}
                  onDelete={(i) => {}}
                />
              ))}
              <button className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-bold hover:bg-slate-50 hover:border-indigo-300 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> Add New Question
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100">
            <SurveyPreview
              surveyTitle={surveyData?.eventName}
              surveyDescription={surveyData?.description}
              questions={surveyData?.questions}
              surveyType="pre"
            />
          </div>
        )}
      </div>
    </div>
  );
}
