const mongoose= require('mongoose')

const brandUrlSchema = new mongoose.Schema({
   url:{
    type: [String],
   }

});

module.exports= mongoose.model('BrandPage', brandUrlSchema);