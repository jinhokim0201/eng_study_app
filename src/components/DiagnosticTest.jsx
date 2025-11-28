import React, { useState, useEffect } from 'react';
import './DiagnosticTest.css';
import { generateDiagnosticWords } from '../services/wordGenerationService';
import ApiKeySettings from './ApiKeySettings';

const DiagnosticTest = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [testWords, setTestWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApiSettings, setShowApiSettings] = useState(false);

    useEffect(() => {
        // Generate test words using AI
        loadDiagnosticWords();
    }, []);

    const loadDiagnosticWords = async () => {
        try {
            setLoading(true);
            setError(null);
            const words = await generateDiagnosticWords();
            setTestWords(words);
        } catch (err) {
            console.error('Failed to generate diagnostic words:', err);
            setError(err.message || '단어 생성에 실패했습니다. API 키를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (known) => {
        const newAnswers = [...answers, { word: testWords[step], known }];
        setAnswers(newAnswers);

        if (step < testWords.length - 1) {
            setStep(step + 1);
        } else {
            analyzeResult(newAnswers);
        }
    };

    const analyzeResult = (finalAnswers) => {
        // Simple logic: Find the highest difficulty word the user knew
        // Ideally, we'd use a more complex algorithm (e.g., finding the drop-off point)
        let maxDifficulty = 0;
        for (const ans of finalAnswers) {
            if (ans.known) {
                maxDifficulty = ans.word.difficulty;
            } else {
                // If they miss 3 in a row, we might stop (not implemented here for simplicity)
            }
        }

        // Map difficulty (1-100) to Level (1-50)
        // Level = Math.ceil(Difficulty / 2)
        const recommendedLevel = Math.max(1, Math.ceil(maxDifficulty / 2));
        onComplete(recommendedLevel);
    };

    if (loading) {
        return (
            <div className="diagnostic-container">
                <div className="diagnostic-card">
                    <div className="word-display">
                        <h3>진단평가 준비 중...</h3>
                        <p>AI가 난이도별 단어를 생성하고 있습니다.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <>
                {showApiSettings && (
                    <ApiKeySettings onClose={() => {
                        setShowApiSettings(false);
                        loadDiagnosticWords();
                    }} />
                )}
                <div className="diagnostic-container">
                    <div className="diagnostic-card">
                        <div className="word-display">
                            <h3>오류 발생</h3>
                            <p style={{ color: '#e74c3c' }}>{error}</p>
                            <button
                                className="btn-yes"
                                onClick={() => setShowApiSettings(true)}
                                style={{ marginTop: '20px' }}
                            >
                                🔑 API 키 설정
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (testWords.length === 0) return <div>Loading test...</div>;

    const currentWord = testWords[step];
    const progress = Math.round(((step + 1) / testWords.length) * 100);

    // Determine difficulty label
    const getDifficultyLabel = (difficulty) => {
        if (difficulty <= 30) return '초급';
        if (difficulty <= 70) return '중급';
        return '고급';
    };

    return (
        <div className="diagnostic-container">
            <div className="diagnostic-header">
                <h2>레벨 진단 평가</h2>
                <div className="progress-bar">
                    <div className="fill" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="diagnostic-card">
                <div className="word-display">
                    <h3>{currentWord.word}</h3>
                    <p className="difficulty-label">
                        난이도: {currentWord.difficulty} ({getDifficultyLabel(currentWord.difficulty)})
                    </p>
                </div>

                <div className="question-text">
                    이 단어의 뜻을 알고 계신가요?
                </div>

                <div className="actions">
                    <button className="btn-no" onClick={() => handleAnswer(false)}>
                        모릅니다
                    </button>
                    <button className="btn-yes" onClick={() => handleAnswer(true)}>
                        압니다
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticTest;
