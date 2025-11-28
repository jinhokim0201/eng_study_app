// Service to generate words using the backend API (Vercel Function)

export const initializeAPI = () => {
    // No initialization needed for backend proxy
    return true;
};

export const validateAPIKey = async (apiKey) => {
    // Validation is now handled by the backend
    return true;
};

const callBackendAPI = async (prompt) => {
    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        console.error('Backend API call failed:', error);
        throw error;
    }
};

export const generateWords = async (difficulty, count = 20) => {
    const difficultyLevel = difficulty <= 20 ? 'beginner' : difficulty <= 60 ? 'intermediate' : 'advanced';

    // Get previously used words from localStorage
    const usedWordsJson = localStorage.getItem('vocaflow_used_words');
    const usedWords = usedWordsJson ? JSON.parse(usedWordsJson) : [];

    const excludeList = usedWords.length > 0
        ? `\n\nIMPORTANT: Do NOT include any of these words that have already been used:\n${usedWords.join(', ')}`
        : '';

    const prompt = `Generate exactly ${count} English vocabulary words for ${difficultyLevel} level learners (difficulty ${difficulty}/100).

Requirements:
- Return ONLY valid JSON array, no markdown formatting
- Each word must be unique and appropriate for the difficulty level
- Include: word (string), definition (Korean translation), example (English sentence), difficulty (number 1-100)${excludeList}

Format:
[
  {
    "word": "example",
    "definition": "예시, 본보기",
    "example": "This is an example sentence.",
    "difficulty": ${difficulty}
  }
]

Generate ${count} words now:`;

    try {
        const text = await callBackendAPI(prompt);

        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const words = JSON.parse(jsonText);

        // Track new words
        const newWords = words.map(w => w.word.toLowerCase());
        const updatedUsedWords = [...new Set([...usedWords, ...newWords])]; // Remove duplicates
        localStorage.setItem('vocaflow_used_words', JSON.stringify(updatedUsedWords));

        console.log(`Generated ${words.length} new words. Total unique words used: ${updatedUsedWords.length}`);

        // Validate and add IDs
        return words.map((word, index) => ({
            id: `ai_${Date.now()}_${index}`,
            word: word.word,
            definition: word.definition,
            example: word.example || `Example sentence with ${word.word}.`,
            difficulty: word.difficulty || difficulty,
            level: 0,
            nextReview: null
        }));
    } catch (error) {
        console.error('Error generating words:', error);
        throw new Error('단어 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
};

// Generate diagnostic test words with varying difficulty levels
export const generateDiagnosticWords = async () => {
    const prompt = `Generate exactly 20 English vocabulary words for a diagnostic test with varying difficulty levels.

Requirements:
- Return ONLY valid JSON array, no markdown formatting
- Words should range from very easy (difficulty 5) to very difficult (difficulty 100)
- Generate words at these specific difficulty levels: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100
- Each word MUST match its difficulty level:
  * Difficulty 5-20: Very basic words (e.g., cat, dog, run, happy)
  * Difficulty 25-40: Common everyday words (e.g., beautiful, important, understand)
  * Difficulty 45-60: Intermediate words (e.g., accomplish, significant, demonstrate)
  * Difficulty 65-80: Advanced words (e.g., meticulous, eloquent, paradigm)
  * Difficulty 85-100: Very difficult/academic words (e.g., ubiquitous, ephemeral, juxtaposition)
- Include: word (string), definition (Korean translation), example (English sentence), difficulty (number)

Format:
[
  {
    "word": "cat",
    "definition": "고양이",
    "example": "The cat is sleeping.",
    "difficulty": 5
  },
  {
    "word": "ubiquitous",
    "definition": "어디에나 있는, 편재하는",
    "example": "Smartphones have become ubiquitous in modern society.",
    "difficulty": 100
  }
]

Generate 20 words now with appropriate difficulty matching:`;

    try {
        const text = await callBackendAPI(prompt);

        // Remove markdown code blocks if present
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const words = JSON.parse(jsonText);

        console.log(`Generated ${words.length} diagnostic test words`);

        // Validate and add IDs
        return words.map((word, index) => ({
            id: `diagnostic_${Date.now()}_${index}`,
            word: word.word,
            definition: word.definition,
            example: word.example || `Example sentence with ${word.word}.`,
            difficulty: word.difficulty || (index + 1) * 5,
            level: 0,
            nextReview: null
        }));
    } catch (error) {
        console.error('Error generating diagnostic words:', error);
        throw new Error('진단평가 단어 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
};
