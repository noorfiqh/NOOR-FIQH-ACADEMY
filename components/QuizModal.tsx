'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Award, ArrowRight, HelpCircle, Sparkles } from 'lucide-react';
import { Quiz, QuizQuestion } from '@/lib/types';
import confetti from 'canvas-confetti';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz?: Quiz;
  lessonTitle?: string;
  onPass: () => void;
}

const DEFAULT_QUIZ: Quiz = {
  id: 'default-quiz-fiqh',
  title: 'মৌলিক ফিকহ ও মাসআলা মূল্যায়ন পরীক্ষা',
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      type: 'mcq',
      question: 'অযুর মধ্যে কয়টি অঙ্গ ধৌত করা বা মাসেহ করা ফরজ?',
      options: ['৩ টি', '৪ টি', '৫ টি', '৭ টি'],
      correctAnswer: 1, // '৪ টি'
      explanation: 'কোরআনের সূরা মায়েদার ৬ নম্বর আয়াত অনুযায়ী অযুর ফরজ চারটি: সম্পূর্ণ মুখমণ্ডল ধোয়া, উভয় হাত কনুইসহ ধোয়া, মাথার চারভাগের একভাগ মাসেহ করা, এবং উভয় পা টাখনুসহ ধোয়া।',
      marks: 1
    },
    {
      id: 'q2',
      type: 'mcq',
      question: 'মুসাফির ব্যক্তি কত দিন পর্যন্ত কসর সালাত আদায় করতে পারবেন যদি এক স্থানে অবস্থানের সুনির্দিষ্ট নিয়ত না থাকে?',
      options: ['৩ দিন', '১৫ দিনের কম', '৩০ দিন', 'যতদিন ইচ্ছা'],
      correctAnswer: 1, // '১৫ দিনের কম'
      explanation: 'হানাফী ফিকহ অনুযায়ী যদি কোনো স্থানে ১৫ দিন বা তার বেশি স্থায়ীভাবে থাকার দৃঢ় নিয়ত না থাকে, তবে তিনি কসর করতে পারবেন।',
      marks: 1
    },
    {
      id: 'q3',
      type: 'mcq',
      question: 'স্বর্ণের নিসাবের ক্ষেত্রে ন্যুনতম কত পরিমাণ স্বর্ণ থাকলে যাকাত ফরজ হয়?',
      options: ['৫ তোলা (৫৮ গ্রাম)', '৭.৫ তোলা (৮৭.৪৮ গ্রাম)', '১০ তোলা', '৫০ গ্রাম'],
      correctAnswer: 1, // '৭.৫ তোলা'
      explanation: 'স্বর্ণের নিসাব হলো সাড়ে সাত ভরি বা তোলা (প্রায় ৮৭.৪৮ গ্রাম)।',
      marks: 1
    }
  ]
};

export function QuizModal({ isOpen, onClose, quiz = DEFAULT_QUIZ, lessonTitle, onPass }: QuizModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [scorePercentage, setScorePercentage] = useState(0);

  if (!isOpen) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const totalQuestions = quiz.questions.length;

  const handleSelectOption = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate Score
      let correctCount = 0;
      quiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswer) {
          correctCount++;
        }
      });
      const pct = Math.round((correctCount / totalQuestions) * 100);
      setScorePercentage(pct);
      setSubmitted(true);

      if (pct >= quiz.passingScore) {
        confetti({ particleCount: 70, spread: 60 });
        onPass();
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-[#ece8e0] font-sans"
      >
        {/* Header */}
        <div className="p-5 bg-[#112734] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#17A2B8] text-slate-950 flex items-center justify-center font-bold">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {quiz.title}
              </h3>
              {lessonTitle && (
                <p className="text-xs text-[#17A2B8]/80 truncate">{lessonTitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#17A2B8]/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              {scorePercentage >= quiz.passingScore ? (
                <>
                  <div className="w-20 h-20 bg-[#17A2B8]/15 text-[#17A2B8] rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Award size={44} />
                  </div>
                  <h4 className="text-2xl font-black text-[#112734]">মাশাআল্লাহ! আপনি উত্তীর্ণ হয়েছেন!</h4>
                  <p className="text-sm text-[#5a524d]">
                    আপনার অর্জিত নম্বর: <strong className="text-[#23626F] text-lg">{scorePercentage}%</strong> (পাস মার্ক: {quiz.passingScore}%)
                  </p>
                  <p className="text-xs text-[#8a817c]">
                    পরবর্তী পাঠে যাওয়ার যোগ্যতা ও সার্টিফিকেট অর্জনের অগ্রগতি আনলক হয়েছে।
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full py-3 bg-[#112734] text-white font-bold rounded-2xl shadow-md hover:bg-[#23626F] transition-colors"
                  >
                    পাঠদান চালিয়ে যান
                  </button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle size={44} />
                  </div>
                  <h4 className="text-2xl font-black text-amber-900">পুনরায় চেষ্টা করুন</h4>
                  <p className="text-sm text-[#5a524d]">
                    আপনার প্রাপ্ত নম্বর: <strong className="text-red-600">{scorePercentage}%</strong>। পাসের জন্য ন্যূনতম {quiz.passingScore}% প্রয়োজন।
                  </p>
                  <button
                    onClick={handleRetry}
                    className="w-full py-3 bg-amber-600 text-white font-bold rounded-2xl shadow-md hover:bg-amber-700 transition-colors"
                  >
                    আবার কুইজ দিন
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Tracker */}
              <div className="flex items-center justify-between text-xs text-[#8a817c] font-bold">
                <span>প্রশ্ন {currentQuestionIndex + 1} / {totalQuestions}</span>
                <span className="text-amber-600">পাস মার্ক: {quiz.passingScore}%</span>
              </div>

              {/* Question Text */}
              <div className="bg-[#fdfcf9] p-5 rounded-2xl border border-[#ece8e0]">
                <h4 className="text-base font-extrabold text-[#2c3e50] leading-relaxed">
                  {currentQuestion.question}
                </h4>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-[#112734] bg-[#17A2B8]/10 text-[#112734] ring-2 ring-[#112734]/20'
                          : 'border-[#ece8e0] hover:bg-slate-50 text-[#2c3e50]'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#112734] bg-[#112734] text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <span className="text-xs">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Next Action */}
              <button
                type="button"
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                onClick={handleNext}
                className="w-full py-3.5 bg-[#112734] hover:bg-[#23626F] text-white font-extrabold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span>{currentQuestionIndex === totalQuestions - 1 ? 'ফলাফল দেখুন' : 'পরবর্তী প্রশ্ন'}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
