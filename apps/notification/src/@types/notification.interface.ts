export interface INotificationAdapter {
  send(to: string, subject: string, message: string): Promise<void>;
}
export interface IUserCreatedNotification {
  email: string;
  name: string;
  url: string;
}
