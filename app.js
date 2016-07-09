/**
 * @file server enter file
 * @author YDSS
 */
'use strict';
const koa = require('koa');
const app = koa();
const port = 3000;

// filter request not from github domain
const reFilter = /github/;
app.use(function* (next) {
    if (reFilter.test(this.path) 
        // see part of Delivery headers in `https://developer.github.com/webhooks/` 
        && this.headers['X-GitHub-Event']
        && this.headers['User-Agent'].indexOf('GitHub-Hookshot')) {
        yield next;
    }
    else {
        this.status = 403;
        this.body = 'request forbidden';
    }
});

app.use(function* (next) {
    let body = this.request.body;
    debugger
});

app.listen(port);
console.log(`server start at port: ${port}`);
