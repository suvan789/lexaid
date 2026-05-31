import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useDocument } from "../context/DocumentContext";

const LOADING_MESSAGES = [
  "Reading your document...",
  "Extracting clauses...",
  "Assessing risk levels...",
  "Checking your legal rights...",
  "Almost done...",
];

function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const { setAnalysis, setDocumentText, setDocumentId } = useDocument();

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");
    const dropped = e.dataTransfer.files[0];
    validateAndSetFile(dropped);
  };

  const handleFileSelect = (e) => {
    setError("");
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else if (selectedFile) {
      setError("Please upload a PDF file.");
      setFile(null);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    setLoadingMsgIdx(0);

    intervalRef.current = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { document_text, document_id, ...analysisData } = res.data;
      
      setAnalysis(analysisData);
      setDocumentText(document_text);
      setDocumentId(document_id);
      
      navigate("/results");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "Analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
      clearInterval(intervalRef.current);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative">
      {/* Upload Box */}
      <div
        className={`bg-white rounded-2xl shadow-sm border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300
          ${isDragging ? "border-accent bg-accent/5 scale-[1.02]" : "border-slate-300 hover:border-accent hover:bg-slate-50"}
          ${file && !isDragging ? "border-accent bg-slate-50" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        {!file ? (
          <div className="animate-fade-in-up">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-xl font-bold text-navy mb-2">Drag & drop your PDF here</h3>
            <p className="text-text-muted text-sm">or click to browse from your computer</p>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-navy truncate px-4">{file.name}</h3>
            <p className="text-text-muted text-sm mt-1">{formatSize(file.size)}</p>
            {!isLoading && <p className="text-accent text-xs mt-3">Click to change file</p>}
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center animate-fade-in-up">
          {error}
        </div>
      )}

      {/* Analyze Button */}
      {file && (
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className={`mt-6 w-full py-3.5 rounded-xl text-white font-semibold text-lg transition-all shadow-sm
            ${isLoading ? "bg-navy/80 cursor-not-allowed" : "bg-navy hover:bg-navy/90 hover:shadow-md active:scale-[0.98]"}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"></div>
              <span>{LOADING_MESSAGES[loadingMsgIdx]}</span>
            </div>
          ) : (
            "Analyze Document"
          )}
        </button>
      )}
    </div>
  );
}

export default Upload;
