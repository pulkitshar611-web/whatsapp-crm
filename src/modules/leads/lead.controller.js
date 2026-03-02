const prisma = require('../../config/prisma');
const socketManager = require('../../sockets/socketManager');

// @desc    Get all leads
// @route   GET /api/leads
exports.getLeads = async (req, res, next) => {
    try {
        const { country, status, dateRange, search } = req.query;

        const where = {};
        if (country && country !== 'Global') where.country = country;
        if (status && status !== 'All Stages') where.stage = status;
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
                { phone: { contains: search } }
            ];
        }

        const leads = await prisma.lead.findMany({
            where,
            include: {
                assignedUser: {
                    select: { name: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const flattenedLeads = leads.map(l => {
            const { assignedUser, ...rest } = l;
            return {
                ...rest,
                handlerName: assignedUser ? assignedUser.name : null
            };
        });

        res.json({
            success: true,
            message: 'Leads retrieved successfully',
            data: flattenedLeads
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create lead
// @route   POST /api/leads
exports.createLead = async (req, res, next) => {
    try {
        const { name, country, phone, email, program, stage, score, source, assignedTo, team, priority } = req.body;

        // Look up statusId based on stage string (e.g., "New", "Qualified")
        let statusEntity = await prisma.leadStatus.findUnique({
            where: { name: stage || 'New' }
        });

        if (!statusEntity) {
            statusEntity = await prisma.leadStatus.findFirst({
                where: { name: 'New' }
            });
        }

        const newLead = await prisma.lead.create({
            data: {
                name,
                country,
                phone,
                email,
                program,
                statusId: statusEntity ? statusEntity.id : null,
                stage: stage || 'New',
                score: score || 0,
                source: source || 'Website',
                assignedTo: assignedTo ? parseInt(assignedTo) : null,
                team: team || 'General',
                priority: priority || 'Medium'
            },
            include: { status: true }
        });

        // Emit real-time socket event
        socketManager.events.leadNew(newLead);
        socketManager.events.dashboardRefresh({ trigger: 'lead_created' });

        res.status(201).json({
            success: true,
            message: 'Lead created successfully',
            data: newLead
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
exports.updateLead = async (req, res, next) => {
    try {
        const { name, country, phone, email, program, stage, score, source, assignedTo, team, priority } = req.body;
        const leadId = parseInt(req.params.id);

        let data = {};
        if (name) data.name = name;
        if (country) data.country = country;
        if (phone) data.phone = phone;
        if (email) data.email = email;
        if (program) data.program = program;
        if (stage) {
            data.stage = stage;
            // Sync statusId based on stage name
            const statusEntity = await prisma.leadStatus.findUnique({
                where: { name: stage }
            });
            if (statusEntity) data.statusId = statusEntity.id;
        }
        if (score !== undefined) data.score = score;
        if (source) data.source = source;
        if (assignedTo !== undefined) data.assignedTo = assignedTo || null;
        if (team) data.team = team;
        if (priority) data.priority = priority;

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data
        });

        // Emit real-time update
        socketManager.events.leadUpdate(updatedLead);
        if (stage) socketManager.events.dashboardRefresh({ trigger: 'lead_stage_changed', stage });

        res.json({
            success: true,
            message: 'Lead updated successfully',
            data: updatedLead
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
exports.deleteLead = async (req, res, next) => {
    try {
        const leadId = parseInt(req.params.id);

        await prisma.lead.delete({
            where: { id: leadId }
        });

        socketManager.events.leadDelete(leadId);
        socketManager.events.dashboardRefresh({ trigger: 'lead_deleted' });

        res.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        next(error);
    }
};

// @desc    Export leads to CSV
// @route   POST /api/leads/export
exports.exportLeads = async (req, res, next) => {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });

        // Define CSV headers
        let csvContent = 'ID,Name,Country,Phone,Email,Program,Stage,Priority,Source,Created At\n';

        // Append rows
        leads.forEach(l => {
            const row = [
                l.id,
                `"${l.name || ''}"`,
                `"${l.country || ''}"`,
                `"${l.phone || ''}"`,
                `"${l.email || ''}"`,
                `"${l.program || ''}"`,
                `"${l.stage || 'New'}"`,
                `"${l.priority || 'Medium'}"`,
                `"${l.source || 'Website'}"`,
                new Date(l.createdAt).toISOString()
            ].join(',');
            csvContent += row + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="leads-export-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
    } catch (error) {
        next(error);
    }
};

// @desc    Assign lead to a user
// @route   PUT /api/leads/:id/assign
exports.assignLead = async (req, res, next) => {
    try {
        const leadId = parseInt(req.params.id);
        const { userId } = req.body;

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: { assignedTo: userId ? parseInt(userId) : null }
        });

        socketManager.events.leadUpdate(updatedLead);

        res.json({ success: true, data: updatedLead, message: 'Lead assigned successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, message: 'Lead not found' });
        }
        next(error);
    }
};
