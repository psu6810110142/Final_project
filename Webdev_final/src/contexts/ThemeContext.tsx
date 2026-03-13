import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
type Theme = 'home' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'home',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('home');

  const toggleTheme = () =>
    setTheme(prev => (prev === 'home' ? 'ocean' : 'home'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);