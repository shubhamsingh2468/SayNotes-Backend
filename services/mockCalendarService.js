/**
 * Mock Google Calendar Service Stub
 */
export const syncWithGoogleCalendar = async (eventDetails) => {
  // TODO: Call Google Calendar API to create/update an event
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        googleEventId: `mock-gcal-id-${Date.now()}`
      });
    }, 300);
  });
};
