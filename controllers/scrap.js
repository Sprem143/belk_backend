const puppeteer = require('puppeteer-extra');
// const Upc = require('../model/upc');
const Data = require('../model/product');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const AutoFetchData= require('../model/autofetchdata')
exports.fetchurl = async (req, res) => {
    try {
        const url = req.body.url;
        let datas = await Data.find({ url: url });
        // Launch Puppeteer instance in non-headless mode
        const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Set user agent and additional headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
        });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 360000
        });

        const utagData = await page.evaluate(() => {
            return typeof utag_data !== 'undefined' ? utag_data : null;
        });

        const price = utagData.sku_price;
        const upc = utagData.sku_upc;
        var urlProduct = upc.map((u, index) => {
            return { upc: u, price: price[index] }
        })
        // -----filter product-----
        let filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => p.upc === data.upc);
            if (matchedProduct) {
                return {
                    upc: data.upc,
                    newPrice: matchedProduct.price,
                    oldPrice: data.price,
                    isChange: data.price !== matchedProduct.price
                };
            }
            return null;
        }).filter(item => item !== null);
        await browser.close();
        res.send(filterData);
    } catch (error) {
        console.error('Error scraping the webpage:', error);
        res.status(500).json({ message: 'Error scraping the webpage' });
    }
};


exports.checkurl = async (req, res) => {
    try {
        const url = req.body.url;
        let datas = await Data.find({ url: url });
        // Launch Puppeteer instance in non-headless mode
        const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Set user agent and additional headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
        });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 360000
        });

        const utagData = await page.evaluate(() => {
            return typeof utag_data !== 'undefined' ? utag_data : null;
        });

        const price = utagData.sku_price;
        const upc = utagData.sku_upc;
        const quantity = utagData.sku_inventory;
        const imgurl = utagData.sku_image_url;
        var urlProduct = upc.map((u, index) => {
            return { upc: u, price: price[index], quantity: quantity[index], imgurl: imgurl[index] }
        })
        // -----filter product-----
        let filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => p.upc === data.upc);
            if (matchedProduct) {
                return {
                    url: data.url,
                    quantity: matchedProduct.quantity,
                    imgurl: matchedProduct.imgurl,
                    upc: data.upc,
                    newPrice: matchedProduct.price,
                    oldPrice: data.price,
                    available: data.available
                };
            }
            return null;
        }).filter(item => item !== null);
        await browser.close();
        res.send(filterData);
    } catch (error) {
        console.error('Error scraping the webpage:', error);
        res.status(500).json({ message: 'Error scraping the webpage' });
    }
};


// -------second option to scrap data---------



// exports.checkurl = async (req, res) => {
//   try {
//     const url = req.body.url;
//     let datas = await Data.find({ url: url });
//       // Set custom headers to mimic a real browser request
//       const response = await axios.get(url, {
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
//           'Accept-Language': 'en-US,en;q=0.9',
//           'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//         }
//       });
      
//       const html = response.data;
//       const $ = cheerio.load(html);
      
//       // Find the script tag containing the utag_data variable
//       const utagDataScript = $('script').filter((i, el) => {
//         const scriptContent = $(el).text();
//         return scriptContent.includes('utag_data');
//       });
  
//       if (utagDataScript.length > 0) {
//         const utagDataString = utagDataScript.text();
        
//         // Extract the utag_data object using regular expression
//         const utagDataRegex = /utag_data = (.*?);/;
//         const match = utagDataRegex.exec(utagDataString);
        
//         if (match) {
//           var utagData = JSON.parse(match[1]);
//           console.log('utag_data:', utagData);

//            const price = utagData.sku_price;
//         const upc = utagData.sku_upc;
//         var urlProduct = upc.map((u, index) => {
//             return { upc: u, price: price[index] }
//         })
//         // -----filter product-----
//         var filterData = datas.map((data) => {
//             const matchedProduct = urlProduct.find((p) => p.upc === data.upc);
//             if (matchedProduct) {
//                 return {
//                     upc: data.upc,
//                     newPrice: matchedProduct.price,
//                     oldPrice: data.price,
//                     isChange: data.price !== matchedProduct.price
//                 };
//             }
//             return null;
//         }).filter(item => item !== null);
//           return res.json(filterData);
//         } else {
//           console.error('Error extracting utag_data: No match found');
//           return res.status(500).json({ error: 'Error extracting utag_data: No match found' });
//         }
//       } else {
//         console.error('Error extracting utag_data: Script not found');
//         return res.status(500).json({ error: 'Error extracting utag_data: Script not found' });
//       }
//     } catch (error) {
//       console.error('Error scraping utag_data:', error);
//       return res.status(500).json({ error: 'Error scraping utag_data', details: error.message });
//     }
// };


exports.autofetchdata= async (req,res)=>{
    try {
        const url = req.body.link;
        console.log(url)
        let datas = await Data.find({ url: url });
        // Launch Puppeteer instance in non-headless mode
        const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Set user agent and additional headers
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.google.com/',
        });

        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 360000
        });

        const utagData = await page.evaluate(() => {
            return typeof utag_data !== 'undefined' ? utag_data : null;
        });

        const price = utagData.sku_price;
        const upc = utagData.sku_upc;
        const quantity = utagData.sku_inventory;
        const imgurl = utagData.sku_image_url;
        var urlProduct = upc.map((u, index) => {
            return { upc: u, price: price[index], quantity: quantity[index], imgurl: imgurl[index] }
        })
        // -----filter product-----
        let filterData = datas.map((data) => {
            const matchedProduct = urlProduct.find((p) => p.upc === data.upc);
            if (matchedProduct) {
                return {
                    url: data.url,
                    quantity: matchedProduct.quantity,
                    imgurl: matchedProduct.imgurl,
                    upc: data.upc,
                    newPrice: matchedProduct.price,
                    oldPrice: data.price,
                    available: data.available
                };
            }
            return null;
        }).filter(item => item !== null);
        await browser.close();
        console.log(filterData)

        // ---save data into database
        for (const d of filterData) {
            const autofetchdata = new AutoFetchData(d);
         var r=await autofetchdata.save();
        }
        if(r){
            res.status(200).send(true);
        }
        
    } catch (error) {
        console.error('Error scraping the webpage:', error);
        res.status(500).send(false);
    }
}

