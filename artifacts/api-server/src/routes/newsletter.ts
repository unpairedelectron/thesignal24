import { Router, type IRouter } from "express";
import { db, newsletterSubscribersTable } from "@workspace/db";
import {
  SubscribeToNewsletterBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeSubscriber(email: string, subscribed: boolean) {
  return { subscribed, email };
}

router.post("/newsletter", async (req, res, next) => {
  try {
    const email = SubscribeToNewsletterBody.parse(req.body).email.toLowerCase();
    await db
      .insert(newsletterSubscribersTable)
      .values({ email })
      .onConflictDoNothing({
        target: newsletterSubscribersTable.email,
      });
    res.status(201).json(serializeSubscriber(email, true));
  } catch (error) {
    next(error);
  }
});

export default router;