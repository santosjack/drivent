import { AuthenticatedRequest } from "@/middlewares";
import { CreateHotelParams } from "@/services/hotels-service";
import hotelService from "@/services/hotels-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = await hotelService.getHotels();

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    return res.sendStatus(httpStatus.NO_CONTENT);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const hotelId = parseInt(req.params.hotelId);

  try {
    const rooms = await hotelService.getHotelRooms(hotelId);

    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function createHotel(req: AuthenticatedRequest, res: Response) {
  const hotel = req.body as CreateHotelParams;
  
  try {
    const result = await hotelService.createHotel(hotel);
  
    return res.status(httpStatus.CREATED).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

