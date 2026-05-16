import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeckSelector from '../components/DeckSelector';
import { useAppStore } from '../store/useStore';
import { DeckType } from '../types';

const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const { language, setDeckType, resetReadingState, setTargetCardCount } = useAppStore();

    const handleDeckSelect = (selectedMode: DeckType) => {
        setDeckType(selectedMode);
        resetReadingState();
        if (selectedMode === DeckType.LENORMAND) {
            setTargetCardCount(3);
        } else {
            setTargetCardCount(1);
        }
        navigate(`/inquiry/${selectedMode}`);
    };

    return <DeckSelector language={language} onSelect={handleDeckSelect} />;
};

export default Lobby;
