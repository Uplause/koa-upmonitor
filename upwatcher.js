var request = require('request');

var calls = 0;
var start_time = new Date().getTime();
var monitor_url = "http://127.0.0.1:3100/register";
var name = "service_name";
var initialized = false;

function initialize()
{
    request(monitor_url + "?name=" + name + "&url=http://127.0.0.1:3001/status", function (error, response, body) {
        if (!error) {
            console.log(body);
        }
        else
        {
            console.log("Error connecting to monitor: " + error);
        }
    })
}

function* inc_call(next)
{
    if (this.request.url === "/status")
        this.body = status();
    else
    {
        calls++;
    }
    yield next;
}

function status()
{
    return JSON.stringify({"calls": calls, "uptime":new Date().getTime() - start_time});
}

function UpWatcher(config = {})
{
    monitor_url = config.url || monitor_url;
    name = config.name || name;

    if (!initialized)
    {
        initialized = true;
        setInterval(initialize, 10000);
    }

    UpWatcher.status = function*()
    {
        console.log("Responding..");

        
    }

    return inc_call;
}

module.exports = UpWatcher;