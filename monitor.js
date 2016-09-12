var app = require('koa')();
var request = require('koa-request');
var router = require('koa-router')();

var services = {};
var cached_responses = {};

var update_frequency = 5000;
var last_updated = 0;

app.use(function *(next){
  yield next;
  console.log('%s %s', this.method, this.url);
  console.log("Header: ", this.request.header);
});

router
    .get('/', function *(next) {
        var responses = cached_responses;

        if (new Date().getTime() - last_updated > update_frequency)
        {
            for (service in services)
            {
                console.log(service);
                console.log(services[service]);

                var options = {
                    url: services[service],
                    headers: { 'User-Agent': 'request' }
                };
                console.log("URL: " + options.url);
                var status = {};

                try {
                    var response = yield request(options);
                    status.code = response.statusCode;

                    if (status.code !== 200)
                        status.body = response.body;
                    else
                        status.body = JSON.parse(response.body);
                }
                catch (err)
                {
                    status.code = 503;
                    status.body = err;
                }
                responses[service] = status;
            }
            last_updated = new Date().getTime();
        }
        cached_responses = responses;
        this.body = responses;
    })
    .get('/register', function *(next) {
        console.log("Registering: " + this.query.name);
        //if (!(this.request.header.host in services))
        //{
            services[this.query.name] = this.query.url;
        //}
        this.response.status = 200;
        this.response.body = "Registered";
    });

app.use(router.routes());

app.listen(3100);