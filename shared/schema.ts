import { pgTable, text, serial, integer, boolean, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['admin', 'staff', 'hospital']);
export const bloodTypeEnum = pgEnum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);
export const statusEnum = pgEnum('status', ['pending', 'approved', 'completed', 'rejected', 'processing', 'urgent']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: roleEnum("role").notNull().default('staff'),
  hospital_id: integer("hospital_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donors table
export const donors = pgTable("donors", {
  id: serial("id").primaryKey(),
  donor_id: text("donor_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  blood_type: bloodTypeEnum("blood_type").notNull(),
  gender: genderEnum("gender").notNull(),
  dob: date("dob").notNull(),
  address: text("address"),
  medical_conditions: text("medical_conditions"),
  last_donation: date("last_donation"),
  eligible_to_donate: boolean("eligible_to_donate").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Recipients table
export const recipients = pgTable("recipients", {
  id: serial("id").primaryKey(),
  recipient_id: text("recipient_id").notNull().unique(),
  name: text("name").notNull(),
  blood_type: bloodTypeEnum("blood_type").notNull(),
  gender: genderEnum("gender").notNull(),
  dob: date("dob").notNull(),
  address: text("address"),
  medical_requirements: text("medical_requirements"),
  hospital_id: integer("hospital_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Hospitals table
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  contact_person: text("contact_person"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blood Inventory table
export const bloodInventory = pgTable("blood_inventory", {
  id: serial("id").primaryKey(),
  blood_type: bloodTypeEnum("blood_type").notNull(),
  units: integer("units").notNull(),
  donation_date: date("donation_date").notNull(),
  expiry_date: date("expiry_date").notNull(),
  donor_id: integer("donor_id").notNull(),
  status: statusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blood Requests table
export const bloodRequests = pgTable("blood_requests", {
  id: serial("id").primaryKey(),
  request_id: text("request_id").notNull().unique(),
  hospital_id: integer("hospital_id").notNull(),
  blood_type: bloodTypeEnum("blood_type").notNull(),
  units_needed: integer("units_needed").notNull(),
  required_by: date("required_by").notNull(),
  reason: text("reason"),
  status: statusEnum("status").default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donation Drives table
export const donationDrives = pgTable("donation_drives", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  date: date("date").notNull(),
  start_time: text("start_time").notNull(),
  end_time: text("end_time").notNull(),
  target_units: integer("target_units"),
  registrations: integer("registrations").default(0),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Donation records
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  donor_id: integer("donor_id").notNull(),
  drive_id: integer("drive_id"),
  date: date("date").notNull(),
  blood_type: bloodTypeEnum("blood_type").notNull(),
  units: integer("units").notNull(),
  status: statusEnum("status").default('completed'),
  notes: text("notes"),
  inventory_id: integer("inventory_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity log
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  activity_type: text("activity_type").notNull(),
  description: text("description").notNull(),
  user_id: integer("user_id"),
  related_id: integer("related_id"),
  date: timestamp("date").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertDonorSchema = createInsertSchema(donors).omit({
  id: true,
  createdAt: true
});

export const insertRecipientSchema = createInsertSchema(recipients).omit({
  id: true,
  createdAt: true
});

export const insertHospitalSchema = createInsertSchema(hospitals).omit({
  id: true,
  createdAt: true
});

export const insertBloodInventorySchema = createInsertSchema(bloodInventory).omit({
  id: true,
  createdAt: true
});

export const insertBloodRequestSchema = createInsertSchema(bloodRequests).omit({
  id: true,
  createdAt: true
});

export const insertDonationDriveSchema = createInsertSchema(donationDrives).omit({
  id: true,
  createdAt: true
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDonor = z.infer<typeof insertDonorSchema>;
export type Donor = typeof donors.$inferSelect;

export type InsertRecipient = z.infer<typeof insertRecipientSchema>;
export type Recipient = typeof recipients.$inferSelect;

export type InsertHospital = z.infer<typeof insertHospitalSchema>;
export type Hospital = typeof hospitals.$inferSelect;

export type InsertBloodInventory = z.infer<typeof insertBloodInventorySchema>;
export type BloodInventory = typeof bloodInventory.$inferSelect;

export type InsertBloodRequest = z.infer<typeof insertBloodRequestSchema>;
export type BloodRequest = typeof bloodRequests.$inferSelect;

export type InsertDonationDrive = z.infer<typeof insertDonationDriveSchema>;
export type DonationDrive = typeof donationDrives.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

// Validation schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;
