import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { createHash } from "crypto";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function isTeacher(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  storage.getUser(userId).then(user => {
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  storage.getUser(userId).then(user => {
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });
}

export function setupAuth(app: Express) {
  // Session middleware
  app.use(
    session({
      secret: "your-secret-key", // In production, use environment variable
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Register new user
  app.post("/api/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid user data" });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...parsed.data,
        password: hashPassword(parsed.data.password),
      });

      // Auto-login after registration
      req.session.userId = user.id;

      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Login
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Logout
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Add admin route to update user roles
  app.patch("/api/admin/users/:id/role", isAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (role !== "student" && role !== "teacher") {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updatedUser = await storage.updateUserRole(userId, role);
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't send password back to client
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  });

  // Add route to get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await Promise.all(
      Array.from((storage as any).users.values()).map(async (user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      })
    );
    res.json(users);
  });
}
