const fs = require("fs");
const path = require("path");
const Utils = require("./utils").utils;

const Koa = require("koa");
const router = require("koa-router")();
const bodyParser = require("koa-body");

const app = new Koa();

const uploadDir = 'uploads';

app.use(bodyParser({multipart: true}));
app.use(router.routes());

router.get("/", function(ctx){
    ctx.response.redirect("/index");
})

router.get("/index", function(ctx){
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./index.html');
})

router.get("/index-upload", function(ctx){
    ctx.response.type = 'html';
    ctx.response.body = fs.createReadStream('./index-upload.html');
})

router.get('/check/file', async function(ctx){
    let fileName = ctx.query.fileName, fileMd5Value = ctx.query.fileMd5Value;
    
    await Utils.getChunkList(path.join(uploadDir, fileName), path.join(__dirname, uploadDir, fileMd5Value), 
        data => {
            ctx.response.body = data;
        }
    )
})

router.post('/upload', async function(ctx){
    let data = ctx.request.body.fields,
        currChunk = data.currChunk,
        totalChunks = data.totalChunks,
        fileMd5Value = data.fileMd5Value,
        file = ctx.request.body.files,
        folder = path.join('uploads', fileMd5Value);
    let isExist = await Utils.folderIsExist(path.join(__dirname, folder));
    if(isExist){
        let destFile = path.join(__dirname, folder, currChunk),
            srcFile = path.join(file.data.path);
        await Utils.copyFile(srcFile, destFile).then(() => {
            ctx.response.body = 'chunk ' + currChunk + ' upload success!!!'
        }, (err) => {
            console.error(err);
            ctx.response.body = 'chunk ' + currChunk + ' upload failed!!!'
        })
    }
})

router.get("/mergeChunk", async function(ctx){
    let md5 = ctx.query.md5,
        fileName = ctx.query.fileName,
        size = ctx.query.size;

    await Utils.mergeFiles(path.join(__dirname, uploadDir, md5), 
                           path.join(__dirname, uploadDir),
                           fileName, size)

    ctx.response.body = "success";
})

app.listen(3000);

console.log("the server is listening on port 3000")