const prisma = require('../../config/prisma');

// @desc    Get menus for the current user's role
// @route   GET /api/system/menus
exports.getMenus = async (req, res, next) => {
    try {
        const roleId = req.user.roleId;

        const menus = await prisma.menu.findMany({
            where: {
                roleId: roleId
            },
            include: {
                submenus: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                order: 'asc'
            }
        });

        res.json({ success: true, data: menus });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new menu (Admin only)
// @route   POST /api/system/menus
exports.createMenu = async (req, res, next) => {
    try {
        const { label, icon, path, role, order } = req.body;
        const menu = await prisma.menu.create({
            data: { label, icon, path, role, order }
        });
        res.status(201).json({ success: true, data: menu });
    } catch (error) {
        next(error);
    }
};

// @desc    Add submenu (Admin only)
// @route   POST /api/system/menus/:id/submenus
exports.addSubmenu = async (req, res, next) => {
    try {
        const { label, path, order } = req.body;
        const menuId = parseInt(req.params.id);

        const submenu = await prisma.submenu.create({
            data: { label, path, order, menuId }
        });
        res.status(201).json({ success: true, data: submenu });
    } catch (error) {
        next(error);
    }
};
