import { prisma } from "@/config";
import { Room } from "@prisma/client";

async function createRoom(room: CreateRoomParams) {
  return prisma.room.create({
    data: {
      ...room,
    }
  });
}

export type CreateRoomParams = Omit<Room, "id" | "createdAt" | "updatedAt">

const roomRepository = {
  createRoom
};

export default roomRepository;
