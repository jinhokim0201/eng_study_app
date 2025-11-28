import React, { useState, useEffect } from 'react';
import { validateAPIKey, initializeAPI } from '../services/wordGenerationService';
import './ApiKeySettings.css';

const ApiKeySettings = ({ onClose }) => {
    const [apiKey, setApiKey] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            setApiKey(savedKey);
        }
    }, []);

    const handleSave = async () => {
        if (!apiKey.trim()) {
            setError('API 키를 입력해주세요.');
            return;
        }

        setIsValidating(true);
        setError('');
        setSuccess(false);

        try {
            const isValid = await validateAPIKey(apiKey);
            if (isValid) {
                localStorage.setItem('gemini_api_key', apiKey);
                initializeAPI(apiKey);
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setError('유효하지 않은 API 키입니다. 다시 확인해주세요.');
            }
        } catch (err) {
            setError('API 키 검증 중 오류가 발생했습니다.');
        } finally {
            setIsValidating(false);
        }
    };

    const handleClear = () => {
        localStorage.removeItem('gemini_api_key');
        setApiKey('');
        setSuccess(false);
        setError('');
    };

    return (
        <div className="api-settings-overlay" onClick={onClose}>
            <div className="api-settings-modal" onClick={(e) => e.stopPropagation()}>
                <h2>🔑 Gemini API 키 설정</h2>

                <div className="api-info">
                    <p>무료 API 키 발급: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a></p>
                    <p className="api-limit">무료 한도: 분당 15 요청, 일일 1,500 요청</p>
                </div>

                <div className="api-input-group">
                    <label>API 키</label>
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIza..."
                        disabled={isValidating}
                    />
                </div>

                {error && <div className="api-error">{error}</div>}
                {success && <div className="api-success">✓ API 키가 저장되었습니다!</div>}

                <div className="api-actions">
                    <button onClick={handleClear} className="btn-secondary" disabled={isValidating}>
                        초기화
                    </button>
                    <button onClick={handleSave} className="btn-primary" disabled={isValidating}>
                        {isValidating ? '검증 중...' : '저장'}
                    </button>
                </div>

                <button className="close-btn" onClick={onClose}>✕</button>
            </div>
        </div>
    );
};

export default ApiKeySettings;
