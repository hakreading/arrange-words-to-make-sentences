import React from "react";
import { TeamScore } from "../types";
import { Trophy, Star, Shield, Plus, Minus, Users } from "lucide-react";

interface ScoreBoardProps {
  score: TeamScore;
  onChangeScore: (score: TeamScore) => void;
  onResetScores: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  onChangeScore,
  onResetScores,
}) => {
  const updateScore = (team: "team1" | "team2", amount: number) => {
    const newScore = { ...score };
    newScore[team] = Math.max(0, newScore[team] + amount);
    onChangeScore(newScore);
  };

  const team1Winning = score.team1 > score.team2;
  const team2Winning = score.team2 > score.team1;
  const isTie = score.team1 === score.team2 && score.team1 > 0;

  return (
    <div className="w-full bg-white border-4 border-[#ddd6fe] rounded-[24px] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-violet-100">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          <h3 className="font-extrabold text-[#7c3aed] text-sm sm:text-base tracking-tight">
            Classroom Teams (Bảng Điểm Nhóm)
          </h3>
        </div>
        <button
          onClick={onResetScores}
          className="text-xs font-bold px-2.5 py-1 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200"
          title="Reset both scores to 0"
        >
          Đặt lại điểm
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Team 1 Panel */}
        <div
          className={`relative rounded-2xl p-4 border-2 transition-all duration-300 ${
            team1Winning
              ? "bg-[#fff7ed] border-[#fdba74] shadow-sm scale-[1.02]"
              : "bg-slate-50/50 border-slate-100"
          }`}
        >
          {team1Winning && (
            <div className="absolute -top-3 -right-2 bg-rose-500 text-white rounded-full p-1 animate-bounce shadow-md">
              <Trophy className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xl">🦁</span>
              <span className="font-bold text-rose-700 text-sm sm:text-base">Team 1</span>
            </div>
            
            <div className="text-3xl sm:text-4xl font-black text-rose-600 font-mono my-1.5 select-none">
              {score.team1}
            </div>

            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => updateScore("team1", 1)}
                className="flex items-center justify-center w-7 h-7 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md font-bold text-sm transition-colors"
                title="+1 point"
              >
                +1
              </button>
              <button
                onClick={() => updateScore("team1", 5)}
                className="flex items-center justify-center w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-md font-bold text-xs transition-colors"
                title="+5 points"
              >
                +5
              </button>
              <button
                onClick={() => updateScore("team1", -1)}
                className="flex items-center justify-center w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-bold text-sm transition-colors"
                title="-1 point"
              >
                -1
              </button>
            </div>
          </div>
        </div>

        {/* Team 2 Panel */}
        <div
          className={`relative rounded-2xl p-4 border-2 transition-all duration-300 ${
            team2Winning
              ? "bg-[#faf5ff] border-[#d8b4fe] shadow-sm scale-[1.02]"
              : "bg-slate-50/50 border-slate-100"
          }`}
        >
          {team2Winning && (
            <div className="absolute -top-3 -right-2 bg-indigo-500 text-white rounded-full p-1 animate-bounce shadow-md">
              <Trophy className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xl">🐼</span>
              <span className="font-bold text-indigo-700 text-sm sm:text-base">Team 2</span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-indigo-600 font-mono my-1.5 select-none">
              {score.team2}
            </div>

            <div className="flex gap-1.5 mt-2">
              <button
                onClick={() => updateScore("team2", 1)}
                className="flex items-center justify-center w-7 h-7 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md font-bold text-sm transition-colors"
                title="+1 point"
              >
                +1
              </button>
              <button
                onClick={() => updateScore("team2", 5)}
                className="flex items-center justify-center w-7 h-7 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-bold text-xs transition-colors"
                title="+5 points"
              >
                +5
              </button>
              <button
                onClick={() => updateScore("team2", -1)}
                className="flex items-center justify-center w-7 h-7 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-bold text-sm transition-colors"
                title="-1 point"
              >
                -1
              </button>
            </div>
          </div>
        </div>
      </div>

      {isTie && (
        <div className="mt-3 text-center text-xs font-semibold text-violet-700 flex items-center justify-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
          Both teams are tied! Keep up the good work!
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};
