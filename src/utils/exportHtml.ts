import { ExercisePack, VoiceSettings } from "../types";

/**
 * Generates a self-contained, single-file HTML version of the sentence scramble game
 * that teachers can save, transfer via USB, and double-click to run on any computer offline.
 */
export function generateSingleHtmlFile(pack: ExercisePack, voiceSettings: VoiceSettings): string {
  const packJson = JSON.stringify(pack.questions);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiếng Anh An Khê - ${pack.title}</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style>
    @keyframes floatBob {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }
    .word-card {
      user-select: none;
      touch-action: none;
      cursor: grab;
      transition: transform 0.1s ease, box-shadow 0.15s ease;
    }
    .word-card:active {
      cursor: grabbing;
      transform: scale(1.05);
    }
    .notebook-paper {
      background-color: #f0fdf4;
      background-image: linear-gradient(#e0f2fe 1px, transparent 1px);
      background-size: 100% 28px;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 font-sans min-h-screen flex flex-col justify-between p-4">

  <!-- Header -->
  <header class="max-w-4xl mx-auto w-full mb-4">
    <div class="bg-white border-4 border-sky-100 rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black text-sky-800 tracking-tight flex items-center gap-2">
          🎓 Tiếng Anh An Khê
        </h1>
        <div class="text-xs font-bold text-sky-600 uppercase tracking-wide">
          Arrange the Sentence • ${pack.title}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button id="btnVoiceConfig" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer">
          🔊 Tốc độ: <span id="lblSpeed">${voiceSettings.rate}x</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Main Game Container -->
  <main class="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
    <section class="lg:col-span-8 space-y-4">
      
      <!-- Progress Bar -->
      <div class="bg-white rounded-2xl border-4 border-sky-200 p-4 flex items-center justify-between">
        <span class="text-sm font-extrabold text-sky-800" id="lblProgress">Câu 1 / ${pack.questions.length}</span>
        <div class="w-32 sm:w-48 bg-slate-100 h-3 rounded-full overflow-hidden">
          <div id="progressBar" class="bg-sky-500 h-full rounded-full transition-all duration-300" style="width: 0%"></div>
        </div>
      </div>

      <!-- Floating Word Bank -->
      <div class="bg-white rounded-3xl border-4 border-sky-100 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-black text-slate-700">🎈 Word Bank (Bấm từ để chọn vào câu):</span>
        </div>
        <div id="wordBank" class="relative w-full h-56 bg-sky-50/50 rounded-2xl border-2 border-dashed border-sky-200 overflow-hidden flex flex-wrap gap-2.5 p-4 items-center justify-center">
        </div>
      </div>

      <!-- Sentence Area -->
      <div class="bg-white rounded-3xl border-4 border-emerald-100 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-black text-emerald-800">✏️ Sentence Area (Khu vực câu):</span>
          <button id="btnListenTop" class="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-full border border-sky-200 cursor-pointer">
            🔊 Nghe câu mẫu
          </button>
        </div>
        <div id="sentenceDropZone" class="min-h-36 rounded-2xl border-2 border-emerald-300 notebook-paper p-4 flex flex-wrap gap-2.5 items-center">
        </div>
        <div id="resultBox" class="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl hidden">
          <div id="resultHeader" class="font-bold text-xs uppercase mb-1"></div>
          <div id="correctSentenceText" class="text-base font-extrabold text-indigo-900"></div>
          <div id="translationText" class="text-xs text-emerald-700 font-semibold mt-0.5"></div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between pt-2">
        <div class="flex items-center gap-2">
          <button id="btnReset" class="px-4 py-2.5 bg-white border-2 border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
            ↺ Reset
          </button>
          <button id="btnListen" class="px-4 py-2.5 bg-sky-50 border-2 border-sky-200 rounded-2xl font-bold text-xs text-sky-800 hover:bg-sky-100 cursor-pointer flex items-center gap-1.5">
            🔊 Nghe câu hoàn chỉnh
          </button>
        </div>
        <div>
          <button id="btnCheck" class="px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold text-sm border-b-4 border-indigo-800 cursor-pointer">
            Check (Kiểm tra)
          </button>
          <button id="btnNext" class="hidden px-7 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-extrabold text-sm border-b-4 border-emerald-700 cursor-pointer">
            Next (Tiếp tục) ➔
          </button>
        </div>
      </div>

    </section>

    <!-- Scoreboard -->
    <aside class="lg:col-span-4 space-y-4">
      <div class="bg-white rounded-3xl border-4 border-amber-200 p-5 shadow-sm">
        <h3 class="font-black text-amber-800 text-base mb-3 flex items-center gap-1.5">
          🏆 Bảng Điểm Thi Đua
        </h3>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="bg-rose-50 border-2 border-rose-200 rounded-2xl p-3 text-center">
            <div class="text-xs font-extrabold text-rose-700">Team 1 🦁</div>
            <div id="scoreT1" class="text-3xl font-black text-rose-600 my-1">0</div>
            <div class="flex justify-center gap-1 mt-2">
              <button onclick="changeScore(1, 1)" class="bg-white px-2 py-1 rounded-lg border border-rose-300 font-bold text-xs cursor-pointer">+1</button>
              <button onclick="changeScore(1, 5)" class="bg-white px-2 py-1 rounded-lg border border-rose-300 font-bold text-xs cursor-pointer">+5</button>
            </div>
          </div>
          <div class="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-3 text-center">
            <div class="text-xs font-extrabold text-indigo-700">Team 2 🐼</div>
            <div id="scoreT2" class="text-3xl font-black text-indigo-600 my-1">0</div>
            <div class="flex justify-center gap-1 mt-2">
              <button onclick="changeScore(2, 1)" class="bg-white px-2 py-1 rounded-lg border border-indigo-300 font-bold text-xs cursor-pointer">+1</button>
              <button onclick="changeScore(2, 5)" class="bg-white px-2 py-1 rounded-lg border border-indigo-300 font-bold text-xs cursor-pointer">+5</button>
            </div>
          </div>
        </div>
        <button onclick="resetScores()" class="w-full text-center text-xs text-slate-400 hover:text-rose-500 py-1 font-semibold cursor-pointer">
          Đặt lại điểm về 0
        </button>
      </div>
    </aside>
  </main>

  <script>
    const QUESTIONS = ${packJson};
    let currentIdx = 0;
    let availableWords = [];
    let droppedWords = [];
    let isChecked = false;
    let speechRate = ${voiceSettings.rate || 0.85};
    let t1Score = 0;
    let t2Score = 0;

    const COLORS = [
      'bg-amber-100 border-amber-300 text-amber-950',
      'bg-sky-100 border-sky-300 text-sky-950',
      'bg-rose-100 border-rose-300 text-rose-950',
      'bg-purple-100 border-purple-300 text-purple-950',
      'bg-emerald-100 border-emerald-300 text-emerald-950',
      'bg-orange-100 border-orange-300 text-orange-950',
    ];

    function changeScore(team, delta) {
      if (team === 1) t1Score = Math.max(0, t1Score + delta);
      if (team === 2) t2Score = Math.max(0, t2Score + delta);
      document.getElementById('scoreT1').innerText = t1Score;
      document.getElementById('scoreT2').innerText = t2Score;
    }

    function resetScores() {
      t1Score = 0; t2Score = 0;
      document.getElementById('scoreT1').innerText = 0;
      document.getElementById('scoreT2').innerText = 0;
    }

    function speakCurrent(text) {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      u.rate = speechRate;
      window.speechSynthesis.speak(u);
    }

    function initQuestion(idx) {
      if (idx >= QUESTIONS.length) {
        alert("Chúc mừng cả lớp đã hoàn thành tất cả các câu!");
        currentIdx = 0;
        initQuestion(0);
        return;
      }

      currentIdx = idx;
      const q = QUESTIONS[idx];
      isChecked = false;

      document.getElementById('lblProgress').innerText = 'Câu ' + (idx + 1) + ' / ' + QUESTIONS.length;
      document.getElementById('progressBar').style.width = ((idx) / QUESTIONS.length * 100) + '%';
      document.getElementById('resultBox').classList.add('hidden');
      document.getElementById('btnCheck').classList.remove('hidden');
      document.getElementById('btnNext').classList.add('hidden');

      // Scramble words
      const words = [...q.words].sort(() => Math.random() - 0.5);
      availableWords = words.map((w, i) => ({ id: 'w-' + i + '-' + Math.random(), text: w, color: COLORS[i % COLORS.length] }));
      droppedWords = [];

      renderBank();
      renderSentence();
    }

    function renderBank() {
      const bank = document.getElementById('wordBank');
      bank.innerHTML = '';
      availableWords.forEach(w => {
        const btn = document.createElement('button');
        btn.className = 'word-card px-3.5 py-2 rounded-xl border-2 font-bold text-sm shadow-xs whitespace-nowrap ' + w.color;
        btn.innerText = w.text;
        btn.onclick = () => {
          if (isChecked) return;
          droppedWords.push(w);
          availableWords = availableWords.filter(x => x.id !== w.id);
          renderBank();
          renderSentence();
        };
        bank.appendChild(btn);
      });
    }

    function renderSentence() {
      const zone = document.getElementById('sentenceDropZone');
      zone.innerHTML = '';
      if (droppedWords.length === 0) {
        zone.innerHTML = '<span class="text-xs text-slate-400 italic">Bấm vào các từ ở trên để xếp vào câu...</span>';
        return;
      }
      droppedWords.forEach(w => {
        const btn = document.createElement('button');
        btn.className = 'px-3.5 py-2 rounded-xl border-2 font-bold text-sm shadow-xs cursor-pointer whitespace-nowrap ' + w.color;
        btn.innerText = w.text;
        btn.onclick = () => {
          if (isChecked) return;
          availableWords.push(w);
          droppedWords = droppedWords.filter(x => x.id !== w.id);
          renderBank();
          renderSentence();
        };
        zone.appendChild(btn);
      });
    }

    document.getElementById('btnReset').onclick = () => initQuestion(currentIdx);

    document.getElementById('btnListen').onclick = () => speakCurrent(QUESTIONS[currentIdx].sentence);
    document.getElementById('btnListenTop').onclick = () => speakCurrent(QUESTIONS[currentIdx].sentence);

    document.getElementById('btnVoiceConfig').onclick = () => {
      const sp = prompt("Nhập tốc độ đọc mong muốn (Ví dụ: 0.75 cho chậm, 0.85 cho chuẩn, 1.0 cho bình thường):", speechRate);
      if (sp && !isNaN(parseFloat(sp))) {
        speechRate = parseFloat(sp);
        document.getElementById('lblSpeed').innerText = speechRate + 'x';
        speakCurrent("Speech speed set to " + speechRate);
      }
    };

    document.getElementById('btnCheck').onclick = () => {
      if (droppedWords.length === 0) return;
      isChecked = true;
      const q = QUESTIONS[currentIdx];
      const userText = droppedWords.map(w => w.text).join(' ').trim().toLowerCase().replace(/[.,!]/g, '');
      const correctText = q.sentence.trim().toLowerCase().replace(/[.,!]/g, '');
      const isCorrect = userText === correctText;

      const resBox = document.getElementById('resultBox');
      const resHeader = document.getElementById('resultHeader');
      resBox.classList.remove('hidden');

      if (isCorrect) {
        resHeader.innerText = '✓ Chính xác! (Correct)';
        resHeader.className = 'font-black text-xs uppercase text-emerald-700';
      } else {
        resHeader.innerText = '✗ Chưa đúng (Incorrect)';
        resHeader.className = 'font-black text-xs uppercase text-rose-700';
      }

      document.getElementById('correctSentenceText').innerText = q.sentence;
      document.getElementById('translationText').innerText = '🇻🇳 ' + q.translation;

      speakCurrent(q.sentence);

      document.getElementById('btnCheck').classList.add('hidden');
      document.getElementById('btnNext').classList.remove('hidden');
    };

    document.getElementById('btnNext').onclick = () => initQuestion(currentIdx + 1);

    // Start
    initQuestion(0);
  </script>
</body>
</html>`;
}
