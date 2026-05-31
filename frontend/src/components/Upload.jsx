import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDocument } from "../context/DocumentContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const LOADING_MESSAGES = [
  "Reading your document...",
  "Extracting clauses...",
  "Assessing risks...",
  "Checking your rights...",
];

function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const fileInputRef = useRef(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const { setAnalysis, setDocumentText } = useDocument();

  const startLoadingMessages = useCallback(() => {
    setLoadingMsgIndex(0);
    intervalRef.current = setInterval(() => {
      setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
  }, []);

  const stopLoadingMessages = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const handleFileSelect = (e) => {
    setError("");
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else if (selectedFile) {
      setError("Please upload a PDF file.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    startLoadingMessages();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
      });

      const data = response.data;
      const docText = data.document_text;
      delete data.document_text;

      setAnalysis(data);
      setDocumentText(docText);
      navigate("/results");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Something went wrong. Please try again.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      stopLoadingMessages();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy/80 backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-white/20 border-t-accent rounded-full animate-spin-slow mb-6"></div>
          <p className="text-white text-xl font-medium animate-fade-in-up">
            {LOADING_MESSAGES[loadingMsgIndex]}
          </p>
          <p className="text-white/50 text-sm mt-2">
            This may take up to a minute
          </p>
        </div>
      )}

      {/* Drop Zone */}
      <div
        id="upload-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${
            isDragging
              ? "border-accent bg-accent/5 scale-[1.02]"
              : "border-gray-300 bg-white hover:border-accent hover:bg-accent/5"
          }
          ${file ? "border-accent bg-accent/5" : ""}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
        />

        {!file ? (
          <>
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-semibold text-navy mb-1">
              Drag & drop your PDF here
            </p>
            <p className="text-gray-400 text-sm">
              or click to browse from your computer
            </p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-4">✅</div>
            <p className="text-lg font-semibold text-navy mb-1">{file.name}</p>
            <p className="text-gray-400 text-sm">
              {formatFileSize(file.size)}
            </p>
            <p className="text-accent text-xs mt-2">Click to change file</p>
          </>
        )}
      </div>

      {/* Analyze Button */}
      <button
        id="analyze-btn"
        onClick={handleUpload}
        disabled={!file || isLoading}
        className={`mt-6 w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-200
          ${
            file && !isLoading
              ? "bg-navy hover:bg-navy/90 hover:shadow-lg active:scale-[0.98]"
              : "bg-gray-300 cursor-not-allowed"
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"></div>
            Analyzing...
          </span>
        ) : (
          "Analyze Document"
        )}
      </button>

      {/* Error Message */}
      {error && (
        <div
          id="upload-error"
          className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium animate-fade-in-up"
        >
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default Upload;
