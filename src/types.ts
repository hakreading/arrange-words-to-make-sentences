export interface Question {
  id: number;
  sentence: string;
  words: string[];
  translation: string;
  hint?: string;
}

export interface WordCard {
  id: string;
  text: string;
  color: string;
}

export interface TeamScore {
  team1: number;
  team2: number;
}

export interface ExercisePack {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  isCustom?: boolean;
  questions: Question[];
}

export interface VoiceSettings {
  rate: number; // 0.5 to 1.5
  voiceURI: string; // SpeechSynthesisVoice URI or name
  pitch: number; // default 1.0
}
