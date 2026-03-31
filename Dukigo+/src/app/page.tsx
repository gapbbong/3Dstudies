"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { SmartLayout } from "@/components/SmartLayout";
import { calculateLevenshtein } from "@/utils/tracing";
import { useConfigStore } from "@/hooks/useConfig";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import confetti from "canvas-confetti";

// 수식 특수문자 및 불필요한 LaTeX 기호 제거 함수 (트레이싱 비교 및 표시용)
const cleanForDisplay = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\$/g, "") // $ 기호 제거
    .replace(/\\\(|\\\)/g, "") // \( \) 기호 제거
    .replace(/\"/g, "") // 쌍따옴표 제거 (사용자 요청)
    .replace(/\\theta/g, "θ")
    .replace(/\\Omega/g, "Ω")
    .replace(/\\mu/g, "μ")
    .replace(/\\Delta/g, "Δ")
    .replace(/\\pi/g, "π")
    .replace(/\\omega/g, "ω")
    .replace(/\\alpha/g, "α")
    .replace(/\\beta/g, "β")
    .replace(/\\gamma/g, "γ")
    .replace(/\\phi/g, "φ")
    .replace(/\\times/g, "×")
    .replace(/\\cdot/g, "·")
    .replace(/\\sqrt/g, "√")
    .replace(/\\angle/g, "∠")
    .replace(/\\degree/g, "°")
    .replace(/\^2/g, "²")
    .replace(/\^3/g, "³")
    .replace(/\\([a-zA-Z]+)/g, "$1") // \cos -> cos 처럼 백슬래시만 제거
    .replace(/\{|\}/g, "") // 나머지 { } 제거
    .replace(/\[|\]/g, "") // [V], [A] 등 단위용 대괄호 보속
    .replace(/\s+/g, " ") // 중복 공백 제거
    .trim();
};

// 한/영 키보드 레이아웃 상호 변환 맵 (QWERTY <-> 한글 자소)
const KO_TO_EN: {[key: string]: string} = {
  'ㄱ': 'r', 'ㄴ': 's', 'ㄷ': 'e', 'ㄹ': 'f', 'ㅁ': 'a', 'ㅂ': 'q', 'ㅅ': 't', 'ㅇ': 'd', 'ㅈ': 'w', 'ㅊ': 'c', 'ㅋ': 'z', 'ㅌ': 'x', 'ㅍ': 'v', 'ㅎ': 'g',
  'ㅏ': 'k', 'ㅑ': 'i', 'ㅓ': 'j', 'ㅕ': 'u', 'ㅗ': 'h', 'ㅛ': 'y', 'ㅜ': 'n', 'ㅠ': 'b', 'ㅡ': 'm', 'ㅣ': 'l', 'ㅐ': 'o', 'ㅔ': 'p', 'ㅒ': 'O', 'ㅖ': 'P',
  'ㄲ': 'R', 'ㄸ': 'E', 'ㅃ': 'Q', 'ㅆ': 'T', 'ㅉ': 'W'
};
const EN_TO_KO: {[key: string]: string} = Object.fromEntries(Object.entries(KO_TO_EN).map(([k, v]) => [v, k]));

const toggleLayoutChar = (char: string) => {
  // 영문이면 한글로, 한글이면 영문으로 타점 위치 변경
  if (KO_TO_EN[char]) return KO_TO_EN[char];
  if (EN_TO_KO[char]) return EN_TO_KO[char];
  return char;
};

const normalizeLayout = (text: string) => {
  return text.split('').map(char => KO_TO_EN[char] || char.toLowerCase()).join('');
};

const toggleFullLayout = (text: string) => {
  return text.split('').map(toggleLayoutChar).join('');
};

const cleanForTracing = (text: string) => {
  const display = cleanForDisplay(text);
  // 표시용에서 특수 기호 제거 후, 레이아웃을 정렬하여 한/영 상관없이 비교
  return normalizeLayout(
    display.replace(/[θΩμΔπωαβγφ×·√∠°²³]/g, "").replace(/\s+/g, " ")
  ).trim();
};

