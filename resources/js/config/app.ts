/**
 * Central Application Configuration
 *
 * All application names, titles, and branding strings are defined here.
 * Changing values in this file updates branding across the entire application.
 */

export const appConfig = {
    /** Short brand name used in headers, titles, and logos */
    name: 'Sendang',

    /** Full system title */
    fullName: 'Sendang Digital Museum System',

    /** Short display name for tags and kickers */
    shortName: 'Sendang',

    /** Default kicker text used in headers */
    brandKicker: 'Sendang / Digital Museum',

    /** Default tagline for museum system */
    tagline: 'Museum Digital Jember',

    /** Admin panel display name */
    adminName: 'Admin Sendang',

    /** Default admin email */
    adminEmail: 'admin@sendang.test',
} as const;

export default appConfig;
