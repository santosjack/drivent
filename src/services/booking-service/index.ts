import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function getBookingByUserId(userId: number) {
  const booking = await bookingRepository.findBookingByUserId(userId);
  if(!booking) {
    throw notFoundError;
  }
  return booking;
}

async function createBooking(userId: number, roomId: number) {
  const booking = await bookingRepository.createBooking(userId, roomId);

  if(!booking) {
    throw notFoundError;
  }
  return booking;
}

async function countBookingRoom(roomId: number) {
  const count = await bookingRepository.countBookingRoom(roomId);
  if(!count) return 0;
  return count;
}

async function updateBooking(bookingId: number, newRoomId: number) {
  const booking = await bookingRepository.updateBooking(bookingId, newRoomId);
  if(!booking) throw notFoundError;
  return booking;
}

const bookingService = {
  getBookingByUserId,
  createBooking,
  countBookingRoom,
  updateBooking,
};

export default bookingService;
