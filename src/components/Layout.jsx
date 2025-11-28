import React from 'react';

const Layout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="app-container">
            <header className="app-header">
                <h1>VocaFlow</h1>
                <nav>
                    <button
                        className={activeTab === 'dashboard' ? 'active' : ''}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        대시보드
                    </button>
                    <button
                        className={activeTab === 'study' ? 'active' : ''}
                        onClick={() => setActiveTab('study')}
                    >
                        학습하기
                    </button>
                    <button
                        className={activeTab === 'quiz' ? 'active' : ''}
                        onClick={() => setActiveTab('quiz')}
                    >
                        퀴즈
                    </button>
                </nav>
            </header>
            <main className="app-main">
                {children}
            </main>
        </div>
    );
};

export default Layout;
