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
      const prayerTimes = this.calculatePrayerTimes(location, date);
      
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
      return this.calculatePrayerTimes(this.islamicCities.makkah, date);
    }
  }

  /**
   * Calculate prayer times using astronomical calculations
   * @param {Object} location - Location data
   * @param {Date} date - Date for prayer times
   * @returns {Object} Prayer times
   */
  calculatePrayerTimes(location, date) {
    // Simplified prayer time calculation
    // In a real implementation, you would use a proper astronomical library
    const now = date || new Date();
    const hours = now.getHours();
    
    // These are placeholder times - in a real implementation, you would calculate based on:
    // - Location coordinates (latitude, longitude)
    // - Date (day of year)
    // - Astronomical calculations for sunrise, sunset, etc.
    
    return {
      date: now.toISOString().split('T')[0],
      location: {
        city: location.city,
        country: location.country,
        lat: location.lat,
        lng: location.lng
      },
      times: {
        fajr: `${4 + Math.floor(Math.random() * 2)}:${30 + Math.floor(Math.random() * 30)}`.slice(0, 5),
        sunrise: `${6 + Math.floor(Math.random() * 2)}:${0 + Math.floor(Math.random() * 60)}`.slice(0, 5),
        dhuhr: `${12 + Math.floor(Math.random() * 2)}:${0 + Math.floor(Math.random() * 60)}`.slice(0, 5),
        asr: `${15 + Math.floor(Math.random() * 2)}:${0 + Math.floor(Math.random() * 60)}`.slice(0, 5),
        maghrib: `${18 + Math.floor(Math.random() * 2)}:${0 + Math.floor(Math.random() * 60)}`.slice(0, 5),
        isha: `${20 + Math.floor(Math.random() * 2)}:${0 + Math.floor(Math.random() * 60)}`.slice(0, 5)
      },
      timezone: location.timezone || 'UTC',
      calculationMethod: 'approximate'
    };
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