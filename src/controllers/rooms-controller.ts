import { AuthenticatedRequest } from "@/middlewares";
import roomService, { CreateRoomParams } from "@/services/rooms-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function createRoom(req: AuthenticatedRequest, res: Response) {
  const room = req.body as CreateRoomParams;
  
  try {
    const result = await roomService.createRoom(room);
  
    return res.sendStatus(httpStatus.CREATED).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}

export async function getRoomById(req: AuthenticatedRequest, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const result = await roomService.getRoomById(id);
  
    return res.sendStatus(httpStatus.OK).send(result);
  } catch (error) {
    return res.sendStatus(httpStatus.BAD_REQUEST);
  }
}
