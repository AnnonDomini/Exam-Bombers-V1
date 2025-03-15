import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  teacherId: integer("teacher_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  teacherId: integer("teacher_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subtopics = pgTable("subtopics", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  subtopicId: integer("subtopic_id").notNull(),
  title: text("title").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  uploadedBy: integer("uploaded_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  question: text("question").notNull(),
  options: text("options").array().notNull(),
  correctAnswer: integer("correct_answer").notNull(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(),
  score: integer("score").notNull(),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["student", "teacher", "admin"]).default("student"),
  });

export const insertSubjectSchema = createInsertSchema(subjects).omit({ 
  id: true, 
  createdAt: true 
});

export const insertTopicSchema = createInsertSchema(topics).omit({ 
  id: true,
  createdAt: true 
});

export const insertSubtopicSchema = createInsertSchema(subtopics).omit({
  id: true,
  createdAt: true
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true
});

export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });

export const insertProgressSchema = createInsertSchema(progress).omit({ 
  id: true,
  completedAt: true 
});

// Types
export type User = typeof users.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type Subtopic = typeof subtopics.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Progress = typeof progress.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type InsertSubtopic = z.infer<typeof insertSubtopicSchema>;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertProgress = z.infer<typeof insertProgressSchema>;