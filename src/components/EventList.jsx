import { useState } from "react";
import useEvents from "../hooks/useEvents";
import EventCard from "./EventCard";

const EventList = () => {
  const { events } = useEvents();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filteredEvents = events.filter((event) => {
    const titleMatch = (event.title || event.name || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const descriptionMatch = (event.description || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const organizerMatch = (event.organizer || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const venueMatch = (event.venue || "")
      .toLowerCase()
      .includes(search.toLowerCase());

    const searchMatch =
      titleMatch || descriptionMatch || organizerMatch || venueMatch;

    const categoryMatch =
      category === "All" || event.category === category;

    return searchMatch && categoryMatch;
  });

  return (
    <section id="events" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Upcoming Events
        </h2>
        <p className="text-sm sm:text-base text-slate-500">
          Explore and search events happening across campus departments
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full flex-1">
          <input
            type="text"
            placeholder="🔍 Search events by name, organizer, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Select */}
        <div className="w-full sm:w-64">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Competition">Competition</option>
          </select>
        </div>

      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventCard key={event._id || event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-xs">
            <span className="text-4xl block mb-2">🔍</span>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              No events found
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Try searching with another keyword or resetting the category filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

    </section>
  );
};

export default EventList;