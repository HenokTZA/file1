import { toast } from 'react-toastify';
export const handleEventDuplication = async ({
  info,
  onEventCreate,
  adjustTimeForBackend,
  preserveCalendarView,
  restoreCalendarView,
  getTimezoneFromDate,
}) => {
  try {
    // Deep copy the event data to avoid unintended mutations
        const eventData = JSON.parse(JSON.stringify(info.event));
   
    const eventTimezone = getTimezoneFromDate(eventData.start);
    const extendedProps = eventData.extendedProps || {};
    const assignedResources = extendedProps.assigned_resources || {
      assigned_to: [],
      materials: [],
      tools: []
    };
     // Prepare the new event object
    const newEvent = {
      start_time: adjustTimeForBackend(eventData.start, eventTimezone),
      end_time: adjustTimeForBackend(eventData.end, eventTimezone),
      title: `Copy of ${eventData.title}`,
      color: eventData.backgroundColor || "#FFFFFF",
      assigned_to: Array.isArray(assignedResources.assigned_to)
        ? assignedResources.assigned_to.filter((res) => res && res._id).map((res) => res._id)
        : [],
      materials: Array.isArray(assignedResources.materials)
        ? assignedResources.materials.filter((mat) => mat && mat._id).map((mat) => mat._id)
        : [],
      tools: Array.isArray(assignedResources.tools)
        ? assignedResources.tools.filter((tool) => tool && tool._id).map((tool) => tool._id)
        : [],      machine: eventData.extendedProps?.machine || null,
      facility: eventData.extendedProps?.facility || null,
      created_by: eventData.extendedProps?.created_by || "unknown",
      repeat_frequency: "none",
      // eventData.extendedProps?.repeat_frequency || 
      task_period: eventData.extendedProps?.task_period || null,
    };

    console.log("Prepared new event object:", newEvent);

    const currentViewState = preserveCalendarView();

    // Attempt to create the event
    const creationResult = await onEventCreate(newEvent);

    if (!creationResult || !creationResult.success) {
      throw new Error(creationResult.error || "Event creation failed");
    }

    if (currentViewState) {
      restoreCalendarView(currentViewState);
    }

    console.log("Event duplication successful:", newEvent);
     } catch (error) {
    console.error("Error during event duplication:", error);

    // Revert UI changes if the operation fails
    if (info.revert) {
      info.revert();
    }

    toast.error(`Failed to duplicate event: ${error.message}`);
  }
};


// Date click handler
export const handleDateClick = (info, user, adjustTimeForBackend, openCreateForm) => {
  if (user.access_level < 3) {
    toast.error('You do not have permission to create events. try logging in again');
    return;
  }
  const timezoneOffset = 3;
  const adjustedStartTime = adjustTimeForBackend(info.date, timezoneOffset);
  const newEvent = {
    start_time: adjustedStartTime,
    title: 'new task',
  };
  openCreateForm(newEvent);
};

// Event click handler
export const handleEventClick = (info, user, selectedEventsRef, selectedEvents, setSelectedEvents, updateEventAppearance, clearEventSelection, openForm) => {
  if (user.access_level < 2) {
    toast.error('You do not have permission to modify events.');
    return;
  }

  const eventId = info.event.extendedProps._id;

  if (info.jsEvent.shiftKey || info.jsEvent.ctrlKey) {
    info.jsEvent.preventDefault();

    const newSelected = new Set(selectedEventsRef.current);

    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
      updateEventAppearance(eventId, false);  // Corrected: passing the eventId to update appearance
    } else {
      newSelected.add(eventId);
      updateEventAppearance(eventId, true);  // Corrected: passing the eventId to update appearance
    }

    selectedEventsRef.current = newSelected;
    setSelectedEvents(newSelected);  // Ensure both ref and state are updated
    return;  // Exit after processing the shift-click
  } else {
    // Single click on event (deselect all if any are selected)
    if (selectedEvents.size > 0) {
      clearEventSelection();
    }

    const { event } = info;
    const { extendedProps } = event;

    const updatedEvent = {
      _id: eventId,
      title: event.title,
      start: event.start,
      end: event.end,
      color: event.backgroundColor,
      image: extendedProps?.image || null,
      notes: extendedProps?.notes || 'No notes available',
      status: extendedProps?.status || null,
    };
    openForm(updatedEvent);
  }
};

