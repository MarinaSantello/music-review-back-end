import express from "express";
import { searchMusics, createReview, getReviewWithID, getReviewWithUser } from "../controllers/review.js";

const router = express.Router();

router.post('/search', searchMusics);

router.post('/create', createReview);
router.post('/get-review', getReviewWithID);
router.post('/get-user-reviews', getReviewWithUser);

export default router;