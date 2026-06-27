/**
 * Mock Briefing Service Stub
 */
export const generateBriefingTextService = async (items) => {
  // TODO: Pass items to an AI service to generate a natural language summary
  return new Promise((resolve) => {
    setTimeout(() => {
      const taskCount = items.filter(i => i.type === 'Task').length;
      const eventCount = items.filter(i => i.type === 'Event').length;
      
      resolve(`Good morning! You have ${taskCount} task(s) and ${eventCount} meeting(s) today.`);
    }, 200);
  });
};
