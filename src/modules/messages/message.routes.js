const express = require('express');
const router = express.Router();
const { getChats, getMessages, sendMessage, clearUnread } = require('./message.controller');
const { verifyToken } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, getChats);
router.get('/:leadId', verifyToken, getMessages);
router.post('/', verifyToken, sendMessage);
router.put('/clear/:chatId', verifyToken, clearUnread);

module.exports = router;
