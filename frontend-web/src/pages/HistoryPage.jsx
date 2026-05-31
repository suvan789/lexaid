import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import HistoryList from "../components/HistoryList";
import { useDocument } from "../context/DocumentContext";

function HistoryPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setAnalysis, setDocumentText, setDocumentId } = useDocument();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/api/documents/history");
      setDocuments(res.data);
    } catch (err) {
      setError("Failed to load history.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/api/documents/${id}`);
      const { document_text, document_id, ...analysisData } = res.data;
      setAnalysis(analysisData);
      setDocumentText(document_text);
      setDocumentId(document_id);
      navigate("/results");
    } catch (err) {
      alert("Failed to load document analysis.");
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <Navbar />
      <div className="h-16"></div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-navy tracking-tight">My Documents</h1>
          <p className="text-text-muted text-sm mt-1">View your previously analyzed legal documents.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex gap-4 h-32 skeleton animate-fade-in-up"></div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm animate-fade-in-up">
            <div className="text-5xl mb-4 opacity-50">📂</div>
            <h3 className="text-xl font-bold text-navy mb-2">No documents yet</h3>
            <p className="text-text-muted mb-6">Upload your first legal document to get started.</p>
            <button
              onClick={() => navigate("/")}
              className="bg-accent text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
            >
              <span>📤</span> Upload Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc, idx) => (
              <div key={doc.id} className="animate-fade-in-up" style={{ animationDelay: `${(idx % 10) * 50}ms` }}>
                <HistoryList document={doc} onView={handleView} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default HistoryPage;
