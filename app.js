/**
 * @file server enter file
 * @author YDSS
 */
'use strict';
const fs = require('fs');
const path = require('path');
const thunkify = require('thunkify');
const execFile = thunkify(require('child_process').execFile);

const koa = require('koa');
const logger = require('koa-logger');
const koaBody = require('koa-body');

const app = koa();
const env = app.env;
const port = 3000;

app.env === 'development' && app.use(logger());
app.use(koaBody());

// filter req not from webhook
const reFilter = /^\/webhook(\/[^\/])?/
app.use(function* (next) {
    if (reFilter.test(this.path)
        // see part of Delivery headers in `https://developer.github.com/webhooks/` 
        // headers key always lower case
        && this.headers['x-github-event']
        && this.headers['user-agent'].indexOf('GitHub-Hookshot') > -1) {
        yield next;
    }
    else {
        this.status = 403;
        this.body = 'request forbidden';
    }
});

// exec shell to update repo
app.use(function* (next) {
    try {
        // payload is a string
        let payload = JSON.parse(this.request.body.payload);
        let pusher = payload.pusher;
        let gitRepoName = payload.repository.name;
        let owner = payload.repository.owner.name; 
        
        // only owner's pushes are allowed
        if (owner !== pusher.name) {
            this.status = 403;
            this.body = `only ${owner} can trigger webhook`;
            return;
        }
        
        let stdout = yield execFile(
            path.join(__dirname, './bin/git_opt'), 
            // no need space between option and value
            [`-d${gitRepoName}`, '-n']
        );
        console.log(stdout.join('\n'));
        this.body = 'update success';
    } catch (e) {
        console.error(e);
    }
});

app.listen(port);
console.log(`server start at port: ${port}`);

app.on('error', (err) => {
    console.log('fatal error: ' + err);
    // del pid file
    fs.unlink('./pid');  
});

// write pid in current dir in case of killing this process
const pid = process.pid;
fs.writeFile('./pid', pid, () => {
    console.log('pid store in file pid');
});
