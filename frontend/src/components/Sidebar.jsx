import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isLawyer = user?.role === 'lawyer';

  const navItems = isLawyer
    ? [
        { path: '/', label: 'Advocate Portal', icon: '⚖️' },
        { path: '/messages', label: 'Direct Messages', icon: '✉️' },
        { path: '/analyze', label: 'Analyze Document', icon: '🔍' },
        { path: '/generate', label: 'Generate Document', icon: '📝' },
        { path: '/chat', label: 'AI Legal Chat', icon: '💬' },
        { path: '/forum', label: 'Community Forum', icon: '👥' },
        { path: '/news', label: 'Legal News', icon: '📰' },
        { path: '/profile', label: 'My Profile', icon: '👤' },
      ]
    : [
        { path: '/', label: 'Dashboard', icon: '🏠' },
        { path: '/messages', label: 'Direct Messages', icon: '✉️' },
        { path: '/analyze', label: 'Analyze Document', icon: '🔍' },
        { path: '/generate', label: 'Generate Document', icon: '📝' },
        { path: '/chat', label: 'AI Legal Chat', icon: '💬' },
        { path: '/lawyers', label: 'Find a Lawyer', icon: '👨‍⚖️' },
        { path: '/forum', label: 'Community Forum', icon: '👥' },
        { path: '/news', label: 'Legal News', icon: '📰' },
        { path: '/profile', label: 'My Profile', icon: '👤' },
      ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-navy text-white z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-lg font-bold">⚖️</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">LexAid</h1>
            <p className="text-xs text-gray-400">{isLawyer ? 'Advocate Dashboard' : 'AI Legal Super App'}</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info */}
        {user && (
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/30 flex items-center justify-center text-sm font-bold">
                {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400 truncate">{isLawyer ? 'Advocate Account' : user.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden animate-fade-in" onClick={() => setMobileOpen(false)}>
          <aside className="w-72 bg-navy text-white h-full flex flex-col shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
            {/* Logo & Close Button */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-lg font-bold">⚖️</div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight">LexAid</h1>
                  <p className="text-xs text-gray-400">{isLawyer ? 'Advocate Dashboard' : 'AI Legal Super App'}</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white p-2 text-xl font-bold">
                ✕
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-accent text-white shadow-lg shadow-accent/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* User Profile Footer */}
            {user && (
              <div className="px-5 py-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center text-base font-bold text-white border border-accent/40">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{user.full_name}</p>
                    <p className="text-xs text-gray-400 truncate">{isLawyer ? 'Advocate Account' : user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy z-40 border-t border-white/10 safe-area-inset-bottom">
        <div className="flex justify-around py-1">
          <button
            onClick={() => setMobileOpen(true)}
            className="flex flex-col items-center py-2 px-2 text-xs text-gray-400 hover:text-white"
          >
            <span className="text-lg mb-0.5">☰</span>
            <span style={{ fontSize: '10px' }}>Menu</span>
          </button>
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 text-xs ${
                  isActive ? 'text-accent font-bold' : 'text-gray-400'
                }`}
              >
                <span className="text-lg mb-0.5">{item.icon}</span>
                <span className="truncate" style={{ fontSize: '10px' }}>
                  {item.label.split(' ')[0]}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
}
