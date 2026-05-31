import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy shadow-lg" style={{ height: "64px" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo & Tagline */}
        <div
          className="flex flex-col cursor-pointer"
          onClick={() => navigate("/")}
          id="navbar-logo"
        >
          <span className="text-white font-bold text-xl leading-tight">
            ⚖️ LexAid
          </span>
          <span className="text-accent text-xs font-medium leading-tight">
            Know Your Rights
          </span>
        </div>

        {/* Upload New Document Button */}
        <button
          id="navbar-upload-btn"
          onClick={() => navigate("/")}
          className="border border-white text-white px-4 py-2 rounded-lg text-sm font-medium 
                     hover:bg-white hover:text-navy transition-all duration-200"
        >
          Upload New Document
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
