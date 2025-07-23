import { integer, json, pgTable, text, varchar, date } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer(),
  phone: varchar({ length: 20 }),
  dateOfBirth: date(),
  gender: varchar({ length: 50 }),
  address: text(),
  emergencyContact: varchar({ length: 255 }),
  allergies: text(),
  currentMedications: text(),
  medicalConditions: text(),
  healthGoals: text(),
});
export const SessionChatTable = pgTable("sessionChatTable", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar().notNull(),
  notes: text(),
  selectedDoctor: json(),
  conversation: json(),
  report: json(),
  createdBy: varchar().references(() => usersTable.email),
  createdOn: varchar(),
});
