import { useContext } from "react";
import { EventContext } from "../context/EventContext";

/**
 * Custom Hook: useEvents
 * Provides easy access to global EventContext and Auth state.
 */
const useEvents = () => {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }

  return context;
};

export default useEvents;
