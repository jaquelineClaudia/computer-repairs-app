const { User } = require('./models/user.model');
const { Repair } = require('./models/repair.model');
const { app } = require('./app');
const { db } = require('./utils/database');

db.authenticate()
    .then(() => console.log('Database authenticated'))
    .catch(err => console.log(err));

User.hasMany(Repair);
Repair.belongsTo(User);

db.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 3013;

app.listen(PORT, () => {
    console.log(`Express running on port: ${PORT}`);
});
