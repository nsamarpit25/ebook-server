import { RequestHandler } from "express";
import HistoryModel from "../models/history.model";
import { UpdateHistoryRequestHandler } from "../types";
import { isValidObjectId } from "mongoose";
import { sendErrorResponse } from "@/utils/helper";

export const updateBookHistory: UpdateHistoryRequestHandler = async (
  req,
  res
) => {
  const { bookId, highlights, lastLocation, remove } = req.body;

  let history = await HistoryModel.findOne({
    book: bookId,
    reader: req.user.id,
  });

  if (!history) {
    history = new HistoryModel({
      reader: req.user.id,
      book: bookId,
      lastLocation,
      highlights,
    });
  } else {
    if (lastLocation) {
      history.lastLocation = lastLocation;
    }
    if (highlights?.length && !remove) {
      history.highlights.push(...highlights);
    }

    if (highlights?.length && remove) {
      history.highlights = history.highlights.filter((item) => {
        const highlight = highlights.find((h) => {
          if (h.selection === item.selection) {
            return h;
          }
        });
        if (!highlight) return true;
      });
    }
  }

  await history.save();

  res.send();
};

export const getBookHistory: RequestHandler = async (req, res) => {
  const { bookId } = req.params;
  if (!isValidObjectId(bookId)) {
    return sendErrorResponse({
      res,
      message: "Invalid book id!",
      status: 422,
    });
  }

  const history = await HistoryModel.findOne({
    book: bookId,
    reader: req.user.id,
  });

  if (!history) {
    return sendErrorResponse({
      res,
      message: "No history found!",
      status: 404,
    });
  }

  const formattedHistory = {
    lastLocation: history.lastLocation,
    highlights: history.highlights.map((item) => {
      return { fill: item.fill, selection: item.selection };
    }),
  };
  res.json({ history: formattedHistory });
};
