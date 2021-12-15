const user = require('./routes/user');
const course = require('./routes/course');
const auth = require('./routes/auth');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const conectionMongo = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PW + '@' + process.env.HOST + ':' + process.env.DB_PORT;
mongoose.connect(conectionMongo, {dbName: process.env.DB_NAME})
    .then(() => console.log("Se conectó correctamente a db"))
    .catch( e => console.log("No se pudo a conectar db: ", e));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', auth)
app.use('/api/usuarios', user);
app.use('/api/cursos', course);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Aplicacion corriendo en puerto: " + port);
})