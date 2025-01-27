import { model, ObjectId, Schema } from "mongoose";

type OrderItem = {
  id: ObjectId;
  price: number;
  qty: number;
  totalPrice: number;
};

interface OrderDocument {
  userId: ObjectId;
  orderItems: OrderItem[];
  stripeCustomerId?: string;
  paymentId?: string;
  totalAmount?: number;
  paymentStatus?: string;
  paymentErrorMessage?: string;
  createdAt: Date;
}

const schema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [
      {
        id: { type: Schema.Types.ObjectId, ref: "Book", required: true },
        // prices stored in cents
        price: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
        qty: { type: Number, required: true, min: 1 },
      },
    ],
    stripeCustomerId: String,
    paymentId: String,
    // totalAmount stored in cents
    totalAmount: { type: Number, min: 0 },
    paymentStatus: String,
    paymentErrorMessage: String,
  },
  { timestamps: true }
);

const OrderModel = model<OrderDocument>("Order", schema);
export default OrderModel;
