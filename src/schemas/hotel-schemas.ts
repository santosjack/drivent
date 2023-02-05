import { CreateHotelParams } from "../services/hotels-service";

import Joi from "joi";

export const createHotelSchema = Joi.object<CreateHotelParams>({
  name: Joi.string().required(),
  image: Joi.string().required(),
});
