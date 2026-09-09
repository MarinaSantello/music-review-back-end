import express from "express";
import { searchMusics, createReview, getReviewWithID, getReviewWithUser, updateReviewData, deleteReview } from "../controllers/review.js";

const router = express.Router();

router.post('/search', searchMusics);

router.post('/create', createReview);
router.post('/get-review', getReviewWithID);
router.post('/get-user-reviews', getReviewWithUser);

router.put('/update', updateReviewData);

router.delete('/delete', deleteReview);

export default router;