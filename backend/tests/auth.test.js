const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/index"); // must export express app (not server)
const Doctor = require("../src/models/doctor");
const Patient = require("../src/models/patient");

let mongoServer;

// setup test db
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

// cleanup after each test
afterEach(async () => {
  await Doctor.deleteMany({});
  await Patient.deleteMany({});
});

// close connection
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Authentication API", () => {
  it("should allow patient signup, profile completion, and login", async () => {
    // 1️⃣ Signup
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "John Doe",
        email: "john@test.com",
        password: "123456",
        role: "Patient",
      });
    expect(signup.statusCode).toBe(201);
    expect(signup.body).toHaveProperty("id");
    const userId = signup.body.id;

    // 2️⃣ Complete profile
    const profile = await request(app)
      .put(`/api/auth/complete-profile/Patient/${userId}`)
      .send({
        phone: "9999999999",
        age: 28,
        gender: "Male",
        address: "123 Street",
      });
    expect(profile.statusCode).toBe(200);

    // 3️⃣ Login
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        username: "john@test.com",
        password: "123456",
      });
    expect(login.statusCode).toBe(200);
    expect(login.body).toHaveProperty("token");
    expect(login.body.profile.email).toBe("john@test.com");
  });

  it("should allow doctor signup, profile completion, and login", async () => {
    // 1️⃣ Signup
    const signup = await request(app)
      .post("/api/auth/signup")
      .send({
        fullName: "Dr Smith",
        email: "drsmith@test.com",
        password: "docpass",
        role: "Doctor",
      });
    expect(signup.statusCode).toBe(201);
    const id = signup.body.id;

    // 2️⃣ Complete profile
    const profile = await request(app)
      .put(`/api/auth/complete-profile/Doctor/${id}`)
      .send({
        hospitalName: "City Hospital",
        specialty: "Cardiology",
      });
    expect(profile.statusCode).toBe(200);

    // 3️⃣ Login
    const login = await request(app)
      .post("/api/auth/login")
      .send({
        username: "drsmith@test.com",
        password: "docpass",
      });
    expect(login.statusCode).toBe(200);
    expect(login.body.profile.role).toBe("Doctor");
  });
});
