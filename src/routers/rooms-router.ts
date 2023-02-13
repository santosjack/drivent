import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createRoomSchema } from "@/schemas/room-schemas";
import { createRoom } from "@/controllers/rooms-controller";

const roomsRouter = Router();

roomsRouter
  .all("/*", authenticateToken)
  .post("", validateBody(createRoomSchema), createRoom);

export { roomsRouter };
