import { useState, useEffect, useRef } from "react";
import { PRESENT_CONTINUOUS_QUESTIONS } from "./questions";
import { Question, WordCard, TeamScore, ExercisePack, VoiceSettings } from "./types";
import { ScoreBoard } from "./components/ScoreBoard";
import { FloatingWordBank } from "./components/FloatingWordBank";
import { SentenceArea } from "./components/SentenceArea";
import { AudioSettingsModal } from "./components/AudioSettingsModal";
import { CreateExerciseModal } from "./components/CreateExerciseModal";
import { ExercisePackSelectorModal } from "./components/ExercisePackSelectorModal";
import {
  playCorrectSound,
  playIncorrectSound,
  playGrabSound,
  playDropSound,
  speakEnglishSentence,
  stopSpeaking,
} from "./sound";
import {
  Award,
  ChevronRight,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Trophy,
  RefreshCw,
  Heart,
  PlusCircle,
  Layers,
  Sliders,
  Play,
  Check,
  Edit3
} from "lucide-react";

// Beautiful pastel colors for words
const PASTEL_COLORS = [
  "bg-amber-100 border-amber-300 text-amber-950 hover:bg-amber-200/80 active:bg-amber-300/60",
  "bg-sky-100 border-sky-300 text-sky-950 hover:bg-sky-200/80 active:bg-sky-300/60",
  "bg-rose-100 border-rose-300 text-rose-950 hover:bg-rose-200/80 active:bg-rose-300/60",
  "bg-purple-100 border-purple-300 text-purple-950 hover:bg-purple-200/80 active:bg-purple-300/60",
  "bg-emerald-100 border-emerald-300 text-emerald-950 hover:bg-emerald-200/80 active:bg-emerald-300/60",
  "bg-orange-100 border-orange-300 text-orange-950 hover:bg-orange-200/80 active:bg-orange-300/60",
  "bg-indigo-100 border-indigo-300 text-indigo-950 hover:bg-indigo-200/80 active:bg-indigo-300/60",
];

const DEFAULT_PACK: ExercisePack = {
  id: "default-present-continuous",
  title: "Thì Hiện tại Tiếp diễn",
  description: "Bộ 15 câu luyện tập cấu trúc S + is/am/are + V-ing",
  createdAt: 1700000000000,
  isCustom: false,
  questions: PRESENT_CONTINUOUS_QUESTIONS,
};

