import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { Admin } from '../models/Admin.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const setupOwnerAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  const mobile = process.env.ADMIN_MOBILE?.replace(/\D/g, '').slice(-10);

  if (!mongoUri) throw new Error('MONGO_URI is required');
  if (!email) throw new Error('ADMIN_EMAIL is required');
  if (!password || password.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters');
  if (!mobile || mobile.length !== 10) throw new Error('ADMIN_MOBILE must contain a 10-digit mobile number');

  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(password, 12);
  const username = email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();

  const existingByEmail = await Admin.findOne({ email });
  if (existingByEmail) {
    existingByEmail.password = passwordHash;
    existingByEmail.mobile = mobile;
    existingByEmail.name = 'PRADEEP Store Owner';
    existingByEmail.role = 'superadmin';
    existingByEmail.isActive = true;
    await existingByEmail.save();
  } else {
    await Admin.deleteMany({ role: 'superadmin' });
    await Admin.create({
      username,
      name: 'PRADEEP Store Owner',
      mobile,
      email,
      password: passwordHash,
      role: 'superadmin',
      isActive: true
    });
  }

  console.log(`Owner admin configured securely: ${email}`);
  await mongoose.disconnect();
};

setupOwnerAdmin().catch(async (error) => {
  console.error(`[Admin Setup Error]: ${error.message}`);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
