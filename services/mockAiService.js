/**
 * Mock AI Parsing Service
 * Simulates an external call to Google Gemini or another LLM.
 */
export const aiParsingService = async (transcript) => {
  // TODO: Replace with actual AI API call (e.g., Google Gemini)
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mocked parsed response based on transcript
      resolve({
        type: 'Event',
        title: 'Team Stand-up',
        content: transcript, // Raw voice transcript text
        startTime: '2026-06-27T09:00:00Z',
        endTime: '2026-06-27T09:30:00Z'
      });
    }, 500); // simulate network delay
  });
};
