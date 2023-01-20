const express=require('express')
const router=express.Router()
const multer= require('multer')


const storage= multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    }, 
    filename:function (req,file , cb) {
        cb(null, file.originalname)
    }
})

// File format restrictions
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
const uploadImg= multer({storage:storage,  fileFilter: fileFilter}).single('image')
module.exports= uploadImg