import React, { useState, useEffect } from "react";
import { Question, ExercisePack } from "../types";
import {
  Sparkles,
  BookOpen,
  PlusCircle,
  FileText,
  X,
  CheckCircle,
  HelpCircle,
  Eye,
  Trash2,
  Lightbulb,
  Edit3,
  AlertTriangle
} from "lucide-react";

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePack: (pack: ExercisePack) => void;
  editingPack?: ExercisePack | null;
  onDeletePack?: (packId: string) => void;
}

const SAMPLE_TOPICS = [
  {
    topic: "Animals at the Zoo (Động vật sở thú)",
    text: `The monkey is eating a yellow banana. - Con khỉ đang ăn quả chuối vàng.
The big lion is sleeping in the cave. - Chú sư tử lớn đang ngủ trong hang.
Two elephants are drinking water together. - Hai chú voi đang cùng nhau uống nước.
The cute panda is climbing a bamboo tree. - Chú gấu trúc dễ thương đang trèo cây tre.
Birds are singing happily in the trees. - Những chú chim đang hót vui vẻ trên cây.`
  },
  {
    topic: "My Daily Routine (Thói quen hàng ngày)",
    text: `I wake up at six o'clock every morning. - Tôi thức dậy lúc sáu giờ mỗi sáng.
She brushes her teeth after breakfast. - Cô ấy đánh răng sau bữa ăn sáng.
We walk to school with our friends. - Chúng tôi đi bộ đến trường cùng bạn bè.
He does his homework in the evening. - Cậu ấy làm bài tập về nhà vào buổi tối.
They play badminton in the schoolyard. - Họ chơi cầu lông ở sân trường.`
  },
  {
    topic: "At the Supermarket (Tại siêu thị)",
    text: `My mother is buying fresh apples and oranges. - Mẹ tôi đang mua táo và cam tươi.
The little boy is pushing a shopping cart. - Cậu bé đang đẩy chiếc xe đẩy hàng.
We are looking for delicious milk and bread. - Chúng tôi đang tìm sữa và bánh mì thơm ngon.
She is paying for the groceries at the counter. - Cô ấy đang thanh toán tiền hàng tại quầy.`
  }
];

