import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [analysis, setAnalysis] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [generatedDoc, setGeneratedDoc] = useState(null);

  return (
    <AppContext.Provider value={{
      analysis, setAnalysis,
      currentLanguage, setCurrentLanguage,
      generatedDoc, setGeneratedDoc,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
