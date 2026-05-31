import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DocumentProvider } from "./context/DocumentContext";
import HomePage from "./pages/HomePage";
import ResultsPage from "./pages/ResultsPage";

function App() {
  return (
    <DocumentProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </Router>
    </DocumentProvider>
  );
}

export default App;
