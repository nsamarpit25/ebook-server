import CartModel from "../models/cart.model";
import { sanitizeUrl, sendErrorResponse } from "../utils/helper";
import { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import BookModel, { BookDoc } from "../models/book.model";
import stripe from "../stripe";
import OrderModel from "@/models/order.model";
import Stripe from "stripe";

type StripeLineItems = Stripe.Checkout.SessionCreateParams.LineItem[];
type options = {
  customer: Stripe.CustomerCreateParams;
  lineItems: StripeLineItems;
};

const generateStripeCheckoutSession = async (options: options) => {
  const customer = await stripe.customers.create(options.customer);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    success_url: process.env.PAYMENT_SUCCESS_URL,
    cancel_url: process.env.PAYMENT_CANCEL_URL,
    line_items: options.lineItems,
    customer: customer.id,
  });

  return session;
};

export const checkout: RequestHandler = async (req, res) => {
  const { cartId } = req.body;

  if (!isValidObjectId(cartId)) {
    return sendErrorResponse({
      message: "Invalid cart id!!",
      res,
      status: 401,
    });
  }

  const cart = await CartModel.findOne({
    _id: cartId,
    userId: req.user.id,
  }).populate<{
    items: { product: BookDoc; quantity: number }[];
  }>({ path: "items.product" });

  if (!cart) {
    return sendErrorResponse({
      message: "cart not found",
      res,
      status: 404,
    });
  }

  const newOrder = await OrderModel.create({
    userId: req.user.id,
    orderItems: cart.items.map(({ product, quantity }) => {
      return {
        id: product._id,
        price: product.price.sale,
        qty: quantity,
        totalPrice: product.price.sale * quantity,
      };
    }),
  });

  const customer: options["customer"] = {
    name: req.user.name,
    email: req.user.email,
    metadata: {
      userId: req.user.id,
      orderId: newOrder._id.toString(),
      type: "checkout",
    },
  };

  const line_items: options["lineItems"] = cart.items.map(
    ({ product, quantity }) => {
      const images = product.cover
        ? { images: [sanitizeUrl(product.cover.url)] }
        : {};
      return {
        quantity,
        price_data: {
          currency: "usd",
          unit_amount: product.price.sale,
          product_data: {
            name: product.title,
            ...images,
          },
        },
      };
    }
  );

  const session = await generateStripeCheckoutSession({
    customer,
    lineItems: line_items,
  });

  if (session.url) {
    res.json({ checkoutUrl: session.url });
  } else {
    sendErrorResponse({
      status: 500,
      message: "Something went wrong could not handle payment",
      res,
    });
  }

  //
};

export const instantCheckout: RequestHandler = async (req, res) => {
  const { productId } = req.body;

  if (!isValidObjectId(productId)) {
    return sendErrorResponse({
      message: "Invalid product id!!",
      res,
      status: 401,
    });
  }

  const product = await BookModel.findById(productId);
  if (!product) {
    return sendErrorResponse({
      res,
      message: "Product not found!",
      status: 404,
    });
  }

  const newOrder = await OrderModel.create({
    userId: req.user.id,
    orderItems: {
      id: product._id,
      price: product.price.sale,
      qty: 1,
      totalPrice: product.price.sale * 1,
    },
  });

  const images = product.cover
    ? { images: [sanitizeUrl(product.cover.url)] }
    : {};

  const line_items: StripeLineItems = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: product.price.sale,
        product_data: {
          name: product.title,
          ...images,
        },
      },
    },
  ];

  const customer: options["customer"] = {
    name: req.user.name,
    email: req.user.email,
    metadata: {
      userId: req.user.id,
      orderId: newOrder._id.toString(),
      type: "instant-checkout",
    },
  };

  const session = await generateStripeCheckoutSession({
    customer,
    lineItems: line_items,
  });
  if (session.url) {
    res.json({ checkoutUrl: session.url });
  } else {
    sendErrorResponse({
      res,
      message: "Something went wrong, could not handle payment!",
      status: 500,
    });
  }
};
