import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Study from './components/Study';
import Quiz from './components/Quiz';
import LevelMap from './components/LevelMap';
import LearningReport from './components/LearningReport';
import DiagnosticTest from './components/DiagnosticTest';
import { generateCurriculum } from './utils/curriculumGenerator';
import { generateWords } from './services/wordGenerationService';
import { safeLocalStorage } from './utils/storage';
import './components/LevelMap.css';
import './components/DiagnosticTest.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [levels, setLevels] = useState(() => {
    const saved = safeLocalStorage.getItem('vocaFlowLevels_v2');
    return saved ? JSON.parse(saved) : generateCurriculum();
  });
  const [currentLevelId, setCurrentLevelId] = useState(1);
  const [sessionData, setSessionData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [isGeneratingWords, setIsGeneratingWords] = useState(false);

  useEffect(() => {
    safeLocalStorage.setItem('vocaFlowLevels_v2', JSON.stringify(levels));
  }, [levels]);

  const handleStartLevel = (levelId) => {
    const level = levels.find(l => l.id === levelId);
    if (level.status === 'locked') {
      alert("이 레벨은 아직 잠겨있습니다. 이전 레벨을 먼저 완료해주세요!");
      return;
    }
    setCurrentLevelId(levelId);
    // Scroll to the session controls to make it obvious
    const controls = document.querySelector('.level-controls');
    if (controls) {
      controls.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const startSession = async (type, sessionIndex = 0) => {
    const level = levels.find(l => l.id === currentLevelId);
    if (!level) return;

    if (!level.sessions) {
      console.error("Invalid data structure: missing sessions");
      return;
    }

    const session = level.sessions[sessionIndex];
    let wordsToUse = session.words;

    // Always try to generate AI words (backend handles the key)
    setIsGeneratingWords(true);
    try {
      const avgDifficulty = session.words.reduce((sum, w) => sum + w.difficulty, 0) / session.words.length;
      const aiWords = await generateWords(Math.round(avgDifficulty), 20);
      wordsToUse = aiWords;
    } catch (error) {
      console.error('Failed to generate AI words, using static words:', error);
      // Fall back to static words
    } finally {
      setIsGeneratingWords(false);
    }

    setSessionData({
      type,
      words: wordsToUse,
      startTime: Date.now(),
      levelId: currentLevelId,
      sessionIndex: sessionIndex
    });
    setActiveTab(type);
    setReportData(null);
  };

  const handleDiagnosticComplete = (recommendedLevel) => {
    alert(`진단 결과, 추천 레벨은 ${recommendedLevel}입니다! 해당 레벨까지 잠금 해제됩니다.`);

    setLevels(prevLevels => prevLevels.map(l => {
      if (l.id <= recommendedLevel) {
        // Unlock the level AND its first session if it was locked
        const newSessions = [...l.sessions];
        if (newSessions.length > 0 && newSessions[0].status === 'locked') {
          newSessions[0] = { ...newSessions[0], status: 'unlocked' };
        }

        return {
          ...l,
          status: l.status === 'locked' ? 'unlocked' : l.status,
          sessions: newSessions
        };
      }
      return l;
    }));

    setCurrentLevelId(recommendedLevel);
    setActiveTab('dashboard');
  };

  const handleSessionComplete = (mastered, troublesome) => {
    // Handled in renderContent via props
  };

  const renderContent = () => {
    if (activeTab === 'diagnostic') {
      return <DiagnosticTest onComplete={handleDiagnosticComplete} />;
    }

    if (activeTab === 'report' && reportData) {
      return <LearningReport
        results={reportData}
        onRetry={() => startSession(reportData.mode, sessionData.sessionIndex)}
        onNext={() => {
          setActiveTab('dashboard');
          // Unlock next session logic could go here
          // For now, we just return to dashboard
        }}
      />;
    }

    switch (activeTab) {
      case 'dashboard':
        const currentLevel = levels.find(l => l.id === currentLevelId);
        return (
          <div className="dashboard-view">
            <div className="level-controls" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <button className="secondary-btn" onClick={() => setActiveTab('diagnostic')}>
                  📊 레벨 진단 평가 보기
                </button>
              </div>

              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                현재 레벨: {currentLevelId} ({currentLevel?.title})
              </h3>

              {/* Session Selector */}
              <div className="session-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxWidth: '500px', margin: '0 auto 1rem' }}>
                {currentLevel?.sessions?.map((session, idx) => (
                  <button
                    key={session.id}
                    className={`session-btn ${session.status}`}
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      background: session.status === 'locked' ? '#f1f5f9' : 'white',
                      cursor: session.status === 'locked' ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      color: session.status === 'locked' ? '#94a3b8' : '#334155'
                    }}
                    onClick={() => {
                      if (session.status !== 'locked') {
                        startSession('study', idx);
                      }
                    }}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>세션 번호를 클릭하여 학습을 시작하세요.</p>
            </div>
            <LevelMap
              levels={levels}
              currentLevel={currentLevelId}
              onSelectLevel={handleStartLevel}
            />
          </div>
        );
      case 'study':
        return <Study
          words={sessionData?.words || []}
          onUpdateWord={() => { }}
          onComplete={(mastered, troublesome) => {
            const timeSpent = Math.round((Date.now() - sessionData.startTime) / 1000);
            setReportData({
              score: mastered.length,
              total: sessionData.words.length,
              masteredWords: mastered,
              troublesomeWords: troublesome,
              timeSpent,
              mode: 'study'
            });

            // Unlock next session if passed (simple logic: unlock next index)
            if (mastered.length / sessionData.words.length >= 0.7) {
              setLevels(prevLevels => prevLevels.map(l => {
                if (l.id === currentLevelId) {
                  const newSessions = [...l.sessions];
                  // Mark current as completed
                  newSessions[sessionData.sessionIndex] = { ...newSessions[sessionData.sessionIndex], status: 'completed' };

                  // Unlock next session if exists
                  if (sessionData.sessionIndex + 1 < newSessions.length) {
                    newSessions[sessionData.sessionIndex + 1] = {
                      ...newSessions[sessionData.sessionIndex + 1],
                      status: 'unlocked'
                    };
                    return { ...l, sessions: newSessions };
                  } else {
                    // Last session completed! Unlock NEXT LEVEL
                    // We need to handle this outside the map or trigger another update
                    // For simplicity, we'll return the updated current level here, 
                    // and handle next level unlocking in a separate effect or just here if we had access to all levels easily
                    // But map only sees 'l'. We need to update the NEXT level 'l+1'.
                    // So we need to map over ALL levels.
                    return { ...l, status: 'completed', sessions: newSessions };
                  }
                }
                // Check if this is the NEXT level that needs unlocking
                if (l.id === currentLevelId + 1) {
                  // Check if previous level is done? 
                  // Actually, we can just check if we are currently finishing the last session of currentLevelId
                  // But inside this map callback we don't know the state of other levels easily without context.
                  // Better approach:
                  // If we are mapping the Next Level, and we know we just finished the Current Level...
                  // Let's do a second pass or use a more robust logic.
                  return l;
                }
                return l;
              }));

              // Separate pass for Next Level unlocking to avoid complexity in single map
              // If we finished the last session
              if (sessionData.sessionIndex === 9) { // 10 sessions (0-9)
                setLevels(prevLevels => prevLevels.map(l => {
                  if (l.id === currentLevelId + 1) {
                    const newSessions = [...l.sessions];
                    if (newSessions.length > 0) newSessions[0] = { ...newSessions[0], status: 'unlocked' };
                    return { ...l, status: 'unlocked', sessions: newSessions };
                  }
                  return l;
                }));
                alert("축하합니다! 다음 레벨이 잠금 해제되었습니다!");
              }
            }

            setSessionData(null);
            setActiveTab('report');
          }}
        />;
      case 'quiz':
        return <Quiz
          words={sessionData?.words || []}
          onComplete={(results) => {
            const timeSpent = Math.round((Date.now() - sessionData.startTime) / 1000);
            setReportData({
              ...results,
              timeSpent,
              mode: 'quiz'
            });
            setSessionData(null);
            setActiveTab('report');
          }}
        />;
      default:
        return <Dashboard words={[]} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {isGeneratingWords && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: 'white',
          fontSize: '1.2rem'
        }}>
          AI가 단어를 생성하는 중입니다...
        </div>
      )}
      {renderContent()}
    </Layout>
  );
}

export default App;
