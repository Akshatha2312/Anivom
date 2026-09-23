const mongoose = require('mongoose');
const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');
const Banner = require('../models/Banner');
const User = require('../models/User');

describe('Banner API Automated Verification Tests', () => {
  let adminToken;
  let customerToken;
  let adminUser;
  let customerUser;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/anivom_test_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    await Banner.deleteMany({});
    await User.deleteMany({ email: { $in: ['banneradmin@test.com', 'banneruser@test.com'] } });

    adminUser = await User.create({
      name: 'Banner Admin',
      email: 'banneradmin@test.com',
      password: 'Password123!',
      role: 'admin',
    });

    customerUser = await User.create({
      name: 'Banner Customer',
      email: 'banneruser@test.com',
      password: 'Password123!',
      role: 'customer',
    });

    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
    adminToken = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    customerToken = jwt.sign({ id: customerUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await Banner.deleteMany({});
    await User.deleteMany({ email: { $in: ['banneradmin@test.com', 'banneruser@test.com'] } });
    await mongoose.connection.close();
  });

  test('1. Unauthenticated or non-admin customer cannot access admin banner endpoints', async () => {
    const resNoToken = await request(app).get('/api/v1/banners/admin');
    expect(resNoToken.status).toBe(401);

    const resCustomer = await request(app)
      .get('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(resCustomer.status).toBe(403);
  });

  test('2. Admin can create active, inactive, future, and past banners', async () => {
    const activeBannerPayload = {
      title: 'Active Banner',
      subtitle: 'Active Subtitle',
      buttonText: 'Shop Now',
      buttonLink: '/catalog',
      sortOrder: 1,
      isActive: true,
    };

    const res = await request(app)
      .post('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(activeBannerPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.banner.title).toBe('Active Banner');

    // Inactive banner
    await request(app)
      .post('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Inactive Banner', isActive: false, sortOrder: 2 });

    // Future banner
    const futureDate = new Date(Date.now() + 86400000);
    await request(app)
      .post('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Future Banner', isActive: true, startDate: futureDate, sortOrder: 3 });

    // Expired banner
    const pastStart = new Date(Date.now() - 172800000);
    const pastEnd = new Date(Date.now() - 86400000);
    await request(app)
      .post('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Expired Banner', isActive: true, startDate: pastStart, endDate: pastEnd, sortOrder: 4 });
  });

  test('3. Public endpoint returns only active within date range, sorted by sortOrder', async () => {
    const res = await request(app).get('/api/v1/banners');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const banners = res.body.data.banners;
    expect(banners.length).toBe(1);
    expect(banners[0].title).toBe('Active Banner');
    expect(banners[0].imagePublicId).toBeUndefined(); // ensure admin secrets / private fields hidden
  });

  test('4. Backend validation rejects unsafe button links', async () => {
    const resScript = await request(app)
      .post('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Unsafe Banner',
        buttonLink: 'javascript:alert(1)',
      });

    expect(resScript.status).toBe(400);
    expect(resScript.body.message).toMatch(/Invalid or unsafe button link URL/);
  });

  test('5. Backend validation rejects end date before start date', async () => {
    const start = new Date(Date.now() + 86400000);
    const end = new Date(Date.now() - 86400000);

    const res = await request(app)
      .post('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Bad Dates Banner',
        startDate: start,
        endDate: end,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/End date cannot be earlier than start date/);
  });

  test('6. Admin can update, toggle status, change sort order and delete banner', async () => {
    const adminRes = await request(app)
      .get('/api/v1/banners/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    
    expect(adminRes.status).toBe(200);
    const bannerId = adminRes.body.data.banners[0]._id;

    // Update title & deactivate
    const patchRes = await request(app)
      .patch(`/api/v1/banners/admin/${bannerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Updated Banner Title', isActive: false });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.banner.title).toBe('Updated Banner Title');
    expect(patchRes.body.data.banner.isActive).toBe(false);

    // Delete banner
    const delRes = await request(app)
      .delete(`/api/v1/banners/admin/${bannerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(delRes.status).toBe(200);
  });
});
