import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { createBooking, updateBooking, getBooking } from "@/controllers/booking-controller";
import { verify } from "jsonwebtoken";
import { verifyavailability } from "@/middlewares/booking-middleware";

const bookingRouter = Router();

bookingRouter
  .all("/*", authenticateToken)
  .get("/", getBooking)
  .post("/", verifyavailability, createBooking)
  .put("/:bookingId", verifyavailability, updateBooking);

export { bookingRouter };
