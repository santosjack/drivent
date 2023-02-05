import { notFoundError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import roomRepository from "@/repositories/rooms-repository";
import { Room } from "@prisma/client";

async function createRoom(room: CreateRoomParams) {
  const result = await roomRepository.createRoom(room);
  return result;
}

export type CreateRoomParams = Omit<Room, "id" | "createdAt" | "updatedAt">

const roomService = {
  createRoom
};

export default roomService;
