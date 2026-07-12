import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#1e1e30',
          color: '#e0e0e0',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          fontSize: '0.875rem',
        },
        success: {
          iconTheme: {
            primary: '#2ecc71',
            secondary: '#1e1e30',
          },
        },
        error: {
          iconTheme: {
            primary: '#e74c3c',
            secondary: '#1e1e30',
          },
        },
      }}
    />
  );
}
