import { useState, useEffect } from 'react';

// Main Calendar Component
export default function CalendarApp() {
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState('2025-05-12');
  const [ruleType, setRuleType] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday (0-6, where 0 is Sunday)
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [time, setTime] = useState('09:00');
  const [count, setCount] = useState(5);
  const [dateRangeStart, setDateRangeStart] = useState('2025-05-01');
  const [dateRangeEnd, setDateRangeEnd] = useState('2025-06-30');
  const [calendarDates, setCalendarDates] = useState([]);

  // Date utility functions
  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    return new Date(year, month - 1, day);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayOfWeek = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    
    return `${dayOfWeek}, ${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const addWeeks = (date, weeks) => {
    return addDays(date, weeks * 7);
  };

  const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  };

  const isWithinInterval = (date, start, end) => {
    return date >= start && date <= end;
  };

  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Generate calendar dates for display
  useEffect(() => {
    if (dateRangeStart && dateRangeEnd) {
      const start = parseDate(dateRangeStart);
      const end = parseDate(dateRangeEnd);
      
      const dates = [];
      let currentDate = new Date(start);
      
      while (currentDate <= end) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
      }
      
      setCalendarDates(dates);
    }
  }, [dateRangeStart, dateRangeEnd]);

  // Generate recurring events
  const generateInstances = (startDate, ruleType, ruleParam, count, dateRangeStart, dateRangeEnd) => {
    // Parse dates
    const start = parseDate(startDate);
    const rangeStart = parseDate(dateRangeStart);
    const rangeEnd = parseDate(dateRangeEnd);
    
    // Combine date with time
    const timeComponents = ruleParam.time.split(':');
    const hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1], 10);
    
    start.setHours(hours, minutes, 0, 0);
    
    const instances = [];
    let currentDate = new Date(start);
    let instancesGenerated = 0;
    
    // Handle different recurrence types
    while (instancesGenerated < count) {
      if (ruleType === 'daily') {
        if (instancesGenerated > 0) {
          currentDate = addDays(currentDate, 1);
        }
      } else if (ruleType === 'weekly') {
        if (instancesGenerated > 0) {
          currentDate = addWeeks(currentDate, 1);
        }
        
        // For weekly recurrence, adjust to the specified day of week if needed
        const currentDayOfWeek = currentDate.getDay();
        if (currentDayOfWeek !== ruleParam.dayOfWeek) {
          const daysToAdd = (ruleParam.dayOfWeek - currentDayOfWeek + 7) % 7;
          currentDate = addDays(currentDate, daysToAdd);
        }
      } else if (ruleType === 'monthly') {
        if (instancesGenerated > 0) {
          currentDate = addMonths(currentDate, 1);
        }
        
        // Set the specific day of month
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(ruleParam.dayOfMonth, daysInMonth);
        currentDate.setDate(targetDay);
      }
      
      // Check if the event is within the specified date range
      if (isWithinInterval(currentDate, rangeStart, rangeEnd)) {
        instances.push(new Date(currentDate));
        instancesGenerated++;
      } else if (currentDate > rangeEnd) {
        // Stop if we've gone beyond the range
        break;
      }
    }
    
    return instances;
  };

  // Handle form submission
  const handleGenerateEvents = () => {
    const ruleParam = {
      time,
      ...(ruleType === 'weekly' && { dayOfWeek: parseInt(dayOfWeek, 10) }),
      ...(ruleType === 'monthly' && { dayOfMonth: parseInt(dayOfMonth, 10) })
    };

    const generatedEvents = generateInstances(
      startDate,
      ruleType,
      ruleParam,
      parseInt(count, 10),
      dateRangeStart,
      dateRangeEnd
    );

    setEvents(generatedEvents);
  };

  // Check if a date has an event
  const hasEvent = (date) => {
    return events.some(event => isSameDay(event, date));
  };

  // Group calendar dates by week for display
  const getCalendarWeeks = () => {
    if (calendarDates.length === 0) return [];
    
    const weeks = [];
    let currentWeek = [];
    
    // Find the first day of the week (Sunday)
    const firstDate = new Date(calendarDates[0]);
    const daysToSubtract = firstDate.getDay();
    firstDate.setDate(firstDate.getDate() - daysToSubtract);
    
    // Fill in dates
    let currentDate = new Date(firstDate);
    const lastDate = new Date(calendarDates[calendarDates.length - 1]);
    
    while (currentDate <= lastDate) {
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      
      currentWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add the last week if it's not complete
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const isDateInRange = (date) => {
    const rangeStart = parseDate(dateRangeStart);
    const rangeEnd = parseDate(dateRangeEnd);
    return isWithinInterval(date, rangeStart, rangeEnd);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Recurring Event Generator</h1>
      
      {/* Form */}
      <div className="bg-gray-50 p-4 rounded-lg mb-8 shadow">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rule Type</label>
            <select
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          {ruleType === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value={0}>Sunday</option>
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
              </select>
            </div>
          )}
          
          {ruleType === 'monthly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day of Month</label>
              <select
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="w-full border rounded p-2"
              >
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Occurrences</label>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              min="1"
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range Start</label>
            <input
              type="date"
              value={dateRangeStart}
              onChange={(e) => setDateRangeStart(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range End</label>
            <input
              type="date"
              value={dateRangeEnd}
              onChange={(e) => setDateRangeEnd(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        
        <button
          onClick={handleGenerateEvents}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Generate Events
        </button>
      </div>
      
      {/* Generated Events List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Generated Events ({events.length})</h2>
        <div className="bg-white p-4 rounded shadow">
          {events.length > 0 ? (
            <ul className="space-y-2">
              {events.map((event, index) => (
                <li key={index} className="border-b pb-2">
                  {formatDisplayDate(event)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No events generated yet.</p>
          )}
        </div>
      </div>
      
      {/* Calendar View */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Calendar View</h2>
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2 bg-gray-100">{day}</div>
            ))}
          </div>
          
          {getCalendarWeeks().map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dateIndex) => {
                const hasEventOnDay = hasEvent(date);
                const isInRange = isDateInRange(date);
                
                return (
                  <div
                    key={dateIndex}
                    className={`p-2 border text-center h-16 ${
                      hasEventOnDay ? 'bg-blue-100' : ''
                    } ${
                      !isInRange ? 'text-gray-300' : ''
                    }`}
                  >
                    <div className={`${hasEventOnDay ? 'font-bold' : ''}`}>
                      {date.getDate()}
                    </div>
                    {hasEventOnDay && (
                      <div className="mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}