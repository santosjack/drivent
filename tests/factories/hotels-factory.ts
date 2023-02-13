import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
    }
  });
}

export async function createRoomsWithHotelId(hotelId: number) {
  const rooms = [
    {
      name: "1001",
      capacity: 2,
      hotelId: hotelId,
    },
    {
      name: "1002",
      capacity: 3,
      hotelId: hotelId,
    },
    {
      name: "1003",
      capacity: 3,
      hotelId: hotelId,
    },
  ];
  await prisma.room.createMany({
    data: rooms
  });
  const result = await prisma.room.findMany();
  return result;
}

export async function generateInvalidRoomId() {
  const rooms = await prisma.room.findMany();
  let id: number = parseInt(faker.random.numeric());
  if(rooms) {
    for (const room of rooms) {
      id = room.id === id ? parseInt(faker.random.numeric()) : id;
    }
  }
  
  return id;
}

