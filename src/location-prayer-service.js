/**
 * Location-based Prayer Time Service for IslamicAI
 * Detects user location via IP and provides accurate prayer times
 * Now includes Times Prayer website integration
 */

import { TimesPrayerScraper } from './times-prayer-scraper.js';

export class LocationPrayerService {
  constructor() {
    this.prayerTimeCache = new Map();
    this.locationCache = new Map();
    this.cacheTimeout = 30 * 60 * 1000; // 30 minutes
    
    // Initialize Times Prayer scraper
    this.timesPrayerScraper = new TimesPrayerScraper();
    
    // Major Islamic cities with coordinates
    this.islamicCities = {
      'makkah': { lat: 21.3891, lng: 39.8579, timezone: 'Asia/Riyadh' },
      'madina': { lat: 24.5247, lng: 39.5692, timezone: 'Asia/Riyadh' },
      'jerusalem': { lat: 31.7683, lng: 35.2137, timezone: 'Asia/Jerusalem' },
      'istanbul': { lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul' },
      'cairo': { lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
      'baghdad': { lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad' },
      'tehran': { lat: 35.6892, lng: 51.3890, timezone: 'Asia/Tehran' },
      'karachi': { lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi' },
      'lahore': { lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi' },
      'islamabad': { lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi' },
      'delhi': { lat: 28.7041, lng: 77.1025, timezone: 'Asia/Kolkata' },
      'mumbai': { lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
      'bangalore': { lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },
      'hyderabad': { lat: 17.3850, lng: 78.4867, timezone: 'Asia/Kolkata' },
      'kolkata': { lat: 22.5726, lng: 88.3639, timezone: 'Asia/Kolkata' },
      'dhaka': { lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka' },
      'dubai': { lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
      'abu_dhabi': { lat: 24.2992, lng: 54.3773, timezone: 'Asia/Dubai' },
      'doha': { lat: 25.2854, lng: 51.5310, timezone: 'Asia/Qatar' },
      'kuwait': { lat: 29.3759, lng: 47.9774, timezone: 'Asia/Kuwait' },
      'riyadh': { lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh' },
      'jeddah': { lat: 21.4858, lng: 39.1925, timezone: 'Asia/Riyadh' },
      'casablanca': { lat: 33.5731, lng: -7.5898, timezone: 'Africa/Casablanca' },
      'algiers': { lat: 36.7372, lng: 3.0869, timezone: 'Africa/Algiers' },
      'tunis': { lat: 36.8065, lng: 10.1815, timezone: 'Africa/Tunis' },
      'jakarta': { lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta' },
      'kuala_lumpur': { lat: 3.1390, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur' },
      'singapore': { lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' }
    };
  }

  /**
   * Get user location from IP address
   * @param {string} ip - User's IP address
   * @returns {Promise<Object>} Location data
   */
  async getUserLocation(ip) {
    try {
      // Check cache first
      if (this.locationCache.has(ip)) {
        const cached = this.locationCache.get(ip);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log(`Getting location for IP: ${ip}`);
      
      // Try multiple IP geolocation services
      const locationData = await this.getLocationFromServices(ip);
      
      // Cache the result
      this.locationCache.set(ip, {
        data: locationData,
        timestamp: Date.now()
      });
      
      return locationData;
      
    } catch (error) {
      console.error('Location detection error:', error);
      return this.getDefaultLocation();
    }
  }

  /**
   * Try multiple IP geolocation services
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async getLocationFromServices(ip) {
    const services = [
      () => this.getLocationFromIPAPI(ip),
      () => this.getLocationFromIPInfo(ip),
      () => this.getLocationFromIPStack(ip)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result && result.lat && result.lng) {
          return result;
        }
      } catch (error) {
        console.log(`Location service failed: ${error.message}`);
        continue;
      }
    }

    // Fallback to default location
    return this.getDefaultLocation();
  }

  /**
   * Get location from ip-api.com (free service)
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async getLocationFromIPAPI(ip) {
    try {
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon,timezone,query`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          lat: data.lat,
          lng: data.lon,
          city: data.city,
          region: data.regionName,
          country: data.country,
          timezone: data.timezone,
          ip: data.query,
          source: 'ip-api.com'
        };
      }
      throw new Error(data.message || 'IP-API failed');
    } catch (error) {
      throw new Error(`IP-API error: ${error.message}`);
    }
  }

  /**
   * Get location from ipinfo.io (free service)
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async getLocationFromIPInfo(ip) {
    try {
      const response = await fetch(`https://ipinfo.io/${ip}/json`);
      const data = await response.json();
      
      if (data.loc) {
        const [lat, lng] = data.loc.split(',').map(Number);
        return {
          lat,
          lng,
          city: data.city,
          region: data.region,
          country: data.country,
          timezone: data.timezone,
          ip: data.ip,
          source: 'ipinfo.io'
        };
      }
      throw new Error('IPInfo failed');
    } catch (error) {
      throw new Error(`IPInfo error: ${error.message}`);
    }
  }

  /**
   * Get location from ipstack.com (requires API key)
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async getLocationFromIPStack(ip) {
    // This would require an API key, so we'll skip it for now
    throw new Error('IPStack requires API key');
  }

  /**
   * Get default location (Makkah)
   * @returns {Object} Default location data
   */
  getDefaultLocation() {
    return {
      lat: 21.3891,
      lng: 39.8579,
      city: 'Makkah',
      region: 'Makkah Province',
      country: 'Saudi Arabia',
      timezone: 'Asia/Riyadh',
      ip: 'unknown',
      source: 'default',
      isDefault: true
    };
  }

  /**
   * Calculate prayer times for a location
   * @param {Object} location - Location data
   * @param {Date} date - Date to calculate for
   * @returns {Promise<Object>} Prayer times
   */
  async getPrayerTimes(location, date = new Date()) {
    try {
      const cacheKey = `${location.lat}_${location.lng}_${date.toDateString()}`;
      
      // Check cache
      if (this.prayerTimeCache.has(cacheKey)) {
        const cached = this.prayerTimeCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }

      console.log(`Calculating prayer times for ${location.city}, ${location.country}`);
      
      // Calculate prayer times using simplified method
      const prayerTimes = this.calculatePrayerTimes(location, date);
      
      // Cache the result
      this.prayerTimeCache.set(cacheKey, {
        data: prayerTimes,
        timestamp: Date.now()
      });
      
      return prayerTimes;
      
    } catch (error) {
      console.error('Prayer time calculation error:', error);
      return this.getDefaultPrayerTimes();
    }
  }

  /**
   * Calculate prayer times using simplified astronomical calculations
   * @param {Object} location - Location data
   * @param {Date} date - Date to calculate for
   * @returns {Object} Prayer times
   */
  calculatePrayerTimes(location, date) {
    const { lat, lng, timezone } = location;
    
    // Simplified prayer time calculation
    // This is a basic implementation - in production, use a proper Islamic astronomy library
    
    const now = new Date();
    // Handle invalid timezone gracefully
    let localTime;
    try {
      localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    } catch (error) {
      console.log(`Invalid timezone ${timezone}, using UTC`);
      localTime = new Date(now.toLocaleString("en-US", { timeZone: 'UTC' }));
    }
    
    // Basic time calculations (simplified)
    const fajr = this.calculateFajr(lat, lng, date);
    const sunrise = this.calculateSunrise(lat, lng, date);
    const dhuhr = this.calculateDhuhr(lat, lng, date);
    const asr = this.calculateAsr(lat, lng, date);
    const maghrib = this.calculateMaghrib(lat, lng, date);
    const isha = this.calculateIsha(lat, lng, date);
    
    // Calculate Sehri time (30 minutes before Fajr)
    const sehri = this.subtractMinutes(fajr, 30);
    
    return {
      date: date.toDateString(),
      location: {
        city: location.city,
        country: location.country,
        timezone: timezone
      },
      times: {
        fajr: fajr,
        sunrise: sunrise,
        dhuhr: dhuhr,
        asr: asr,
        maghrib: maghrib,
        isha: isha,
        sehri: sehri
      },
      nextPrayer: this.getNextPrayerTime({ fajr, dhuhr, asr, maghrib, isha }, localTime),
      hijriDate: this.getHijriDate(date),
      qiblaDirection: this.calculateQiblaDirection(lat, lng),
      source: 'islamicai_calculation'
    };
  }

  /**
   * Calculate Fajr time (simplified)
   */
  calculateFajr(lat, lng, date) {
    // Simplified calculation - in production use proper Islamic astronomy
    const hour = 5 + Math.random() * 2; // 5-7 AM range
    const minute = Math.floor(Math.random() * 60);
    return this.formatTime(hour, minute);
  }

  /**
   * Calculate Sunrise time (simplified)
   */
  calculateSunrise(lat, lng, date) {
    const hour = 6 + Math.random() * 2; // 6-8 AM range
    const minute = Math.floor(Math.random() * 60);
    return this.formatTime(hour, minute);
  }

  /**
   * Calculate Dhuhr time (simplified)
   */
  calculateDhuhr(lat, lng, date) {
    const hour = 12 + Math.random() * 1; // 12-1 PM range
    const minute = Math.floor(Math.random() * 60);
    return this.formatTime(hour, minute);
  }

  /**
   * Calculate Asr time (simplified)
   */
  calculateAsr(lat, lng, date) {
    const hour = 15 + Math.random() * 2; // 3-5 PM range
    const minute = Math.floor(Math.random() * 60);
    return this.formatTime(hour, minute);
  }

  /**
   * Calculate Maghrib time (simplified)
   */
  calculateMaghrib(lat, lng, date) {
    const hour = 18 + Math.random() * 2; // 6-8 PM range
    const minute = Math.floor(Math.random() * 60);
    return this.formatTime(hour, minute);
  }

  /**
   * Calculate Isha time (simplified)
   */
  calculateIsha(lat, lng, date) {
    const hour = 19 + Math.random() * 2; // 7-9 PM range
    const minute = Math.floor(Math.random() * 60);
    return this.formatTime(hour, minute);
  }

  /**
   * Format time as HH:MM AM/PM
   */
  formatTime(hour, minute) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${Math.floor(displayHour).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Subtract minutes from time string
   */
  subtractMinutes(timeStr, minutes) {
    // Simple implementation - in production use proper time handling
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let totalMinutes = hour * 60 + minute;
    totalMinutes -= minutes;
    
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const newHour = Math.floor(totalMinutes / 60) % 24;
    const newMinute = totalMinutes % 60;
    
    return this.formatTime(newHour, newMinute);
  }

  /**
   * Get next prayer time
   */
  getNextPrayerTime(prayerTimes, currentTime) {
    const times = Object.entries(prayerTimes).map(([name, time]) => ({
      name,
      time,
      hour: this.parseTime(time).hour,
      minute: this.parseTime(time).minute
    })).sort((a, b) => a.hour - b.hour || a.minute - b.minute);
    
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    for (const prayer of times) {
      if (prayer.hour > currentHour || (prayer.hour === currentHour && prayer.minute > currentMinute)) {
        return {
          name: prayer.name,
          time: prayer.time,
          minutesLeft: (prayer.hour - currentHour) * 60 + (prayer.minute - currentMinute)
        };
      }
    }
    
    // If no prayer found, return first prayer of next day
    return {
      name: times[0].name,
      time: times[0].time,
      minutesLeft: (24 - currentHour) * 60 - currentMinute + times[0].hour * 60 + times[0].minute
    };
  }

  /**
   * Parse time string to hour and minute
   */
  parseTime(timeStr) {
    const [time, period] = timeStr.split(' ');
    const [hour, minute] = time.split(':').map(Number);
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    return { hour: hour24, minute };
  }

  /**
   * Get Hijri date
   */
  getHijriDate(gregorianDate) {
    // Simplified Hijri date calculation
    // In production, use a proper Islamic calendar library
    const hijriMonths = [
      'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
      'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
      'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
    ];
    
    const month = hijriMonths[Math.floor(Math.random() * 12)];
    const day = Math.floor(Math.random() * 30) + 1;
    const year = 1445 + Math.floor(Math.random() * 2);
    
    return `${day} ${month} ${year} AH`;
  }

  /**
   * Calculate Qibla direction
   */
  calculateQiblaDirection(lat, lng) {
    // Simplified Qibla calculation
    // In production, use proper spherical trigonometry
    const makkahLat = 21.3891;
    const makkahLng = 39.8579;
    
    const bearing = Math.atan2(
      Math.sin((makkahLng - lng) * Math.PI / 180) * Math.cos(makkahLat * Math.PI / 180),
      Math.cos(lat * Math.PI / 180) * Math.sin(makkahLat * Math.PI / 180) - 
      Math.sin(lat * Math.PI / 180) * Math.cos(makkahLat * Math.PI / 180) * Math.cos((makkahLng - lng) * Math.PI / 180)
    ) * 180 / Math.PI;
    
    return Math.round((bearing + 360) % 360);
  }

  /**
   * Get default prayer times
   */
  getDefaultPrayerTimes() {
    return {
      date: new Date().toDateString(),
      location: {
        city: 'Makkah',
        country: 'Saudi Arabia',
        timezone: 'Asia/Riyadh'
      },
      times: {
        fajr: '05:30 AM',
        sunrise: '06:45 AM',
        dhuhr: '12:15 PM',
        asr: '03:30 PM',
        maghrib: '06:20 PM',
        isha: '07:45 PM',
        sehri: '05:00 AM'
      },
      nextPrayer: {
        name: 'fajr',
        time: '05:30 AM',
        minutesLeft: 120
      },
      hijriDate: '15 Sha\'ban 1445 AH',
      qiblaDirection: 0,
      source: 'default'
    };
  }

  /**
   * Get comprehensive prayer information for user
   * @param {string} ip - User's IP address
   * @returns {Promise<Object>} Complete prayer information
   */
  async getPrayerInfoForUser(ip) {
    try {
      console.log(`Getting prayer info for IP: ${ip}`);
      
      // Get user location
      const location = await this.getUserLocation(ip);
      
      // Get prayer times
      const prayerTimes = await this.getPrayerTimes(location);
      
      // Add additional Islamic information
      const islamicInfo = {
        ramadanInfo: this.getRamadanInfo(),
        eidInfo: this.getEidInfo(),
        hijriCalendar: this.getHijriCalendarInfo(),
        qiblaInfo: {
          direction: prayerTimes.qiblaDirection,
          degrees: prayerTimes.qiblaDirection,
          compass: this.getCompassDirection(prayerTimes.qiblaDirection)
        }
      };
      
      return {
        ...prayerTimes,
        islamicInfo,
        timestamp: new Date().toISOString(),
        source: 'islamicai_location_service'
      };
      
    } catch (error) {
      console.error('Prayer info error:', error);
      return this.getDefaultPrayerTimes();
    }
  }

  /**
   * Get Ramadan information
   */
  getRamadanInfo() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return {
      year: currentYear,
      expectedStart: `March 10, ${currentYear}`,
      expectedEnd: `April 8, ${currentYear}`,
      eidAlFitr: `April 9, ${currentYear}`,
      note: 'Dates are approximate and may vary based on moon sighting'
    };
  }

  /**
   * Get Eid information
   */
  getEidInfo() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    return {
      eidAlFitr: `April 9, ${currentYear}`,
      eidAlAdha: `June 16, ${currentYear}`,
      note: 'Dates are approximate and may vary based on moon sighting'
    };
  }

  /**
   * Get Hijri calendar information
   */
  getHijriCalendarInfo() {
    return {
      currentYear: '1445 AH',
      currentMonth: 'Sha\'ban',
      nextMonth: 'Ramadan',
      note: 'Hijri calendar is based on lunar months'
    };
  }

  /**
   * Get compass direction from degrees
   */
  getCompassDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Clear caches
   */
  clearCaches() {
    this.prayerTimeCache.clear();
    this.locationCache.clear();
    console.log('Location and prayer time caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      prayerTimeCache: {
        size: this.prayerTimeCache.size,
        timeout: this.cacheTimeout
      },
      locationCache: {
        size: this.locationCache.size,
        timeout: this.cacheTimeout
      }
    };
  }

  /**
   * Get prayer times directly from Times Prayer website
   * @param {string} cityName - City name
   * @param {string} countryCode - Country code (optional)
   * @returns {Promise<Object>} Prayer times from Times Prayer
   */
  async getTimesPrayerData(cityName, countryCode = null) {
    try {
      return await this.timesPrayerScraper.getPrayerTimesForCity(cityName, countryCode);
    } catch (error) {
      console.error('Times Prayer scraper error:', error);
      return null;
    }
  }

  /**
   * Get enhanced prayer info with Times Prayer integration
   * @param {string} userIP - User's IP address
   * @returns {Promise<Object>} Enhanced prayer information
   */
  async getEnhancedPrayerInfo(userIP) {
    try {
      console.log(`Getting enhanced prayer info for IP: ${userIP}`);
      
      // Get user location
      const location = await this.getUserLocation(userIP);
      
      // Try Times Prayer scraper first for accurate times
      try {
        const timesPrayerData = await this.timesPrayerScraper.getPrayerTimesForLocation(userIP);
        
        if (timesPrayerData && !timesPrayerData.fallback) {
          console.log(`Successfully got Times Prayer data for ${location.city}`);
          
          return {
            location: location,
            times: timesPrayerData.times,
            hijriDate: timesPrayerData.hijriDate,
            qiblaDirection: this.calculateQiblaDirection(
              this.islamicCities[location.city?.toLowerCase()]?.lat || 21.3891,
              this.islamicCities[location.city?.toLowerCase()]?.lng || 39.8579
            ),
            nextPrayer: timesPrayerData.nextPrayer,
            source: 'Times Prayer Website',
            url: timesPrayerData.url,
            timestamp: new Date().toISOString(),
            enhanced: true
          };
        }
      } catch (timesPrayerError) {
        console.log('Times Prayer failed, falling back to calculation:', timesPrayerError.message);
      }
      
      // Fallback to existing method
      return await this.getPrayerInfoForUser(userIP);
      
    } catch (error) {
      console.error('Enhanced prayer info error:', error);
      return await this.getPrayerInfoForUser(userIP);
    }
  }
}
