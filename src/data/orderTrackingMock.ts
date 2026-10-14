export type TrackingStatus =
  | 'order_confirmed'
  | 'design_review'
  | 'in_production'
  | 'quality_check'
  | 'ready_for_delivery'
  | 'out_for_delivery'
  | 'delivered';

export interface TrackingStage {
  value: TrackingStatus;
  label: string;
  description: string;
}

export interface TrackingOrder {
  orderNumber: string;
  status: TrackingStatus;
  estimatedDelivery: string;
  updatedAt: string;
}

export const TRACKING_STAGES: readonly TrackingStage[] = [
  { value: 'order_confirmed', label: 'Order Confirmed', description: "We've received and confirmed your order." },
  { value: 'design_review', label: 'Design Review', description: 'Your artwork and print specifications are being reviewed.' },
  { value: 'in_production', label: 'In Production', description: 'Your order is currently being printed and produced.' },
  { value: 'quality_check', label: 'Quality Check', description: 'Your printed items are undergoing final quality inspection.' },
  { value: 'ready_for_delivery', label: 'Ready for Delivery', description: 'Your order has passed inspection and is being prepared for dispatch.' },
  { value: 'out_for_delivery', label: 'Out for Delivery', description: 'Your order is on its way to you.' },
  { value: 'delivered', label: 'Delivered', description: 'Your order has been delivered.' },
];

const DEMO_TRACKING_ORDERS: Record<string, TrackingOrder> = {
  'ALAN-2026-001': {
    orderNumber: 'ALAN-2026-001',
    status: 'quality_check',
    estimatedDelivery: '29 Sep 2026',
    updatedAt: '28 Sep 2026 · 2:35 PM',
  },
  'ALAN-2026-002': {
    orderNumber: 'ALAN-2026-002',
    status: 'out_for_delivery',
    estimatedDelivery: '28 Sep 2026',
    updatedAt: '28 Sep 2026 · 9:15 AM',
  },
  'ALAN-2026-003': {
    orderNumber: 'ALAN-2026-003',
    status: 'delivered',
    estimatedDelivery: '27 Sep 2026',
    updatedAt: '27 Sep 2026 · 4:50 PM',
  },
};

export const lookupDemoOrder = async (orderNumber: string): Promise<TrackingOrder | null> => {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 450));
  return DEMO_TRACKING_ORDERS[orderNumber] ?? null;
};
