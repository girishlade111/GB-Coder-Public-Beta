import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

/**
 * AppWrapper wraps the main App component with necessary providers.
 * This includes AuthProvider for Supabase authentication.
 */
const AppWrapper: React.FC = () => {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
};

export default AppWrapper;
