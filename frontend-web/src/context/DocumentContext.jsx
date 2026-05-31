import React, { createContext, useContext, useState } from "react";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [analysis, setAnalysis] = useState(null);
  const [documentText, setDocumentText] = useState("");
  const [documentId, setDocumentId] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState("english");

  return (
    <DocumentContext.Provider
      value={{
        analysis,
        documentText,
        documentId,
        currentLanguage,
        setAnalysis,
        setDocumentText,
        setDocumentId,
        setCurrentLanguage,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
}
