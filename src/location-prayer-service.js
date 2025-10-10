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
    
    // DSA: Cap caches and precompiled patterns
    this.locationCacheCapacity = 1000;
    this.prayerCacheCapacity = 2000;
    this._privateIpRegex = /^(?:192\.168\.|10\.|172\.(?:1[6-9]|2\d|3[01])\.)/;
    
    // DSA: Geohash precision (approx ~4.9km @ precision 5)
    this._geohashPrecision = 5;
    
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

    // Different calculation methods with their parameters
    this.calculationMethods = {
      'MWL': {  // Muslim World League
        name: 'Muslim World League',
        fajr: 18,
        isha: 17,
        maghrib: 1, // minutes after sunset
        asr: 1, // 1 for standard, 2 for Hanafi
        midnight: 'standard'
      },
      'ISNA': {  // Islamic Society of North America
        name: 'Islamic Society of North America',
        fajr: 15,
        isha: 15,
        maghrib: 1,
        asr: 1,
        midnight: 'standard'
      },
      'Egypt': {  // Egyptian General Authority of Survey
        name: 'Egyptian General Authority',
        fajr: 19.5,
        isha: 17.5,
        maghrib: 1,
        asr: 1,
        midnight: 'standard'
      },
      'Makkah': {  // Umm al-Qura University, Makkah
        name: 'Umm al-Qura University, Makkah',
        fajr: 18.5,
        isha: '90min', // 90 minutes after Maghrib
        maghrib: 1,
        asr: 1,
        midnight: 'standard'
      },
      'Karachi': {  // University of Islamic Sciences, Karachi
        name: 'University of Islamic Sciences, Karachi',
        fajr: 18,
        isha: 18,
        maghrib: 1,
        asr: 1,
        midnight: 'standard'
      }
    };

    // Default calculation method
    this.defaultCalculationMethod = 'MWL';
  }

  // Helper functions for astronomical calculations
  deg2rad(deg) {
    return deg * Math.PI / 180;
  }

  rad2deg(rad) {
    return rad * 180 / Math.PI;
  }

  /**
   * Get user location from IP address
   * @param {string} ip - User's IP address
   * @returns {Promise<Object>} Location data
   */
  async getUserLocation(ip) {
    try {
      const now = Date.now();
      // Check cache first
      if (this.locationCache.has(ip)) {
        const cached = this.locationCache.get(ip);
        if (now - cached.timestamp < this.cacheTimeout) {
          console.log(`Location cache hit for IP: ${ip}`);
          return cached.data;
        } else {
          // Remove expired cache entry
          this.locationCache.delete(ip);
        }
      }

      console.log(`Getting location for IP: ${ip}`);
      
      // Try multiple IP geolocation services
      const locationData = await this.getLocationFromServices(ip);
      
      // Cache the result
      this.locationCache.set(ip, {
        data: locationData,
        timestamp: now
      });
      // Enforce capacity (LRU-ish via Map iteration order)
      if (this.locationCache.size > this.locationCacheCapacity) {
        const oldestKey = this.locationCache.keys().next().value;
        if (oldestKey) this.locationCache.delete(oldestKey);
      }
      
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
    // Skip location detection for private IPs or unknown
    if (!ip || ip === 'unknown' || this._privateIpRegex.test(ip)) {
      console.log('Skipping location detection for private IP or unknown IP');
      return this.getDefaultLocation();
    }

    const services = [
      () => this.getLocationFromIPAPI(ip),
      () => this.getLocationFromIPInfo(ip),
      // Add more services as fallbacks
      () => this.getLocationFromIPGeolocation(ip)
    ];

    for (const service of services) {
      try {
        const result = await service();
        if (result && result.lat && result.lng && result.city) {
          console.log(`Location detected from ${result.source}: ${result.city}, ${result.country}`);
          return result;
        } else if (result) {
          console.log(`Partial location data from ${result.source}:`, result);
        }
      } catch (error) {
        console.log(`Location service failed: ${error.message}`);
        continue;
      }
    }

    // Fallback to default location
    console.log('All location services failed, using default location');
    return this.getDefaultLocation();
  }

  /**
   * Get location from ip-api.com (free service)
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async getLocationFromIPAPI(ip) {
    try {
      // Use HTTPS for better security
      const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,lat,lon,timezone,query`);
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          lat: data.lat || 0,
          lng: data.lon || 0,
          city: data.city || 'Unknown City',
          region: data.regionName || 'Unknown Region',
          country: data.country || 'Unknown Country',
          timezone: data.timezone || 'UTC',
          ip: data.query || ip,
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
          lat: lat || 0,
          lng: lng || 0,
          city: data.city || 'Unknown City',
          region: data.region || 'Unknown Region',
          country: data.country || 'Unknown Country',
          timezone: data.timezone || 'UTC',
          ip: data.ip || ip,
          source: 'ipinfo.io'
        };
      }
      // Even if loc is not available, we might still have other data
      if (data.city || data.country) {
        return {
          lat: 0,
          lng: 0,
          city: data.city || 'Unknown City',
          region: data.region || 'Unknown Region',
          country: data.country || 'Unknown Country',
          timezone: data.timezone || 'UTC',
          ip: data.ip || ip,
          source: 'ipinfo.io'
        };
      }
      throw new Error('IPInfo failed - no location data');
    } catch (error) {
      throw new Error(`IPInfo error: ${error.message}`);
    }
  }

  /**
   * Get location from ipgeolocation.io (free tier available)
   * @param {string} ip - IP address
   * @returns {Promise<Object>} Location data
   */
  async getLocationFromIPGeolocation(ip) {
    try {
      // This is a free service with 1000 requests per day
      // For production, you should add your API key
      const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=&ip=${ip}`);
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        return {
          lat: parseFloat(data.latitude) || 0,
          lng: parseFloat(data.longitude) || 0,
          city: data.city || 'Unknown City',
          region: data.state_prov || 'Unknown Region',
          country: data.country_name || 'Unknown Country',
          timezone: data.time_zone ? data.time_zone.name : 'UTC',
          ip: ip,
          source: 'ipgeolocation.io'
        };
      }
      // Even if coordinates are not available, we might still have other data
      if (data.city || data.country_name) {
        return {
          lat: 0,
          lng: 0,
          city: data.city || 'Unknown City',
          region: data.state_prov || 'Unknown Region',
          country: data.country_name || 'Unknown Country',
          timezone: data.time_zone ? data.time_zone.name : 'UTC',
          ip: ip,
          source: 'ipgeolocation.io'
        };
      }
      throw new Error('IPGeolocation failed - no location data');
    } catch (error) {
      throw new Error(`IPGeolocation error: ${error.message}`);
    }
  }

  /**
   * Get timezone offset in hours for the given timezone and date
   * @param {string} timezone - IANA timezone name
   * @param {Date} date - The date
   * @returns {number} Offset in hours
   */
  getTimezoneOffset(timezone, date) {
    try {
      const testDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0));
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'shortOffset'
      });
      const parts = formatter.formatToParts(testDate);
      const tzPart = parts.find(p => p.type === 'timeZoneName');
      if (tzPart) {
        let offsetStr = tzPart.value.replace('GMT', '').replace(':', ''); // e.g., "+0300"
        const sign = offsetStr.startsWith('+') ? 1 : (offsetStr.startsWith('-') ? -1 : 0);
        if (sign === 0) return 0;
        const hours = parseInt(offsetStr.substring(1, 3));
        const mins = parseInt(offsetStr.substring(3, 5)) || 0;
        return sign * (hours + mins / 60);
      }
      return 0;
    } catch (e) {
      console.error('Timezone offset calculation error:', e);
      return 0;
    }
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
   * Calculate Julian Day Number for the given UTC date at 0h
   * @param {Date} date - The date
   * @returns {number} Julian Day Number
   */
  julianDate(date) {
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();

    if (month <= 2) {
      year -= 1;
      month += 12;
    }

    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);

    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + b - 1524;
  }

  /**
   * Calculate Sun's declination and equation of time
   * @param {number} jd - Julian Day Number
   * @returns {Object} {D: declination in degrees, EqT: equation of time in hours}
   */
  sunPosition(jd) {
    const d = jd - 2451545.0;
    const g = 357.529 + 0.98560028 * d;
    const q = 280.459 + 0.98564736 * d;
    const L = q + 1.915 * Math.sin(this.deg2rad(g)) + 0.020 * Math.sin(this.deg2rad(2 * g));
    const e = 23.439 - 0.00000036 * d;
    const RA = this.rad2deg(Math.atan2(Math.cos(this.deg2rad(e)) * Math.sin(this.deg2rad(L)), Math.cos(this.deg2rad(L)))) / 15;
    const D = this.rad2deg(Math.asin(Math.sin(this.deg2rad(e)) * Math.sin(this.deg2rad(L))));
    const EqT = q / 15 - RA;
    return { D, EqT };
  }

  /**
   * Calculate time offset for a given angle (used for sunrise, fajr, etc.)
   * @param {number} angle - Angle in degrees
   * @param {number} lat - Latitude
   * @param {number} D - Declination
   * @returns {number} Time offset in hours
   */
  timeOffset(angle, lat, D) {
    const arg = (Math.sin(this.deg2rad(angle)) - Math.sin(this.deg2rad(lat)) * Math.sin(this.deg2rad(D))) /
                (Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(D)));
    const clampedArg = Math.max(-1, Math.min(1, arg));
    const acosAngle = Math.acos(clampedArg);
    return this.rad2deg(acosAngle) / 15;
  }

  /**
   * Calculate Asr time offset
   * @param {number} lat - Latitude
   * @param {number} D - Declination
   * @param {number} factor - 1 for standard, 2 for Hanafi
   * @returns {number} Time offset in hours
   */
  asrTimeOffset(lat, D, factor) {
    const phi = lat - D;
    const tanPhi = Math.tan(this.deg2rad(Math.abs(phi)));
    const declitan = 1.0 / (factor + tanPhi * tanPhi);
    const angle = this.atan(declitan);
    const arg = (Math.sin(angle) - Math.sin(this.deg2rad(lat)) * Math.sin(this.deg2rad(D))) /
                (Math.cos(this.deg2rad(lat)) * Math.cos(this.deg2rad(D)));
    const clampedArg = Math.max(-1, Math.min(1, arg));
    const acosAngle = Math.acos(clampedArg);
    return this.rad2deg(acosAngle) / 15;
  }

  atan(declitan) {
    return Math.atan(declitan);
  }

  /**
   * Format hours to HH:MM string
   * @param {number} hours - Hours (can be >24 or <0)
   * @returns {string} Formatted time
   */
  timeToString(hours) {
    let h = ((hours % 24) + 24) % 24;
    let m = Math.floor((h - Math.floor(h)) * 60);
    h = Math.floor(h);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate prayer times using astronomical calculations with specific method
   * @param {Object} location - Location data
   * @param {Date} date - Date for prayer times
   * @param {number} timezoneOffset - Timezone offset in hours
   * @param {string} method - Calculation method (default: MWL)
   * @returns {Object} Prayer times with method information
   */
  calculatePrayerTimes(location, date, timezoneOffset, method = this.defaultCalculationMethod) {
    // Get calculation parameters for the specified method
    const params = this.calculationMethods[method] || this.calculationMethods[this.defaultCalculationMethod];
    
    const jd = this.julianDate(date);
    const { D, EqT } = this.sunPosition(jd);
    const lat = location.lat;
    const lng = location.lng;
    const timeZone = timezoneOffset;

    const dhuhr = 12 + timeZone - lng / 15 - EqT;
    const sunriseAngle = 0.8333;
    const sunriseOffset = this.timeOffset(sunriseAngle, lat, D);
    const sunsetOffset = this.timeOffset(sunriseAngle, lat, D);
    
    // Calculate Fajr and Isha based on method parameters
    const fajrOffset = this.timeOffset(params.fajr, lat, D);
    
    let ishaOffset;
    if (params.isha === '90min') {
      // Special case for Makkah method where Isha is 90 minutes after Maghrib
      const maghribOffset = sunsetOffset + params.maghrib / 60;
      const maghrib = dhuhr + maghribOffset;
      const ishaTime = maghrib + 1.5; // 90 minutes = 1.5 hours
      ishaOffset = ishaTime - dhuhr;
    } else {
      ishaOffset = this.timeOffset(params.isha, lat, D);
    }
    
    const asrOffset = this.asrTimeOffset(lat, D, params.asr);
    const maghribOffset = sunsetOffset + params.maghrib / 60;

    const fajr = dhuhr - fajrOffset;
    const sunrise = dhuhr - sunriseOffset;
    const sunset = dhuhr + sunsetOffset;
    const asr = dhuhr + asrOffset;
    const maghrib = dhuhr + maghribOffset;
    const isha = dhuhr + ishaOffset;

    return {
      date: date.toISOString().split('T')[0],
      location: {
        city: location.city,
        country: location.country,
        lat: location.lat,
        lng: location.lng
      },
      times: {
        fajr: this.timeToString(fajr),
        sunrise: this.timeToString(sunrise),
        dhuhr: this.timeToString(dhuhr),
        asr: this.timeToString(asr),
        maghrib: this.timeToString(maghrib),
        isha: this.timeToString(isha)
      },
      timezone: location.timezone || 'UTC',
      calculationMethod: method,
      calculationMethodName: params.name
    };
  }

  /**
   * Calculate prayer times for a location with multiple methods for comparison
   * @param {Object} location - Location data
   * @param {Date} date - Date for prayer times (default: today)
   * @returns {Promise<Object>} Prayer times with method comparison
   */
  async getPrayerTimesWithMethods(location, date = new Date()) {
    try {
      const dateKey = date.toDateString();
      const geoKey = this._geohash(location.lat, location.lng, this._geohashPrecision);
      const cacheKey = `${geoKey}:${dateKey}:methods`;
      
      // Check cache first
      if (this.prayerTimeCache.has(cacheKey)) {
        const cached = this.prayerTimeCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }
      
      // Compute timezone offset
      const timezoneOffset = this.getTimezoneOffset(location.timezone, date);
      
      // Try to get prayer times from Times Prayer website first
      try {
        const timesPrayerData = await this.timesPrayerScraper.getPrayerTimes(location, date);
        if (timesPrayerData) {
          // Add method information
          const result = {
            ...timesPrayerData,
            source: 'timesprayer.org',
            calculationMethod: 'WebsiteProvided',
            calculationMethodName: 'TimesPrayer.org Provided Times'
          };
          
          // Cache the result
          this.prayerTimeCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          });
          if (this.prayerTimeCache.size > this.prayerCacheCapacity) {
            const oldestKey = this.prayerTimeCache.keys().next().value;
            if (oldestKey) this.prayerTimeCache.delete(oldestKey);
          }
          return result;
        }
      } catch (error) {
        console.log('Times Prayer scraper failed:', error.message);
      }
      
      // Calculate times using multiple methods for comparison
      const methodsComparison = {};
      for (const [methodName, methodParams] of Object.entries(this.calculationMethods)) {
        methodsComparison[methodName] = this.calculatePrayerTimes(location, date, timezoneOffset, methodName);
      }
      
      // Return the default method as primary with comparison data
      const defaultMethodResult = methodsComparison[this.defaultCalculationMethod];
      const result = {
        ...defaultMethodResult,
        methodsComparison: methodsComparison
      };
      
      // Cache the result
      this.prayerTimeCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      if (this.prayerTimeCache.size > this.prayerCacheCapacity) {
        const oldestKey = this.prayerTimeCache.keys().next().value;
        if (oldestKey) this.prayerTimeCache.delete(oldestKey);
      }
      
      return result;
    } catch (error) {
      console.error('Prayer time calculation error:', error);
      // Return default prayer times for Makkah
      const defaultLocation = this.islamicCities.makkah;
      const defaultOffset = this.getTimezoneOffset(defaultLocation.timezone, date);
      return this.calculatePrayerTimes(defaultLocation, date, defaultOffset);
    }
  }

  /**
   * Calculate prayer times for a location (backward compatibility)
   * @param {Object} location - Location data
   * @param {Date} date - Date for prayer times (default: today)
   * @returns {Promise<Object>} Prayer times
   */
  async getPrayerTimes(location, date = new Date()) {
    try {
      const dateKey = date.toDateString();
      const geoKey = this._geohash(location.lat, location.lng, this._geohashPrecision);
      const cacheKey = `${geoKey}:${dateKey}`;
      
      // Check cache first
      if (this.prayerTimeCache.has(cacheKey)) {
        const cached = this.prayerTimeCache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
      }
      
      // Compute timezone offset
      const timezoneOffset = this.getTimezoneOffset(location.timezone, date);
      
      // Try to get prayer times from Times Prayer website first
      try {
        const timesPrayerData = await this.timesPrayerScraper.getPrayerTimes(location, date);
        if (timesPrayerData) {
          // Cache the result
          this.prayerTimeCache.set(cacheKey, {
            data: timesPrayerData,
            timestamp: Date.now()
          });
          if (this.prayerTimeCache.size > this.prayerCacheCapacity) {
            const oldestKey = this.prayerTimeCache.keys().next().value;
            if (oldestKey) this.prayerTimeCache.delete(oldestKey);
          }
          return timesPrayerData;
        }
      } catch (error) {
        console.log('Times Prayer scraper failed:', error.message);
      }
      
      // Fallback to calculation if web scraping fails
      const prayerTimes = this.calculatePrayerTimes(location, date, timezoneOffset);
      
      // Cache the result
      this.prayerTimeCache.set(cacheKey, {
        data: prayerTimes,
        timestamp: Date.now()
      });
      if (this.prayerTimeCache.size > this.prayerCacheCapacity) {
        const oldestKey = this.prayerTimeCache.keys().next().value;
        if (oldestKey) this.prayerTimeCache.delete(oldestKey);
      }
      
      return prayerTimes;
    } catch (error) {
      console.error('Prayer time calculation error:', error);
      // Return default prayer times for Makkah
      const defaultLocation = this.islamicCities.makkah;
      const defaultOffset = this.getTimezoneOffset(defaultLocation.timezone, date);
      return this.calculatePrayerTimes(defaultLocation, date, defaultOffset);
    }
  }

  /**
   * Get nearby Islamic cities
   * @param {Object} location - User location
   * @param {number} maxDistance - Maximum distance in kilometers
   * @returns {Array} Nearby Islamic cities
   */
  getNearbyIslamicCities(location, maxDistance = 500) {
    const nearby = [];
    
    // Calculate distance to each Islamic city
    for (const [cityName, cityData] of Object.entries(this.islamicCities)) {
      const distance = this.calculateDistance(
        location.lat, location.lng, 
        cityData.lat, cityData.lng
      );
      
      if (distance <= maxDistance) {
        nearby.push({
          name: cityName,
          ...cityData,
          distance: Math.round(distance)
        });
      }
    }
    
    // Sort by distance
    return nearby.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Calculate distance between two points using Haversine formula
   * @param {number} lat1 - Latitude of point 1
   * @param {number} lon1 - Longitude of point 1
   * @param {number} lat2 - Latitude of point 2
   * @param {number} lon2 - Longitude of point 2
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  // DSA: Simple base32 geohash (subset) with fixed precision
  _geohash(lat, lon, precision = 5) {
    // Normalize ranges
    let latMin = -90, latMax = 90;
    let lonMin = -180, lonMax = 180;
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let hash = '';
    let isLon = true;
    let bit = 0;
    let ch = 0;
    while (hash.length < precision) {
      if (isLon) {
        const mid = (lonMin + lonMax) / 2;
        if (lon > mid) { ch = (ch << 1) + 1; lonMin = mid; } else { ch = (ch << 1); lonMax = mid; }
      } else {
        const mid = (latMin + latMax) / 2;
        if (lat > mid) { ch = (ch << 1) + 1; latMin = mid; } else { ch = (ch << 1); latMax = mid; }
      }
      isLon = !isLon;
      bit++;
      if (bit === 5) { hash += base32[ch]; bit = 0; ch = 0; }
    }
    return hash;
  }

  clearCaches() {
    this.prayerTimeCache.clear();
    this.locationCache.clear();
  }
}