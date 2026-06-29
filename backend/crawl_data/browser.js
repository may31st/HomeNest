const puperteer = require('puppeteer');
const fs = require('fs');

const startBrowser =  async() => {
    let browser
    try{
    const executablePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    let execPath = undefined;
    for (const path of executablePaths) {
      if (fs.existsSync(path)) {
        execPath = path;
        break;
      }
    }

    browser = await puperteer.launch({
        headless: true,
        executablePath: execPath,
        args: ['--disable-setuid-sandbox', '--no-sandbox'],
        'ignoreHTTPSErrors': true
    })
    
    }catch(err){
        console.log('Không tạo được browser', err)
    }
    return browser
}

module.exports = startBrowser