const { Repair } = require('../models/repair.model');
const { User } = require('../models/user.model');
const { catchAsync } = require('../utils/catchAsync');

const getAllCompletedRepairs = catchAsync(async (req, res, next) => {
  const repairs = await Repair.findAll({
    where: { status: 'pending' },
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
  });

  res.status(200).json({ repairs });
});

const getAllPendingRepairs = catchAsync(async (req, res, next) => {
  const repairs = await Repair.findAll({
    where: { status: 'pending' },
    include: [{ model: User, attributes: ['id', 'name', 'email'] }],
  });

  res.status(200).json({
    repairs,
  });
});

const getRepairById = catchAsync(async (req, res, next) => {
  const { repair } = req;

  res.status(200).json({ repair });
});

const createRepair = catchAsync(async (req, res, next) => {
  const { userId, date, computerNumber, comments } = req.body;

  const newRepair = await Repair.create({
    userId,
    date,
    computerNumber,
    comments,
  });

  res.status(201).json({ newRepair });
});

const updateRepair = catchAsync(async (req, res, next) => {
  const { repair } = req;

  await repair.update({ status: 'completed' });
  res.status(200).json({ status: 'Success' });
});

const deleteRepair = catchAsync(async (req, res, next) => {
  const { repair } = req;

  await repair.update({ status: 'cancelled' });
  res.status(200).json({ status: 'Success' });
});

module.exports = {
  getAllCompletedRepairs,
  getAllPendingRepairs,
  getRepairById,
  createRepair,
  updateRepair,
  deleteRepair,
};
