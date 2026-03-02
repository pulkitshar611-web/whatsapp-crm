const prisma = require('../../config/prisma');

BigInt.prototype.toJSON = function () {
    return Number(this);
};

// @desc    Get system-wide analytics summary
// @route   GET /api/analytics/summary
exports.getSummary = async (req, res, next) => {
    try {
        const [leads, users] = await Promise.all([
            prisma.lead.findMany({ select: { country: true, stage: true, source: true } }),
            prisma.user.findMany({ select: { role: true, status: true } })
        ]);

        // Group leads by country
        const countryMap = {};
        leads.forEach(l => {
            const key = l.country || 'Unknown';
            if (!countryMap[key]) countryMap[key] = { 'Country Zone': key, 'Total Leads Generated': 0, 'Qualified Pipelines': 0 };
            countryMap[key]['Total Leads Generated']++;
            if (l.stage === 'Qualified' || l.stage === 'QUALIFIED') countryMap[key]['Qualified Pipelines']++;
        });

        // Group leads by source
        const sourceMap = {};
        leads.forEach(l => {
            const key = l.source || 'Direct';
            if (!sourceMap[key]) sourceMap[key] = { 'Ingress Channel': key, 'Total Leads': 0, 'Successful Conversions': 0 };
            sourceMap[key]['Total Leads']++;
            if (l.stage === 'Converted' || l.stage === 'CONVERTED') sourceMap[key]['Successful Conversions']++;
        });

        // Group users by role
        const roleMap = {};
        users.forEach(u => {
            const key = typeof u.role === 'object' ? (u.role?.name || 'Unknown') : (u.role || 'Unknown');
            if (!roleMap[key]) roleMap[key] = { 'Operational Tier': key, 'Allocated Seats': 0, 'Online Today': 0 };
            roleMap[key]['Allocated Seats']++;
            if (u.status === 'Active') roleMap[key]['Online Today']++;
        });

        res.json({
            success: true,
            data: {
                leadsByCountry: Object.values(countryMap),
                leadsBySource: Object.values(sourceMap),
                activeUsers: Object.values(roleMap)
            }
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Export system analytics metadata
// @route   GET /api/analytics/export
exports.getExport = async (req, res, next) => {
    try {
        const [leadsByCountry, leadsBySource, activeUsers] = await Promise.all([
            prisma.$queryRaw`SELECT country, COUNT(*) as count FROM leads GROUP BY country`,
            prisma.$queryRaw`SELECT source, COUNT(*) as count FROM leads GROUP BY source`,
            prisma.$queryRaw`SELECT role, COUNT(*) as count FROM users GROUP BY role`
        ]);

        const exportData = {
            exportDate: new Date().toISOString(),
            generatedBy: req.user.id,
            metrics: {
                geographicDistribution: leadsByCountry,
                ingressChannels: leadsBySource,
                operationalTiers: activeUsers
            }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=crm-intelligence-metadata.json');
        res.send(JSON.stringify(exportData, null, 2));
    } catch (error) {
        next(error);
    }
};
