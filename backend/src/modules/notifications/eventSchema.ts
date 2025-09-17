export interface NotificationEvent {
  type: string;
  userId: string;
  message: string;
  data?: any;
  timestamp: string;
}

export function createNotificationEvent(
  type: string,
  userId: string,
  message: string,
  data?: any
): NotificationEvent {
  return {
    type,
    userId,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}
