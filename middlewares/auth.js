const jwt = require('jsonwebtoken');

let verificarToken = (req, res, next) => {
    let token = req.get('Authorization');
    jwt.verify(token, process.env.TOKEN_SEED, (err, decoded) => {
        if(err){
            return res.status(401).json({
                error: err
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = verificarToken;