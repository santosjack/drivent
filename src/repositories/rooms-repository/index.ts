import { prisma } from "@/config";
import { Room } from "@prisma/client";

async function createRoom(room: CreateRoomParams) {
  return prisma.room.create({
    data: {
      ...room,
    }
  });
}

async function getRoomById(id: number) {
  return prisma.room.findFirst({
    where: {
      id: id
    }
  });
}

export type CreateRoomParams = Omit<Room, "id" | "createdAt" | "updatedAt">

const roomRepository = {
  createRoom,
  getRoomById
};

export default roomRepository;
