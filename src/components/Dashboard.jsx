import useEvents from "../hooks/useEvents";

const Dashboard = () => {
  const { events, registeredEvents } = useEvents();

  const workshops = events.filter(
    (event) => event.category === "Workshop"
  ).length;

  const technical = events.filter(
    (event) => event.category === "Technical"
  ).length;

  return (
    <section id="dashboard" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3.5 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
            ✨ Campus Event Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Campus Event Management System
          </h1>
          <p className="text-base sm:text-lg text-indigo-100 font-normal">
            Manage, explore, and participate in upcoming campus technical events, workshops, sports, and cultural galas.
          </p>
        </div>

        {/* 4 Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          
          <div className="bg-white p-6 rounded-2xl text-slate-800 shadow-md hover:-translate-y-1.5 transition-transform duration-200 border border-slate-100 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-600 block mb-1">
              {events.length}
            </span>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total Events
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-slate-800 shadow-md hover:-translate-y-1.5 transition-transform duration-200 border border-slate-100 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 block mb-1">
              {registeredEvents.length}
            </span>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Registered Events
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-slate-800 shadow-md hover:-translate-y-1.5 transition-transform duration-200 border border-slate-100 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-500 block mb-1">
              {workshops}
            </span>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Workshops
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl text-slate-800 shadow-md hover:-translate-y-1.5 transition-transform duration-200 border border-slate-100 text-center">
            <span className="text-3xl sm:text-4xl font-extrabold text-purple-600 block mb-1">
              {technical}
            </span>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Technical Events
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Dashboard;