import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Toast from './components/common/Toast';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toast />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
