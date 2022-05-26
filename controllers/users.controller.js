const { User } = require('../models/user.model');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.findAll({
        attributes: { exclude: ['password'] },
    });

    res.status(200).json({ users });
});

const getUserById = catchAsync(async (req, res, next) => {
    const { user } = req;

    res.status(200).json({ user });
});

const createUser = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = await User.create({
        name,
        email,
        password: hashPassword,
        role,
    });
    newUser.password = undefined;

    res.status(201).json({ newUser });
});

const updateUser = catchAsync(async (req, res, next) => {
    const { name, email } = req.body;
    const { user } = req;

    await user.update({ name, email });
    res.status(200).json({ status: 'success' });
});

const deleteUser = catchAsync(async (req, res, next) => {
    const { user } = req;

    await user.update({ status: 'disable' });

    res.status(200).json({ status: 'success' });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({
        where: { email, status: 'active' },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        next(new AppError('Invalid credentials', 400));
    }

    const token = await jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    user.password = undefined;

    res.status(200).json({ token, user });
});

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    login,
};