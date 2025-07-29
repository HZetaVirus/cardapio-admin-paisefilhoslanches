
export const isStoreOpen = (horarioFuncionamento?: string): boolean => {
  if (!horarioFuncionamento) return true; // If no hours set, assume always open
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
  
  try {
    // Parse the schedule format (expecting something like "Seg-Sex: 08:00-22:00\nSáb-Dom: 09:00-21:00")
    const lines = horarioFuncionamento.split('\n');
    
    for (const line of lines) {
      const [dayRange, timeRange] = line.split(':').map(s => s.trim());
      if (!dayRange || !timeRange) continue;
      
      // Parse day range
      let startDay = 0, endDay = 6;
      if (dayRange.includes('Seg') && dayRange.includes('Sex')) {
        startDay = 1; endDay = 5; // Monday to Friday
      } else if (dayRange.includes('Sáb') && dayRange.includes('Dom')) {
        startDay = 6; endDay = 0; // Saturday to Sunday (handle wrap around)
      } else if (dayRange.includes('Seg') && dayRange.includes('Dom')) {
        startDay = 1; endDay = 0; // Monday to Sunday (handle wrap around)
      }
      
      // Check if current day is in range
      const isInDayRange = startDay <= endDay 
        ? (currentDay >= startDay && currentDay <= endDay)
        : (currentDay >= startDay || currentDay <= endDay);
      
      if (isInDayRange) {
        // Parse time range
        const [startTime, endTime] = timeRange.split('-').map(s => s.trim());
        if (startTime && endTime) {
          const [startHour, startMin] = startTime.split(':').map(Number);
          const [endHour, endMin] = endTime.split(':').map(Number);
          
          const startTimeInMinutes = startHour * 60 + startMin;
          const endTimeInMinutes = endHour * 60 + endMin;
          
          if (currentTime >= startTimeInMinutes && currentTime <= endTimeInMinutes) {
            return true;
          }
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error parsing store hours:', error);
    return true; // Default to open if parsing fails
  }
};

export const getStoreStatusText = (isOpen: boolean): string => {
  return isOpen ? 'Aberto' : 'Fechado';
};
