export const ORDER_STATUS_NAMES = {
  NEW: 'New',
  ACCEPTED: 'Accepted',
  IN_PRODUCTION: 'In Production',
  READY: 'Ready',
  CLOSED: 'Closed',
} as const;

export type OrderStatusName =
  (typeof ORDER_STATUS_NAMES)[keyof typeof ORDER_STATUS_NAMES];
