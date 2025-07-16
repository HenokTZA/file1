import React, { useEffect, useRef ,useState,useMemo,useCallback} from 'react';
import Calendar from '@event-calendar/core';
import DayGrid from '@event-calendar/day-grid';
import Interaction from '@event-calendar/interaction';
import List from '@event-calendar/list';
import ResourceTimeGrid from '@event-calendar/resource-time-grid';
import TimeGrid from '@event-calendar/time-grid';
import ResourceTimeline from '@event-calendar/resource-timeline';
import '@event-calendar/core/index.css';
import { useSelector} from 'react-redux';
import { toast } from 'react-toastify';
import promptForStartAndEndTime from './promptHelper';
import { handleMonthBulkUpdate, handleWeekBulkUpdate, handleSingleEventUpdate } from './eventDropHandler';
import {getTimezoneOffsetHours} from './getTimezones';
import {
   handleEventDuplication, 
  handleEventResize } from './calendarHandlers';
import './custom.css';
const EventCalendarWrapper = ({ events = [], onEventUpdate, onMultipleEventUpdate,calendarStartDate, onEventCreate, openForm, openCreateForm }) => {
  const calendarContainer = useRef(null);
  const [changedView, setChangedView] = useState('timeGridWeek'); // To keep track of current view
  const calendarRef = useRef(null);
  const user = useSelector((state) => state.auth);
  const currentDateRef = useRef(new Date()); // Initialize with a default value
  const [selectedEvents, setSelectedEvents] = useState(new Set());
  const selectedEventsRef = useRef(new Set()); // Add this ref to persist selection
  const dragStartPositionsRef = useRef(new Map());
  const [calendarDate, setCalendarDate] = useState(new Date());  // Default to today's date
  const isDateChangeAllowed = useRef(true); // Add this line to define the ref

 
  const handleDateChange = useCallback((args) => {
    const currentView = args.view.type;
    let normalizedArgsStart;
      let normalizedCalendarDate;
    if (currentView === "dayGridMonth") {
      const viewStart = args.view.currentStart;
      const newDate = new Date(viewStart.getFullYear(), viewStart.getMonth(), 1);
      
      // Only update if month actually changed
      if (newDate.getMonth() !== calendarDate.getMonth() || 
          newDate.getFullYear() !== calendarDate.getFullYear()) {
        setCalendarDate(newDate);
      }
    }  else {
            // For week and day views, normalize to the start of the day
            normalizedArgsStart = new Date(args.start).setHours(0, 0, 0, 0);
            normalizedCalendarDate = new Date(calendarDate).setHours(0, 0, 0, 0);
          }
      
          if (normalizedCalendarDate !== normalizedArgsStart) {
            setCalendarDate(new Date(normalizedArgsStart));
            currentDateRef.current = new Date(normalizedArgsStart);
          }
  }, [calendarDate]);

  const mappedEvents = events.map(event => ({
    _id: event._id,
    start: event.schedule.start || new Date(),
    end: event.schedule.end || new Date(),
    title: event.title || 'Untitled Event',
    color: event.color|| event.color_code || '#fbbf24',
    allDay: false,
    
    resourceIds: [
      // Handle assigned_to with null checks
      ...(event.assigned_resources?.assigned_to
        ?.map(a => a?.user?.id || a?.user?._id || a?._id) // Check multiple possible ID locations
        .filter(id => id && typeof id === 'string') // Ensure valid string IDs
        || []),
      
      // Handle resources with null checks  
      ...(event.assigned_resources?.resources
        ?.map(r => r?.resource?._id || r?._id) // Check both resource._id and root _id
        .filter(id => id && typeof id === 'string') // Ensure valid string IDs
        || [])
    ],
    extendedProps: {
      ...event,
      created_by: event.createdBy ? {
        id: event.createdBy._id,
        name: event.createdBy.full_name || 
              `${event.createdBy.first_name} ${event.createdBy.last_name}`,
        email: event.createdBy.email
      } : null,
      assigned_resources: {
        assigned_to: event.assigned_resources?.assigned_to?.map(assignment => ({
          _id: assignment._id,
          role: assignment.role,
          team: assignment.team,
          id: assignment.user?.id, // Use _id instead of id
          name: assignment.user?.name,
          email: assignment.user?.email
        })) || [],
        resources: event.assigned_resources?.resources
      ?.filter(resource => resource?.resource) // Filter null resources
      ?.map(resource => ({
        _id: resource._id,
        relationshipType: resource.relationshipType,
        required: resource.required,
        resource: {
          _id: resource.resource._id,
          type: resource.resource.type,
          displayName: resource.resource.displayName,
          fields: resource.resource.fields,
          status: resource.resource.status
        }
      })) || []
      }
    }
  }));
 
  const groupedAssignedResources = useMemo(() => {
    const uniqueUsers = new Map();
    const uniqueResources = new Map();
   
    mappedEvents.forEach(event => {
      // Process assigned users
      event.extendedProps.assigned_resources?.assigned_to?.forEach(assignment => {
        const user = assignment; // Get the user object
        if (user?.id && !uniqueUsers.has(user.id)) {
          uniqueUsers.set(user.id, {
            id: user.id,
            title: user.name, // Now properly accessing the name
            email: user.email,
            role: assignment.role,
            parent: 'assignedUsers'
          });
        }
      });
  
      // Process resources
      event.extendedProps.assigned_resources.resources.forEach(resource => {
        if (resource.resource?._id && !uniqueResources.has(resource.resource._id)) {
          uniqueResources.set(resource.resource._id, {
            id: resource.resource._id,
            title: resource.resource.displayName || 'Unknown Resource',
            type: resource.resource.type,
            relationshipType: resource.relationshipType,
            required: resource.required,
            parent: 'resources'
          });
        }
      });
    });
  
    return [
      {
        id: 'assignedUsers',
        title: 'Assigned Users',
        children: Array.from(uniqueUsers.values())
      },
      {
        id: 'resources',
        title: 'Resources',
        children: Array.from(uniqueResources.values())
      }
    ];
  }, [mappedEvents]);

  const assigned_resources = useMemo(() => [...groupedAssignedResources], [groupedAssignedResources]);
  const getTimezoneFromDate = (date) => {
    const timezoneOffsetMinutes = new Date(date).getTimezoneOffset(); // In minutes
    if (isNaN(timezoneOffsetMinutes)) {
      console.error('Invalid date for timezone calculation:', date);
      return null;
    }
    return -timezoneOffsetMinutes / 60; // Convert to hours
  };
  const adjustTimeForBackend = (time, timezoneInput) => {
    try {
      // Validate time
      const date = new Date(time);
      if (isNaN(date.getTime())) {
        console.error('Invalid date input:', time);
        return null;
      }
  
      // Get offset in hours (handles both numbers and timezone names)
      const timezoneOffset = getTimezoneOffsetHours(timezoneInput);
      
      // Calculate adjusted time
      const utcTime = date.getTime();
      const adjustedTime = new Date(utcTime + timezoneOffset * 60 * 60 * 1000);
  
      if (isNaN(adjustedTime.getTime())) {
        console.error('Invalid adjusted time:', adjustedTime);
        return null;
      }
  
      return adjustedTime.toISOString();
    } catch (error) {
      console.error('Error adjusting time:', error);
      return null;
    }
  };
  const updateEventAppearance = (eventId, isSelected) => {
    const eventElement = document.querySelector(`[data-event-id="${eventId}"]`);
    if (eventElement) {
      if (isSelected) {
        eventElement.style.border = '2px solid #ff4444';
        eventElement.style.boxShadow = '0 0 4px rgba(255, 68, 68, 0.5)';
      } else {
        eventElement.style.border = '';
        eventElement.style.boxShadow = '';
      }
    }
  };
  const handleViewChange = (view) => {
    setChangedView(view);
  };
  const preserveCalendarView = useCallback(() => {
    const calendarApi = calendarRef.current?.getView();
    if (calendarApi) {
      return {
        date: calendarApi.currentStart,
        view: calendarApi.type,
      };
    }
    return null;
  }, [calendarRef]); 

  const restoreCalendarView = useCallback((viewState) => {
    const calendarApi = calendarRef.current;

    if (calendarApi && viewState) {
     
      calendarApi.view.currentStart.setDate(viewState.date);
      setCalendarDate(viewState.date);
    }
   
  }, [calendarRef]); 

  const handleEventDrop = async (info) => {
    if (user.access_level < 3) {
      toast.error('You do not have permission to modify events.');
      info.revert();
      return;
    }

    const { event, jsEvent } = info;
    
    const deltaMs = event.start.getTime() - info.oldEvent.start.getTime();
    const selectedEventIds = Array.from(selectedEventsRef.current);
    try {
      if (selectedEventIds.length > 0 && !jsEvent.altKey) {
        if (info.view.type === "dayGridMonth") {
          await handleMonthBulkUpdate({
            info,
            event,
            deltaMs,
            selectedEventIds,
            events,
            calendarRef,
            onMultipleEventUpdate,
            clearEventSelection,
            promptForStartAndEndTime
          });
        } else {
          await handleWeekBulkUpdate({
            info,
            deltaMs,
            selectedEventIds,
            events,
            onMultipleEventUpdate,
            clearEventSelection,
            calendarRef
          });
        }
      } else if (jsEvent.altKey) {
        await handleEventDuplication({
          info,
          onEventCreate,
          adjustTimeForBackend,
          preserveCalendarView,
          restoreCalendarView,
          getTimezoneFromDate
        });
      } else {
        await handleSingleEventUpdate({
          info,
          onEventUpdate,
          adjustTimeForBackend,
          calendarRef,
          promptForStartAndEndTime,
          getTimezoneFromDate
        });
      }
    } catch (error) {
      console.error('Error in event drop:', error);
      info.revert();
      toast.error('Failed to update event(s)');
    }
  
  };
  
  useEffect(() => {
    if (!calendarContainer.current) return;
    // Destroy existing calendar to prevent multiple instances
    if (calendarRef.current) {
      calendarRef.current.destroy();
    }
    if (!mappedEvents || !groupedAssignedResources) {
      console.warn('Mapped events or grouped resources are not ready yet.');
      return;
    }
    calendarRef.current = new Calendar({
      target: calendarContainer.current,
      props: {
        plugins: [DayGrid, TimeGrid, List, ResourceTimeGrid, ResourceTimeline, Interaction],
        options: {
          // date: currentDateRef.current,
          date: calendarStartDate || calendarDate,
          view: changedView,
          selectable: true,
          selectMirror: true,
          unselectAuto: false,
          editable: true,
          eventStartEditable: true,
          eventDurationEditable: true,
          events: mappedEvents,
          resources: assigned_resources,
          selectBackgroundColor: 'rgba(255, 68, 68, 0.2)',
          headerToolbar: {
            start: 'today,prev,next',
            center: 'title',
            end: 'year,month,week,day,list,resource,timeline',
          },
          datesSet: (args) => {
            if (!isDateChangeAllowed.current) return;
            isDateChangeAllowed.current = false;
            setTimeout(() => { isDateChangeAllowed.current = true }, 100);
            handleDateChange(args);
          },
        
         
          customButtons: {
            month: {
              text: 'Month',
              click: () => handleViewChange('dayGridMonth'),
            },
            week: {
              text: 'Week',
              click: () => handleViewChange('timeGridWeek'),
            },
            day: {
              text: 'Day',
              click: () => handleViewChange('timeGridDay'),
            },
            list: {
              text: 'List',
              click: () => handleViewChange('listWeek'),
            },
            year: {
              text: 'Year',
              click: () => handleViewChange('listYear'),
            },
            resource: {
              text: 'Resource',
              click: () => handleViewChange('resourceTimeGridWeek'),
            },
            timeline: {
              text: 'Timeline',
              click: () => handleViewChange('resourceTimelineDay'), // Corrected view name
            },
          },
          eventClassNames: (arg) => {
            return selectedEvents.has(arg.event.extendedProps._id) ? 'selected-event' : '';
          },

          select: (info) => {
            if (user.access_level < 3) {
              toast.error('You do not have permission to create events.try logging in again');
              return;
            }
            const { start, end, resource } = info;
            const timezoneOffset = 3;
            const adjustedStartTime = adjustTimeForBackend(start, timezoneOffset);
            const adjustedEndTime = adjustTimeForBackend(end, timezoneOffset);
            
            const newEvent = {
              start_time: adjustedStartTime,
              end_time: adjustedEndTime,
             
              title: 'new task',
              resource,
            };
            openCreateForm(newEvent);
          },
          
          dateClick: (info) => {
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
             // Preserve the current view before opening the form
  const currentViewState = preserveCalendarView();

  openCreateForm(newEvent); // Open form with pre-filled start time

  // Restore the calendar view after form submission (assuming successful)
  if (currentViewState) {
    restoreCalendarView(currentViewState);
  }
            // openCreateForm(newEvent); // Open form with pre-filled start time
          },
          eventClick: (info) => {
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
                updateEventAppearance(eventId, false);
              } else {
                newSelected.add(eventId);
                updateEventAppearance(eventId, true);
              }
              
              // Update both state and ref
              selectedEventsRef.current = newSelected;
              setSelectedEvents(newSelected);
            } else {
              // Single select mode
              if (selectedEvents.size > 0) {
                clearEventSelection();
              }
              const { event } = info;
              const { extendedProps } = event;
               
// Helper function to process resource arrays
const processResourceArray = (resources) => {
  if (!resources) return [];
  
  return resources.map(resource => {
    if (typeof resource === 'string') return resource;
    
    // Handle both direct IDs and resource objects
    return {
      _id: resource._id || resource.id,
      relationshipType: resource.relationshipType || 'requires',
      required: resource.required || false,
      resource: resource.resource ? {
        _id: resource.resource._id,
        displayName: resource.resource.displayName,
        fields: resource.resource.fields || {},
        status: resource.resource.status,
        type: resource.resource.type
      } : null
    };
  });
};

// Construct the updatedEvent object with proper resource handling
const updatedEvent = {
  _id: event._id || eventId,
  title: event.title || 'Untitled Event',
  start: event.start || new Date(),
  end: event.end || new Date(),
  color: event.backgroundColor || extendedProps?.color || '#cccccc',
  images: extendedProps?.images || [],
  notes: extendedProps?.notes || '',
  status: extendedProps?.status || 'pending',
  repeat_frequency: extendedProps?.repeat_frequency || 'none',
  task_period: extendedProps?.task_period || '1 week',
  priority: extendedProps?.priority || 'medium',
  timezone: extendedProps?.timezone || 'UTC',
  visibility: extendedProps?.visibility || 'team',
  created_by: extendedProps?.created_by || null,
  
  // Process assigned resources
  assigned_resources: {
    assigned_to: Array.isArray(extendedProps?.assigned_resources?.assigned_to)
    ? extendedProps.assigned_resources.assigned_to.map(user => 
        typeof user === 'object' ? {
          // Include full user object if available
          ...user,
          _id: user._id || user.id
        } : user
      )
    : [],
    
    resources: processResourceArray(extendedProps?.assigned_resources?.resources)
  },
  
  // Include all resource IDs in a flat array
  resourceIds: extendedProps?.resourceIds || []
};

openForm(updatedEvent);
          }
          },
          
          eventDrop: (info) => {
            handleEventDrop(info).catch(console.error);
          },
          eventResize: (info) => { 
            handleEventResize(info, user, onEventUpdate, adjustTimeForBackend);
          }
        },
      },
    });
    // Add this to your useEffect that handles styles
    // const style = document.createElement('style');
    // style.textContent = `
    //     .time-picker-dialog {
    //         position: fixed;
    //         top: 0;
    //         left: 0;
    //         right: 0;
    //         bottom: 0;
    //         background: rgba(0,0,0,0.5);
    //         display: flex;
    //         align-items: center;
    //         justify-content: center;
    //         z-index: 9999;
    //     }
        
    //     .time-picker-dialog input[type="time"] {
    //         padding: 8px;
    //         margin: 5px;
    //         border: 1px solid #ddd;
    //         border-radius: 4px;
    //     }
        
    //     .time-picker-dialog button {
    //         cursor: pointer;
    //         border-radius: 4px;
    //         border: 1px solid #ddd;
    //     }
        
    //     .time-picker-dialog button:hover {
    //         opacity: 0.8;
    //     }
    // `;
    // document.head.appendChild(style);

    // return () => {
    //   document.head.removeChild(style);
    // };
  }, [events, assigned_resources, changedView]);
    // Update clearEventSelection to handle both state and ref
    const clearEventSelection = useCallback(() => {
      Array.from(selectedEventsRef.current).forEach(eventId => {
        updateEventAppearance(eventId, false);
      });
      selectedEventsRef.current.clear();
      setSelectedEvents(new Set());
    }, []);
  
    // Add this effect to sync ref with state changes
    useEffect(() => {
      selectedEventsRef.current = new Set(selectedEvents);
    }, [selectedEvents]);
  
  useEffect(() => {
    return () => {
        dragStartPositionsRef.current.clear();
    };
  }, []);

  return (
    <>
      <div ref={calendarContainer} id="ec" />
    </>
  );
};

export default EventCalendarWrapper;
