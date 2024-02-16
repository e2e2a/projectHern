

const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const verifyController = require('../controllers/verifyController');
const indexController = require('../controllers/indexController');
const aboutController = require('../controllers/aboutController');
const deceasedController = require('../controllers/deceasedController');

module.exports = function(app){
    //users
    app.get('/', indexController.index);
    app.get('/about', aboutController.index);
    app.get('/deceased', deceasedController.index);
    app.get('/register', registerController.index);
    app.post('/doRegister', registerController.doRegister);
    app.get('/login', loginController.login);
    app.post('/login', loginController.doLogin);
    app.post('/logout', loginController.logout);
    app.post('/doLogin', loginController.doLogin);
    app.get('/verify', verifyController.verify);
    app.post('/verify', verifyController.doVerify);
    
    app.get('/elements', (req,res) => {
        res.render('elements');
    });
    //admin
}