// Content moderation filter for offensive language
const offensiveWords = [
  // Common profanity
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap',
  // Slurs and hate speech
  'nigger', 'nigga', 'faggot', 'retard', 'retarded',
  // Sexual content
  'sex', 'porn', 'xxx', 'nude', 'naked',
  // Violence
  'kill', 'murder', 'die', 'suicide', 'bomb', 'terrorist',
  // Add more as needed
];

// Variations to catch attempts to bypass filter
const variations: Record<string, string[]> = {
  'fuck': ['f*ck', 'fck', 'fuk', 'f u c k', 'f.u.c.k'],
  'shit': ['sh*t', 'sht', 'sh1t', 's h i t'],
  'bitch': ['b*tch', 'btch', 'b1tch'],
  // Add more variations as needed
};

export interface FilterResult {
  isClean: boolean;
  flaggedWords: string[];
  filteredText: string;
}

export function filterOffensiveContent(text: string): FilterResult {
  const lowerText = text.toLowerCase();
  const flaggedWords: string[] = [];
  let filteredText = text;

  // Check for offensive words
  offensiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(lowerText)) {
      flaggedWords.push(word);
      filteredText = filteredText.replace(regex, '***');
    }

    // Check variations
    if (variations[word]) {
      variations[word].forEach(variant => {
        const variantRegex = new RegExp(variant.replace(/\s/g, '\\s*'), 'gi');
        if (variantRegex.test(lowerText)) {
          flaggedWords.push(word);
          filteredText = filteredText.replace(variantRegex, '***');
        }
      });
    }
  });

  return {
    isClean: flaggedWords.length === 0,
    flaggedWords,
    filteredText
  };
}

export function containsOffensiveContent(text: string): boolean {
  return !filterOffensiveContent(text).isClean;
}