export const handleEventDragStart = (info, calendarRef, selectedEventsRef, dragStartPositionsRef, clearEventSelection) => {
  const eventId = info.event.extendedProps._id;

  // Convert selected events from ref to an array
  const selectedEventIds = Array.from(selectedEventsRef.current);

  // Clear any previous drag start positions
  dragStartPositionsRef.current.clear();

  // Store positions of all selected events
  selectedEventIds.forEach((id) => {
    const event = calendarRef.current.getEventById(id);
    if (event) {
      dragStartPositionsRef.current.set(id, {
        start: event.start,
        end: event.end,
      });
      console.log(`Stored position for event ${id}:`, {
        start: event.start,
        end: event.end,
      });
    }
  });

  // If the dragged event is not in the selected events, clear selection
  if (!selectedEventIds.includes(eventId)) {
    console.log(`Event ${eventId} is not in the selected events, clearing selection.`);
    clearEventSelection();
  }
};


// Event did mount handler
export const handleEventDidMount = (info, selectedEvents, updateEventAppearance) => {
  const eventElement = info.el;
  const eventId = info.event.extendedProps._id;
  eventElement.setAttribute('data-event-id', eventId);
  
  if (selectedEvents.has(eventId)) {
    updateEventAppearance(eventId, true);
  }
};

// Event drag handler
export const handleEventDrag = (info, selectedEventsRef, dragStartPositionsRef, calendarRef) => {
  const mainEventId = info.event.extendedProps._id;
  const deltaMs = info.event.start.getTime() - info.event._instance.range.start.getTime();
  
  selectedEventsRef.current.forEach(eventId => {
    if (eventId !== mainEventId) {
      const eventToMove = calendarRef.current.getEventById(eventId);
      const startPosition = dragStartPositionsRef.current.get(eventId);
      
      if (eventToMove && startPosition) {
        const newStart = new Date(startPosition.start.getTime() + deltaMs);
        const newEnd = new Date(startPosition.end.getTime() + deltaMs);
        
        try {
          calendarRef.current.updateEvent({
            id: eventId,
            start: newStart,
            end: newEnd,
            allDay: eventToMove.allDay
          });
        } catch (error) {
          console.error('Error updating event position:', error);
        }
      }
    }
  });
};

// Event resize handler
export const handleEventResize = async (info, user, onEventUpdate, adjustTimeForBackend) => {
  if (user.access_level < 3) {
    toast.error('You do not have permission to update events.');
    return;
  }
  const { event } = info;
  const mongoId = event.extendedProps._id;
  if (!mongoId) {
    toast.error('Event ID missing. Cannot update.');
    info.revert();
    return;
  }
  // 1. Get user's timezone dynamically
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // 2. Fallback to local timezone offset if needed (in hours)
  const fallbackTimezoneOffset = new Date().getTimezoneOffset() / -60;
  
  // 3. Use detected timezone (preferred) or fallback
  const timezoneToUse = userTimezone || fallbackTimezoneOffset;

  const adjustedStartTime = adjustTimeForBackend(event.start, timezoneToUse);
  const adjustedEndTime = adjustTimeForBackend(event.end, timezoneToUse);
  const updatedEvent = {
    _id: mongoId,
    start_time: adjustedStartTime,
    end_time: adjustedEndTime,
    title: event.title,
    color: event.backgroundColor,
  };
  try {
    await onEventUpdate(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    info.revert();
    toast.error('Failed to update event. Changes reverted.');
  }
};
