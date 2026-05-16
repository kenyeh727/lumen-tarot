import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginPage from '../components/LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { useAppStore } from '../store/useStore';

const LoginPageWrapper: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { language } = useAppStore();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const from = (location.state as any)?.from?.pathname || params.get('redirect_to');

        if (from && from !== '/login') {
            sessionStorage.setItem('auth_redirect_to', from);
        }

        if (user) {
            const savedRedirect = sessionStorage.getItem('auth_redirect_to');
            const finalRedirect = savedRedirect || '/';
            sessionStorage.removeItem('auth_redirect_to');
            navigate(finalRedirect, { replace: true });
        }
    }, [user, navigate, location]);

    return <LoginPage language={language} />;
};

export default LoginPageWrapper;
