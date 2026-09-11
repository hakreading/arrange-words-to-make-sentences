import React from "react";
import { ExercisePack, VoiceSettings } from "../types";
import { BookOpen, PlusCircle, Check, Trash2, X, Calendar, Layers, Download, Edit3 } from "lucide-react";
import { generateSingleHtmlFile } from "../utils/exportHtml";

interface ExercisePackSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  packs: ExercisePack[];
  activePackId: string;
  onSelectPack: (packId: string) => void;
  onDeletePack: (packId: string) => void;
  onOpenCreateModal: () => void;
  onEditPack?: (pack: ExercisePack) => void;
  voiceSettings?: VoiceSettings;
}

export const ExercisePackSelectorModal: React.FC<ExercisePackSelectorModalProps> = ({
  isOpen,
  onClose,
  packs,
  activePackId,
  onSelectPack,
  onDeletePack,
  onOpenCreateModal,
  onEditPack,
  voiceSettings = { rate: 0.85, voiceURI: "", pitch: 1.0 },
}) => {

  if (!isOpen) return null;

  const handleDownloadHtml = (pack: ExercisePack, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const htmlContent = generateSingleHtmlFile(pack, voiceSettings);
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Sanitize title for filename
      const safeName = pack.title.replace(/[^a-zA-Z0-9\s_-]/g, "").trim().replace(/\s+/g, "_") || "exercise";
      a.download = `${safeName}_sentence_scramble.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export HTML", err);
      alert("Không thể xuất file HTML: " + err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white border-4 border-sky-200 rounded-[28px] max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight">
                Thư Viện Bài Tập Đã Lưu
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Chọn chủ đề để luyện tập hoặc tải file HTML chạy offline
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

        {/* Action Button: Create New */}
        <div className="pt-4 pb-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            + Tạo Bài Tập Mới Cho Lớp Học
          </button>
        </div>

        {/* List of Packs */}
        <div className="py-2 space-y-2.5 overflow-y-auto flex-1 pr-1">
          {packs.map((pack) => {
            const isActive = pack.id === activePackId;
            return (
              <div
                key={pack.id}
                className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? "bg-sky-50/80 border-sky-400 shadow-sm ring-2 ring-sky-300/30"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm sm:text-base text-slate-800 break-words">
                      {pack.title}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-extrabold bg-sky-600 text-white px-2 py-0.5 rounded-full shrink-0">
                        Đang chọn
                      </span>
                    )}
                    {pack.isCustom && (
                      <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                        Tự tạo
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                    <span>{pack.questions.length} câu hỏi</span>
                    {pack.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(pack.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Download HTML Button */}
                  <button
                    onClick={(e) => handleDownloadHtml(pack, e)}
                    className="p-2 bg-white hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer"
                    title="Tải về file HTML đơn để chạy offline trên USB/máy tính lớp học"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {/* Edit Pack Button for custom packs */}
                  {pack.isCustom && onEditPack && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        onEditPack(pack);
                      }}
                      className="p-2 bg-white hover:bg-amber-50 text-slate-500 hover:text-amber-700 border border-slate-200 hover:border-amber-300 rounded-xl transition-all cursor-pointer"
                      title="Chỉnh sửa chủ đề hoặc các câu trong bài tập này"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {!isActive && (
                    <button
                      onClick={() => {
                        onSelectPack(pack.id);
                        onClose();
                      }}
                      className="px-3 py-2 bg-white hover:bg-sky-50 border border-slate-300 hover:border-sky-400 text-slate-700 hover:text-sky-700 font-bold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                      Chọn học
                    </button>
                  )}

                  {/* Delete Pack Button */}
                  {pack.isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          confirm(
                            `Bạn có chắc chắn muốn xóa bộ bài tập "${pack.title}" không?\n\nLưu ý: Toàn bộ câu hỏi trong bài này sẽ bị xóa vĩnh viễn và không thể hoàn tác.`
                          )
                        ) {
                          onDeletePack(pack.id);
                        }
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all cursor-pointer"
                      title="Xóa bộ bài tập này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 font-medium">
            💡 Bấm biểu tượng <strong>Tải xuống</strong> để xuất file HTML chạy không cần internet.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

