import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
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

  // Listen for hamburger menu toggle event from Navbar
  useEffect(() => {
    const handleToggle = () => {
      if (mobileOpen) {
        closeSidebar();
      } else {
        setMobileOpen(true);
        setIsClosing(false);
      }
    };
    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    return () => window.removeEventListener('toggle-mobile-sidebar', handleToggle);
  }, [mobileOpen]);

  // Close on route change
  useEffect(() => {
    if (mobileOpen) closeSidebar();
  }, [location.pathname]);

  const closeSidebar = () => {
    setIsClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setIsClosing(false);
    }, 320); // match transition duration
  };

  return (
    <>
      {/* ─── Desktop Sidebar ─── */}
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

      {/* ─── Mobile Slide-Out Drawer ─── */}
      {/* Backdrop */}
      {(mobileOpen || isClosing) && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            opacity: isClosing ? 0 : 1,
            transition: 'opacity 320ms cubic-bezier(0.4,0,0.2,1)',
          }}
          onClick={closeSidebar}
        />
      )}

      {/* Drawer Panel */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-[60] lg:hidden w-[280px] bg-navy text-white flex flex-col shadow-2xl"
        style={{
          transform: mobileOpen && !isClosing ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 320ms cubic-bezier(0.4,0,0.2,1)',
          visibility: mobileOpen || isClosing ? 'visible' : 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Logo + Close */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-lg font-bold shadow-lg">⚖️</div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">LexAid</h1>
              <p className="text-xs text-gray-400">{isLawyer ? 'Advocate Dashboard' : 'AI Legal Super App'}</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                style={{
                  transitionDelay: mobileOpen && !isClosing ? `${index * 35}ms` : '0ms',
                  opacity: mobileOpen && !isClosing ? 1 : 0,
                  transform: mobileOpen && !isClosing ? 'translateX(0)' : 'translateX(-16px)',
                  transition: 'opacity 260ms ease, transform 260ms ease',
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-accent text-white shadow-lg shadow-accent/30'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                )}
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
              <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" title="Online" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
