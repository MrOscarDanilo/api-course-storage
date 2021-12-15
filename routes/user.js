const express = require('express');
const usuarioModel = require('../models/user');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const ruta = express.Router();
const verificarToken = require('../middlewares/auth');

const schema = Joi.object({
    nombre: Joi.string()
        .alphanum()
        .min(3)
        .max(10)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})

ruta.get('/', verificarToken, (req, res) => {
    let resultado = listarUsuarios();
    
    resultado.then(user => {
        res.send({
            response: user
        })
    }).catch(e => {
        res.status(400).json({
            error: e
        })
    });
});

ruta.post('/', (req, res) => {
    let body = req.body;

    usuarioModel.findOne({email: body.email}, function (err, user) {
        if(err){
            return res.status(400).json({error: 'Server Error'});
        }
        else if(user){
            return res.status(400).json({
                msk: 'El usuario ya existe'
            });
        }

        const {error, value} = schema.validate({
            nombre: body.nombre,
            email: body.email
        });
        if(!error){
            let resultado = crearUsuario(body);
        
            resultado.then(user => {
                res.send({
                    response: {
                        nombre: user.nombre,
                        email: user.email
                    }
                })
            }).catch(e => {
                res.status(400).json({
                    error: e
                })
            });
        } else{
            res.status(400).send(error);
        }
    })

    /* const {error, value} = schema.validate({
        nombre: body.nombre,
        email: body.email
    });
    if(!error){
        let resultado = crearUsuario(body);
    
        resultado.then(user => {
            res.send({
                response: {
                    nombre: user.nombre,
                    email: user.email
                }
            })
        }).catch(e => {
            res.status(400).json({
                error: e
            })
        });
    } else{
        res.status(400).send(error);
    } */

});

ruta.put('/:email', verificarToken, (req, res) => {
    let email = req.params.email;
    let body = req.body;
    const {error, value} = schema.validate({
        nombre: body.nombre,
        email: email
    });

    if(!error){
        let resultado = actualizarUsuario(email, body);
    
        resultado.then(user => {
            res.send({
                response: {
                    nombre: user.nombre,
                    email: user.email
                }
            })
        }).catch(e => {
            res.status(400).json({
                error: e
            })
        });
    } else {
        res.status(400).send(error);
    }

});

ruta.delete('/:email', verificarToken, (req, res) => {
    let email = req.params.email;
    let resultado = desactivarUsuario(email);
    
    resultado.then(user => {
        res.send({
            response: {
                nombre: user.nombre,
                email: user.email
            }
        })
    }).catch(e => {
        res.status(400).json({
            error: e
        })
    });
});

async function crearUsuario(body){
    let usuario = new usuarioModel({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10)
    });
    return await usuario.save();
}

async function actualizarUsuario(email, body){
    let usuario = await usuarioModel.findOneAndUpdate({"email": email}, {
        $set: {
            nombre: body.nombre,
            password: body.password
        }
    }, {
        new: true
    });
    return usuario;
}

async function desactivarUsuario(email){
    let usuario = await usuarioModel.findOneAndUpdate({"email": email}, {
        $set: {
            estado: false
        }
    }, {
        new: true
    });
    return usuario;
}

async function listarUsuarios(){
    let usuarios = await usuarioModel.find({
        "estado":true
    }).select({
        nombre: 1,
        email: 1
    });
    return usuarios;
}

module.exports = ruta;