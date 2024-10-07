const mongoose= require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
    url:String,
    quantity:Number,
    imgurl:String,
    upc:String,
    oldPrice:Number,
    newPrice:Number,
    available:String
});

module.exports= mongoose.model('AutoFetchData', autofetchdataSchema);