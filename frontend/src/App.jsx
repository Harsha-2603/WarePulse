import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AppContextProvider } from './contexts';

function App() {
  return (
    <AppContextProvider>
      <div className="min-h-screen bg-slate-50">
        <AppRoutes />
      </div>
    </AppContextProvider>
  );
}

export default App;
