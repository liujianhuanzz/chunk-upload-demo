const fs = require("fs");
const path = require("path");
const concat = require("concat-files");
const child_process = require("child_process")

//判断文件或者文件夹是否存在
function isExist(filePath){
    return new Promise((resolve, reject) => {
        fs.stat(filePath, (err, stats) => {
            if(err && err.code === 'ENOENT'){
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
}

//列出文件夹下所有文件
function listDir(path){
    return new Promise((resolve, reject) => {
        fs.readdir(path, (err, data) => {
            //去掉临时文件
            if(data && data.length > 0 && data[0] === '.DS_Store'){
                data.splice(0, 1);
            }

            resolve(data);
        })
    })
}

//获取临时文件列表
async function getChunkList(filePath, folderPath, callback){
    let isFileExit = await isExist(filePath);
    let result = {};

    if(isFileExit){
        result = {
            file: {
                isExists: true,
                name: filePath
            }
        }
    }else{
        let isFolderExist = await isExist(folderPath);
        let fileList = [];
        if(isFolderExist){
            fileList = await listDir(folderPath);
        }
        result = {
            chunkList: fileList
        }
    }
    callback(result);
}

//判断文件夹是否存在，不存在则新建
function folderIsExist(folder){
    return new Promise((resolve, reject) => {
        fs.stat(folder, (err, stats) => {
            //不存在
            if(err && err.code === 'ENOENT'){
                child_process.exec("chmod 777 " + __dirname, () => {
                    console.log(folder)
                    child_process.exec("mkdir -p " + folder, function(err){
                        if(err){
                            resolve(false);
                        }else{
                            resolve(true);
                        }
                    })
                });
            }else{
                resolve(true);
            }
        })
    })
}

//文件拷贝
function copyFile(src, dest){
    return new Promise((resolve, reject) => {
        fs.rename(src, dest, err => {
            if(err){
                reject(err)
            }else{
                resolve('copy file : ' + dest + 'success !')
            }
        })
    })
}

//合并临时文件

async function mergeFiles(srcDir, targetDir, newFileName, size){
    let writeStream = fs.createWriteStream(path.join(targetDir, newFileName));
    let fileArr = await listDir(srcDir);

    for(let i = 0; i < fileArr.length; i++){
        fileArr[i] = srcDir + '/' + fileArr[i];
    }

    concat(fileArr, path.join(targetDir, newFileName), () => {
        console.log('Merge Success');
    })
}

exports.utils = {
    isExist: isExist,
    listDir: listDir,
    getChunkList: getChunkList,
    folderIsExist: folderIsExist,
    copyFile: copyFile,
    mergeFiles: mergeFiles
}