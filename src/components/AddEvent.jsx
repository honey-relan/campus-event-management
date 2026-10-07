import { useState } from "react";
import useEvents from "../hooks/useEvents";

const AddEvent = () => {
  const { addEvent } = useEvents();

  const [form, setForm] = useState({
    title: "",
    category: "Technical",
    date: "",
    time: "10:00 AM",
    venue: "",
    organizer: "",
    description: "",
    seats: "100"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.date || !form.venue || !form.organizer || !form.description) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    await addEvent(form);
    setIsSubmitting(false);

    setForm({
      title: "",
      category: "Technical",
      date: "",
      time: "10:00 AM",
      venue: "",
      organizer: "",
      description: "",
      seats: "100"
    });
  };

  // 1-Click sample auto-fill for fast viva & testing
  const handleAutoFill = () => {
    setForm({
      title: "National AI & Cloud Hackathon 2026",
      category: "Technical",
      date: "12 October 2026",
      time: "09:00 AM - 05:00 PM",
      venue: "Central Computing Lab, Block A",
      organizer: "Computer Science Society",
      description: "24-Hour hackathon focused on building intelligent agentic systems and cloud web applications.",
      seats: "150"
    });
  };

  return (
    <section id="add-event" className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100/60 border-y border-slate-200/80">
      <div className="max-w-4xl mx-auto">
        
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Add New Event
          </h2>
          <p className="text-sm text-slate-500">
            Publish a campus event to the database and global state
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleAutoFill}
              className="text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span>⚡</span> Auto-fill Sample Data
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5"
        >
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Event Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                placeholder="e.g. National Robotics Challenge"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="Technical">Technical</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Competition">Competition</option>
              </select>
            </div>
          </div>

          {/* Row 2: Date, Time & Seats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                name="date"
                type="text"
                placeholder="e.g. 15 October 2026"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Time Slot
              </label>
              <input
                name="time"
                type="text"
                placeholder="e.g. 10:00 AM - 04:00 PM"
                value={form.time}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Available Seats
              </label>
              <input
                name="seats"
                type="number"
                min="1"
                placeholder="100"
                value={form.seats}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: Venue & Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Venue / Location <span className="text-rose-500">*</span>
              </label>
              <input
                name="venue"
                type="text"
                placeholder="e.g. Main Auditorium"
                value={form.venue}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Organizer / Club <span className="text-rose-500">*</span>
              </label>
              <input
                name="organizer"
                type="text"
                placeholder="e.g. IT Department"
                value={form.organizer}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Event Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows="3"
              placeholder="Describe what attendees will learn, experience, or gain from this event..."
              value={form.description}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-99"
          >
            {isSubmitting ? "Publishing..." : "Publish Event"}
          </button>
        </form>

      </div>
    </section>
  );
};

export default AddEvent;