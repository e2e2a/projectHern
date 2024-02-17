

const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const verifyController = require('../controllers/verifyController');
const indexController = require('../controllers/indexController');
const aboutController = require('../controllers/aboutController');
const deceasedController = require('../controllers/deceasedController');
const editController = require('../controllers/editController');
const verifyEditController = require('../controllers/verifyEditController');
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
    app.get('/edit', editController.index);
    app.post('/doEdit', editController.doEdit);
    app.get('/verifyEdit', verifyEditController.verify);
    app.post('/verifyDoEdit', verifyEditController.doVerify);
    app.get('/elements', (req,res) => {
        res.render('elements');
    });
    //admin
    app.get('/admin', (req,res) => {
        res.render('admin/index')
    })
}