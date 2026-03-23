import { Router } from 'express';
import testSeriesRoutes from './testSeries/testSeries.routes';
import testsRoutes from './tests/tests.routes';
import categoriesRoutes from './categories/categories.routes';
import questionsRoutes from './questions/questions.routes';
import studentsRoutes from './students/students.routes';
import liveTestsRoutes from './liveTests/liveTests.routes';
import analyticsRoutes from './analytics/analytics.routes';
import leaderboardsRoutes from './leaderboards/leaderboards.routes';
import announcementsRoutes from './announcements/announcements.routes';
import cutoffsRoutes from './cutoffs/cutoffs.routes';
import faqsRoutes from './faqs/faqs.routes';
import notificationsRoutes from './notifications/notifications.routes';
import pricingRoutes from './pricing/pricing.routes';

const router = Router();

// Phase 2
router.use('/test-series', testSeriesRoutes);
router.use('/tests', testsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/folders', categoriesRoutes); // Alias to not break frontend
router.use('/questions', questionsRoutes);

// Phase 3
router.use('/students', studentsRoutes);
router.use('/live-tests', liveTestsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/leaderboards', leaderboardsRoutes);

// Phase 4
router.use('/announcements', announcementsRoutes);
router.use('/cutoffs', cutoffsRoutes);
router.use('/faqs', faqsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/pricing', pricingRoutes);

// Fallback to avoid 404s breaking the frontend dashboard
router.use('/*', (req, res) => {
    // If it's a GET request expecting an array, return []
    if (req.method === 'GET') {
        return res.json({ success: true, data: [] });
    }
    // Otherwise return success mock
    res.json({ success: true, message: 'Mock response for Phase 4+ endpoint', mock: true });
});

export default router;
