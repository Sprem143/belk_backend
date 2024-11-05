const mongoose= require('mongoose')

const autofetchdataSchema = new mongoose.Schema({
    url:String,
    quantity:Number,
    imgurl:String,
    upc:String,
    clrsize:String,
    oldPrice:Number,
    newPrice:Number,
    available:String,
    offer:String,
    onsale:String,
    offerend:String
});

module.exports= mongoose.model('AutoFetchData', autofetchdataSchema);