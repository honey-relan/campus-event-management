import { createContext, useEffect, useState } from "react";
import eventsData from "../data/events";
import { socket } from "../socket";

export const EventContext = createContext();

const API_BASE = "http://localhost:5000/api";

export const EventProvider = ({ children }) => {
  // State for all campus events
  const [events, setEvents] = useState(eventsData);

  // State for registered events (persisted in localStorage)
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_registered_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("campus_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem("campus_token") || null;
    } catch {
      return null;
    }
  });

  // WebSocket Connection State
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // Auth Modal/View state: null | 'login' | 'register'
  const [authView, setAuthView] = useState(null);
  const [notification, setNotification] = useState(null);

  // Effect 1: Fetch events from backend API on initial load
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map(item => ({
              ...item,
              id: item._id || item.id,
              title: item.title || item.name
            }));
            setEvents(mapped);
          }
        }
      } catch (err) {
        console.log("Backend offline or loading, using local sample events.");
      }
    };

    fetchEvents();
  }, []);

  // Effect 2: Real-time Socket.IO Event Listeners
  useEffect(() => {
    // Socket connection listeners
    const onConnect = () => {
      console.log("🟢 Connected to WebSocket server:", socket.id);
      setIsSocketConnected(true);
    };

    const onDisconnect = () => {
      console.log("🔴 Disconnected from WebSocket server");
      setIsSocketConnected(false);
    };

    // Socket Event: eventCreated (Real-time Broadcast)
    const onEventCreated = (newEvent) => {
      console.log("⚡ Real-time eventCreated received:", newEvent);
      const formatted = {
        ...newEvent,
        id: newEvent._id || newEvent.id,
        title: newEvent.title || newEvent.name
      };

      setEvents((prev) => {
        // Prevent duplicate addition
        const exists = prev.some(
          (e) => (e._id || e.id) === (formatted._id || formatted.id)
        );
        if (exists) return prev;
        return [formatted, ...prev];
      });

      showNotification(`🎉 Real-Time Update: New event added: "${formatted.title}"`, "success");
    };

    // Socket Event: eventUpdated (Real-time Broadcast)
    const onEventUpdated = (updatedEvent) => {
      console.log("⚡ Real-time eventUpdated received:", updatedEvent);
      const formatted = {
        ...updatedEvent,
        id: updatedEvent._id || updatedEvent.id,
        title: updatedEvent.title || updatedEvent.name
      };

      const targetId = formatted._id || formatted.id;

      setEvents((prev) =>
        prev.map((e) => ((e._id || e.id) === targetId ? formatted : e))
      );

      setRegisteredEvents((prev) =>
        prev.map((e) => ((e._id || e.id) === targetId ? formatted : e))
      );

      showNotification(`⚡ Real-Time Update: Event updated: "${formatted.title}"`, "info");
    };

    // Socket Event: eventDeleted (Real-time Broadcast)
    const onEventDeleted = (data) => {
      console.log("⚡ Real-time eventDeleted received:", data);
      const deletedId = data.id || data._id;

      setEvents((prev) => prev.filter((e) => (e._id || e.id) !== deletedId));
      setRegisteredEvents((prev) =>
        prev.filter((e) => (e._id || e.id) !== deletedId)
      );

      showNotification(`🗑️ Real-Time Update: Event removed: "${data.name || 'Event'}"`, "warning");
    };

    // Attach listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("eventCreated", onEventCreated);
    socket.on("eventUpdated", onEventUpdated);
    socket.on("eventDeleted", onEventDeleted);

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    // Cleanup listeners on unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("eventCreated", onEventCreated);
      socket.off("eventUpdated", onEventUpdated);
      socket.off("eventDeleted", onEventDeleted);
    };
  }, []);

  // Effect 3: Persist registered events to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("campus_registered_events", JSON.stringify(registeredEvents));
    } catch (err) {
      console.error("Could not save registrations to localStorage", err);
    }
  }, [registeredEvents]);

  // Effect 4: Auto-clear notifications after 4 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type, id: Date.now() });
  };

  // Add Event
  const addEvent = async (newEvent) => {
    const payload = {
      name: newEvent.title || newEvent.name,
      title: newEvent.title || newEvent.name,
      category: newEvent.category || "Technical",
      date: newEvent.date,
      time: newEvent.time || "10:00 AM",
      venue: newEvent.venue,
      organizer: newEvent.organizer || "Campus Club",
      description: newEvent.description,
      seats: Number(newEvent.seats) || 100
    };

    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const created = {
          ...data.event,
          id: data.event._id || data.event.id,
          title: data.event.title || data.event.name
        };
        // Local state update (and Socket broadcast will notify other clients)
        setEvents((prev) => {
          const exists = prev.some((e) => (e._id || e.id) === created.id);
          return exists ? prev : [created, ...prev];
        });
        showNotification("Event created and broadcast in real-time!", "success");
        return { success: true };
      }
    } catch (err) {
      console.log("Saving locally as fallback");
    }

    // Fallback local update
    const localEvent = {
      ...payload,
      id: `evt-${Date.now()}`
    };
    setEvents((prev) => [localEvent, ...prev]);
    showNotification("Event added locally!", "success");
    return { success: true };
  };

  // Delete Event
  const deleteEvent = async (id) => {
    try {
      await fetch(`${API_BASE}/events/${id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
    } catch (err) {
      console.log("Deleted locally");
    }

    setEvents((prev) => prev.filter((event) => (event._id || event.id) !== id));
    setRegisteredEvents((prev) =>
      prev.filter((event) => (event._id || event.id) !== id)
    );
    showNotification("Event removed.", "info");
  };

  // Register for an Event
  const registerEvent = (event) => {
    const eventId = event._id || event.id;
    const alreadyRegistered = registeredEvents.some(
      (item) => (item._id || item.id) === eventId
    );

    if (!alreadyRegistered) {
      setRegisteredEvents((prev) => [...prev, event]);
      showNotification(`Registered for "${event.title || event.name}"! 🎉`, "success");
    } else {
      showNotification("You are already registered for this event.", "info");
    }
  };

  // Remove Registration
  const removeRegistration = (id) => {
    setRegisteredEvents((prev) =>
      prev.filter((event) => (event._id || event.id) !== id)
    );
    showNotification("Registration cancelled.", "info");
  };

  // User Login
  const loginUser = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("campus_user", JSON.stringify(data.user));
        localStorage.setItem("campus_token", data.token);
        setAuthView(null);
        showNotification(`Welcome back, ${data.user.name}! 👋`, "success");
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (err) {
      return { success: false, message: "Backend server is unreachable on port 5000" };
    }
  };

  // User Registration
  const registerUser = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        showNotification("Account created! Please login.", "success");
        return { success: true, message: "Registration successful!" };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (err) {
      return { success: false, message: "Backend server is unreachable on port 5000" };
    }
  };

  // User Logout
  const logoutUser = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("campus_user");
    localStorage.removeItem("campus_token");
    showNotification("Logged out successfully.", "info");
  };

  return (
    <EventContext.Provider
      value={{
        events,
        registeredEvents,
        user,
        token,
        authView,
        notification,
        isSocketConnected,
        setAuthView,
        showNotification,
        addEvent,
        deleteEvent,
        registerEvent,
        removeRegistration,
        loginUser,
        registerUser,
        logoutUser
      }}
    >
      {children}
    </EventContext.Provider>
  );
};