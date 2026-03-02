const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding menus...');

    // Clear existing menus
    await prisma.submenu.deleteMany();
    await prisma.menu.deleteMany();

    const menus = [
        // SUPER_ADMIN
        { label: 'Overview', icon: 'LayoutDashboard', path: '/super-admin', role: 'SUPER_ADMIN', order: 1 },
        { label: 'All Channels Control', icon: 'MessageSquare', path: '/super-admin/channels', role: 'SUPER_ADMIN', order: 2 },
        { label: 'Billing & Plans', icon: 'Phone', path: '/super-admin/billing', role: 'SUPER_ADMIN', order: 3 },
        { label: 'Audit Logs', icon: 'BrainCircuit', path: '/super-admin/audit', role: 'SUPER_ADMIN', order: 4 },
        { label: 'Global Users', icon: 'Users', path: '/super-admin/users', role: 'SUPER_ADMIN', order: 5 },
        { label: 'System Analytics', icon: 'BarChart3', path: '/super-admin/analytics', role: 'SUPER_ADMIN', order: 6 },

        // ADMIN
        { label: 'Dashboard', icon: 'LayoutDashboard', path: '/admin', role: 'ADMIN', order: 1 },
        { label: 'Channels', icon: 'MessageSquare', path: '/admin/channels', role: 'ADMIN', order: 2 },
        { label: 'Routing Rules', icon: 'Globe', path: '/admin/routing', role: 'ADMIN', order: 3 },
        { label: 'User Management', icon: 'Users', path: '/admin/users', role: 'ADMIN', order: 4 },
        { label: 'AI Configuration', icon: 'BrainCircuit', path: '/admin/ai-config', role: 'ADMIN', order: 5 },

        // MANAGER
        { label: 'Performance', icon: 'LayoutDashboard', path: '/manager', role: 'MANAGER', order: 1 },
        { label: 'Lead Funnel', icon: 'PieChart', path: '/manager/funnel', role: 'MANAGER', order: 2 },
        { label: 'Country Analytics', icon: 'Globe', path: '/manager/country', role: 'MANAGER', order: 3 },
        { label: 'Team Overview', icon: 'Users2', path: '/manager/team', role: 'MANAGER', order: 4 },

        // TEAM_LEADER
        { label: 'Dashboard', icon: 'LayoutDashboard', path: '/team-leader', role: 'TEAM_LEADER', order: 1 },
        { label: 'Team Inbox', icon: 'Inbox', path: '/team-leader/inbox', role: 'TEAM_LEADER', order: 2 },
        { label: 'Assigned Leads', icon: 'Users', path: '/team-leader/leads', role: 'TEAM_LEADER', order: 3 },

        // COUNSELOR
        { label: 'My Leads', icon: 'Users', path: '/counselor', role: 'COUNSELOR', order: 1 },
        { label: 'Unified Inbox', icon: 'Inbox', path: '/inbox', role: 'COUNSELOR', order: 2 },
        { label: 'Lead Notes', icon: 'FileEdit', path: '/counselor/notes', role: 'COUNSELOR', order: 3 },
        { label: 'Lead Stages', icon: 'Layers', path: '/counselor/stages', role: 'COUNSELOR', order: 4 },

        // SUPPORT
        { label: 'Unified Inbox', icon: 'Inbox', path: '/inbox', role: 'SUPPORT', order: 1 },
        { label: 'New Leads Queue', icon: 'UserPlus', path: '/support', role: 'SUPPORT', order: 2 },
        { label: 'Lead Assignment', icon: 'UserCheck', path: '/support/assign', role: 'SUPPORT', order: 3 }
    ];

    for (const menuData of menus) {
        await prisma.menu.create({
            data: menuData
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
