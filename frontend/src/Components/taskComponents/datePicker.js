
import React, { useState, useMemo } from 'react'; // <-- Import useMemo
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datePicker.css'; // <-- We'll create this file for our custom dot styles

const DateRangeFilter = ({ onDateRangeSelect, onCalendarDateChange, tasksWithDates = [] }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  // 2. Calculate highlighted dates using useMemo for performance
  const highlightedDates = useMemo(() => {
    if (!tasksWithDates || tasksWithDates.length === 0) {
      return [];
    }

    const dateSet = new Set();
    tasksWithDates.forEach((task) => {
          if (task.start) {
        // Normalize the date to midnight to ensure correct comparison
        const taskDate = new Date(task.start);
        taskDate.setHours(0, 0, 0, 0);
        dateSet.add(taskDate.getTime()); // Add the timestamp to the set
      }
    });

    // Convert the set of timestamps back to an array of Date objects
    return Array.from(dateSet).map(time => new Date(time));
  }, [tasksWithDates]); // This will only re-run when tasksWithDates changes

    const handleDateRangeChange = (update) => {
      // `update` is an array [startDate, endDate]. On the first click, it's [Date, null].
      setDateRange(update);
  
      const [start, end] = update;
        onDateRangeSelect(start, end);
      onCalendarDateChange(start, end);
    };
   
  
  const clearDateRange = () => {
    setDateRange([null, null]);
    onDateRangeSelect(null, null);
    onCalendarDateChange(null, null);
  };

  return (
    <div className="date-range-filter relative">
      <ReactDatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleDateRangeChange}
        highlightDates={highlightedDates}
        inline
        
        renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
          <div className="flex items-center justify-between mb-2 px-2">
            <button onClick={decreaseMonth} className="text-blue-500 font-bold hover:underline">
              {'<'}
            </button>
            <span className=" text-md font-semibold">
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={increaseMonth} className="text-blue-500 font-bold hover:underline">
              {'>'}
            </button>
            {(startDate || endDate) && (
              <button
                onClick={clearDateRange}
                className="text-white px-2 py-1 bg-red-500 rounded-md hover:bg-red-600 transition ml-1"
              >
                X
              </button>
            )}
          </div>
        )}
        placeholderText="Select a date range"
        className="input p-1 border border-blue-400 rounded-md"
      />
    </div>
  );
};

export default DateRangeFilter;