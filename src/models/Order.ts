import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total: number;
  // Fulfillment lifecycle — independent of whether money has moved.
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  cancelReason?: string;
  // Payment lifecycle — independent of fulfillment. An order can be
  // completed AND later refunded (a return), or cancelled and still
  // unpaid/paid (refund not yet issued).
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  refundReason?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
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
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  refundReason: { type: String },
  stripeSessionId: { type: String, unique: true, sparse: true },
  stripePaymentIntentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);