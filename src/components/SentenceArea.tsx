import React, { forwardRef } from "react";
import { WordCard } from "../types";
import { ArrowDownLeft, BookOpen, Trash2, HelpCircle, Volume2 } from "lucide-react";

interface SentenceAreaProps {
  droppedWords: WordCard[];
  onWordReturned: (wordId: string) => void;
  isChecked: boolean;
  isCorrect: boolean | null;
  correctSentence: string;
  translation: string;
  hint?: string;
  showHint: boolean;
  onToggleHint: () => void;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export const SentenceArea = forwardRef<HTMLDivElement, SentenceAreaProps>(
  (
    {
      droppedWords,
      onWordReturned,
      isChecked,
      isCorrect,
      correctSentence,
      translation,
      hint,
      showHint,
      onToggleHint,
      onSpeak,
      isSpeaking,
    },
    ref
  ) => {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <h2 className="text-base sm:text-lg font-bold text-indigo-800 flex items-center gap-1.5">
              Sentence Area <span className="text-xs sm:text-sm font-medium text-indigo-600/90">(Khu vực xếp câu)</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {onSpeak && (
              <button
                onClick={onSpeak}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                  isSpeaking
                    ? "bg-sky-500 text-white border-sky-600 animate-pulse"
                    : "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200"
                }`}
                title="Nghe câu hoàn chỉnh"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? "Đang phát..." : "Nghe câu mẫu"}</span>
              </button>
            )}

            {hint && (
              <button
                onClick={onToggleHint}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-full border border-amber-200 transition-colors shadow-xs"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                {showHint ? "Ẩn gợi ý" : "Gợi ý"}
              </button>
            )}
          </div>
        </div>

        {/* Notebook page container */}
        <div
          ref={ref}
          className={`w-full min-h-36 sm:min-h-40 bg-[#f0fdf4] border-4 rounded-[24px] relative overflow-hidden shadow-sm p-6 flex flex-col justify-between transition-all duration-300 ${
            isChecked
              ? isCorrect
                ? "border-emerald-400 bg-emerald-50/70"
                : "border-rose-400 bg-rose-50/70"
              : "border-[#bbf7d0] hover:border-emerald-300"
          }`}
        >
          {/* Notebook Red Margin Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-rose-200 pointer-events-none" />

          {/* Notebook Horizontal Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-45 pl-8">
            <div className="w-full h-[1px] bg-sky-100 mt-10" />
            <div className="w-full h-[1px] bg-sky-100 mt-10" />
            <div className="w-full h-[1px] bg-sky-100 mt-10" />
            <div className="w-full h-[1px] bg-sky-100 mt-10" />
          </div>

            {/* Placed Words Container */}
            <div className="relative pl-6 z-10 flex flex-wrap gap-2.5 items-center min-h-[44px]">
              {droppedWords.length === 0 ? (
                <div className="w-full py-4 flex flex-col sm:flex-row items-center gap-2 text-indigo-400/80 italic text-xs sm:text-sm">
                  <ArrowDownLeft className="w-5 h-5 text-indigo-400 animate-bounce hidden sm:inline" />
                  <span>Kéo thả các từ bay ở trên xuống đây hoặc bấm trực tiếp vào từ để xếp thành câu nhé!</span>
                </div>
              ) : (
                droppedWords.map((word, idx) => (
                  <button
                    key={`dropped-${word.id}-${idx}`}
                    onClick={() => !isChecked && onWordReturned(word.id)}
                    disabled={isChecked}
                    className={`flex items-center px-3.5 py-2 rounded-xl border-2 ${word.color} font-extrabold text-slate-800 shadow-sm text-sm sm:text-base cursor-pointer hover:scale-95 active:scale-90 hover:opacity-85 transition-all duration-150 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap`}
                    title="Bấm để đưa từ này trở lại"
                  >
                    {word.text}
                  </button>
                ))
              )}
            </div>

            {/* Hint and Translation reveals */}
            <div className="relative z-10 pl-6 mt-4">
              {showHint && hint && !isChecked && (
                <div className="bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl p-2.5 text-xs sm:text-sm font-medium animate-fade-in mb-2 flex items-start gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="break-words leading-relaxed">
                    <strong className="text-amber-800">Grammar Hint:</strong> {hint}
                  </div>
                </div>
              )}

              {/* Complete result view on Check */}
              {isChecked && (
                <div className="mt-3 p-3.5 bg-slate-50/90 border border-slate-200 rounded-xl text-slate-900 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-[11px] font-bold ${isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <span className={`text-xs font-extrabold uppercase tracking-wide ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? "Correct! (Chính xác!)" : "Incorrect! (Chưa đúng rồi!)"}
                      </span>
                    </div>

                    {onSpeak && (
                      <button
                        onClick={onSpeak}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${
                          isSpeaking
                            ? "bg-sky-600 text-white border-sky-700 animate-pulse"
                            : "bg-white hover:bg-sky-50 text-sky-700 border-sky-200"
                        }`}
                        title="Bấm để nghe đọc câu hoàn chỉnh"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Nghe lại</span>
                      </button>
                    )}
                  </div>

                  <div className="text-base sm:text-lg font-extrabold text-indigo-900 mt-1 select-all font-sans leading-snug break-words">
                    {correctSentence}
                  </div>

                  <div className="text-xs sm:text-sm text-emerald-800 font-semibold mt-1 break-words leading-relaxed">
                    🇻🇳 {translation}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }
);

SentenceArea.displayName = "SentenceArea";

