const express = require('express');
const {
    protectToken,
    protectEmployee,
} = require('../middlewares/users.middlewares');

const { repairExists } = require('../middlewares/repairs.middlewares');

const {
    createRepairValidations,
    checkValidations,
} = require('../middlewares/validations.middlewares');
const {
    getAllPendingRepairs,
    createRepair,
    getRepairById,
    updateRepair,
    deleteRepair,
} = require('../controllers/repairs.controller');

const { upload } = require('../utils/multer');

const router = express.Router();

router.post(
    '/',
    upload.single('imgPath'),
    createRepairValidations,
    checkValidations,
    createRepair
);

router.use(protectToken, protectEmployee);

router.get('/', getAllPendingRepairs);

router
    .use('/:id', repairExists)
    .route('/:id')
    .get(getRepairById)
    .patch(updateRepair)
    .delete(deleteRepair);

module.exports = { repairsRouter: router };
