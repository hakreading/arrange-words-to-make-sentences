import React, { useState, useEffect } from "react";
import { VoiceSettings } from "../types";
import { getEnglishVoices, speakEnglishSentence, stopSpeaking } from "../sound";
import { Volume2, Sliders, Play, Square, X, Check, Globe } from "lucide-react";

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onSaveSettings: (newSettings: VoiceSettings) => void;
  currentSentence?: string;
}

const SPEED_PRESETS = [
  { label: "0.6x (Rất chậm)", value: 0.6 },
  { label: "0.75x (Chậm)", value: 0.75 },
  { label: "0.85x (Khuyên dùng)", value: 0.85 },
  { label: "1.0x (Bình thường)", value: 1.0 },
  { label: "1.2x (Nhanh)", value: 1.2 },
];

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  currentSentence = "Welcome to English class. Let's learn English together!",
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(settings.voiceURI || "");
  const [rate, setRate] = useState<number>(settings.rate || 0.85);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const loadVoices = () => {
      const v = getEnglishVoices();
      setVoices(v);
      if (!selectedVoiceURI && v.length > 0) {
        // Pick first US or GB voice
        const preferred = v.find(item => item.lang.includes("US") || item.lang.includes("GB")) || v[0];
        setSelectedVoiceURI(preferred.voiceURI || preferred.name);
      }
    };

    loadVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestVoice = () => {
    if (isPlaying) {
      stopSpeaking();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    speakEnglishSentence(currentSentence, {
      rate,
      voiceURI: selectedVoiceURI,
      onEnd: () => setIsPlaying(false),
    });
  };

  const handleSave = () => {
    stopSpeaking();
    onSaveSettings({
      rate,
      voiceURI: selectedVoiceURI,
      pitch: 1.0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border-4 border-indigo-200 rounded-[28px] max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">
                Cài đặt Giọng đọc & Tốc độ
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Tùy chỉnh phát âm câu chuẩn cho học sinh
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-5">
          {/* Tốc độ đọc */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Tốc độ đọc (Speech Speed):
              </label>
              <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {rate.toFixed(2)}x
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0.5"
              max="1.3"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />

            {/* Presets */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-2.5">
              {SPEED_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setRate(preset.value)}
                  className={`text-[11px] font-bold py-1.5 px-1 rounded-xl border text-center transition-all ${
                    Math.abs(rate - preset.value) < 0.03
                      ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn giọng đọc */}
          <div>
            <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Globe className="w-4 h-4 text-emerald-500" />
              Giọng phát âm tiếng Anh (Voice):
            </label>

            {voices.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl font-medium">
                Đang nạp giọng đọc từ trình duyệt... Nếu không thấy giọng, hãy đảm bảo thiết bị đã cài giọng đọc Speech Synthesis.
              </div>
            ) : (
              <select
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-hidden"
              >
                {voices.map((v) => (
                  <option key={v.voiceURI || v.name} value={v.voiceURI || v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            )}
            <p className="text-[11px] text-slate-400 mt-1.5">
              💡 Gợi ý: Chọn giọng <strong>en-US</strong> hoặc <strong>en-GB</strong> để học sinh nghe phát âm bản ngữ tự nhiên nhất.
            </p>
          </div>

          {/* Nghe thử */}
          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-sky-800 uppercase tracking-wider">
                Câu thử giọng:
              </div>
              <p className="text-xs font-semibold text-slate-700 break-words leading-relaxed italic">
                "{currentSentence}"
              </p>
            </div>
            <button
              onClick={handleTestVoice}
              type="button"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-extrabold text-xs transition-all shadow-xs shrink-0 ${
                isPlaying
                  ? "bg-rose-500 hover:bg-rose-600 text-white"
                  : "bg-sky-600 hover:bg-sky-700 text-white"
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  Dừng
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Nghe thử
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs sm:text-sm shadow-sm transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
