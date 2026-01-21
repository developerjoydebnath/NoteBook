import express from 'express';
import { createLink, deleteLink, getLinkById, getLinks, updateLink } from '../controllers/linkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getLinks);
router.get('/:id', getLinkById);
router.post('/', createLink);
router.put('/:id', updateLink);
router.delete('/:id', deleteLink);

export default router;
