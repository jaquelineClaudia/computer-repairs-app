const express = require('express');
const {
    userExists,
    protectToken,
    protectAccountOwner,
} = require('../middlewares/users.middlewares');
const {
    createUserValidations,
    checkValidations,
} = require('../middlewares/validations.middlewares');

const {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    login,
} = require('../controllers/users.controller');

const router = express.Router();

router.post('/login', login);
router.post('/', createUserValidations, checkValidations, createUser);
router.use(protectToken);
router.get('/', getAllUsers);

router
    .use('/:id', userExists)
    .route('/:id')
    .get(getUserById)
    .patch(protectAccountOwner, updateUser)
    .delete(protectAccountOwner, deleteUser);

module.exports = { usersRoter: router };
