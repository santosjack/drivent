import { CreateRoomParams } from "../services/rooms-service";

import Joi from "joi";

export const createRoomSchema = Joi.object<CreateRoomParams>({
  name: Joi.string().required(),
  capacity: Joi.number().required(),
  hotelId: Joi.number().required()
});
