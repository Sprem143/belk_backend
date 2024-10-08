const Data= require('../model/product');
const xlsx = require('xlsx');
const path = require('path');
const Upc= require('../model/upc');
const Url= require('../model/url');
const AutoFetchData= require('../model/autofetchdata')
const fs = require('fs');
const product = require('../model/product');


exports.getdbproduct= async (req,res)=>{
  try{
    let result= await Data.find();
    res.json(result)
  }catch(err){
      console.log(err);
  }
};

exports.getlinks= async(req,res)=>{
  try{
    
    let result=  await Url.find();
    let totalProduct= await product.find();
    let notp= totalProduct.length;
    res.status(200).json({links:result,notp:notp})
  }catch(err){
    console.log(err);
  }
}

// -------- upload csv file to database
const toCamelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.toUpperCase()
    )
    .replace(/\s+/g, '');
};
const convertKeysToCamelCase = (data) => {
  return data.map(item => {
    const newItem = {};
    Object.keys(item).forEach(key => {
      const camelCaseKey = toCamelCase(key); // Convert key to camelCase
      newItem[camelCaseKey] = item[key]; // Copy value with new camelCase key
    });
    return newItem;
  });
};

exports.uploaddata= async(req, res) => {
  const file = req.file;
  if (!file) {
      return res.status(400).send('No file uploaded.');
  }

  // Load the uploaded Excel file
  const workbook = xlsx.readFile(file.path);
  const sheetName = workbook.SheetNames[0];  // Read first sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet to JSON
  const data = xlsx.utils.sheet_to_json(sheet);
  // const camelCaseData = convertKeysToCamelCase(data);
  // console.log(camelCaseData[0])
  // Insert the data into MongoDB
  Data.insertMany(data)
  .then( async() => {
      const uniqueUpc = data
      .map(item => item.upc) // Extract only the URLs
      .filter((upc, index, self) => self.indexOf(upc) === index);
      var upcs= new Upc({upc:uniqueUpc});
      await upcs.save();
  })
      .then( async() => {
          const uniqueUrls = data
          .map(item => item.url) // Extract only the URLs
          .filter((url, index, self) => self.indexOf(url) === index);
          var urls= new Url({url:uniqueUrls});
          await urls.save();
          res.status(200).json({msg:'Data successfully uploaded'})
      })
      .catch(err => {
          console.error('Error saving data to MongoDB:', err);
          res.status(500).json({msg:'Error saving data to MongoDB'});
      });

};

exports.getproductdetail=async(req, res) => {
    // try {
    //   console.log('Fetching details');
      
    //   // Set custom headers to mimic a real browser request
    //   const response = await axios.get('https://www.belk.com/p/vineyard-vines-mens-garment-dye-shep-shirt/32026641K004732.html?dwvar_32026641K004732_color=401441861025', {
    //     headers: {
    //       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
    //       'Accept-Language': 'en-US,en;q=0.9',
    //       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //     }
    //   });
      
    //   const html = response.data;
    //   const $ = cheerio.load(html);
      
    //   // Find the script tag containing the utag_data variable
    //   const utagDataScript = $('script').filter((i, el) => {
    //     const scriptContent = $(el).text();
    //     return scriptContent.includes('utag_data');
    //   });
  
    //   if (utagDataScript.length > 0) {
    //     const utagDataString = utagDataScript.text();
        
    //     // Extract the utag_data object using regular expression
    //     const utagDataRegex = /utag_data = (.*?);/;
    //     const match = utagDataRegex.exec(utagDataString);
        
    //     if (match) {
    //       const utagData = JSON.parse(match[1]);
    //       console.log('utag_data:', utagData);
          
    //       // Send the utag_data back as a response
    //       return res.json(utagData);
    //     } else {
    //       console.error('Error extracting utag_data: No match found');
    //       return res.status(500).json({ error: 'Error extracting utag_data: No match found' });
    //     }
    //   } else {
    //     console.error('Error extracting utag_data: Script not found');
    //     return res.status(500).json({ error: 'Error extracting utag_data: Script not found' });
    //   }
    // } catch (error) {
    //   console.error('Error scraping utag_data:', error);
    //   return res.status(500).json({ error: 'Error scraping utag_data', details: error.message });
    // }
  };

  exports.getlatestdata=async(req,res)=>{
    try{
      console.log("get latest data")
        let result= await AutoFetchData.find();
        res.status(200).send(result);
    }catch(err){
      res.send('Error while getting latest data')
    }
  }

  // -------download excel file --------
  exports.downloadExcel=async(req,res)=>{
    try{
      const data= await AutoFetchData.find();
      if (!data || data.length === 0) {
        return res.status(404).send('No data found.');
      }

      const jsondata= data.map((item)=>(
        {
          url:item.url,
          quantity:item.quantity,
          // imgurl:item.imgurl,
          UPC:item.upc,
          "Old Price":item.oldPrice,
          "New Price":item.newPrice,
          isAvailable: item.available
        }
      ))
      const worksheet = xlsx.utils.json_to_sheet(jsondata);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, "Products");
    const filePath = path.join(__dirname, 'data.xlsx');
    xlsx.writeFile(workbook, filePath);

    // Send the Excel file for download
    res.download(filePath, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
        // Delete the file after download
        fs.unlinkSync(filePath);
    });
    }catch(err){
      console.log(err)
    }
  }

  // -------get number of updated product------
  exports.noofupdatedpr=async(req,res)=>{
   try{
    let updatedProduct= await AutoFetchData.find();
    let noup=updatedProduct.length;
   
    if(!noup){
      res.send('Error while getting number of product')
    }
    res.status(200).json({noup:noup})
   }catch(err){
    console.log(err)
   }
  }