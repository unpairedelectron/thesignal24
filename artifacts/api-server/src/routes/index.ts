import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsletterRouter from "./newsletter";
import publicationRouter from "./publication";
import communityRouter from "./community";
import evidenceRouter from "./evidence";
import contentDeskRouter from "./content-desk";

const router: IRouter = Router();

router.use(healthRouter);
router.use(publicationRouter);
router.use(evidenceRouter);
router.use(contentDeskRouter);
router.use(communityRouter);
router.use(newsletterRouter);

export default router;
