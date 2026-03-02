const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { errorMiddleware } = require('./middleware/error.middleware');

dotenv.config();

const app = express();

// Middlewares
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (to be added)
app.get('/', (req, res) => {
    res.json({ success: true, message: 'CRM API is running' });
});

// Auth Routes
const authRoutes = require('./modules/auth/auth.routes');
app.use('/api/auth', authRoutes);

// User Routes
const userRoutes = require('./modules/users/user.routes');
app.use('/api/users', userRoutes);

// Lead Routes
const leadRoutes = require('./modules/leads/lead.routes');
app.use('/api/leads', leadRoutes);

// Dashboard Routes
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
app.use('/api/dashboard', dashboardRoutes);

// Message Routes
const messageRoutes = require('./modules/messages/message.routes');
app.use('/api/messages', messageRoutes);

// Billing Routes
const billingRoutes = require('./modules/billing/billing.routes');
app.use('/api/billing', billingRoutes);

// System Routes
const channelRoutes = require('./modules/system/channel.routes');
app.use('/api/channels', channelRoutes);
app.use('/api/channel', channelRoutes);

const analyticsRoutes = require('./modules/system/analytics.routes');
app.use('/api/analytics', analyticsRoutes);

// Counselor/Support Routes
const counselorRoutes = require('./modules/users/counselor.routes');
app.use('/api/counselor', counselorRoutes);

const supportRoutes = require('./modules/users/support.routes');
app.use('/api/support', supportRoutes);

const callRoutes = require('./modules/system/call.routes');
app.use('/api/calls', callRoutes);

const notificationRoutes = require('./modules/system/notification.routes');
app.use('/api/notifications', notificationRoutes);

const menuRoutes = require('./modules/system/menu.routes');
app.use('/api/system/menus', menuRoutes);

// Admin/Management Routes
const auditRoutes = require('./modules/admin/audit.routes');
app.use('/api/audit', auditRoutes);

const templateRoutes = require('./modules/messages/template.routes');
app.use('/api/templates', templateRoutes);

const routingRoutes = require('./modules/leads/routing.routes');
app.use('/api/routing', routingRoutes);

const adminRoutes = require('./modules/admin/admin.routes');
app.use('/api/admin', adminRoutes);

const careTemplateRoutes = require('./modules/templates/template.routes');
app.use('/api/care-templates', careTemplateRoutes);

const rotaRoutes = require('./modules/rota/rota.routes');
app.use('/api/rota', rotaRoutes);

const superAdminRoutes = require('./modules/admin/superadmin.routes');
app.use('/api/super-admin', superAdminRoutes);

const managerRoutes = require('./modules/admin/manager.routes');
app.use('/api/manager', managerRoutes);

const teamLeaderRoutes = require('./modules/admin/teamleader.routes');
app.use('/api/team-leader', teamLeaderRoutes);

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
