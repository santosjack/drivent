import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { getHotels, getHotelRooms, createHotel } from "@/controllers";
import { createHotelSchema } from "@/schemas/hotel-schemas";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("", getHotels)
  .get("/:hotelId", getHotelRooms)
  .post("", validateBody(createHotelSchema), createHotel);

export { hotelsRouter };
