export function isWithinQuietHours(
    checkTime: Date, 
    quietHoursStart: string, 
    quietHoursEnd: string
  ): boolean {
    const currentTime = checkTime.getHours() * 60 + checkTime.getMinutes();
    
    const [startHour, startMinute] = quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = quietHoursEnd.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
  
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentTime >= startMinutes || currentTime <= endMinutes;
    }
  
    return currentTime >= startMinutes && currentTime <= endMinutes;
  }