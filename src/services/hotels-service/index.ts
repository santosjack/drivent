import { notFoundError } from "@/errors";
import ticketService from "../tickets-service";
import hotelRepository from "@/repositories/hotels-repository";
import { Hotel, TicketStatus } from "@prisma/client";
import { paymentRequiredError } from "@/errors/payment-required-error";

async function getHotels(userId: number) {
  const ticket = await ticketService.getTicketByUserId(userId);
  if (!ticket) {
    throw notFoundError();
  }
  const hotels = await hotelRepository.findHotels();

  if (!hotels || hotels.length === 0) {
    throw notFoundError();
  }
  if (ticket.status !== TicketStatus.PAID) {
    throw paymentRequiredError();
  }
  if (ticket.TicketType.isRemote) {
    throw paymentRequiredError();
  }
  if (!ticket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }
  
  return hotels;
}

async function getHotelRooms(hotelId: number, userId: number) {
  const ticket = await ticketService.getTicketByUserId(userId);
  const hotel = await hotelRepository.findRoomsByHotelId(hotelId);
  if (!hotel || hotel.length === 0) {
    throw notFoundError();
  }
  if (!ticket) {
    throw notFoundError();
  }
  if (ticket.status !== TicketStatus.PAID) {
    throw paymentRequiredError();
  }
  if (ticket.TicketType.isRemote) {
    throw paymentRequiredError();
  }
  if (!ticket.TicketType.includesHotel) {
    throw paymentRequiredError();
  }
  
  return hotel;
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
