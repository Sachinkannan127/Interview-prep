export const detectFillerWords = (text: string): number => {
  const fillerPatterns = /\b(um|uh|like|you know|actually|basically|literally|sort of|kind of)\b/gi;
  const matches = text.match(fillerPatterns);
  return matches ? matches.length : 0;
};

export const calculateWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

export const calculateSpeakingPace = (wordCount: number, durationSeconds: number): number => {
  if (durationSeconds === 0) return 0;
  return Math.round((wordCount / durationSeconds) * 60);
};

export const calculateConfidenceScore = (text: string, fillerCount: number, wordCount: number): number => {
  if (wordCount === 0) return 0;
  
  const fillerRatio = fillerCount / wordCount;
  const baseScore = Math.max(0, 100 - (fillerRatio * 200));
  
  const hasHedging = /\b(maybe|perhaps|possibly|might|could be)\b/gi.test(text);
  const penalty = hasHedging ? 10 : 0;
  
  return Math.max(0, Math.min(100, Math.round(baseScore - penalty)));
};

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
