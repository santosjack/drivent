import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { Room, TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import { createEnrollmentWithAddress, createHotel, createPayment, createRoomsWithHotelId, createTicket, createTicketType, createUser, generateInvalidRoomId, createBooking } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 200 and booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const rooms: Room[] = await createRoomsWithHotelId(hotel.id);
      await createBooking(user.id, rooms[0].id);
    
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: expect.any(Number),
        Room: expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      });
    });

    it("should respond with status 404 when the user does not have booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType(false, true);
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const rooms: Room[] = await createRoomsWithHotelId(hotel.id);
    
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 201", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const rooms: Room[] = await createRoomsWithHotelId(hotel.id);

    const body = {
      roomId: rooms[0].id,
    };

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    console.log(response.body);
    expect(response.status).toEqual(httpStatus.CREATED);
    expect(response.body).toEqual({
      roomId: expect.any(Number)
    });
  });

  it("should respond with status 404 when roomId does not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const rooms: Room[] = await createRoomsWithHotelId(hotel.id);
    const invalidRoomId = await generateInvalidRoomId();

    const body = {
      roomId: invalidRoomId,
    };

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const id = faker.random.numeric();
    const response = await server.put(`/booking/${id}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const id = faker.random.numeric();

    const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const id = faker.random.numeric();

    const response = await server.put(`/booking/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 200 and new booking id", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const rooms: Room[] = await createRoomsWithHotelId(hotel.id);
    const booking = await createBooking(user.id, rooms[0].id);
    
    const body = {
      roomId: rooms[1].id,
    };

    const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual({
      roomId: expect.any(Number)
    });
  });

  it("should respond with status 404 when roomId does not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketType(false, true);
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const rooms: Room[] = await createRoomsWithHotelId(hotel.id);
    const booking = await createBooking(user.id, rooms[0].id);
    const invalidRoomId = await generateInvalidRoomId();

    const body = {
      roomId: invalidRoomId,
    };

    const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);
    
    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("should return 403 when the room has no more vacancy", async () => {
    const ticketType = await createTicketType(false, true);
    const hotel = await createHotel();
    const rooms: Room[] = await createRoomsWithHotelId(hotel.id);

    const userFirstVacancy = await createUser();
    const enrollmentFirstVacancy = await createEnrollmentWithAddress(userFirstVacancy);
    const ticketFirstVacancy = await createTicket(enrollmentFirstVacancy.id, ticketType.id, TicketStatus.PAID);
    await createBooking(userFirstVacancy.id, rooms[0].id);

    const userSecondVacancy = await createUser();
    const enrollmentSecondVacancy = await createEnrollmentWithAddress(userSecondVacancy);
    const ticketSecondVacancy = await createTicket(enrollmentSecondVacancy.id, ticketType.id, TicketStatus.PAID);
    await createBooking(userSecondVacancy.id, rooms[0].id);

    const userExtra = await createUser();
    const token = await generateValidToken(userExtra);
    const enrollmentExtra = await createEnrollmentWithAddress(userExtra);
    const ticketExtra = await createTicket(enrollmentExtra.id, ticketType.id, TicketStatus.PAID);
    const booking = await createBooking(userExtra.id, rooms[1].id);
    
    const body = {
      roomId: rooms[0].id,
    };

    const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.FORBIDDEN);
  });
});
