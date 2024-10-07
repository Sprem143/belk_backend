const mongoose= require('mongoose')

const dataSchema = new mongoose.Schema({
    title:String,
    url:String,
    price:Number,
    upc:{unique:true,
        type:String},
    available:String

});

module.exports= mongoose.model('Data', dataSchema);