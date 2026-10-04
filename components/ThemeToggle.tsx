
import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeToggleProps {
  mode: ThemeMode;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ mode, onToggle }) => {
  const getIcon = () => {
    switch (mode) {
      case ThemeMode.LIGHT: return <Sun className="w-5 h-5" />;
      case ThemeMode.DARK: return <Moon className="w-5 h-5" />;
      case ThemeMode.SYSTEM: return <Monitor className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (mode) {
      case ThemeMode.LIGHT: return "Light Mode";
      case ThemeMode.DARK: return "Dark Mode";
      case ThemeMode.SYSTEM: return "System Theme";
    }
  };

  return (
    <button
      onClick={onToggle}
      className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-[#F8F9FA] dark:bg-[#1A1A1A] border border-[#E9ECEF] dark:border-[#2D2D2D] text-[#6C757D] hover:text-rosePink transition-all duration-300"
      title={getLabel()}
    >
      <span className="transition-transform duration-500 group-hover:rotate-12">
        {getIcon()}
      </span>
      {/* Visual tool tip could be added here if needed, or rely on browser title */}
    </button>
  );
};

export default ThemeToggle;
