# webhook-transit-service
A koa server which receive github webhook request and then update related git repository

## purpose
I build this server for updating git repositories in my ecs when projects on github has push event, by receiving github webhook. As so far, I want to support updating one sepicify git repo by post info in webhook request, then copy git repo to where this project really is, and do someting like restart service, etc.
