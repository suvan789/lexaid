import React from "react";
import Navbar from "../components/Navbar";
import Upload from "../components/Upload";

function HomePage() {
  return (
    <div className="min-h-screen bg-bg-light font-inter">
      <Navbar />

      {/* Spacer for fixed navbar */}
      <div style={{ height: "64px" }}></div>

      {/* Hero Section */}
      <section className="pt-16 pb-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-navy leading-tight mb-4 animate-fade-in-up">
            Understand Any Legal Document{" "}
            <span className="text-accent">in Seconds</span>
          </h1>
          <p className="text-gray-500 text-lg mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            Upload your contract, rent agreement, or legal notice — LexAid
            explains it in plain English and protects your rights.
          </p>

          {/* Feature Pills */}
          <div
            className="flex flex-wrap items-center justify-center gap-3 mb-12 animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            <span className="bg-accent/10 text-accent px-5 py-2 rounded-full text-sm font-semibold">
              ⚡ Instant Analysis
            </span>
            <span className="bg-red-50 text-risk-high px-5 py-2 rounded-full text-sm font-semibold">
              🔴 Risk Detection
            </span>
            <span className="bg-navy/5 text-navy px-5 py-2 rounded-full text-sm font-semibold">
              ⚖️ Know Your Rights
            </span>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="pb-20">
        <Upload />
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-400 text-xs border-t border-gray-200">
        <p>
          ⚖️ LexAid — AI-powered legal analysis. Not a substitute for
          professional legal advice.
        </p>
      </footer>
    </div>
  );
}

export default HomePage;
