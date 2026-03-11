"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";

const SurveyEditModal = ({ isOpen, onClose, initialData, onSave }) => {
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setEditData(JSON.parse(JSON.stringify(initialData)));
    }
  }, [isOpen, initialData]);

  if (!isOpen || !editData) return null;

  const updateQuestion = (idx, field, value) => {
    const newQ = [...editData.questions];
    newQ[idx][field] = value;
    if (field === "questionType" && value !== "text" && newQ[idx].choices.length === 0) {
      newQ[idx].choices = ["", ""];
    }
    setEditData({ ...editData, questions: newQ });
  };

  const updateChoice = (qIdx, cIdx, value) => {
    const newQ = [...editData.questions];
    newQ[qIdx].choices[cIdx] = value;
    setEditData({ ...editData, questions: newQ });
  };

  const addChoice = (qIdx) => {
    const newQ = [...editData.questions];
    newQ[qIdx].choices.push("");
    setEditData({ ...editData, questions: newQ });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] shadow-2xl flex flex-col scale-in-center">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-black text-slate-800">แก้ไขแบบสำรวจ</h2>
            <p className="text-slate-400 text-sm font-medium">ปรับปรุงรายละเอียดและคำถาม</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* ข้อมูลทั่วไป */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">ชื่อแบบสำรวจ</label>
              <input 
                className="w-full border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700" 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">แต้มที่จะได้รับ</label>
              <input 
                type="number"
                className="w-full border-2 border-slate-100 rounded-2xl p-4 outline-none focus:border-indigo-500 transition-all font-bold text-slate-700" 
                value={editData.points} 
                onChange={(e) => setEditData({...editData, points: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
               <h3 className="text-xl font-black text-slate-800">รายการคำถาม ({editData.questions.length})</h3>
               <button 
                onClick={() => setEditData({...editData, questions: [...editData.questions, { question: "", questionType: "text", choices: [] }]})}
                className="text-indigo-600 font-black text-sm hover:underline flex items-center gap-1"
               >
                 <Plus size={16} strokeWidth={3} /> เพิ่มคำถามใหม่
               </button>
            </div>

            {editData.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-8 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] relative group transition-all hover:border-indigo-100">
                {/* แถวบน: คำถาม + ประเภท (อ้างอิงรูปภาพ) */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <input 
                    className="flex-1 border-2 border-white rounded-2xl p-4 outline-none focus:border-indigo-400 bg-white shadow-sm transition-all font-bold"
                    placeholder="ระบุหัวข้อคำถามของคุณ..."
                    value={q.question}
                    onChange={(e) => updateQuestion(qIdx, 'question', e.target.value)}
                  />
                  <select 
                    className="md:w-48 border-2 border-white rounded-2xl p-4 bg-white shadow-sm outline-none cursor-pointer font-bold text-slate-600"
                    value={q.questionType}
                    onChange={(e) => updateQuestion(qIdx, 'questionType', e.target.value)}
                  >
                    <option value="text">Text (พิมพ์ตอบ)</option>
                    <option value="multiple_choice">Choice (เลือกข้อเดียว)</option>
                    <option value="checkbox">Checkbox (เลือกหลายข้อ)</option>
                  </select>
                  <button 
                    onClick={() => setEditData({...editData, questions: editData.questions.filter((_, i) => i !== qIdx)})}
                    className="p-4 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* แถวล่าง: รายการ Choice (Grid 2 คอลัมน์ ตามรูปภาพ) */}
                {q.questionType !== "text" && (
                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {q.choices.map((choice, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-3 group/choice">
                          <input 
                            className="flex-1 border-2 border-white rounded-xl p-3 text-sm outline-none focus:border-indigo-300 bg-white shadow-sm font-medium"
                            placeholder={`ตัวเลือกที่ ${cIdx + 1}`}
                            value={choice}
                            onChange={(e) => updateChoice(qIdx, cIdx, e.target.value)}
                          />
                          <button 
                            onClick={() => {
                              const newQ = [...editData.questions];
                              newQ[qIdx].choices = newQ[qIdx].choices.filter((_, i) => i !== cIdx);
                              setEditData({...editData, questions: newQ});
                            }}
                            className="p-2 text-slate-200 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* ปุ่มเพิ่มตัวเลือก (สีน้ำเงินมีเส้นใต้) */}
                    <button 
                      onClick={() => addChoice(qIdx)}
                      className="inline-flex items-center gap-1 text-indigo-600 font-black hover:text-indigo-800 transition-colors mt-4"
                    >
                      <Plus size={18} strokeWidth={3} />
                      <span className="underline underline-offset-8 decoration-2">เพิ่มตัวเลือก</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 sticky bottom-0">
          <button onClick={onClose} className="px-8 py-3 text-slate-500 font-black hover:bg-slate-200 rounded-2xl transition-all uppercase tracking-widest text-xs">
            ยกเลิก
          </button>
          <button 
            onClick={() => { onSave(editData); onClose(); }} 
            className="px-10 py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
          >
            <Save size={20} /> บันทึกการแก้ไข
          </button>
        </div>
      </div>
    </div>
  );
};

export default SurveyEditModal;