

const registerController = require('../controllers/registerController');
const loginController = require('../controllers/loginController');
const verifyController = require('../controllers/verifyController');
const indexController = require('../controllers/indexController');
const aboutController = require('../controllers/aboutController');
const deceasedController = require('../controllers/deceasedController');
const editController = require('../controllers/editController');
const verifyEditController = require('../controllers/verifyEditController');
//admin
const adminDeceasedController = require('../controllers/admin/deceasedController');
const adminIndexController = require('../controllers/admin/indexController');
const adminEditDeceasedController = require('../controllers/admin/editDeceasedController');
const adminAllDeceasedPrintController = require('../controllers/admin/allDeceasedPrintController');
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
    app.get('/admin', adminIndexController.index);
    app.get('/users', (req,res) => {
        res.render('admin/usertable')
    })
    app.get('/register-deceased', adminDeceasedController.index);
    app.post('/doCreateDeceased', adminDeceasedController.create);
    app.post('/actions', adminDeceasedController.actions);
    app.get('/editDeceased/:id', adminEditDeceasedController.index);
    app.post('/editDeceased/:id', adminEditDeceasedController.doEdit);
    app.post('/print', adminAllDeceasedPrintController.print)
    app.get('/table', (req,res) => {
        res.render('admin/table')
    })
    app.get('/404', (req,res) => {
        res.render('admin/404')
    })
    app.get('/button', (req,res) => {
        res.render('admin/button')
    })
    app.get('/form', (req,res) => {
        res.render('admin/form')
    })
    app.get('/element', (req,res) => {
        res.render('admin/element')
    })
}