export const CreateExerciseModal: React.FC<CreateExerciseModalProps> = ({
  isOpen,
  onClose,
  onSavePack,
  editingPack = null,
  onDeletePack,
}) => {
  const [topic, setTopic] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // Initialize or update fields when modal opens or editingPack changes
  useEffect(() => {
    if (isOpen) {
      if (editingPack) {
        setTopic(editingPack.title);
        const formatted = editingPack.questions
          .map((q) => {
            if (
              q.translation &&
              !q.translation.includes("Hãy sắp xếp các từ")
            ) {
              return `${q.sentence} - ${q.translation}`;
            }
            return q.sentence;
          })
          .join("\n");
        setInputText(formatted);
        setShowPreview(true);
        setErrorMsg("");
      } else {
        setTopic("");
        setInputText("");
        setShowPreview(false);
        setErrorMsg("");
      }
    }
  }, [isOpen, editingPack]);

  if (!isOpen) return null;

  // Helper to parse input text into questions
  const parseSentences = (rawText: string): Question[] => {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const questions: Question[] = [];

    lines.forEach((line, index) => {
      // Check if there is a translation separated by `-` or `|` or `//`
      let englishPart = line;
      let vietnamesePart = "";

      if (line.includes(" - ")) {
        const parts = line.split(" - ");
        englishPart = parts[0].trim();
        vietnamesePart = parts.slice(1).join(" - ").trim();
      } else if (line.includes(" | ")) {
        const parts = line.split(" | ");
        englishPart = parts[0].trim();
        vietnamesePart = parts.slice(1).join(" | ").trim();
      } else if (line.includes(" // ")) {
        const parts = line.split(" // ");
        englishPart = parts[0].trim();
        vietnamesePart = parts.slice(1).join(" // ").trim();
      }

      // Automatically strip leading numbers like "1. ", "2) ", "3- " if teacher pasted numbered list
      englishPart = englishPart
        .replace(/^\d+[\.\)\-]\s*/, "")
        .replace(/\s+/g, " ")
        .trim();

      if (!englishPart) return;

      // Extract words
      const words = englishPart.split(" ").filter((w) => w.length > 0);

      if (words.length >= 2) {
        questions.push({
          id: index + 1,
          sentence: englishPart,
          words,
          translation:
            vietnamesePart || "Hãy sắp xếp các từ để tạo thành câu hoàn chỉnh.",
          hint: `Gồm ${words.length} từ. Bắt đầu bằng chữ viết hoa.`,
        });
      }
    });

    return questions;
  };

  const parsedQuestions = parseSentences(inputText);

  const handleApplySample = (sampleIndex: number) => {
    const sample = SAMPLE_TOPICS[sampleIndex];
    setTopic(sample.topic);
    setInputText(sample.text);
    setErrorMsg("");
    setShowPreview(true);
  };

  const handleSave = () => {
    if (!topic.trim()) {
      setErrorMsg("Vui lòng nhập Chủ đề bài tập (ví dụ: Animals, Daily Routine...)");
      return;
    }

    if (parsedQuestions.length === 0) {
      setErrorMsg(
        "Vui lòng nhập ít nhất một câu tiếng Anh hợp lệ (tối thiểu 2 từ mỗi câu)."
      );
      return;
    }

    const packToSave: ExercisePack = {
      id: editingPack
        ? editingPack.id
        : `pack-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: topic.trim(),
      description: `Bộ bài tập tự tạo gồm ${parsedQuestions.length} câu`,
      createdAt: editingPack ? editingPack.createdAt || Date.now() : Date.now(),
      isCustom: true,
      questions: parsedQuestions,
    };

    onSavePack(packToSave);
    onClose();
  };

  const handleDeleteCurrent = () => {
    if (!editingPack || !onDeletePack) return;
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa bộ bài tập "${editingPack.title}" không?\n\nLưu ý: Dữ liệu bài tập này sẽ bị xóa và không thể khôi phục.`
      )
    ) {
      onDeletePack(editingPack.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border-4 border-emerald-200 rounded-[28px] max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                editingPack
                  ? "bg-amber-50 border-amber-200 text-amber-600"
                  : "bg-emerald-50 border-emerald-200 text-emerald-600"
              }`}
            >
              {editingPack ? (
                <Edit3 className="w-5 h-5" />
              ) : (
                <PlusCircle className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                {editingPack ? "Chỉnh Sửa Bài Tập Đã Tạo" : "Tạo Bài Tập Xếp Câu Mới"}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {editingPack
                  ? "Cập nhật câu hỏi, bản dịch hoặc bổ sung câu mới"
                  : "Dành cho Giáo viên • Tự động tách từ • Lưu lại dùng lâu dài"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-bold flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chủ đề */}
          <div>
            <label className="block text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-1.5">
              1. Chủ đề bài tập (Topic Title): <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Ví dụ: Unit 4 - My Favorite Pets, Action Verbs..."
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden transition-all"
            />
          </div>

          {/* Quick sample buttons (shown only when creating new) */}
          {!editingPack && (
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 mb-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Nạp mẫu câu nhanh cho giáo viên:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_TOPICS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplySample(idx)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
                  >
                    + {s.topic.split("(")[0].trim()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nhập các câu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider">
                2. Nhập các câu (Mỗi dòng 1 câu): <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold text-slate-400">
                Đã nhận diện:{" "}
                <strong className="text-emerald-600 font-extrabold">
                  {parsedQuestions.length} câu
                </strong>
              </span>
            </div>

            <textarea
              rows={7}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder={`Nhập mỗi dòng một câu tiếng Anh, có thể kèm nghĩa tiếng Việt sau dấu gạch ngang '-':\n\nThe rabbit is jumping in the garden. - Chú thỏ đang nhảy trong vườn.\nShe likes to read books. - Cô ấy thích đọc sách.\nWe are learning English today.`}
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl p-3.5 text-xs sm:text-sm font-mono text-slate-800 placeholder-slate-400 focus:outline-hidden transition-all resize-y"
            />

            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              💡 <em>Cách nhập:</em> Gõ câu tiếng Anh bình thường (hỗ trợ cả danh sách số 1, 2, 3...). Thêm <strong>" - Bản dịch"</strong> ở cuối câu để hiển thị nghĩa tiếng Việt cho học sinh.
            </div>
          </div>

          {/* Live Preview Toggle */}
          {parsedQuestions.length > 0 && (
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-500" />
                  Xem trước {parsedQuestions.length} câu sẽ tách thành từ xếp
                </span>
                <span className="text-indigo-600 underline">
                  {showPreview ? "Thu gọn" : "Mở rộng"}
                </span>
              </button>

              {showPreview && (
                <div className="p-3 bg-white space-y-2.5 max-h-48 overflow-y-auto border-t border-slate-100">
                  {parsedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                    >
                      <div className="font-bold text-slate-800">
                        {idx + 1}. {q.sentence}
                      </div>
                      {q.translation && (
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          👉 {q.translation}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.words.map((w, wIdx) => (
                          <span
                            key={wIdx}
                            className="bg-white border border-slate-300 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[10px]"
                          >
                            {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            {editingPack && onDeletePack ? (
              <button
                type="button"
                onClick={handleDeleteCurrent}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-all cursor-pointer"
                title="Xóa vĩnh viễn bài tập này"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bài này</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTopic("");
                  setInputText("");
                }}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Xóa trắng
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer ${
                editingPack
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {editingPack ? (
                <>
                  <CheckCircle className="w-4 h-4 text-amber-200" />
                  <span>Cập Nhật Thay Đổi</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Generate & Lưu bài tập</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

