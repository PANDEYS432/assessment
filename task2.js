import { useState, useEffect } from 'react';

export default function RecurringEventGenerator() {
  // State for event parameters
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventTime, setEventTime] = useState('09:00');
  const [recurrenceType, setRecurrenceType] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('1'); // Monday = 1, Sunday = 0
  const [occurrences, setOccurrences] = useState(10);
  
  // State for view window
  const [viewStartDate, setViewStartDate] = useState('');
  const [viewEndDate, setViewEndDate] = useState('');
  
  // State for generated instances
  const [instances, setInstances] = useState([]);
  const [filteredInstances, setFilteredInstances] = useState([]);
  
  // Initialize dates when component loads
  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    setEventStartDate(formatDate(today));
    setViewStartDate(formatDate(today));
    setViewEndDate(formatDate(nextMonth));
  }, []);
  
  // Helper function to format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Helper function to format datetime for display
  const formatDateTime = (dateStr, timeStr) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    const dateObj = new Date(`${dateStr}T${timeStr}`);
    return dateObj.toLocaleString('en-US', options);
  };
  
  // Generate instances based on the provided parameters
  const generateInstances = () => {
    if (!eventStartDate) return;
    
    const startDate = new Date(`${eventStartDate}T${eventTime}`);
    const generatedInstances = [];
    
    // For weekly recurrence
    if (recurrenceType === 'weekly') {
      const selectedDayOfWeek = parseInt(dayOfWeek);
      
      // Align the start date to the selected day of week if needed
      let currentDate = new Date(startDate);
      while (currentDate.getDay() !== selectedDayOfWeek) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Generate instances
      for (let i = 0; i < occurrences; i++) {
        const instanceDate = new Date(currentDate);
        generatedInstances.push({
          date: formatDate(instanceDate),
          time: eventTime,
          display: formatDateTime(formatDate(instanceDate), eventTime),
          inWindow: isDateInWindow(instanceDate)
        });
        
        // Move to next week
        currentDate.setDate(currentDate.getDate() + 7);
      }
    } else if (recurrenceType === 'daily') {
      // For daily recurrence
      let currentDate = new Date(startDate);
      
      for (let i = 0; i < occurrences; i++) {
        const instanceDate = new Date(currentDate);
        generatedInstances.push({
          date: formatDate(instanceDate),
          time: eventTime,
          display: formatDateTime(formatDate(instanceDate), eventTime),
          inWindow: isDateInWindow(instanceDate)
        });
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    setInstances(generatedInstances);
    
    // Filter instances based on view window
    filterInstancesByWindow(generatedInstances);
  };
  
  // Check if a date is within the view window
  const isDateInWindow = (date) => {
    if (!viewStartDate || !viewEndDate) return true;
    
    const viewStart = new Date(`${viewStartDate}T00:00:00`);
    const viewEnd = new Date(`${viewEndDate}T23:59:59`);
    
    return date >= viewStart && date <= viewEnd;
  };
  
  // Filter instances based on the view window
  const filterInstancesByWindow = (allInstances) => {
    if (!viewStartDate || !viewEndDate) {
      setFilteredInstances(allInstances);
      return;
    }
    
    const viewStart = new Date(`${viewStartDate}T00:00:00`);
    const viewEnd = new Date(`${viewEndDate}T23:59:59`);
    
    const filtered = allInstances.filter(instance => {
      const instanceDate = new Date(`${instance.date}T${instance.time}`);
      return instanceDate >= viewStart && instanceDate <= viewEnd;
    });
    
    setFilteredInstances(filtered);
  };
  
  // Update filtered instances when view window changes
  useEffect(() => {
    filterInstancesByWindow(instances);
  }, [viewStartDate, viewEndDate]);
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Recurring Event Generator</h1>
      
      <div className="space-y-6">
        {/* Event Parameters Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Event Parameters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Start Date</label>
              <input 
                type="date" 
                value={eventStartDate} 
                onChange={(e) => setEventStartDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Time</label>
              <input 
                type="time" 
                value={eventTime} 
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence Type</label>
              <select 
                value={recurrenceType} 
                onChange={(e) => setRecurrenceType(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            
            {recurrenceType === 'weekly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select 
                  value={dayOfWeek} 
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Occurrences</label>
              <input 
                type="number" 
                value={occurrences} 
                onChange={(e) => setOccurrences(parseInt(e.target.value))}
                min="1"
                max="100"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* View Window Section */}
        <div className="bg-gray-50 p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">View Window</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <input 
                type="date" 
                value={viewStartDate} 
                onChange={(e) => setViewStartDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
              <input 
                type="date" 
                value={viewEndDate} 
                onChange={(e) => setViewEndDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="text-center">
          <button 
            onClick={generateInstances} 
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Generate Instances
          </button>
        </div>
        
        {/* Instance List */}
        {instances.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Generated Instances</h2>
            
            <div className="mb-2 text-sm text-gray-500">
              Showing {instances.length} instances ({filteredInstances.length} in view window)
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {instances.map((instance, index) => (
                <div 
                  key={index}
                  className={`p-3 border rounded-md ${instance.inWindow ? 'bg-white' : 'bg-gray-100 text-gray-500'}`}
                >
                  <div className="flex items-center">
                    <div className="mr-2">
                      {instance.inWindow ? (
                        <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="inline-block w-3 h-3 bg-gray-300 rounded-full"></span>
                      )}
                    </div>
                    <div>
                      {instance.display}
                      {!instance.inWindow && <span className="ml-2 text-sm">(outside view window)</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}