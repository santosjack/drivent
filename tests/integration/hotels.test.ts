import app, { init } from "@/app";
import { prisma } from "@/config";
import { CreateHotelParams } from "@/services";
import { CreateRoomParams } from "@/services/rooms-service";
import faker from "@faker-js/faker";
import { Hotel, Room, TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createUser, createTicketType, createTicket } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

const populateHotels =  async () => {
  const hotels: CreateHotelParams[] = [
    {
      name: "Hotel Ibis 1",
      image: "https://diariodonordeste.verdesmares.com.br/image/contentid/policy:1.1168330:1590123427/image/image.jpg?f=16x9&$p$f=3965716"
    },
    {
      name: "Hotel Ibis 2",
      image: "https://diariodonordeste.verdesmares.com.br/image/contentid/policy:1.1168330:1590123427/image/image.jpg?f=16x9&$p$f=3965716"
    },
    {
      name: "Hotel Ibis 3",
      image: "https://diariodonordeste.verdesmares.com.br/image/contentid/policy:1.1168330:1590123427/image/image.jpg?f=16x9&$p$f=3965716"
    }
  ];
  const hotelsCreated = await prisma.hotel.createMany({
    data: hotels
  });

  return hotelsCreated;
};

const populateHotelRooms = async (hotelId: number) => {
  const rooms: CreateRoomParams[] = [
    {
      name: "Quarto 01 - padrão",
      capacity: 2,
      hotelId: hotelId
    },
    {
      name: "Quarto 02 - Master",
      capacity: 2,
      hotelId: hotelId
    },
    {
      name: "Quarto 03 - Family",
      capacity: 4,
      hotelId: hotelId
    }
  ];

  await prisma.room.createMany({
    data: rooms
  });

  const hotelWithRooms = await prisma.hotel.findUnique({
    where: {
      id: hotelId
    },
    include: {
      Rooms: true
    }
  });

  return hotelWithRooms;
};

describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if there are no hotels created", async () => {
      const token = await generateValidToken();

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
      populateHotels();

      const token = await generateValidToken();
     
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a ticket yet", async () => {
      populateHotels();

      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when ticket doesnt have status paid", async () => {
      populateHotels();

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when ticket type is remote", async () => {
      populateHotels();
      
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when ticket type doesnt include hotel", async () => {
      populateHotels();
      
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 200 and with hotels data", async () => {
      populateHotels();

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body as Hotel[]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String)
          })
        ])
      );
    });
  });
});

describe("GET /hotels/:id", () => {
  it("should respond with status 401 if no token is given", async () => {
    await populateHotels();
    const hotel = await prisma.hotel.findFirst({});
    await populateHotelRooms(hotel.id);
    const response = await server.get(`/hotels/${hotel.id}`);
    console.log(hotel.id);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    await populateHotels();
    const hotel = await prisma.hotel.findFirst({});
    await populateHotelRooms(hotel.id);
    const token = faker.lorem.word();

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    await populateHotels();
    const hotel = await prisma.hotel.findFirst({});
    await populateHotelRooms(hotel.id);

    const userWithoutSession = await createUser();

    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when user doesnt have an enrollment yet", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);

      const token = await generateValidToken();
     
      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user doesnt have a ticket yet", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);

      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 402 when ticket doesnt have status paid", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);
      
      console.log(hotel.id);
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when ticket type is remote", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);
      
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 402 when ticket type doesnt include hotel", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);
      
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when hotel selected not existed", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);
      
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get(`/hotels/${0}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with rooms data for the hotel selected", async () => {
      await populateHotels();
      const hotel = await prisma.hotel.findFirst({});
      await populateHotelRooms(hotel.id);

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      console.log(response.body);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            Rooms: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                capacity: expect.any(Number),
                hotelId: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
              })
            ])
          })
        ])
      );
    });
  });
});
