const mongoose= require('mongoose')

const visitedurlSchema = new mongoose.Schema({
   url:{
    type: [String],
   }

});

module.exports= mongoose.model('VisitedUrl', visitedurlSchema);