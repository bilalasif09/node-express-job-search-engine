const jwt = require('jsonwebtoken');
const config = require('../config');
const { hashSync } = require('bcryptjs');

exports.encodeAndValidatePassword = (password) => {
    return password ? hashSync(password, 8) : password;
};
exports.createAuthToken = (id) => {
    return jwt.sign(
        { id: id },
        config.secret,
        { expiresIn: 86400 } // expires in 24 hours 
    );
};
exports.validateAuthToken = (req, res, next) => {
    const token = req.headers['x-access-token'];
    console.log("validating token", token);
    if (!token) failure404(res, {});
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            failure401(res, {});
        }
        req.userId = decoded.id;
        next();
    });
};
exports.saveSession = (data, req, res, next) => {
    req.session.token = data.token;
    req.session.name = data.user.name;
    next(data);
};
exports.success = (response, req, res, next) => {
    res.status(200).send({ auth: true, response: response, message: 'Success', status: 200 });
};
exports.failure500 = (res, err) => {
    res.status(500).send({ error: err, auth: false, message: 'Something went wrong!', status: 500 });
};
exports.failure404 = (res, err) => {
    res.status(404).send({ error: err, auth: false, message: 'Not found!', status: 404 });
};
exports.failure401 = (res, err) => {
    res.status(401).send({ error: err, auth: false, message: 'Authentication failed!', status: 401 });
};

