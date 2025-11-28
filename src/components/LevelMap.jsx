import React from 'react';

const LevelMap = ({ levels, currentLevel, onSelectLevel }) => {
    return (
        <div className="level-map-container">
            <h2 className="map-title">학습 커리큘럼</h2>
            <div className="level-path">
                {levels.map((level, index) => {
                    const isUnlocked = level.status === 'unlocked' || level.status === 'completed';
                    const isCompleted = level.status === 'completed';
                    const isCurrent = level.id === currentLevel;

                    return (
                        <div
                            key={level.id}
                            className={`level-node ${level.status} ${isCurrent ? 'current' : ''}`}
                            onClick={() => isUnlocked ? onSelectLevel(level.id) : null}
                        >
                            <div className="node-circle">
                                {isCompleted ? '★' : level.id}
                            </div>
                            <div className="node-info">
                                <h3>{level.title}</h3>
                                <p>{level.description}</p>
                            </div>
                            {index < levels.length - 1 && <div className="path-line"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default LevelMap;
