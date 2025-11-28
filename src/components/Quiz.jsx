import React, { useState } from 'react';

const Quiz = ({ words, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [masteredWords, setMasteredWords] = useState([]);
    const [troublesomeWords, setTroublesomeWords] = useState([]);

    if (words.length < 4) {
        return <div>퀴즈를 진행하기 위한 단어가 부족합니다! (최소 4개)</div>;
    }

    const currentWord = words[currentIndex];

    return (
        <div className="quiz-container">
            <QuizCard
                key={currentIndex}
                word={currentWord}
                allWords={words}
                onAnswer={(option) => {
                    const isCorrect = option.id === currentWord.id;
                    const newScore = isCorrect ? score + 1 : score;

                    if (isCorrect) {
                        setScore(newScore);
                        setMasteredWords(prev => [...prev, currentWord]);
                    } else {
                        setTroublesomeWords(prev => [...prev, currentWord]);
                    }

                    setTimeout(() => {
                        if (currentIndex < words.length - 1) {
                            setCurrentIndex(currentIndex + 1);
                        } else {
                            // Quiz Complete
                            const finalMastered = isCorrect ? [...masteredWords, currentWord] : masteredWords;
                            const finalTroublesome = !isCorrect ? [...troublesomeWords, currentWord] : troublesomeWords;
                            onComplete({
                                score: newScore,
                                total: words.length,
                                masteredWords: finalMastered,
                                troublesomeWords: finalTroublesome
                            });
                        }
                    }, 1000);
                }}
            />
            <div className="progress">문제 {currentIndex + 1} / {words.length}</div>
        </div>
    );
};

const QuizCard = ({ word, allWords, onAnswer }) => {
    const [selected, setSelected] = useState(null);

    // Generate options once per card
    const options = React.useMemo(() => {
        const opts = [word];
        while (opts.length < 4) {
            const random = allWords[Math.floor(Math.random() * allWords.length)];
            if (!opts.find(o => o.id === random.id)) {
                opts.push(random);
            }
        }
        return opts.sort(() => Math.random() - 0.5);
    }, [word, allWords]);

    const handleClick = (option) => {
        if (selected) return; // Prevent multiple clicks
        setSelected(option);
        onAnswer(option);
    };

    return (
        <div className="quiz-card">
            <h2>"{word.word}"의 뜻은 무엇인가요?</h2>
            <div className="options">
                {options.map(opt => (
                    <button
                        key={opt.id}
                        className={`option-btn ${selected ? (opt.id === word.id ? 'correct' : (selected.id === opt.id ? 'wrong' : '')) : ''}`}
                        onClick={() => handleClick(opt)}
                    >
                        {opt.definition}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Quiz;
