"use client"

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function CreateFeedbackForm() {
  const [formData, setFormData] = useState({
    selectEvent: '',
    feedbackName: '',
    feedbackDetails: '',
    feedbackType: '',
    dateFrom: '',
    dateTo: '',
    timeFrom: '',
    timeTo: '',
    givePoints: ''
  });

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      type: 'rating',
      options: ['Excellent', 'Good', 'Fair', 'Less', 'Poor']
    },
    {
      id: 2,
      question: '',
      type: 'multiple',
      options: ['text', 'text', 'text', 'text', 'text']
    }
  ]);

  const addQuestion = () => {
    const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
    setQuestions([...questions, {
      id: newId,
      question: '',
      type: 'multiple',
      options: ['text', 'text', 'text', 'text', 'text']
    }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleReset = () => {
    setFormData({
      selectEvent: '',
      feedbackName: '',
      feedbackDetails: '',
      feedbackType: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: '',
      givePoints: ''
    });
    setQuestions([
      {
        id: 1,
        question: '',
        type: 'rating',
        options: ['Excellent', 'Good', 'Fair', 'Less', 'Poor']
      }
    ]);
  };

  const handleCreate = () => {
    alert('Feedback form created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Create Feedback Form Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">Create Feedback Form</h1>
            <div className="flex-1 h-px bg-gray-300 ml-6"></div>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Select Event :
                  </label>
                  <div className="relative">
                    <select 
                      className="w-full px-4 py-2 border border-gray-300 rounded bg-white appearance-none pr-10"
                      value={formData.selectEvent}
                      onChange={(e) => setFormData({...formData, selectEvent: e.target.value})}
                    >
                      <option value="">Select an event</option>
                      <option value="event1">Event 1</option>
                      <option value="event2">Event 2</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Feedback Name :
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    value={formData.feedbackName}
                    onChange={(e) => setFormData({...formData, feedbackName: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Feedback Details :
                  </label>
                  <textarea 
                    className="w-full px-4 py-2 border border-gray-300 rounded h-32 resize-none"
                    value={formData.feedbackDetails}
                    onChange={(e) => setFormData({...formData, feedbackDetails: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Feedback Type :
                  </label>
                  <input 
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    value={formData.feedbackType}
                    onChange={(e) => setFormData({...formData, feedbackType: e.target.value})}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">
                      Date :
                    </label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      value={formData.dateFrom}
                      onChange={(e) => setFormData({...formData, dateFrom: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">
                      To
                    </label>
                    <input 
                      type="date"
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      value={formData.dateTo}
                      onChange={(e) => setFormData({...formData, dateTo: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">
                      Time :
                    </label>
                    <input 
                      type="time"
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      value={formData.timeFrom}
                      onChange={(e) => setFormData({...formData, timeFrom: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-700 font-medium mb-2">
                      To
                    </label>
                    <input 
                      type="time"
                      className="w-full px-4 py-2 border border-gray-300 rounded"
                      value={formData.timeTo}
                      onChange={(e) => setFormData({...formData, timeTo: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Give points :
                  </label>
                  <input 
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                    value={formData.givePoints}
                    onChange={(e) => setFormData({...formData, givePoints: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Question Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <h2 className="text-3xl font-semibold text-gray-800">Create Question</h2>
            <div className="flex-1 h-px bg-gray-300 ml-6"></div>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow p-6 relative">
                <button
                  onClick={() => removeQuestion(question.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-gray-700 font-medium">{index + 1}.</span>
                    <input 
                      type="text"
                      placeholder="Question ..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded"
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                    />
                  </div>

                  {question.type === 'rating' ? (
                    <div className="flex items-center gap-4 pl-8">
                      {question.options.map((option, i) => (
                        <label key={i} className="flex items-center gap-2 text-gray-700">
                          <input type="radio" name={`question-${question.id}`} className="w-4 h-4" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="pl-8">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-gray-700">Type answer:</span>
                        <div className="relative">
                          <select 
                            className="px-4 py-1 border border-gray-300 rounded bg-white appearance-none pr-8"
                            value={question.type}
                            onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                          >
                            <option value="multiple">Multiple</option>
                            <option value="single">Single</option>
                            <option value="text">Text</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-gray-700">Answer option :</span>
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4" />
                            <input 
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(question.id, i, e.target.value)}
                              className="px-2 py-1 border-b border-gray-300 text-sm"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add Question Button */}
            <div className="bg-white rounded-lg shadow p-6 flex justify-center">
              <button
                onClick={addQuestion}
                className="px-6 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors"
              >
                Add a new question
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="text-center">
          <p className="text-red-500 mb-4">Are you sure you want to create the feedback?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-8 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleCreate}
              className="px-8 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}