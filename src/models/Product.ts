import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  images: string[]; 
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, index: true },
  stock: { type: Number, required: true, default: 0 },
  imageUrl: { type: String, default: '' },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);