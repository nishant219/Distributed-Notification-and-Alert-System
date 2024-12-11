/**
 * Check if a given time is within quiet hours
 * @param checkTime Time to check
 * @param quietHoursStart Start of quiet hours (HH:MM format)
 * @param quietHoursEnd End of quiet hours (HH:MM format)
 * @returns Boolean indicating if time is within quiet hours
 */
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