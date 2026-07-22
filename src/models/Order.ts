import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IStatusHistoryEntry {
  from: string;
  to: string;
  reason?: string;
  changedAt: Date;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  cancelReason?: string;
  revertReason?: string;
  statusHistory: IStatusHistoryEntry[];
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  refundReason?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  deliveryAddress?: string;
  deliveryLat?: number;
  deliveryLng?: number;
  createdAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    reason: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending',
  },

  cancelReason: { type: String },
  revertReason: { type: String },
  statusHistory: { type: [StatusHistorySchema], default: [] },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  refundReason: { type: String },
  stripeSessionId: { type: String, unique: true, sparse: true },
  stripePaymentIntentId: { type: String },
  deliveryAddress: { type: String },
  deliveryLat: { type: Number },
  deliveryLng: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);