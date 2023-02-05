import { prisma } from "@/config";
import { Hotel, Room } from "@prisma/client";

async function findHotels() {
  return prisma.hotel.findMany();
}

async function findRoomsByHotelId(hotelId: number) {
  return prisma.hotel.findMany({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    }
  });
}

async function createHotel(hotel: CreateHotelParams) {
  return prisma.hotel.create({
    data: {
      ...hotel,
    }
  });
}

export type CreateHotelParams = Omit<Hotel, "id" | "createdAt" | "updatedAt">

const hotelRepository = {
  createHotel,
  findHotels,
  findRoomsByHotelId
};

export default hotelRepository;
