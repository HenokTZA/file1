import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { importCalendar, resetCalendarState } from '../features/calendarSlice';
import { FaGoogle, FaMicrosoft, FaApple, FaInfoCircle, FaLink } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CalendarImport() {
  const [url, setUrl] = useState('');
  const dispatch = useDispatch();
  const { loading, success, error, importedCount } = useSelector((state) => state.calendar);

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    
    dispatch(importCalendar(url)).then(() => {
      if (success) {
        toast.success(`✅ Successfully imported ${importedCount} events!`);
      }
      if (error) {
        toast.error(`❌ Error: ${error}`);
      }
      setTimeout(() => dispatch(resetCalendarState()), 3000);
    });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          <FaLink className="text-blue-500" />
          Import Calendar Feed
        </h2>

        <div className="mb-4">
          <label htmlFor="ical-url" className="block text-sm font-medium text-gray-700 mb-1">
            iCal URL
          </label>
          <div className="relative">
            <input
              id="ical-url"
              type="text"
              placeholder="https://example.com/calendar.ics"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-28"
            />
            
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex mx-2 items-center gap-1">
              <div className="relative group">
                <button className="text-gray-500 hover:text-gray-700 transition-colors p-1">
                  <FaGoogle className="text-red-500 text-xl hover:text-red-600" />
                </button>
                <div className="absolute hidden group-hover:block right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200 p-3 animate-fadeIn">
                  <h3 className="font-semibold text-red-500 mb-1">Google Calendar</h3>
                  <p className="text-sm text-gray-600">
                    Go to calendar settings → Select your calendar → Under "Access permissions",
                    enable "Make available to public" and copy the <strong>public iCal URL</strong>.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-500 hover:text-gray-700 transition-colors p-1">
                  <FaMicrosoft className="text-blue-600 text-xl hover:text-blue-700" />
                </button>
                <div className="absolute hidden group-hover:block right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200 p-3 animate-fadeIn">
                  <h3 className="font-semibold text-blue-600 mb-1">Outlook Calendar</h3>
                  <p className="text-sm text-gray-600">
                    Navigate to Calendar settings → Shared Calendars → Publish calendar
                    and copy the <strong>ICS link</strong> under the "Subscribe" section.
                  </p>
                </div>
              </div>

              <div className="relative group">
                <button className="text-gray-500 hover:text-gray-700 transition-colors p-1">
                  <FaApple className="text-gray-800 text-xl hover:text-black" />
                </button>
                <div className="absolute hidden group-hover:block right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200 p-3 animate-fadeIn">
                  <h3 className="font-semibold text-gray-800 mb-1">iCloud Calendar</h3>
                  <p className="text-sm text-gray-600">
                    Open Calendar app → Right-click your calendar → Select "Share" →
                    Enable "Public Calendar" → Copy the <strong>WebCal URL</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleImport}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
          } text-white flex items-center justify-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing...
            </>
          ) : (
            'Import Calendar'
          )}
        </button>
      </div>
    </div>
  );
}

export default CalendarImport;