// Helper to scramble array elements securely
function scrambleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Exercise Packs Management
  const [customPacks, setCustomPacks] = useState<ExercisePack[]>(() => {
    try {
      const saved = localStorage.getItem("tieng_anh_an_khe_custom_packs");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load custom packs", e);
    }
    return [];
  });

  const [activePackId, setActivePackId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("tieng_anh_an_khe_active_pack");
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_PACK.id;
  });

  // Combine default and custom packs
  const allPacks: ExercisePack[] = [DEFAULT_PACK, ...customPacks];
  const currentPack = allPacks.find((p) => p.id === activePackId) || DEFAULT_PACK;
  const currentQuestions = currentPack.questions;

  // Voice & Speech Settings
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem("tieng_anh_an_khe_voice_settings");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load voice settings", e);
    }
    return { rate: 0.85, voiceURI: "", pitch: 1.0 };
  });

  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingPack, setEditingPack] = useState<ExercisePack | null>(null);
  const [isPackSelectorOpen, setIsPackSelectorOpen] = useState<boolean>(false);
  const [isAudioModalOpen, setIsAudioModalOpen] = useState<boolean>(false);

  // Success Notification Toast for Pack Creation
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Game state
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [availableWords, setAvailableWords] = useState<WordCard[]>([]);
  const [droppedWords, setDroppedWords] = useState<WordCard[]>([]);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Streak and scores
  const [correctStreak, setCorrectStreak] = useState<number>(0);
  const [questionsAnswered, setQuestionsAnswered] = useState<boolean[]>(
    () => new Array(currentQuestions.length).fill(false)
  );

  // Team score state (preserved in localStorage)
  const [teamScore, setTeamScore] = useState<TeamScore>(() => {
    try {
      const saved = localStorage.getItem("tieng_anh_an_khe_team_scores");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { team1: 0, team2: 0 };
  });

  const sentenceAreaRef = useRef<HTMLDivElement>(null);
  const currentQuestion: Question | undefined = currentQuestions[currentIdx];
  const isGameComplete = currentIdx >= currentQuestions.length;

  // Save team scores to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tieng_anh_an_khe_team_scores", JSON.stringify(teamScore));
    } catch (e) {
      console.error(e);
    }
  }, [teamScore]);

  // Save custom packs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tieng_anh_an_khe_custom_packs", JSON.stringify(customPacks));
    } catch (e) {
      console.error(e);
    }
  }, [customPacks]);

  // Save active pack ID
  useEffect(() => {
    try {
      localStorage.setItem("tieng_anh_an_khe_active_pack", activePackId);
    } catch (e) {
      console.error(e);
    }
  }, [activePackId]);

  // Save voice settings
  const handleSaveVoiceSettings = (newSettings: VoiceSettings) => {
    setVoiceSettings(newSettings);
    try {
      localStorage.setItem("tieng_anh_an_khe_voice_settings", JSON.stringify(newSettings));
    } catch (e) {
      console.error(e);
    }
  };

  // When changing pack or question, prepare words
  useEffect(() => {
    if (!currentQuestion) return;

    const cards: WordCard[] = currentQuestion.words.map((w, index) => ({
      id: `${currentQuestion.id}-${index}-${w}-${Math.random().toString(36).substr(2, 4)}`,
      text: w,
      color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    }));

    setAvailableWords(scrambleArray(cards));
    setDroppedWords([]);
    setIsChecked(false);
    setIsCorrect(null);
    setShowHint(false);
  }, [currentIdx, activePackId, currentQuestions]);

  // Update questionsAnswered array length when pack changes
  useEffect(() => {
    setQuestionsAnswered(new Array(currentQuestions.length).fill(false));
    setCurrentIdx(0);
  }, [activePackId]);

  // Toast auto-hide
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Handlers for Custom Packs
  const handleOpenCreateModal = () => {
    setEditingPack(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (pack: ExercisePack) => {
    setEditingPack(pack);
    setIsCreateModalOpen(true);
  };

  const handleSavePack = (packToSave: ExercisePack) => {
    setCustomPacks((prev) => {
      const existingIdx = prev.findIndex((p) => p.id === packToSave.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx] = packToSave;
        return updated;
      }
      return [packToSave, ...prev];
    });

    setActivePackId(packToSave.id);
    setCurrentIdx(0);
    setCorrectStreak(0);
    setToastMessage(
      editingPack
        ? `Đã cập nhật bài tập "${packToSave.title}" (${packToSave.questions.length} câu)!`
        : `Đã tạo thành công bài tập "${packToSave.title}" (${packToSave.questions.length} câu)!`
    );
    setEditingPack(null);
  };

  const handleSelectPack = (packId: string) => {
    stopSpeaking();
    setActivePackId(packId);
    setCurrentIdx(0);
    setCorrectStreak(0);
  };

  const handleDeletePack = (packId: string) => {
    const packToDelete = customPacks.find((p) => p.id === packId);
    const title = packToDelete ? packToDelete.title : "bài tập";
    setCustomPacks((prev) => prev.filter((p) => p.id !== packId));
    if (activePackId === packId) {
      setActivePackId(DEFAULT_PACK.id);
      setCurrentIdx(0);
      setCorrectStreak(0);
      setToastMessage(`Đã xóa bài tập "${title}" và chuyển về bài tập mặc định.`);
    } else {
      setToastMessage(`Đã xóa bài tập "${title}".`);
    }
  };

  // Speak sentence helper using configured voice and speed
  const speakCurrentSentence = () => {
    if (!currentQuestion) return;
    setIsSpeaking(true);
    speakEnglishSentence(currentQuestion.sentence, {
      rate: voiceSettings.rate,
      voiceURI: voiceSettings.voiceURI,
      pitch: voiceSettings.pitch,
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Handle dropping a word into Sentence Area
  const handleWordDropped = (wordId: string, clientX: number, clientY: number) => {
    if (isChecked) return;

    if (sentenceAreaRef.current) {
      const rect = sentenceAreaRef.current.getBoundingClientRect();
      const isInside =
        clientX >= rect.left - 20 &&
        clientX <= rect.right + 20 &&
        clientY >= rect.top - 20 &&
        clientY <= rect.bottom + 20;

      if (isInside) {
        const word = availableWords.find((w) => w.id === wordId);
        if (word) {
          playDropSound();
          setDroppedWords((prev) => [...prev, word]);
          setAvailableWords((prev) => prev.filter((w) => w.id !== wordId));
        }
      }
    }
  };

  // Handle clicking word in bank to add it
  const handleWordClicked = (wordId: string) => {
    if (isChecked) return;
    const word = availableWords.find((w) => w.id === wordId);
    if (word) {
      playGrabSound();
      setDroppedWords((prev) => [...prev, word]);
      setAvailableWords((prev) => prev.filter((w) => w.id !== wordId));
    }
  };

  // Handle returning a dropped word back to the bank
  const handleWordReturned = (wordId: string) => {
    if (isChecked) return;
    const word = droppedWords.find((w) => w.id === wordId);
    if (word) {
      playGrabSound();
      setAvailableWords((prev) => [...prev, word]);
      setDroppedWords((prev) => prev.filter((w) => w.id !== wordId));
    }
  };

  // Reset current question
  const handleResetQuestion = () => {
    if (!currentQuestion) return;
    playGrabSound();
    const cards: WordCard[] = currentQuestion.words.map((w, index) => ({
      id: `${currentQuestion.id}-${index}-${w}-${Math.random().toString(36).substr(2, 4)}`,
      text: w,
      color: PASTEL_COLORS[index % PASTEL_COLORS.length],
    }));

    setAvailableWords(scrambleArray(cards));
    setDroppedWords([]);
    setIsChecked(false);
    setIsCorrect(null);
  };

  // Check the answer
  const handleCheckAnswer = () => {
    if (!currentQuestion || droppedWords.length === 0) return;

    const userSentence = droppedWords.map((w) => w.text).join(" ");
    const expected = currentQuestion.sentence.trim();

    const normalize = (s: string) =>
      s.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

    const correct = normalize(userSentence) === normalize(expected);

    setIsChecked(true);
    setIsCorrect(correct);

    // Speak sentence with configured voice settings
    speakCurrentSentence();

    if (correct) {
      playCorrectSound();
      setCorrectStreak((prev) => prev + 1);
      const updated = [...questionsAnswered];
      updated[currentIdx] = true;
      setQuestionsAnswered(updated);
    } else {
      playIncorrectSound();
      setCorrectStreak(0);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    stopSpeaking();
    setIsSpeaking(false);
    if (currentIdx < currentQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setCurrentIdx(currentQuestions.length);
    }
  };

  // Restart the current game
  const handleRestartGame = () => {
    stopSpeaking();
    setCurrentIdx(0);
    setCorrectStreak(0);
    setQuestionsAnswered(new Array(currentQuestions.length).fill(false));
  };

  // Reset team scores
  const handleResetTeamScores = () => {
    setTeamScore({ team1: 0, team2: 0 });
  };

  // Render Celebration when pack is finished
  if (isGameComplete) {
    const totalCorrect = questionsAnswered.filter(Boolean).length;
    const winningTeam =
      teamScore.team1 > teamScore.team2
        ? "Team 1 🦁"
        : teamScore.team2 > teamScore.team1
        ? "Team 2 🐼"
        : "Both Teams! 🤝";

    return (
      <div
        id="game-container"
        className="min-h-screen bg-[#f3faf7] py-8 px-4 flex flex-col justify-between font-sans text-slate-800"
      >
        <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl border-4 border-emerald-400 p-6 sm:p-8 shadow-xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto animate-bounce mb-4" />

            <h1 className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight leading-tight">
              Congratulations! 🎉
            </h1>
            <p className="text-sm font-bold text-emerald-600/90 mt-1 uppercase tracking-wide">
              Tiếng Anh An Khê - {currentPack.title}
            </p>

            <div className="my-6 p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl max-w-md mx-auto">
              <h2 className="text-lg font-bold text-emerald-900 mb-3 flex items-center justify-center gap-1.5">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Hoàn Thành Bài Tập!
              </h2>

              <div className="space-y-2.5 text-sm font-bold text-slate-700 text-left">
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span>Chủ đề đã học:</span>
                  <span className="text-indigo-600 font-extrabold">{currentPack.title}</span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span>Số câu làm đúng:</span>
                  <span className="text-emerald-600">
                    {totalCorrect} / {currentQuestions.length}
                  </span>
                </div>
                <div className="flex justify-between border-b border-emerald-100 pb-1.5">
                  <span>Team 1 🦁 Score:</span>
                  <span className="text-rose-600">{teamScore.team1} pts</span>
                </div>
                <div className="flex justify-between pb-0.5">
                  <span>Team 2 🐼 Score:</span>
                  <span className="text-indigo-600">{teamScore.team2} pts</span>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-emerald-200 text-center">
                <span className="text-xs text-slate-500 block">Classroom Winner (Đội chiến thắng):</span>
                <span className="text-base font-black text-amber-600">{winningTeam}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleRestartGame}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-base rounded-2xl border-b-4 border-emerald-700 shadow-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-5 h-5" />
                Luyện Lại Bài Này
              </button>
              {currentPack.isCustom && (
                <button
                  onClick={() => handleOpenEditModal(currentPack)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-extrabold text-base rounded-2xl border-b-4 border-amber-800 shadow-md transition-all cursor-pointer"
                  title="Chỉnh sửa hoặc bổ sung câu hỏi cho bài tập này"
                >
                  <Edit3 className="w-5 h-5" />
                  Sửa Bài Tập Này
                </button>
              )}
              <button
                onClick={() => setIsPackSelectorOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-extrabold text-base rounded-2xl border-b-4 border-sky-800 shadow-md transition-all cursor-pointer"
              >
                <Layers className="w-5 h-5" />
                Chọn Bài Tập Khác
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-base rounded-2xl border-b-4 border-amber-700 shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                Tạo Bài Tập Mới
              </button>
            </div>
          </div>
        </div>

        <footer className="text-center text-xs text-slate-400 mt-6 font-medium">
          <p>Created by Tiếng Anh An Khê with ❤️ for classroom teaching</p>
        </footer>

        {/* Modals rendered on Complete screen as well */}
        <CreateExerciseModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingPack(null);
          }}
          onSavePack={handleSavePack}
          editingPack={editingPack}
          onDeletePack={handleDeletePack}
        />
        <ExercisePackSelectorModal
          isOpen={isPackSelectorOpen}
          onClose={() => setIsPackSelectorOpen(false)}
          packs={allPacks}
          activePackId={activePackId}
          onSelectPack={handleSelectPack}
          onDeletePack={handleDeletePack}
          onOpenCreateModal={handleOpenCreateModal}
          onEditPack={handleOpenEditModal}
          voiceSettings={voiceSettings}
        />
      </div>
    );
  }

  const progressPercent = ((currentIdx) / currentQuestions.length) * 100;

  return (
    <div
      id="game-container"
      className="min-h-screen bg-[#f8fafc] py-5 px-3 sm:px-4 flex flex-col justify-between font-sans text-slate-800"
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-sm border-2 border-emerald-400 animate-bounce">
          <Check className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Card */}
      <header className="max-w-4xl mx-auto w-full mb-4">
        <div className="w-full bg-white border-4 border-[#e0f2fe] rounded-[24px] p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & School Branding */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-[#0ea5e9]" />
              <h1 className="text-xl sm:text-2xl font-black text-[#0369a1] tracking-tight leading-tight">
                Tiếng Anh An Khê
              </h1>
            </div>
            <div className="text-xs font-bold text-[#0ea5e9] uppercase tracking-wider">
              Arrange the Sentence • Xếp từ thành câu
            </div>
          </div>

          {/* Teacher Tool Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Topic Selector Button */}
            <button
              onClick={() => setIsPackSelectorOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title={`Chủ đề: ${currentPack.title} (Bấm để chọn bài tập)`}
            >
              <Layers className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-bold text-slate-800 text-left">
                {currentPack.title}
              </span>
              <span className="text-[10px] bg-sky-200 text-sky-900 px-1.5 py-0.5 rounded-md font-extrabold shrink-0">
                {currentQuestions.length} câu
              </span>
            </button>

            {/* Quick Edit Button if current pack is custom */}
            {currentPack.isCustom && (
              <button
                onClick={() => handleOpenEditModal(currentPack)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
                title={`Sửa bài tập: ${currentPack.title}`}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Sửa bài tập</span>
              </button>
            )}

            {/* Create Exercise Button */}
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-black transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Giáo viên nhập chủ đề và các câu để tạo bài tập mới"
            >
              <PlusCircle className="w-4 h-4 text-yellow-200" />
              <span>+ Tạo Bài Tập Mới</span>
            </button>

            {/* Audio Settings Button */}
            <button
              onClick={() => setIsAudioModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95 cursor-pointer"
              title="Cài đặt giọng đọc và tốc độ phát âm"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-600" />
              <span>{voiceSettings.rate}x</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Game Layout */}
      <main className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: Game Area */}
        <section className="lg:col-span-8 space-y-4">
          {/* Progress Indicator Card */}
          <div className="w-full bg-white rounded-[24px] border-4 border-[#bae6fd] p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold text-sky-800 shrink-0">
                Câu {currentIdx + 1}/{currentQuestions.length}
              </span>
              <span className="text-[11px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-bold border border-sky-100">
                {currentPack.title}
              </span>
            </div>

            <div className="flex-1 max-w-[120px] sm:max-w-xs bg-slate-100 h-3 rounded-full overflow-hidden relative">
              <div
                style={{ width: `${progressPercent}%` }}
                className="bg-gradient-to-r from-sky-400 to-[#0ea5e9] h-full rounded-full transition-all duration-500 ease-out"
              />
            </div>

            {correctStreak > 1 && (
              <div className="flex items-center gap-1 text-xs font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full animate-bounce">
                <Sparkles className="w-3.5 h-3.5 fill-rose-500" />
                Streak: {correctStreak}🔥
              </div>
            )}
          </div>

          {/* Floating Word Bank Container */}
          <FloatingWordBank
            availableWords={availableWords}
            onWordDropped={handleWordDropped}
            onWordClicked={handleWordClicked}
          />

          {/* Sentence Area Dropper */}
          {currentQuestion && (
            <SentenceArea
              ref={sentenceAreaRef}
              droppedWords={droppedWords}
              onWordReturned={handleWordReturned}
              isChecked={isChecked}
              isCorrect={isCorrect}
              correctSentence={currentQuestion.sentence}
              translation={currentQuestion.translation}
              hint={currentQuestion.hint}
              showHint={showHint}
              onToggleHint={() => setShowHint(!showHint)}
              onSpeak={speakCurrentSentence}
              isSpeaking={isSpeaking}
            />
          )}

          {/* Game Action Buttons Panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Left side actions */}
            <div className="flex items-center gap-2">
              <button
                disabled={droppedWords.length === 0 || isChecked}
                onClick={handleResetQuestion}
                className="flex items-center gap-1.5 px-4 py-3 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-extrabold text-xs sm:text-sm rounded-2xl border-2 border-slate-200 shadow-xs transition-all cursor-pointer active:scale-95"
                title="Làm lại câu này"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>Reset</span>
              </button>

              {/* Nghe câu hoàn chỉnh button (Always accessible) */}
              <div className="flex items-center bg-white border-2 border-sky-200 rounded-2xl p-0.5 shadow-xs">
                <button
                  onClick={speakCurrentSentence}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
                    isSpeaking
                      ? "bg-sky-500 text-white animate-pulse"
                      : "bg-sky-50 hover:bg-sky-100 text-sky-800"
                  }`}
                  title="Bấm để nghe đọc toàn bộ câu này với tốc độ đã chọn"
                >
                  <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-bounce" : ""}`} />
                  <span>{isSpeaking ? "Đang đọc..." : "Nghe câu"}</span>
                </button>

                <button
                  onClick={() => setIsAudioModalOpen(true)}
                  className="px-2 py-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors ml-0.5"
                  title="Chọn tốc độ & giọng đọc"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right side check/advance actions */}
            <div className="flex items-center gap-2">
              {!isChecked ? (
                <button
                  disabled={droppedWords.length === 0}
                  onClick={handleCheckAnswer}
                  className="flex items-center gap-2 px-6 sm:px-7 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xs border-b-4 border-indigo-800 transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Check (Kiểm tra)
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-6 sm:px-7 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xs border-b-4 border-emerald-700 transition-all cursor-pointer active:scale-95 animate-pulse"
                  >
                    Next (Tiếp tục)
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Scoreboard & Teacher Instructions */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Team Points Scoreboard */}
          <ScoreBoard
            score={teamScore}
            onChangeScore={setTeamScore}
            onResetScores={handleResetTeamScores}
          />

          {/* Teacher Guide Card */}
          <div className="w-full bg-white border-4 border-[#fed7aa] rounded-[24px] p-4 sm:p-5 shadow-xs text-xs space-y-3">
            <h4 className="font-extrabold text-amber-800 flex items-center gap-1.5 text-sm tracking-tight">
              <Award className="w-4 h-4 text-amber-600" />
              Teacher's Guide (Hướng dẫn giáo viên):
            </h4>
            <ul className="list-disc list-inside text-slate-600 space-y-1.5 ml-0.5 leading-relaxed">
              <li>
                Bấm <strong className="text-emerald-700 font-extrabold">+ Tạo Bài Tập Mới</strong> để nhập bất kỳ chủ đề và danh sách câu tiếng Anh nào của bài học.
              </li>
              <li>
                Bấm nút <strong className="text-sky-700 font-extrabold">🔊 Nghe câu</strong> để học sinh nghe phát âm cả câu.
              </li>
              <li>
                Bấm vào <strong className="text-indigo-600 font-extrabold">{voiceSettings.rate}x</strong> hoặc biểu tượng thanh trượt để chỉnh tốc độ đọc (chậm cho học sinh nhỏ) và đổi giọng đọc bản xứ.
              </li>
              <li>
                Cho hai đội <strong>Team 1🦁</strong> và <strong>Team 2🐼</strong> thi đua ghi điểm trực tiếp trên bảng điểm.
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 mt-6 py-2">
        <p className="flex items-center justify-center gap-1 font-medium">
          Tiếng Anh An Khê <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" /> Lesson Activity
        </p>
      </footer>

      {/* Teacher Modals */}
      <CreateExerciseModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPack(null);
        }}
        onSavePack={handleSavePack}
        editingPack={editingPack}
        onDeletePack={handleDeletePack}
      />

      <ExercisePackSelectorModal
        isOpen={isPackSelectorOpen}
        onClose={() => setIsPackSelectorOpen(false)}
        packs={allPacks}
        activePackId={activePackId}
        onSelectPack={handleSelectPack}
        onDeletePack={handleDeletePack}
        onOpenCreateModal={handleOpenCreateModal}
        onEditPack={handleOpenEditModal}
        voiceSettings={voiceSettings}
      />

      <AudioSettingsModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        settings={voiceSettings}
        onSaveSettings={handleSaveVoiceSettings}
        currentSentence={currentQuestion?.sentence}
      />
    </div>
  );
}
