
export const getTimezoneOffsetHours = (timezone) => {
    try {
      // If already a number (like +3 or -5), return it directly
      if (typeof timezone === 'number') {
        return timezone;
      }
      
      // If it's a string like "+3" or "-5.5"
      if (/^[+-]?\d+(\.\d+)?$/.test(timezone)) {
        return parseFloat(timezone);
      }
      
      // For timezone names (Europe/Jersey, America/New_York)
      if (typeof timezone === 'string' && Intl?.DateTimeFormat) {
        const date = new Date();
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          timeZoneName: 'longOffset'
        }).format(date);
        
        // Extract offset like "GMT+3" or "GMT-5:30"
        const offsetString = formatted.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
        if (offsetString) {
          const hours = parseInt(offsetString[1]);
          const minutes = offsetString[2] ? parseInt(offsetString[2]) / 60 : 0;
          return hours + (hours < 0 ? -minutes : minutes);
        }
      }
      
      // Fallback to local timezone
      return new Date().getTimezoneOffset() / -60;
    } catch (error) {
      console.error('Error getting timezone offset:', error);
      return 0; // Fallback to UTC
    }
  };