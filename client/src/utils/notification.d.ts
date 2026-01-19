export declare const notification: {
  error(message: string, duration?: number): void;
  success(message: string, duration?: number): void;
  warning(message: string, duration?: number): void;
  info(message: string, duration?: number): void;
  show(message: string, type?: 'error' | 'success' | 'warning' | 'info', duration?: number): void;
};
