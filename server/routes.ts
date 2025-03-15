import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertProgressSchema, insertSubjectSchema, insertTopicSchema, insertQuestionSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, isTeacher } from "./auth";

export async function registerRoutes(app: Express) {
  // Set up authentication routes and middleware
  setupAuth(app);

  // Get all subjects (public)
  app.get("/api/subjects", async (_req, res) => {
    const subjects = await storage.getSubjects();
    res.json(subjects);
  });

  // Get a specific subject (public)
  app.get("/api/subjects/:id", async (req, res) => {
    const subject = await storage.getSubject(parseInt(req.params.id));
    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }
    res.json(subject);
  });

  // Create a new subject (teachers only)
  app.post("/api/subjects", isTeacher, async (req, res) => {
    const parsed = insertSubjectSchema.safeParse({
      ...req.body,
      teacherId: req.session.userId,
    });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid subject data" });
    }

    const subject = await storage.createSubject(parsed.data);
    res.status(201).json(subject);
  });

  // Get topics for a subject (public)
  app.get("/api/subjects/:id/topics", async (req, res) => {
    const topics = await storage.getTopics(parseInt(req.params.id));
    res.json(topics);
  });

  // Create a new topic (teachers only)
  app.post("/api/subjects/:id/topics", isTeacher, async (req, res) => {
    const parsed = insertTopicSchema.safeParse({
      ...req.body,
      subjectId: parseInt(req.params.id),
      teacherId: req.session.userId,
    });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid topic data" });
    }

    const topic = await storage.createTopic(parsed.data);
    res.status(201).json(topic);
  });

  // Get a specific topic
  app.get("/api/topics/:id", async (req, res) => {
    const topic = await storage.getTopic(parseInt(req.params.id));
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }
    res.json(topic);
  });

  // Update a topic (teachers only)
  app.patch("/api/topics/:id", isTeacher, async (req, res) => {
    const topic = await storage.getTopic(parseInt(req.params.id));
    if (!topic) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const parsed = insertTopicSchema.partial().safeParse({
      ...req.body,
      teacherId: req.session.userId,
    });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid topic data" });
    }

    const updatedTopic = await storage.updateTopic(parseInt(req.params.id), parsed.data);
    res.json(updatedTopic);
  });

  // Get questions for a topic (public)
  app.get("/api/topics/:id/questions", async (req, res) => {
    const questions = await storage.getQuestions(parseInt(req.params.id));
    res.json(questions);
  });

  // Create a new question (teachers only)
  app.post("/api/topics/:id/questions", isTeacher, async (req, res) => {
    const parsed = insertQuestionSchema.safeParse({
      ...req.body,
      topicId: parseInt(req.params.id),
    });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid question data" });
    }

    const question = await storage.createQuestion(parsed.data);
    res.status(201).json(question);
  });

  // Get progress for a topic (authenticated)
  app.get("/api/topics/:id/progress", isAuthenticated, async (req, res) => {
    const progress = await storage.getProgress(
      req.session.userId!,
      parseInt(req.params.id)
    );
    res.json(progress || { completed: false, score: 0 });
  });

  // Update progress for a topic (authenticated)
  app.post("/api/topics/:id/progress", isAuthenticated, async (req, res) => {
    const parsed = insertProgressSchema.safeParse({
      ...req.body,
      userId: req.session.userId,
      topicId: parseInt(req.params.id),
    });

    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid progress data" });
    }

    const progress = await storage.updateProgress(parsed.data);
    res.json(progress);
  });

  // Get teacher's subjects (teachers only)
  app.get("/api/teacher/subjects", isTeacher, async (req, res) => {
    const subjects = await storage.getTeacherSubjects(req.session.userId!);
    res.json(subjects);
  });

  const httpServer = createServer(app);
  return httpServer;
}