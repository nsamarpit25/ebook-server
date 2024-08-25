import { RequestHandler } from "express";
import stripe from "../stripe";
import { sendErrorResponse } from "../utils/helper";
import {
  StripeCustomer,
  StripeFailedIntent,
  StripeSuccessIntent,
} from "../stripe/stripe.types";
import OrderModel from "../models/order.model";
import userModel from "@/models/user.model";
import CartModel from "@/models/cart.model";

export const handlePayment: RequestHandler = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
    let event;

    event = stripe.webhooks.constructEvent(req.body, sig!, endpointSecret);

    const succeed = event.type === "payment_intent.succeeded";
    const failed = event.type === "payment_intent.payment_failed";

    if (failed || succeed) {
      const stripeSession = event.data.object as unknown as
        | StripeSuccessIntent
        | StripeFailedIntent;

      const customerId = stripeSession.customer;

      const customer = (await stripe.customers.retrieve(
        customerId
      )) as unknown as StripeCustomer;

      const { orderId, type, userId } = customer.metadata;

      const order = await OrderModel.findByIdAndUpdate(orderId, {
        stripeCustomerId: customerId,
        paymentId: stripeSession.id,
        totalAmount: stripeSession.amount_received,
        paymentStatus: stripeSession.status,
        paymentErrorMessage: stripeSession.last_payment_error?.message,
      });

      const booksIds =
        order?.orderItems.map((item) => {
          return item.id.toString();
        }) || [];

      if (succeed && order) {
        await userModel.findByIdAndUpdate(userId, {
          $push: { books: { $each: booksIds }, orders: { $each: [order._id] } },
        });

        if (type === "checkout") {
          await CartModel.findOneAndUpdate({ userId }, { items: [] });
        }
      }
    }
  } catch (err) {
    return sendErrorResponse({
      message: "Could not complete payment",
      res,
      status: 400,
    });
  }

  res.send();
};
