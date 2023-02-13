import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import roomService from "@/services/rooms-service";
import { NextFunction, Response } from "express";
import httpStatus from "http-status";

export async function verifyavailability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roomId = parseInt(req.body.roomId);
  try{
    const occupiedSeats = await bookingService.countBookingRoom(roomId);
    const room = await roomService.getRoomById(roomId);
    
    if(room.capacity <= occupiedSeats) {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }

    next();
  }catch(error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
