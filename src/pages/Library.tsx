import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardLibrary from '../components/CardLibrary';
import { useAppStore } from '../store/useStore';

const LibraryPage: React.FC = () => {
    const navigate = useNavigate();
    const { language } = useAppStore();

    return <CardLibrary language={language} onBack={() => navigate('/')} />;
};

export default LibraryPage;
