import { AuthenticatedRequest } from "@/middlewares";
import { CreateHotelParams } from "@/services/hotels-service";
import hotelService from "@/services/hotels-service";
import { Request, Response } from "express";
import httpStatus from "http-status";
import { ApplicationError } from "@/protocols";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = await hotelService.getHotels(req.userId);

    return res.status(httpStatus.OK).send(hotels);
  } catch (error) {
    const err = error as ApplicationError;
    if(err.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND).send({
        message: err.message
      });
    }
    if(err.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED).send({
        message: err.message
      });
    }
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const hotelId = parseInt(req.params.hotelId);

  try {
    const rooms = await hotelService.getHotelRooms(hotelId, req.userId);
    return res.status(httpStatus.OK).send(rooms);
  } catch (error) {
    const err = error as ApplicationError;
    if(err.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND).send({
        message: err.message
      });
    }
    if(err.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED).send({
        message: err.message
      });
    }

    return res.sendStatus(httpStatus.BAD_REQUEST);
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

