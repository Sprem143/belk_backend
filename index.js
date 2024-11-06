const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const cors = require('cors');
const db = require('./db');
const Product = require('./model/product');
const Url = require('./model/url');
const Upc = require('./model/upc');
const router = require('./router');
db();
puppeteer.use(StealthPlugin()); // Use stealth mode

const app = express();
const port = process.env.PORT||10000;

app.use(cors());
app.use(express.json());
app.use('/', router);
// -------get old price from db

// app.post('/price', async (req, res) => {
//     try {
//         const url= req.body.url
//         // Launch Puppeteer instance in non-headless mode
//         const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
//         const page = await browser.newPage();

//         // Set user agent and additional headers
//         await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
//         await page.setExtraHTTPHeaders({
//             'Accept-Language': 'en-US,en;q=0.9',
//             'Referer': 'https://www.google.com/',
//         });

//         await page.goto(url, {
//             waitUntil: 'networkidle2',
//             timeout: 200000
//         });

//         // Extract the value of the utag_data variable
//         const utagData = await page.evaluate(() => {
//             return typeof utag_data !== 'undefined' ? utag_data : null;
//         });

//         // console.log('utag_data:', utagData);  // Print the utag_data variable
//         const price= utagData.sku_price;  
//         const upc= utagData.sku_upc;  
//         // Close the browser
//         await browser.close();

//         // Send the utag_data content to the frontend
//         res.json({ upc,price });
//     } catch (error) {
//         console.error('Error scraping the webpage:', error);
//         res.status(500).json({ message: 'Error scraping the webpage' });
//     }
// });


app.get('/checkprice', async (req, res) => {
    try {
        // Fetching UPCs from the database
        let upcs = await Upc.find();
        let datas = await Product.find();  // Fetching old data (to compare prices)

        var upcsarr = upcs[0].upc;  // Extracting the UPC array

        // Fetching URLs from the database
        const urls = await Url.find();
        let arr = urls[0].url;  // Extracting the URL array

        // Launching Puppeteer browser
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        // Use Promise.all to handle multiple requests concurrently
        var resultArray = await Promise.all(
            arr.map(async (link) => {
                try {
                    const page = await browser.newPage();

                    // Setting User Agent and headers
                    await page.setUserAgent(
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    );
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': 'en-US,en;q=0.9',
                        Referer: 'https://www.google.com/'
                    });

                    // Navigate to the URL
                    await page.goto(link, {
                        waitUntil: 'networkidle2',
                        timeout: 400000
                    });

                    // Extracting utag_data
                    const utagData = await page.evaluate(() => {
                        return typeof utag_data !== 'undefined' ? utag_data : null;
                    });

                    if (!utagData) {
                        await page.close();
                        return { link, price: null, upc: null, error: 'utag_data not found' };
                    }
                    var price = Array.isArray(utagData.sku_price) ? utagData.sku_price : [utagData.sku_price];
                    var upc = Array.isArray(utagData.sku_upc) ? utagData.sku_upc : [utagData.sku_upc];

                    // Combine UPC and price into key-value pairs along with old price
                    var upc_price = upc.map((key, index) => {
                        let oldPriceData = datas.find((data) => data.upc === key);
                        let oldPrice = oldPriceData ? oldPriceData.price : null;  // Get old price or null

                        return {
                            upc: key,
                            current_price: price[index],
                            old_price: oldPrice
                        };
                    });

                    await page.close();

                    return { link, upc_price };
                } catch (error) {
                    console.error(`Error scraping ${link}:`, error);
                    return { link, price: null, upc: null, error: 'Error scraping this page' };
                }
            })
        );

        // Close the browser after all operations
        await browser.close();

        // Filter `upc_price` based on `upcsarr` (valid UPCs)
        resultArray = resultArray.map((result) => {
            result.upc_price = result.upc_price.filter((u) => upcsarr.includes(u.upc));
            return result;
        });

        // Returning only filtered results
        let finalarr = [];
        finalarr.push(resultArray[0])
        // Sending the filtered result back to the client
        res.status(200).json(finalarr);
    } catch (err) {
        console.error('Error during checkprice:', err);
        res.status(500).json({ message: 'Error during price checking process' });
    }
});






app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
