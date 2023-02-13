import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import bookingService from "@/services/booking-service";
import roomService from "@/services/rooms-service";
import httpStatus from "http-status";

export async function createBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const roomId = parseInt(req.body.roomId);
  try {
    const result = await bookingService.createBooking(userId, roomId);

    return res.status(httpStatus.CREATED).send({ roomId: result.roomId });
  }catch(error) {
    return res.sendStatus(httpStatus.INTERNAL_SERVER_ERROR);
  }
}

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;

  try {
    const booking = await bookingService.getBookingByUserId(userId);
    const room = await roomService.getRoomById(booking.roomId);
    const result = {
      id: booking.id,
      Room: { ...room }
    };
    
    return res.status(httpStatus.OK).send(result);
  }catch(error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const roomId = parseInt(req.body.roomId);
  const bookingId = parseInt(req.params.bookingId);
  try{
    const result = await bookingService.updateBooking(bookingId, roomId);
    return res.status(httpStatus.OK).send({ roomId: result.roomId });
  }catch(error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
