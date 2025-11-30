/**
 * Analytics type constants and configurations
 */

export enum AnalyticsType {
  PEOPLE_COUNTING = "people_counting",
  DWELL_TIME = "dwell_time",
  DEMOGRAPHIC = "demographic",
}

export interface AnalyticsTypeConfig {
  name: string;
  type: AnalyticsType;
  description: string;
  defaultConfig: Record<string, any>;
  icon?: string;
  color?: string;
}

export const ANALYTICS_TYPES: Record<AnalyticsType, AnalyticsTypeConfig> = {
  [AnalyticsType.PEOPLE_COUNTING]: {
    name: "People Counting",
    type: AnalyticsType.PEOPLE_COUNTING,
    description: "Track the number of people entering and exiting areas",
    defaultConfig: {
      threshold: 0.5,
      min_height: 100,
      max_height: 300,
      tracking_enabled: true,
      count_direction: "both", // "in", "out", "both"
      reset_interval: 3600, // seconds
    },
    icon: "Users",
    color: "blue",
  },
  [AnalyticsType.DWELL_TIME]: {
    name: "Dwell Time Analysis",
    type: AnalyticsType.DWELL_TIME,
    description: "Analyze how long people spend in specific areas",
    defaultConfig: {
      min_dwell_time: 5, // seconds
      max_dwell_time: 300, // seconds
      zone_detection: true,
      heatmap_enabled: true,
      tracking_interval: 1, // seconds
      session_timeout: 30, // seconds
    },
    icon: "Clock",
    color: "green",
  },
  [AnalyticsType.DEMOGRAPHIC]: {
    name: "Demographic Analytics",
    type: AnalyticsType.DEMOGRAPHIC,
    description: "Analyze demographic information of visitors",
    defaultConfig: {
      age_groups: ["18-25", "26-35", "36-45", "46-55", "55+"],
      gender_detection: true,
      emotion_analysis: true,
      privacy_mode: true,
      confidence_threshold: 0.7,
      anonymize_data: true,
    },
    icon: "UserCheck",
    color: "purple",
  },
};

export function getAnalyticsTypeConfig(type: AnalyticsType): AnalyticsTypeConfig {
  return ANALYTICS_TYPES[type];
}

export function getAllAnalyticsTypes(): AnalyticsTypeConfig[] {
  return Object.values(ANALYTICS_TYPES);
}

export function getAnalyticsTypeByName(name: string): AnalyticsTypeConfig | undefined {
  return Object.values(ANALYTICS_TYPES).find(config => config.name === name);
}

export function getAnalyticsTypeByType(type: string): AnalyticsTypeConfig | undefined {
  return ANALYTICS_TYPES[type as AnalyticsType];
} 