import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import EventList from "./components/EventList";
import AddEvent from "./components/AddEvent";
import RegisteredEvents from "./components/RegisteredEvents";
import Login from "./components/Login";
import Register from "./components/Register";
import { EventProvider } from "./context/EventContext";
import useEvents from "./hooks/useEvents";

function MainContent() {
  const { authView, setAuthView, notification } = useEvents();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Global Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce">
          <div className={`py-3 px-5 rounded-2xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-500 shadow-emerald-950/20'
              : notification.type === 'info'
                ? 'bg-indigo-900 text-indigo-100 border-indigo-500 shadow-indigo-950/20'
                : 'bg-rose-900 text-rose-100 border-rose-500 shadow-rose-950/20'
          }`}>
            <span>{notification.type === 'success' ? '✅' : notification.type === 'info' ? 'ℹ️' : '⚠️'}</span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Auth Modals (Exp-6) */}
      {authView === "login" && (
        <Login
          onRegister={() => setAuthView("register")}
          onClose={() => setAuthView(null)}
        />
      )}

      {authView === "register" && (
        <Register
          onLogin={() => setAuthView("login")}
          onClose={() => setAuthView(null)}
        />
      )}

      {/* Main Single Page Sections */}
      <main className="flex-1 space-y-4">
        <section id="dashboard">
          <Dashboard />
        </section>

        <section id="events">
          <EventList />
        </section>

        <section id="add-event">
          <AddEvent />
        </section>

        <section id="registered">
          <RegisteredEvents />
        </section>
      </main>

      {/* Responsive Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-bold">
            <span>🎓</span>
            <span>Campus Event Management System</span>
          </div>
          <p className="text-slate-400">
            College Full-Stack Practical • Experiments 1 to 6
          </p>
          <p className="text-slate-500">
            React 19 + Tailwind CSS + Context API + Express + MongoDB Atlas
          </p>
        </div>
      </footer>

    </div>
  );
}

function App() {
  return (
    <EventProvider>
      <MainContent />
    </EventProvider>
  );
}

export default App;