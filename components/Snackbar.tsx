import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type SnackbarType = 'success' | 'error' | 'info' | 'warning';

interface SnackbarMessage {
    id: string;
    message: string;
    type: SnackbarType;
}

interface SnackbarContextType {
    showSnackbar: (message: string, type: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

interface SnackbarProviderProps {
    children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [snackbars, setSnackbars] = useState<SnackbarMessage[]>([]);

    const showSnackbar = useCallback((message: string, type: SnackbarType) => {
        const id = Date.now().toString();
        setSnackbars((prev) => [...prev, { id, message, type }]);

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
        }, 4000);
    }, []);

    const removeSnackbar = (id: string) => {
        setSnackbars((prev) => prev.filter((snackbar) => snackbar.id !== id));
    };

    return (
        <SnackbarContext.Provider value={{ showSnackbar }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
                <AnimatePresence>
                    {snackbars.map((snackbar) => (
                        <SnackbarItem key={snackbar.id} snackbar={snackbar} onClose={() => removeSnackbar(snackbar.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </SnackbarContext.Provider>
    );
};

const SnackbarItem: React.FC<{ snackbar: SnackbarMessage; onClose: () => void }> = ({ snackbar, onClose }) => {
    const getStyles = (type: SnackbarType) => {
        switch (type) {
            case 'success':
                return 'bg-[#2ECC71] text-white shadow-[#2ECC71]/30'; // Bright Green
            case 'error':
                return 'bg-[#FF3B30] text-white shadow-[#FF3B30]/30'; // Bright Red
            case 'info':
                // Info Pink and Green as requested
                return 'bg-gradient-to-r from-rosePink to-[#2ECC71] text-white shadow-rosePink/30';
            case 'warning':
                return 'bg-[#FFCC00] text-black shadow-[#FFCC00]/30';
            default:
                return 'bg-[#1A1A1A] text-white';
        }
    };

    const getIcon = (type: SnackbarType) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />;
            case 'error': return <AlertCircle className="w-5 h-5" />;
            case 'info': return <Info className="w-5 h-5" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`pointer-events-auto min-w-[300px] max-w-sm p-4 rounded-2xl shadow-xl backdrop-blur-md flex items-center justify-between gap-4 ${getStyles(snackbar.type)}`}
        >
            <div className="flex items-center gap-3">
                {getIcon(snackbar.type)}
                <span className="font-bold text-sm leading-snug">{snackbar.message}</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full transition-colors">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export default SnackbarProvider;
