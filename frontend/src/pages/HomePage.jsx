import React from "react";
import Navbar from "../components/Navbar";
import Upload from "../components/Upload";

function HomePage() {
  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <Navbar />
      
      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-navy tracking-tight mb-6">
            Understand Any Legal Document <span className="text-accent block sm:inline">in Seconds</span>
          </h1>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload your contract, rent agreement, or legal notice. LexAid explains every clause in plain English and tells you your legal rights.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold shadow-sm">
              ⚡ Instant AI Analysis
            </span>
            <span className="px-4 py-2 bg-red-50 text-risk-high rounded-full text-sm font-semibold shadow-sm">
              🔴 Risk Detection
            </span>
            <span className="px-4 py-2 bg-navy/5 text-navy rounded-full text-sm font-semibold shadow-sm">
              ⚖️ Your Legal Rights
            </span>
            <span className="px-4 py-2 bg-green-50 text-risk-low rounded-full text-sm font-semibold shadow-sm">
              🌐 Tamil & Hindi Support
            </span>
          </div>
        </div>

        {/* Upload Component */}
        <div className="w-full animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <Upload />
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-text-muted border-t border-slate-200 bg-white">
        Powered by Groq AI
      </footer>
    </div>
  );
}

export default HomePage;
