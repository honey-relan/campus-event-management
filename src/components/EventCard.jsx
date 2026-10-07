import useEvents from "../hooks/useEvents";

const categoryColorMap = {
  Technical: "bg-blue-100 text-blue-700",
  Cultural: "bg-purple-100 text-purple-700",
  Sports: "bg-emerald-100 text-emerald-700",
  Workshop: "bg-amber-100 text-amber-700",
  Seminar: "bg-indigo-100 text-indigo-700",
  Competition: "bg-rose-100 text-rose-700"
};

const EventCard = ({ event }) => {
  const { registerEvent, registeredEvents, deleteEvent } = useEvents();

  const eventId = event._id || event.id;
  const isRegistered = registeredEvents.some(
    (item) => (item._id || item.id) === eventId
  );

  const categoryBadgeClass =
    categoryColorMap[event.category] || "bg-slate-100 text-slate-700";

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between">
      
      <div>
        {/* Top Icon and Category */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-3xl">🎫</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${categoryBadgeClass}`}>
            {event.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
          {event.title || event.name}
        </h3>

        {/* Details */}
        <div className="space-y-1.5 text-xs text-slate-600 mb-3">
          <p className="flex items-center gap-1.5">
            <span>📅</span>
            <span className="font-semibold text-slate-800">{event.date}</span>
          </p>

          {event.time && (
            <p className="flex items-center gap-1.5">
              <span>🕐</span>
              <span>{event.time}</span>
            </p>
          )}

          <p className="flex items-center gap-1.5">
            <span>📍</span>
            <span className="truncate">{event.venue}</span>
          </p>

          <p className="flex items-center gap-1.5">
            <span>👤</span>
            <span className="truncate text-slate-700 font-medium">{event.organizer}</span>
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div>
        {/* Seats Available */}
        <div className="pt-3 border-t border-slate-100 mb-4 flex items-center justify-between text-xs font-semibold text-emerald-600">
          <span>🎟️ Available Seats</span>
          <span>{event.seats || 100} seats</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => registerEvent(event)}
            disabled={isRegistered}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              isRegistered
                ? "bg-emerald-500 text-white cursor-default shadow-xs"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 active:scale-98 cursor-pointer"
            }`}
          >
            {isRegistered ? "Registered ✓" : "Register"}
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${event.title || event.name}"?`)) {
                deleteEvent(eventId);
              }
            }}
            className="py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            title="Delete event"
          >
            Delete
          </button>
        </div>
      </div>

    </div>
  );
};

export default EventCard;