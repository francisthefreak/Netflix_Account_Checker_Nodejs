var exec = require('child_process').exec;
var psTree = require('ps-tree');

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

var ovpnProcess = null;

if(ovpnProcess != null){
    console.log('close connection');
    var isWin = /^win/.test(ovpnProcess.platform);
    if(!isWin) {
        kill(ovpnProcess.pid);
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

    ovpnProcess = exec(`openvpn --config ./ipvanish/vpngate_public-vpn-56.opengw.net_udp_1195.ovpn`);
    ovpnProcess.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    ovpnProcess.stderr.on('data', function(data) {
        console.log('stdout: ' + data);
    });
    ovpnProcess.on('close', function(code) {
        console.log('closing code: ' + code);
    });