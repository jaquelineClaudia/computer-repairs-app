const express = require('express');
const { globalErrorHandler } = require('./controllers/errors.controller');
const dotenv = require('dotenv');

const { usersRoter } = require('./routes/user.routes');
const { repairsRouter } = require('./routes/repair.routes');

dotenv.config({ path: './config.env' });

const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    max: 10000,
    windowMs: 30 * 60 * 1000,
    message: 'You have exceed the limit request for your IP',
});

const app = express();

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug');

app.use(limiter);
app.use(express.json());

app.use(helmet());
app.use(compression());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

app.use('/api/v1/users', usersRoter);
app.use('/api/v1/repairs', repairsRouter);
app.use('*', globalErrorHandler);

module.exports = { app };
