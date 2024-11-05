const mongoose= require('mongoose')

const brandProductUrlSchema = new mongoose.Schema({
   producturl:{
    type: [String],
   }

});

module.exports= mongoose.model('BrandUrl', brandProductUrlSchema);