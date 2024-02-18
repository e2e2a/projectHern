const User = require('../../models/user')
const Deceased = require('../../models/deceased');
const SITE_TITLE = 'Deceased profiling management system with email notification';

module.exports.index = async (req,res) => {
    const deceasedId = req.params.id;
    const deceased = await Deceased.findById(deceasedId)
    console.log(deceasedId)
    res.render('admin/editDeceased',{
        site_title: SITE_TITLE,
        title: 'Edit',
        deceased:deceased,
    });
}

module.exports.doEdit = async (req, res) => {
    const deceasedId = req.params.id;
    
    const data = {
        fullname: req.body.fullname,
        deathDate: req.body.deathDate,
        placeDeath: req.body.placeDeath,
        birthDate: req.body.birthDate,
        placeBirth: req.body.placeBirth,
        ageDeath: req.body.ageDeath,
        gender: req.body.gender,
        occupation: req.body.occupation,
        civilStatus: req.body.civilStatus,
        religion: req.body.religion,
        citizenship: req.body.citizenship,
        description: req.body.description,
        causeDeath: req.body.causeDeath,
        nameCemetery: req.body.nameCemetery,
    };
    const deceased = await Deceased.findByIdAndUpdate(deceasedId, data, { new:true});
    if(deceased){
        req.flash('message', 'Updated Successfully!');
        return res.redirect('/index');
    } else{
        req.flash('message', 'Failed to Update Successfully!');
        return res.redirect('/index');
    }
}