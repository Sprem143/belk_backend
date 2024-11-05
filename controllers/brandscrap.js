const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const BrandPage = require('../model/brandpage');
const BrandUrl = require('../model/brandurl');

exports.brandscrap = async (req, res) => {
    let browser; // Declare browser outside the try block for cleanup
    try {
        const url = req.body.weblink;

        // Validate URL
        if (!url || typeof url !== 'string' || !url.startsWith('http')) {
            return res.status(400).json({ error: 'Invalid URL' });
        }
        // Launch Puppeteer ins   tance in non-headless mode
        browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
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

        const links = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('.pagination a'));
            return anchors.map(anchor => anchor.href);
        });
        if(links.length>0){
          let deleted=  links.pop();
            if(deleted){
                const pages = new BrandPage({ url: links });
               let result= await pages.save();
               console.log(result)
               await browser.close();
            }
        }
        const productUrls = await page.evaluate(() => {
            const scriptTag = document.querySelector('script[type="application/ld+json"]');
            if (scriptTag) {
                try {
                    const jsonData = JSON.parse(scriptTag.textContent);
                    return jsonData.itemListElement.map(item => item.item.url);
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    return [];
                }
            }
            return [];
        });

        if (productUrls.length > 0) {
            const productarr = productUrls.map(p => 'https://www.belk.com' + p);
            const products = new BrandUrl({ producturl: productarr });
            await products.save();

            const pages = await BrandPage.find();
            const secondurl = pages[0].url;
            // Proceed to the second process after the first completes
            await handleSecondPageScraping(secondurl); // Call the second scraping function here
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while scraping data.' });
    } 
};

// Function to handle the second page scraping
const handleSecondPageScraping = async (urls) => {
  
    for (const url of urls) {
        console.log(url);
        await new Promise(resolve => setTimeout(resolve, 60000)); 
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

    const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('.pagination a'));
        return anchors.map(anchor => anchor.href);
    });
    links.pop();
    const nextpage = new BrandPage({ url: links });
    await nextpage.save();
    await browser.close();
   
   }// Close the browser after the second process
};



// ------------scraping bee setting

exports.scrapingbee=async(req,res)=>{
 var client = new scrapingbee.ScrapingBeeClient('J3ZDHM98OZX3DNXI4Q2QAJFFR0B9MSV8DPQE5YW6A8GZ2SLCUQE22QM693C7DJ7UWEYEV05V0EEOVMZB');
 var response = await client.get({
    url: url,
    params: {  
    },
  })
  var decoder = new TextDecoder();
  var text = decoder.decode(response.data);
  console.log(text);
  res.send(text);
}
