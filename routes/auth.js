const express = require('express');
const usuarioModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const ruta = express.Router();

ruta.post('/', (req, res) => {
    usuarioModel.findOne({email: req.body.email})
        .then(datos => {
            if(datos){
                const passVal = bcrypt.compareSync(req.body.password, datos.password)
                if(!passVal){
                    return res.status(400).json({
                        error: 'ok',
                        msj: 'Usuario o contraseña incorrecta.'
                    });
                }
                /* const jwtoken = jwt.sign({
                    id: datos._id,
                    nombre: datos.nombre,
                    email: datos.email
                }, 'password'); */
                const jwtoken= jwt.sign({
                    usuario: {
                        id: datos._id,
                        nombre: datos.nombre,
                        email: datos.email
                    }
                  }, process.env.TOKEN_SEED, { expiresIn: process.env.TOKEN_EXPIRED });
                res.send({
                    usuario: {
                        id: datos._id,
                        nombre: datos.nombre,
                        email: datos.email
                    },
                    token: jwtoken});
            } else {
                res.status(400).json({
                    error: 'ok',
                    msj: 'Usuario o contraseña incorrecta.'
                });
            }
        })
        .catch(e => {
            res.status(400).json({
                error: 'ok',
                msj: 'Error en el servicio' + e
            });
        })
});

module.exports = ruta;