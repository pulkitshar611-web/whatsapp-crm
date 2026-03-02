const express = require('express');
const router = express.Router();
const { getSummary, getExport } = require('./analytics.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

router.use(verifyToken);
// Analytics can be viewed by all internal staff members
// router.use(roleGuard('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TEAM_LEADER'));

router.get('/summary', getSummary);
router.get('/export', getExport);

module.exports = router;

