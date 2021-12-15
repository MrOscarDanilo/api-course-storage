const express = require('express');
const cursoModel = require('../models/course');
const Joi = require('joi');
const ruta = express.Router();
const verificarToken = require('../middlewares/auth');

const schema = Joi.object({
    titulo: Joi.string()
        .min(3)
        .max(50)
        .required(),

    descripcion: Joi.string(),
})

ruta.get('/', verificarToken, (req, res) => {
    let resultado = listarCursos();
    resultado.then(cursos => {
        res.json(cursos);
    }).catch(e => {
        res.status(400).send(e);
    });
});

ruta.post('/', verificarToken, (req,res) => {
    let body = req.body;
    const {error, value} = schema.validate({
        titulo: body.titulo,
        descripcion: body.descripcion
    });
    if(!error){
        let resultado = crearCurso(req);
    
        resultado.then(curso => {
            res.send({
                response: curso
            })
        }).catch(e => {
            res.status(400).json({
                error: e
            })
        });
    } else{
        res.status(400).send(error);
    }
});

ruta.put('/:id', verificarToken, (req,res) => {
    let id = req.params.id;
    let body = req.body;
    const {error, value} = schema.validate({
        titulo: body.titulo,
        descripcion: body.descripcion
    });

    if(!error){
        let resultado = actualizarCurso(id, body);
    
        resultado.then(curso => {
            res.send({
                response: curso
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

ruta.delete('/:id', verificarToken, (req, res) => {
    let id = req.params.id;
    let resultado = desactivarCurso(id);
    
    resultado.then(curso => {
        res.send({
            response: curso
        })
    }).catch(e => {
        res.status(400).json({
            error: e
        })
    });
});

async function crearCurso(req){
    let curso = new cursoModel({
        titulo: req.body.titulo,
        autor: req.usuario.id,
        descripcion: req.body.descripcion,
    });
    return await curso.save();
}

async function actualizarCurso(id, body){
    let curso = await cursoModel.findByIdAndUpdate(id, {
        $set: {
            titulo: body.titulo,
            descripcion: body.descripcion
        }
    }, {
        new: true
    });
    return curso;
}

async function desactivarCurso(id){
    let curso = await cursoModel.findByIdAndUpdate(id, {
        $set: {
            estado: false
        }
    }, {
        new: true
    });
    return curso;
}

async function listarCursos(){
    let cursos = await cursoModel.find({
        "estado":true
    })
    .populate('autor', 'nombre -_id');
    return cursos;
}

module.exports = ruta;