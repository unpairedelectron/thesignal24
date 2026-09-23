import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsletterRouter from "./newsletter";
import publicationRouter from "./publication";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publicationRouter);
router.use(newsletterRouter);

export default router;
