const errorMiddleware = (err, req, res, next) => {
    console.error('🔥 [ERROR MIDDLEWARE CAUGHT]:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        data: null,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { errorMiddleware };
