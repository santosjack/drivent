import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotels-repository";
import { Hotel } from "@prisma/client";

async function getHotels() {
  const hotels = await hotelRepository.findHotels();

  if (!hotels) {
    throw notFoundError();
  }
  return hotels;
}

async function getHotelRooms(hotelId: number) {
  const rooms = await hotelRepository.findRoomsByHotelId(hotelId);
  if (!rooms) {
    throw notFoundError();
  }

  return rooms;
}

async function createHotel(hotel: CreateHotelParams) {
  const result = await hotelRepository.createHotel(hotel);
  return result;
}

export type CreateHotelParams = Omit<Hotel, "id" | "createdAt" | "updatedAt">

const hotelService = {
  getHotelRooms,
  getHotels,
  createHotel
};

export default hotelService;
