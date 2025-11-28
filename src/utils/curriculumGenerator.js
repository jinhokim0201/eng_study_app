import initialWords from '../data/vocabulary.json';

// Helper to generate a large dataset based on the initial small set
export const generateCurriculum = () => {
    const levels = [];
    const totalLevels = 50;
    const sessionsPerLevel = 10;
    const wordsPerSession = 20;

    // Difficulty scaling: Level 1 starts at difficulty 1, Level 50 ends at difficulty 100
    // Each level spans a difficulty range of 2 (e.g., Level 1: 1-2, Level 50: 99-100)

    let globalWordIdCounter = 1;

    for (let i = 1; i <= totalLevels; i++) {
        const levelSessions = [];
        const levelBaseDifficulty = (i - 1) * 2 + 1; // Level 1 -> 1, Level 50 -> 99

        for (let s = 1; s <= sessionsPerLevel; s++) {
            const sessionWords = [];

            for (let w = 0; w < wordsPerSession; w++) {
                // Cycle through initial words to fill the slots but add variation
                const sourceWord = initialWords[(globalWordIdCounter - 1) % initialWords.length];

                // Calculate specific difficulty for this word
                // Add some random variation within the level's range
                const difficulty = Math.min(100, Math.max(1, Math.floor(levelBaseDifficulty + Math.random() * 5)));

                // Create a unique word instance
                // In a real app, 'word' would be unique. Here we append ID to make it distinct visually if needed,
                // or just keep the base word but track it as a distinct entity in the system.
                // User requested NO numbers in the display word.
                const wordText = sourceWord.word;

                sessionWords.push({
                    ...sourceWord,
                    id: `L${i}_S${s}_W${w}_${globalWordIdCounter}`, // Unique ID
                    word: wordText,
                    difficulty: difficulty,
                    level: 0, // SRS level starts at 0
                    nextReview: null
                });

                globalWordIdCounter++;
            }

            levelSessions.push({
                id: `L${i}_S${s}`,
                title: `Session ${s}`,
                words: sessionWords,
                status: (i === 1 && s === 1) ? 'unlocked' : 'locked'
            });
        }

        levels.push({
            id: i,
            title: `Level ${i}`,
            description: i <= 10 ? '초급 (Beginner)' : i <= 30 ? '중급 (Intermediate)' : '고급 (Advanced)',
            status: i === 1 ? 'unlocked' : 'locked',
            sessions: levelSessions
        });
    }

    return levels;
};
