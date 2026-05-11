import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { Navigate, useLocation } from 'react-router-dom';

export const Login: React.FC = () => {
    const { user, login, loading } = useAuth();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    if (user) {
        return <Navigate to={from} replace />;
    }

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_50%_120%,var(--accent-light)_0%,transparent_50%)]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="w-full max-w-sm space-y-8 text-center"
            >
                <div className="space-y-3">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto shadow-btn animate-pulse-ring">
                        <Dumbbell size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-text-primary">GYM LOGGER</h1>
                    <p className="text-text-secondary font-medium">Log your sets, track your progress.</p>
                </div>

                <div className="bg-bg-secondary border border-border-color p-8 rounded-3xl shadow-card-lg space-y-6">
                    <button
                        onClick={() => login()}
                        disabled={loading}
                        className="w-full flex items-center justify-center space-x-3 bg-text-primary text-bg-primary hover:bg-text-secondary py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
                    >
                        <GoogleIcon />
                        <span>Sign in with Google</span>
                    </button>
                    
                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">
                        Securely sync your workouts
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

const Dumbbell = ({ size, className }: { size: number; className?: string }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="m6.5 6.5 11 11" />
        <path d="m21 21-1-1" />
        <path d="m3 3 1 1" />
        <path d="m18 22 4-4" />
        <path d="m2 6 4-4" />
        <path d="m3 10 7-7" />
        <path d="m14 21 7-7" />
    </svg>
);

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        <path fill="none" d="M0 0h48v48H0z" />
    </svg>
);
