const mongoose= require('mongoose')

const dataSchema = new mongoose.Schema({
    amazonTitle:String,
    vendorURL:String,
    productCost:Number,
    colorSize:String,
    upc:{unique:true,
        type:String},
    available:String

});

module.exports= mongoose.model('Data', dataSchema);