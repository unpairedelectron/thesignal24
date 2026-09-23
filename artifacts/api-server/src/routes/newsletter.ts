import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, newsletterSubscribersTable } from "@workspace/db";
import {
  GetNewsletterStatusQueryParams,
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

router.get("/newsletter/status", async (req, res, next) => {
  try {
    const email = GetNewsletterStatusQueryParams.parse(req.query).email.toLowerCase();
    const [subscriber] = await db
      .select({ email: newsletterSubscribersTable.email })
      .from(newsletterSubscribersTable)
      .where(eq(newsletterSubscribersTable.email, email))
      .limit(1);
    res.json(serializeSubscriber(email, Boolean(subscriber)));
  } catch (error) {
    next(error);
  }
});

export default router;