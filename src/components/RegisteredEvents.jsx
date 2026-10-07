import useEvents from "../hooks/useEvents";

const RegisteredEvents = () => {
  const { registeredEvents, removeRegistration } = useEvents();

  return (
    <section id="registered" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          My Registered Events
        </h2>
        <p className="text-sm sm:text-base text-slate-500">
          Admission passes and event bookings for your account
        </p>
      </div>

      {/* List or Empty State */}
      {registeredEvents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
          <span className="text-4xl block mb-2">🎟️</span>
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            No registered events
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            You haven't reserved your spot for any events yet. Browse events above and click "Register" to get your pass.
          </p>
          <a
            href="#events"
            className="inline-block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            Explore Events
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {registeredEvents.map((event) => {
            const eventId = event._id || event.id;
            return (
              <div
                key={eventId}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-200 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                      Confirmed Pass
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      #{String(eventId).slice(-6)}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    {event.title || event.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      📅 {event.date}
                    </span>
                    {event.time && (
                      <span className="flex items-center gap-1">
                        🕐 {event.time}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      📍 {event.venue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 justify-end">
                  <button
                    onClick={() => removeRegistration(eventId)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel Pass
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};

export default RegisteredEvents;