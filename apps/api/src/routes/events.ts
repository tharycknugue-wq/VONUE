import { Router } from 'express';
import * as eventsController from '../controllers/events.controller';
import * as photosController from '../controllers/photos.controller';
import * as djController from '../controllers/dj.controller';
import * as promoterController from '../controllers/promoter.controller';
import * as jobController from '../controllers/job.controller';
import { auth } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/error';

const router = Router();

router.get('/', asyncHandler(eventsController.list));
router.post('/', auth, asyncHandler(eventsController.create));
router.get('/:id', asyncHandler(eventsController.detail));
router.post('/:id/ticket-types', auth, asyncHandler(eventsController.createTicketTypes));
router.get('/:id/checkins', asyncHandler(eventsController.checkins));
router.post('/:id/checkin', auth, asyncHandler(eventsController.checkin));
router.get('/:id/reviews', asyncHandler(eventsController.listReviews));
router.post('/:id/review', auth, asyncHandler(eventsController.reviewOrganizer));
router.get('/:id/photos', asyncHandler(photosController.listEvent));
router.post('/:id/photos', auth, asyncHandler(photosController.upload));
router.post('/:id/lineup', auth, asyncHandler(djController.addLineup));
router.post('/:id/promoters', auth, asyncHandler(promoterController.enroll));
router.get('/:id/jobs', asyncHandler(jobController.listForEvent));
router.post('/:id/jobs', auth, asyncHandler(jobController.post));

export default router;
