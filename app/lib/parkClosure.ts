// Park closure configuration - Central Time
export const PARK_CLOSING_DATE = new Date('2025-08-17T23:59:59-05:00'); // Central Time

// Helper function to create a date in Central Time
function createCentralDate(dateString: string): Date {
  // If no time zone specified, assume Central Time
  if (!dateString.includes('T') && !dateString.includes(' ')) {
    // Just a date like "2025-08-18"
    return new Date(dateString + 'T00:00:00-05:00');
  }
  
  // If it has time but no timezone, assume Central Time
  if (!dateString.includes('+') && !dateString.includes('-05:00') && !dateString.includes('Z')) {
    return new Date(dateString + '-05:00');
  }
  
  return new Date(dateString);
}

// Check if the park is closed based on current date
export function isParkClosed(currentDate: Date = new Date()): boolean {
  return currentDate > PARK_CLOSING_DATE;
}

// For testing purposes, you can override the date
export function isParkClosedWithOverride(overrideDate?: string): boolean {
  // Check for URL parameter override (for testing)
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const dateOverride = urlParams.get('date') || overrideDate;
    
    if (dateOverride) {
      const testDate = createCentralDate(dateOverride);
      if (!isNaN(testDate.getTime())) {
        return testDate > PARK_CLOSING_DATE;
      }
    }
  }
  
  return isParkClosed();
}