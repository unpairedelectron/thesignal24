import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsletterRouter from "./newsletter";
import publicationRouter from "./publication";
import communityRouter from "./community";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publicationRouter);
router.use(communityRouter);
router.use(newsletterRouter);

export default router;
