import request from 'supertest';
import express from 'express';
import appRoutes from '../routes/appRoutes.js';

// 1) Student A1 authenticates
// 2) Professor P1 authenticates
// 3) Professor P1 creates free time slots T1, T2
// 4) Student A1 views Professor P1 slots
// 5) Student A1 books T1
// 6) Student A2 authenticates
// 7) Student A2 books T2
// 8) Professor P1 cancels appointment with Student A1
// 9) Student A1 checks appointments

const app = express();
app.use(express.json());
app.use('/', appRoutes);

describe('Appointment Booking Flow', () => {
  let studentA1Token;
  let studentA2Token;
  let professorP1Token;
  let professorP1Id;
  let professorP1Name;
  let slotT1Id;
  let slotT2Id;
  let appointmentA1Id;

  it('Student A1 authenticates', async () => {
    const createRes = await request(app)
    .post('/user/create')
    .send({
      username: 'StudentA1',
      email: 'studenta1@test.com',
      password: 'Password123$',
      is_professor: false
    });
    expect(createRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/user/login')
      .send({ username: 'StudentA1', password: 'Password123$' });
    expect(loginRes.status).toBe(201);
    studentA1Token = loginRes.body.authToken;
    expect(studentA1Token).toBeDefined();
  });

  it('Professor P1 authenticates', async () => {
    const createRes = await request(app)
      .post('/user/create')
      .send({
        username : "ProfessorP1",
        email: 'professorp1@gmail.com',
        password: 'Password123$',
        is_professor: true
      });
      console.log(createRes.body.message);
    expect(createRes.status).toBe(201);
    professorP1Id = createRes.body.user.userId;
    professorP1Name = createRes.body.user.username;

    const loginRes = await request(app)
      .post('/user/login')
      .send({
        username: 'ProfessorP1',
        password: 'Password123$'
      });
    expect(loginRes.status).toBe(201);
    professorP1Token = loginRes.body.authToken;
    expect(professorP1Token).toBeDefined();
  });

  it('Professor P1 creates time slots T1 and T2', async () => {
    const t1 = new Date();
    t1.setHours(t1.getHours() + 2);
    const t2 = new Date();
    t2.setHours(t2.getHours() + 4);

    const res1 = await request(app)
      .post('/slot')
      .set('auth-token', professorP1Token)
      .send({
        slot: t1.toISOString()
      })
      console.log(res1.body.message);
    expect(res1.status).toBe(201);

    const res2 = await request(app)
      .post('/slot')
      .set('auth-token', professorP1Token)
      .send({
        slot: t2.toISOString()
      })
      console.log(res2.body.message);
    expect(res2.status).toBe(201);
  });

  it('Student A1 views available slots for Professor P1', async () => {
    const res = await request(app)
      .get('/slots')
      .send({
        professor : professorP1Name
      });

    expect(res.status).toBe(200);
    // console.log(res.body.data);
    const slots = res.body.data.slots || [];
    // Store two slots for booking
    slotT1Id = slots[0].id;
    slotT2Id = slots[1].id;
    expect(slotT1Id).toBeDefined();
    expect(slotT2Id).toBeDefined();
  });

  it('Student A1 books an appointment T1 with Professor P1', async () => {
    const res = await request(app)
      .post('/appointment')
      .set('auth-token', studentA1Token)
      .send({
        professorId : professorP1Id,
        slotId : slotT1Id,
        reason: 'Need help with course topics'
      })
    expect(res.status).toBe(201);
  });

  it('Student A2 authenticates', async () => {
    const createRes = await request(app)
      .post('/user/create')
      .send({
        username: 'StudentA2',
        email: 'studenta2@test.com',
        password: 'Password123$',
        is_professor: false
      })
    expect(createRes.status).toBe(201);

    const loginRes = await request(app)
      .post('/user/login')
      .send({
        username: 'StudentA2',
        password: 'Password123$'
      })
    expect(loginRes.status).toBe(201);
    studentA2Token = loginRes.body.authToken;
    expect(studentA2Token).toBeDefined();
  });

  it('Student A2 books an appointment T2 with Professor P1', async () => {
    const res = await request(app)
      .post('/appointment')
      .set('auth-token', studentA2Token)
      .send({
        professorId : professorP1Id,
        slotId : slotT2Id,
        reason: 'Need help with assignments'
      })
    expect(res.status).toBe(201);
  });

  it('Professor P1 cancels the appointment with Student A1', async () => {
    const listRes = await request(app)
      .get('/professor/appointments')
      .set('auth-token', professorP1Token);
    expect(listRes.status).toBe(200);
    const appts = listRes.body.data || [];
    expect(appts.length).toBeGreaterThan(0);
    appointmentA1Id = appts[0].id;

    const res = await request(app)
      .patch('/appointment')
      .set('auth-token', professorP1Token)
      .send({
        appointment_id : appointmentA1Id
      });
    expect(res.status).toBe(200);
  });

  it('Student A1 checks appointments and has none pending', async () => {
    const res = await request(app)
      .get('/student/appointments')
      .set('auth-token', studentA1Token)
      .send({
        status : 'booked'
      });
    expect(res.status).toBe(200);
    expect(res.body.pageSize).toBe(0);
    expect(res.body.data.length).toBe(0);
  });


});
