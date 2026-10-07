import { useState } from "react";
import useEvents from "../hooks/useEvents";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logoutUser, setAuthView, registeredEvents, isSocketConnected } = useEvents();

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & WebSocket Live Status */}
          <div className="flex items-center gap-3">
            <a href="#dashboard" className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight flex items-center gap-2">
              <span>🎓</span>
              <span>Campus<span className="text-slate-900">Events</span></span>
            </a>

            {/* WebSocket Connection Indicator Badge (Exp-7) */}
            <div 
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                isSocketConnected 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
              title={isSocketConnected ? "WebSocket server connected in real-time" : "WebSocket disconnected"}
            >
              <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{isSocketConnected ? 'Live Sync' : 'Disconnected'}</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#dashboard" className="hover:text-indigo-600 transition-colors">
              Dashboard
            </a>
            <a href="#events" className="hover:text-indigo-600 transition-colors">
              Events
            </a>
            <a href="#add-event" className="hover:text-indigo-600 transition-colors">
              Add Event
            </a>
            <a href="#registered" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              <span>Registered Events</span>
              {registeredEvents.length > 0 && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {registeredEvents.length}
                </span>
              )}
            </a>
          </div>

          {/* User Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${user.role === 'admin' ? 'text-purple-600' : 'text-slate-500'}`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logoutUser}
                  className="ml-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthView("login")}
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthView("register")}
                  className="text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <span className="text-2xl leading-none">☰</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs text-slate-500">WebSocket Status:</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${
              isSocketConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
              {isSocketConnected ? 'Live Sync' : 'Disconnected'}
            </span>
          </div>

          <a
            href="#dashboard"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Dashboard
          </a>
          <a
            href="#events"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Events
          </a>
          <a
            href="#add-event"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Add Event
          </a>
          <a
            href="#registered"
            onClick={() => setMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-indigo-600"
          >
            Registered Events ({registeredEvents.length})
          </a>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-slate-800">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={() => {
                    logoutUser();
                    setMenuOpen(false);
                  }}
                  className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    setAuthView("login");
                    setMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg text-center"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setAuthView("register");
                    setMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg text-center"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;