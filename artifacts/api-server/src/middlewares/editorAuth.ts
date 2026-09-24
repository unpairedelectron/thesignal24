import { clerkClient, getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

export interface VerifiedEditorIdentity {
  id: string;
  displayName: string;
}

declare global {
  namespace Express {
    interface Request {
      editorIdentity?: VerifiedEditorIdentity;
    }
  }
}

const editorEmails = new Set(
  (process.env.EDITOR_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export const requireEditor: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ message: "Sign in to access the editorial desk." });
      return;
    }

    const user = await clerkClient.users.getUser(userId);
    const primaryEmail = user.primaryEmailAddress;
    if (
      !primaryEmail ||
      primaryEmail.verification?.status !== "verified" ||
      !editorEmails.has(primaryEmail.emailAddress.trim().toLowerCase())
    ) {
      res.status(403).json({ message: "This account is not an authorized editor." });
      return;
    }

    req.editorIdentity = {
      id: user.id,
      displayName: user.fullName?.trim() || primaryEmail.emailAddress,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const requireEditorForUnpublished: RequestHandler = (
  req,
  res,
  next,
) => {
  const includeUnpublished = req.query.includeUnpublished === "true";
  if (!includeUnpublished) {
    next();
    return;
  }
  void requireEditor(req, res, next);
};