import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title="สลับธีม"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        width: '54px',
        height: '54px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.6rem',
        boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
        background: theme === 'home'
          ? 'linear-gradient(135deg, #1565c0, #42a5f5)'  // ocean preview
          : 'linear-gradient(135deg, #ff9800, #ffd54f)', // home preview
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {theme === 'home' ? '🌊' : '🏠'}
    </button>
  );
}