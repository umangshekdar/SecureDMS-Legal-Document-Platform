import { Router, type IRouter } from "express";
import healthRouter from "./health";
import secureDmsRouter from "./securedms";

const router: IRouter = Router();

router.use(healthRouter);
router.use(secureDmsRouter);

export default router;
