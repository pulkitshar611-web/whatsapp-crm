const express = require('express');
const router = express.Router();
const { getLeads, createLead, updateLead, deleteLead, exportLeads, assignLead } = require('./lead.controller');
const { verifyToken, roleGuard } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, getLeads);
router.post('/', verifyToken, createLead);
router.post('/export', verifyToken, exportLeads);
router.put('/:id', verifyToken, updateLead);
router.put('/:id/assign', verifyToken, roleGuard('SUPPORT', 'TEAM_LEADER', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'), assignLead);
router.delete('/:id', verifyToken, roleGuard('SUPER_ADMIN', 'ADMIN'), deleteLead);

module.exports = router;