export default function Home() {
  const [questions, setQuestions] = useState<{question_text: string, id: string, options?: string[], correct_answer?: string, explanation?: string}[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [studyMode, setStudyMode] = useState<'TRACING' | 'QUIZ'>('TRACING');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const [accuracy, setAccuracy] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [lastSpaceTime, setLastSpaceTime] = useState(0); // 더블 스페이스 감지용
  const [inputMode, setInputMode] = useState<'KO' | 'EN'>('KO'); // 한/영 입력 모드 고정
  const [userId, setUserId] = useState<string | null>(null);
  
  const { config, temp, setTemp, streak, setStreak } = useConfigStore();
  const threshold = config?.STUDY_CONFIG.PASS_THRESHOLD_ACCURACY || 93;
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentQuestion = questions[currentIndex];
  // 트레이싱용 타겟 텍스트 (해설이 있으면 해설을, 없으면 질문 텍스트를 사용하되 비교를 위해 정제)
  const targetText = studyMode === 'TRACING' 
    ? (currentQuestion?.explanation || currentQuestion?.question_text || "") 
    : (currentQuestion?.question_text || "");

  // 비교를 위한 정제된 텍스트 (필드가 변경되어 정확도가 안정됨)
  const cleanTarget = cleanForTracing(targetText);

  // 실제 데이터베이스에서 기출문제 로드 (2015_03 제외 필터링)
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('dukigo_exam_questions')
        .select('id, question_text, options, correct_answer, explanation')
        .order('created_at', { ascending: false })
        .range(0, 2000); // 1,598개 전체 데이터를 허용하도록 범위 확대

      if (!error && data && data.length > 0) {
        const filteredData = data.filter(q => !q.id.startsWith('2015_03'));
        if (filteredData.length > 0) {
          setQuestions(filteredData);
        } else {
          setFallback();
        }
      } else {
        setFallback();
      }
      setIsLoading(false);
    };

    const setFallback = () => {
      setQuestions([
        { id: 'f1', question_text: "전선 접속 시 접속 부분의 전기 저항이 증가하지 않도록 해야 한다.", options: ["증가시킨다", "감소하지 않게", "무시한다", "제외함"], correct_answer: "2" },
        { id: 'f2', question_text: "금속관 배관 공사 시 관의 굴곡 반경은 관 안지름의 6배 이상으로 한다.", options: ["3배", "4배", "5배", "6배"], correct_answer: "4" }
      ]);
    };

    fetchQuestions();
  }, []);

  // [보안 끝판왕] 네이티브 DOM 레벨의 붙여넣기 차단
  useEffect(() => {
    const target = inputRef.current;
    if (!target) return;

    const preventNativePaste = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    const preventNativeKey = (e: KeyboardEvent) => {
      if (((e.ctrlKey || e.metaKey) && (e.code === "KeyV" || e.key === "v" || e.key === "V")) || 
          (e.shiftKey && e.code === "Insert")) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    const preventNativeBeforeInput = (e: any) => {
      const inputType = e.inputType;
      if (inputType === "insertFromPaste" || inputType === "insertFromDrop") {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    };

    target.addEventListener('paste', preventNativePaste, true);
    target.addEventListener('drop', preventNativePaste, true);
    target.addEventListener('keydown', preventNativeKey, true);
    target.addEventListener('beforeinput', preventNativeBeforeInput, true);

    return () => {
      target.removeEventListener('paste', preventNativePaste, true);
      target.removeEventListener('drop', preventNativePaste, true);
      target.removeEventListener('keydown', preventNativeKey, true);
      target.removeEventListener('beforeinput', preventNativeBeforeInput, true);
    };
  }, [isLoading, studyMode, questions.length]);

  const handlePreventPaste = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBeforeInput = (e: any) => {
    const inputType = e.nativeEvent?.inputType;
    if (inputType === "insertFromPaste" || inputType === "insertFromDrop") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    let localId = localStorage.getItem('dukigo_user_id');
    if (!localId) {
      localId = crypto.randomUUID();
      localStorage.setItem('dukigo_user_id', localId);
    }
    setUserId(localId);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      if (!isPassed) setStreak(0);
      setCurrentIndex(prev => prev + 1);
      setInputText("");
      setSelectedOption(null);
      setIsPassed(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex, questions.length, isPassed, setStreak]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setInputText("");
      setSelectedOption(null);
      setIsPassed(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [currentIndex]);

  const handleOptionSelect = (index: number) => {
    if (isPassed || studyMode !== 'QUIZ') return;
    
    setSelectedOption(index);
    const isCorrect = String(index + 1) === currentQuestion?.correct_answer;
    
    if (isCorrect) {
      handleSuccessEffects();
    } else {
      setStreak(0);
      setTemp(Math.max(0, temp - 5.0)); // 오답 시 온도 하락
    }
  };

  const handleSuccessEffects = () => {
    setIsPassed(true);
    if (typeof window !== "undefined" && window.navigator?.vibrate) window.navigator.vibrate(20);
    
    const newStreak = streak + 1;
    setStreak(newStreak);

    if (newStreak >= 3) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fb923c', '#4ade80', '#6366f1']
      });
    }

    if (userId) {
      supabase.rpc('dukigo_check_and_update_temp', {
        p_user_id: userId,
        p_temp_weight: 1.0,
        p_is_correct: true
      }).then(({ data, error }) => {
        if (!error && typeof data === 'number') setTemp(data);
      });
    }
  };

  useEffect(() => {
    if (studyMode !== 'TRACING' || !targetText || isPassed) return;
    
    // 정제된 문자열끼리 비교하여 수식 입력 편의성 증대
    const acc = calculateLevenshtein(cleanTarget, cleanForTracing(inputText));
    setAccuracy(acc);

    if (acc >= threshold) {
      handleSuccessEffects();
    }
  }, [inputText, cleanTarget, threshold, isPassed, studyMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && studyMode === 'TRACING') {
        const now = Date.now();
        // 0.3초 이내에 스페이스가 두 번 눌리면 '입력 모드 고정' 전환!
        if (now - lastSpaceTime < 300) {
          e.preventDefault(); // 스페이스 제거
          setInputMode(prev => prev === 'KO' ? 'EN' : 'KO'); // 모드 전환
          setLastSpaceTime(0);
          return;
        }
        setLastSpaceTime(now);
      }
      
      if (e.key === "Enter" && !e.shiftKey && studyMode === 'TRACING') {
        // 기존 엔터 로직
      }

      if (((e.ctrlKey || e.metaKey) && (e.code === "KeyV" || e.key === "v" || e.key === "V")) || 
          (e.shiftKey && e.code === "Insert")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      if (studyMode === 'QUIZ' && !isPassed) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          handleOptionSelect(parseInt(e.key) - 1);
        }
      }

      if (isPassed && e.key === "Enter") {
        e.preventDefault();
        handleNext();
      } else if (e.altKey && (e.key === "ArrowRight" || e.key === "Enter")) {
        e.preventDefault();
        handleNext();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isPassed, studyMode, currentQuestion, lastSpaceTime, inputMode]);

  if (isLoading) return (
    <SmartLayout userId={userId || undefined}>
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-zinc-400 font-bold">Dukigo+ 데이터를 불러오는 중...</div>
      </div>
    </SmartLayout>
  );

  const progress = ((currentIndex + 1) / (questions.length || 1)) * 100;

  return (
    <SmartLayout userId={userId || undefined}>
      <div className="w-full flex flex-col pt-4">
        {/* 상단 프로그레스 바 */}
        <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full transition-colors duration-500 ${temp >= 90 ? 'bg-red-500' : 'bg-orange-500'}`}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tighter">DUKIGO+</h1>
            {/* [Smart-IME Indicator] 최상단 배치 및 애니메이션 추가 */}
            <AnimatePresence mode="wait">
              {studyMode === 'TRACING' && (
                <motion.div
                  key={inputMode}
                  initial={{ scale: 0.8, opacity: 0, x: -10 }}
                  animate={{ scale: 1, opacity: 1, x: 0 }}
                  exit={{ scale: 0.8, opacity: 0, x: 10 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1 rounded-lg text-[10px] font-black shadow-sm border transition-all duration-300 ${
                    inputMode === 'KO' 
                      ? "bg-orange-500 text-white border-orange-400 rotate-0" 
                      : "bg-blue-500 text-white border-blue-400 -rotate-1"
                  }`}
                >
                  {inputMode === 'KO' ? "한글 모드 [KO]" : "영문 모드 [EN]"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-medium border shadow-sm transition-colors duration-[600ms] flex items-center gap-2 ${
            temp >= 90 ? 'bg-red-500 text-white border-red-400 animate-pulse' : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
          }`}>
            <span>{temp.toFixed(1)}°C</span>
            {streak >= 3 && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">🔥 {streak}</span>}
          </div>
        </div>

        {/* 모드 전환 탭 */}
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl mb-8 w-fit mx-auto border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => { setStudyMode('TRACING'); setInputText(""); setIsPassed(false); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${studyMode === 'TRACING' ? 'bg-white dark:bg-zinc-800 shadow-sm text-orange-500' : 'text-zinc-400'}`}
          >
            학습 트레이싱
          </button>
          <button 
            onClick={() => { setStudyMode('QUIZ'); setIsPassed(false); setSelectedOption(null); }}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${studyMode === 'QUIZ' ? 'bg-white dark:bg-zinc-800 shadow-sm text-orange-500' : 'text-zinc-400'}`}
          >
            문제 풀이
          </button>
        </div>

        {/* 퀴즈 모드에만 질문지 노출, 트레이싱 모드에서는 해설에 집중 */}
        {studyMode === 'QUIZ' && (
          <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl mb-6 relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 ${temp >= 90 ? 'bg-red-500' : 'bg-orange-500'}`} />    
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 opacity-60">
                {currentQuestion?.id || "ID"} | Q{currentIndex + 1} OF {questions.length}
              </h2>
              <span className="px-2 py-1 rounded-md bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black tracking-widest uppercase border border-orange-200 dark:border-orange-500/20">
                Question
              </span>
            </div>
            <p className="text-xl font-bold leading-tight tracking-tight text-zinc-800 dark:text-zinc-100">
              {cleanForDisplay(currentQuestion?.question_text) || "질문 데이터를 불러오는 중..."}
            </p>
          </div>
        )}

        {/* 렌더링 분기: 트레이싱 vs 퀴즈 */}
        {studyMode === 'TRACING' ? (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 opacity-60">
                ITEM {currentQuestion?.id || "ID"} | {currentIndex + 1} / {questions.length}
              </h2>
              <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-[9px] font-black tracking-widest uppercase border border-zinc-200 dark:border-zinc-700">
                Tracing Active
              </span>
            </div>
            
            {/* 트레이싱 목표 텍스트 박스 - 이제 이것이 메인입니다 */}
            <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-orange-200 dark:border-orange-500/20 shadow-xl relative overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                 <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Memorization Target</div>
                 <div className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md border border-zinc-100 dark:border-zinc-700">
                   💡 Tip: 특수 기호(θ, Ω 등)는 입력을 건드리지 않고 건너뛰어도 됩니다!
                 </div>
               </div>
               <p className="text-xl font-bold text-zinc-800 dark:text-zinc-100 leading-relaxed italic">
                 {cleanForDisplay(targetText)}
               </p>
            </div>

            <div className="relative group">
              {/* 이전 위치 배지 제거 (최상단으로 이동됨) */}

              <textarea
                ref={inputRef}
                autoFocus
                value={inputText}
                onChange={(e) => {
                  let newVal = e.target.value;
                  // 새로 추가된 한 글자가 있다면 현재 모드에 맞게 강제 레이아웃 변환
                  if (newVal.length > inputText.length) {
                    const lastChar = newVal.slice(-1);
                    if (inputMode === 'KO' && EN_TO_KO[lastChar]) {
                      newVal = newVal.slice(0, -1) + EN_TO_KO[lastChar];
                    } else if (inputMode === 'EN' && KO_TO_EN[lastChar]) {
                      newVal = newVal.slice(0, -1) + KO_TO_EN[lastChar];
                    }
                  }
                  setInputText(newVal);
                }}
                onBeforeInput={handleBeforeInput}
                onPaste={handlePreventPaste}
                onContextMenu={(e) => e.preventDefault()}
                placeholder="위 해설 문장을 정교하게 트레이싱 하세요..."
                className={`w-full p-8 text-xl bg-white dark:bg-zinc-950 border-2 rounded-3xl outline-none transition-all resize-none h-48 shadow-lg leading-relaxed
                  ${isPassed ? 'border-green-500 ring-8 ring-green-500/10' : 'border-zinc-50 dark:border-zinc-900 focus:border-orange-300 focus:ring-8 focus:ring-orange-500/5'}
                  ${temp >= 90 && !isPassed ? 'focus:border-red-500 focus:ring-red-500/10' : ''}`}
              />
              <div className={`absolute bottom-6 right-6 text-[10px] font-black px-3 py-1 rounded-full border shadow-sm transition-all duration-300 ${
                accuracy >= threshold ? "bg-green-500 text-white border-green-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
              }`}>
                ACCURACY: {accuracy.toFixed(1)}%
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {Array.isArray(currentQuestion?.options) ? 
              currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className={`p-5 text-left rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                    selectedOption === idx 
                      ? String(idx+1) === currentQuestion.correct_answer 
                        ? "border-green-500 bg-green-50/50 dark:bg-green-500/10" 
                        : "border-red-500 bg-red-50/50 dark:bg-red-500/10"
                      : "border-zinc-50 dark:border-zinc-900 bg-white dark:bg-zinc-950 hover:border-orange-300 hover:scale-[1.02]"
                  } ${isPassed && String(idx+1) !== currentQuestion.correct_answer ? "opacity-30" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                    selectedOption === idx ? "border-current" : "border-zinc-100 dark:border-zinc-800 text-zinc-400 group-hover:border-orange-300 group-hover:text-orange-500"
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-lg font-medium ${selectedOption === idx ? "text-inherit" : "text-zinc-600 dark:text-zinc-300"}`}>
                    {cleanForDisplay(option)}
                  </span>
                </button>
              )) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 animate-pulse">
                  <p className="text-zinc-400 text-sm font-bold">이 문항은 선택지가 없는 트레이싱 전용입니다.</p>
                  <p className="text-zinc-300 text-[10px] mt-2">상단 탭에서 [학습 트레이싱] 모드로 전환해 주세요.</p>
                </div>
              )
            }
          </div>
        )}

        {/* 하단 내비게이션 */}
        <div className="flex items-center justify-center gap-12 mt-12">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-lg hover:scale-110 active:scale-95 disabled:opacity-20`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
          </button>

          <AnimatePresence mode="wait">
            {isPassed ? (
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                key="success"
                className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white shadow-xl shadow-green-500/30"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="4"><path d="M5 13l4 4L19 7" /></svg>
              </motion.div>
            ) : (
              <motion.div key="neutral" className={`w-3 h-3 rounded-full ${temp >= 90 ? 'bg-red-500 animate-ping' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
            )}
          </AnimatePresence>

          <button 
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95 disabled:opacity-20 ${isPassed ? 'bg-orange-500 text-white animate-bounce' : 'bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800'}`}
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </SmartLayout>
  );
}
