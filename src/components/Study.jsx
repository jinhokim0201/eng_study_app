import React, { useState } from 'react';
import { calculateNextReview } from '../utils/srsAlgorithm';

const Study = ({ words, onUpdateWord, onComplete }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [masteredWords, setMasteredWords] = useState([]);
    const [troublesomeWords, setTroublesomeWords] = useState([]);

    if (words.length === 0) {
        return <div className="study-empty">현재 학습할 단어가 없습니다!</div>;
    }

    const currentWord = words[currentIndex];

    const handleRate = (isCorrect) => {
        // Track results locally for the session report
        if (isCorrect) {
            setMasteredWords(prev => [...prev, currentWord]);
        } else {
            setTroublesomeWords(prev => [...prev, currentWord]);
        }

        // SRS update
        const { level, nextReview } = calculateNextReview(currentWord.level, isCorrect);
        onUpdateWord(currentWord.id, { level, nextReview });

        if (currentIndex < words.length - 1) {
            // 먼저 카드를 뒤집고, 약간의 딜레이 후 다음 카드로 이동
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 150);
        } else {
            // Session Complete
            const finalMastered = isCorrect ? [...masteredWords, currentWord] : masteredWords;
            const finalTroublesome = !isCorrect ? [...troublesomeWords, currentWord] : troublesomeWords;
            onComplete(finalMastered, finalTroublesome);
        }
    };

    return (
        <div className="study-container">
            <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                <div className="card-front">
                    <h2>{currentWord.word}</h2>
                    <p className="tap-hint">(터치하여 뒤집기)</p>
                </div>
                <div className="card-back">
                    <h3>{currentWord.definition}</h3>
                    <p className="example">"{currentWord.example}"</p>
                    {currentWord.image && <img src={currentWord.image} alt={currentWord.word} />}
                </div>
            </div>

            {isFlipped && (
                <div className="controls">
                    <button className="btn-hard" onClick={(e) => { e.stopPropagation(); handleRate(false); }}>어려움 / 모름</button>
                    <button className="btn-easy" onClick={(e) => { e.stopPropagation(); handleRate(true); }}>쉬움 / 알아요</button>
                </div>
            )}

            <div className="progress" style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b' }}>
                {currentIndex + 1} / {words.length}
            </div>
        </div>
    );
};

export default Study;
