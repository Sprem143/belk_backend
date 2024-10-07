const express = require('express');
const {getdbproduct,noofupdatedpr, uploaddata, getlinks,getlatestdata,downloadExcel} = require('./controllers/database');
const {fetchurl, checkurl, autofetchdata} = require('./controllers/scrap');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


router.post('/price', fetchurl);
router.post('/checkurl', checkurl);
router.post('/autofetchdata', autofetchdata);
router.get('/getoldproduct', getdbproduct)
router.get('/getlatestdata', getlatestdata)
router.get('/noofupdatedpr', noofupdatedpr)
router.get('/download-excel', downloadExcel)
router.get('/links', getlinks)
router.post('/upload',upload.single('file'), uploaddata)

module.exports = router;