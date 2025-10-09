/**
 * Minimal stub for TimesPrayerScraper to satisfy imports and keep builds green.
 * In production, replace with actual scraping or API integration.
 */

export class TimesPrayerScraper {
  constructor() {}

  /**
   * Return null to fallback to calculation, or provide a lightweight structure
   * matching LocationPrayerService expectations when available.
   */
  async getPrayerTimes(location, date = new Date()) {
    // For now, return null so LocationPrayerService falls back to calculations
    return null;
  }
}


