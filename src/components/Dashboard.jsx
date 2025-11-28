import React from 'react';
import { getDueWords } from '../utils/srsAlgorithm';

const Dashboard = ({ words, onStartStudy }) => {
    const dueWords = getDueWords(words);
    const learnedWords = words.filter(w => w.level > 0).length;

    return (
        <div className="dashboard">
            <div className="stats-container">
                <div className="stat-card">
                    <h2>{dueWords.length}</h2>
                    <p>복습할 단어</p>
                </div>
                <div className="stat-card">
                    <h2>{learnedWords}</h2>
                    <p>암기한 단어</p>
                </div>
                <div className="stat-card">
                    <h2>{words.length}</h2>
                    <p>전체 단어</p>
                </div>
            </div>

            <div className="action-area">
                {dueWords.length > 0 ? (
                    <button className="primary-btn" onClick={onStartStudy}>
                        복습 시작하기
                    </button>
                ) : (
                    <div className="all-caught-up">
                        <h3>모든 학습을 완료했습니다!</h3>
                        <p>훌륭합니다. 나중에 다시 복습하러 오세요.</p>
                        <button className="secondary-btn" onClick={onStartStudy}>
                            전체 복습하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
