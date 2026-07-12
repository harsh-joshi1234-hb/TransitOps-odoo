import React, { createContext, useState } from 'react';
export const ThemeContext = createContext();
export const ThemeProvider = ({ children }) => { const [isDark, setIsDark] = useState(false); return <ThemeContext.Provider value={{isDark, setIsDark}}><div className={isDark ? 'dark' : ''}>{children}</div></ThemeContext.Provider>; };
