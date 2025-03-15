import { createHash } from "crypto";
import {
  type User,
  type Subject,
  type Topic,
  type Question,
  type Progress,
  type InsertUser,
  type InsertSubject,
  type InsertTopic,
  type InsertQuestion,
  type InsertProgress,
} from "@shared/schema";

export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, newRole: "student" | "teacher"): Promise<User | undefined>;

  // Subjects (with teacher management)
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  getTeacherSubjects(teacherId: number): Promise<Subject[]>;

  // Topics
  getTopics(subjectId: number): Promise<Topic[]>;
  getTopic(id: number): Promise<Topic | undefined>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: number, topic: Partial<InsertTopic>): Promise<Topic>;

  // Questions
  getQuestions(topicId: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // Progress
  getProgress(userId: number, topicId: number): Promise<Progress | undefined>;
  updateProgress(progress: InsertProgress): Promise<Progress>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private topics: Map<number, Topic>;
  private questions: Map<number, Question>;
  private progresses: Map<number, Progress>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.topics = new Map();
    this.questions = new Map();
    this.progresses = new Map();
    this.currentId = 1;
    this.initializeData();
  }

  private initializeData() {
    // Create initial admin account
    const adminUser: InsertUser = {
      username: "admin",
      password: createHash("sha256").update("admin123").digest("hex"),
      role: "admin"
    };
    const admin = this.createUser(adminUser);

    // Create initial teacher account
    const teacherUser: InsertUser = {
      username: "demo_teacher",
      password: createHash("sha256").update("password123").digest("hex"),
      role: "teacher"
    };
    const teacher = this.createUser(teacherUser);

    // Add sample subjects
    const subjects: InsertSubject[] = [
      {
        name: "Physics",
        description: "Study of matter, energy, and their interactions",
        imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31",
        teacherId: teacher.id,
      },
      {
        name: "Chemistry",
        description: "Study of substances, their properties, and reactions",
        imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d",
        teacherId: teacher.id,
      },
      {
        name: "Biology",
        description: "Study of living organisms and their processes",
        imageUrl: "https://images.unsplash.com/photo-1475906089153-644d9452ce87",
        teacherId: teacher.id,
      },
    ];

    const createdSubjects = subjects.map(subject => this.createSubject(subject));

    // Add sample topics for Physics
    const physicsTopics: InsertTopic[] = [
      {
        subjectId: createdSubjects[0].id,
        teacherId: teacher.id,
        name: "Mechanics",
        content: "Study of motion, forces, and energy...",
      },
      {
        subjectId: createdSubjects[0].id,
        teacherId: teacher.id,
        name: "Thermodynamics",
        content: "Study of heat, temperature, and energy transfer...",
      },
    ];

    physicsTopics.forEach(topic => {
      const createdTopic = this.createTopic(topic);

      // Add questions for each topic
      const questions: InsertQuestion[] = [
        {
          topicId: createdTopic.id,
          question: "What is Newton's First Law?",
          options: [
            "An object at rest stays at rest...",
            "Force equals mass times acceleration",
            "For every action there is an equal reaction",
            "None of the above"
          ],
          correctAnswer: 0,
        },
        {
          topicId: createdTopic.id,
          question: "What is the unit of force?",
          options: ["Newton", "Joule", "Watt", "Pascal"],
          correctAnswer: 0,
        },
      ];

      questions.forEach(question => this.createQuestion(question));
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(userId: number, newRole: "student" | "teacher"): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;

    const updatedUser = { ...user, role: newRole };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Subjects
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.currentId++;
    const now = new Date();
    const newSubject: Subject = { ...subject, id, createdAt: now };
    this.subjects.set(id, newSubject);
    return newSubject;
  }

  async getTeacherSubjects(teacherId: number): Promise<Subject[]> {
    return Array.from(this.subjects.values()).filter(
      (subject) => subject.teacherId === teacherId
    );
  }

  // Topics
  async getTopics(subjectId: number): Promise<Topic[]> {
    return Array.from(this.topics.values()).filter(
      (topic) => topic.subjectId === subjectId
    );
  }

  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const id = this.currentId++;
    const now = new Date();
    const newTopic: Topic = { ...topic, id, createdAt: now };
    this.topics.set(id, newTopic);
    return newTopic;
  }

  async updateTopic(id: number, updates: Partial<InsertTopic>): Promise<Topic> {
    const topic = await this.getTopic(id);
    if (!topic) {
      throw new Error("Topic not found");
    }

    const updatedTopic = { ...topic, ...updates };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  // Questions
  async getQuestions(topicId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(
      (question) => question.topicId === topicId
    );
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const newQuestion: Question = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  // Progress
  async getProgress(userId: number, topicId: number): Promise<Progress | undefined> {
    return Array.from(this.progresses.values()).find(
      (progress) => progress.userId === userId && progress.topicId === topicId
    );
  }

  async updateProgress(progress: InsertProgress): Promise<Progress> {
    const id = this.currentId++;
    const completedAt = progress.completed ? new Date() : null;
    const newProgress: Progress = { ...progress, id, completedAt };
    this.progresses.set(id, newProgress);
    return newProgress;
  }
}

export const storage = new MemStorage();