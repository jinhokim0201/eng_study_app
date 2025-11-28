import React from 'react';
import './LearningReport.css';

const LearningReport = ({ results, onRetry, onNext }) => {
    const {
        score,
        total,
        timeSpent,
        masteredWords,
        troublesomeWords,
        mode // 'study' or 'quiz'
    } = results;

    const percentage = Math.round((score / total) * 100);
    const isPass = percentage >= 70;

    return (
        <div className="report-container">
            <h2 className="report-title">학습 결과 리포트</h2>

            <div className="score-section">
                <div className={`score-circle ${isPass ? 'pass' : 'fail'}`}>
                    <span className="score-number">{percentage}%</span>
                    <span className="score-label">정답률</span>
                </div>
                <div className="score-details">
                    <div className="detail-item">
                        <span className="label">총 문항</span>
                        <span className="value">{total}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">정답</span>
                        <span className="value">{score}</span>
                    </div>
                    <div className="detail-item">
                        <span className="label">소요 시간</span>
                        <span className="value">{timeSpent}초</span>
                    </div>
                </div>
            </div>

            <div className="words-analysis">
                <div className="analysis-column">
                    <h3 className="section-header success">암기한 단어 ({masteredWords.length})</h3>
                    <ul className="word-list">
                        {masteredWords.map(word => (
                            <li key={word.id} className="word-item success">
                                <span className="word-text">{word.word}</span>
                                <span className="word-meaning">{word.definition}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="analysis-column">
                    <h3 className="section-header danger">틀린 단어 ({troublesomeWords.length})</h3>
                    <ul className="word-list">
                        {troublesomeWords.map(word => (
                            <li key={word.id} className="word-item danger">
                                <span className="word-text">{word.word}</span>
                                <span className="word-meaning">{word.definition}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="report-actions">
                <button className="secondary-btn" onClick={onRetry}>다시 하기</button>
                <button className="primary-btn" onClick={onNext}>
                    {isPass ? '다음 단계로' : '메인으로'}
                </button>
            </div>
        </div>
    );
};

export default LearningReport;
