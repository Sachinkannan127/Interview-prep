// Score range configuration and utilities

export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  color: string;
  bgColor: string;
  description: string;
}

export const DEFAULT_SCORE_RANGES: ScoreRange[] = [
  {
    min: 90,
    max: 100,
    label: 'Excellent',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    description: 'Outstanding performance! You demonstrated exceptional knowledge and skills.'
  },
  {
    min: 75,
    max: 89,
    label: 'Good',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    description: 'Great job! You have a strong understanding with minor areas for improvement.'
  },
  {
    min: 60,
    max: 74,
    label: 'Fair',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    description: 'Decent effort. Focus on strengthening key concepts and practice more.'
  },
  {
    min: 0,
    max: 59,
    label: 'Needs Improvement',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    description: 'More preparation needed. Review fundamentals and practice extensively.'
  }
];

/**
 * Get score range for a given score
 */
export function getScoreRange(score: number, ranges: ScoreRange[] = DEFAULT_SCORE_RANGES): ScoreRange {
  const range = ranges.find(r => score >= r.min && score <= r.max);
  return range || ranges[ranges.length - 1]; // Return lowest range if not found
}

/**
 * Get color classes for a score
 */
export function getScoreColor(score: number, ranges: ScoreRange[] = DEFAULT_SCORE_RANGES): {
  text: string;
  bg: string;
} {
  const range = getScoreRange(score, ranges);
  return {
    text: range.color,
    bg: range.bgColor
  };
}

/**
 * Get label for a score
 */
export function getScoreLabel(score: number, ranges: ScoreRange[] = DEFAULT_SCORE_RANGES): string {
  return getScoreRange(score, ranges).label;
}

/**
 * Get description for a score
 */
export function getScoreDescription(score: number, ranges: ScoreRange[] = DEFAULT_SCORE_RANGES): string {
  return getScoreRange(score, ranges).description;
}

/**
 * Get badge color based on score (legacy compatibility)
 */
export function getScoreBadgeColor(score: number): string {
  if (score >= 90) return 'bg-green-100 text-green-700';
  if (score >= 75) return 'bg-blue-100 text-blue-700';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

/**
 * Format score display
 */
export function formatScore(score: number | undefined | null, showLabel: boolean = false): string {
  if (score === undefined || score === null) return 'N/A';
  const scoreValue = Math.round(score);
  if (showLabel) {
    return `${scoreValue}/100 (${getScoreLabel(scoreValue)})`;
  }
  return `${scoreValue}/100`;
}

/**
 * Get overall performance rating
 */
export function getOverallRating(averageScore: number): {
  rating: string;
  emoji: string;
  message: string;
} {
  if (averageScore >= 90) {
    return {
      rating: 'Excellent',
      emoji: '🌟',
      message: 'Outstanding! You are well-prepared for your interviews!'
    };
  } else if (averageScore >= 75) {
    return {
      rating: 'Good',
      emoji: '👍',
      message: 'Great work! A bit more practice and you will be perfect!'
    };
  } else if (averageScore >= 60) {
    return {
      rating: 'Fair',
      emoji: '📚',
      message: 'Good effort! Keep practicing to improve your performance.'
    };
  } else {
    return {
      rating: 'Needs Improvement',
      emoji: '💪',
      message: 'Keep going! More practice will help you succeed.'
    };
  }
}

/**
 * Validate custom score ranges
 */
export function validateScoreRanges(ranges: ScoreRange[]): boolean {
  if (ranges.length === 0) return false;
  
  // Check for gaps and overlaps
  const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
  
  for (let i = 0; i < sortedRanges.length - 1; i++) {
    const current = sortedRanges[i];
    const next = sortedRanges[i + 1];
    
    // Check for overlap
    if (current.max >= next.min) return false;
    
    // Check for gaps
    if (current.max + 1 !== next.min) return false;
  }
  
  // Check if ranges cover 0-100
  if (sortedRanges[0].min !== 0) return false;
  if (sortedRanges[sortedRanges.length - 1].max !== 100) return false;
  
  return true;
}
