// @ts-nocheck
import fs from "fs";

const fse = require('fs-extra')

export class Type {

    /**
     * @param projectName 导出项目名
     * @param solFileList  接口文件名称列表（xxx.sol)
     * @param typeFileList artifacts/types导出名称列表
     */
    public static export(projectName: string, solFileList: string[]=[], typeNameList: string[]=[], testFileList?: string[]=[], handlerList?:string[]=[]) {
        //导出artifacts
        let srcDir = './artifacts/contracts';
        let allSrcFiles = [];
        Type.getAllFiles(srcDir, allSrcFiles)
        allSrcFiles.forEach(filePath => {

            let filename = filePath.substring(filePath.lastIndexOf("/") + 1);
            let fileFolder = filePath.substring(0, filePath.lastIndexOf("/"));

            let pureFilename = filename.split(".")[0]

            function process(){
                let dirFolder = "../contract-artifacts/chaosverse-plugins/" + projectName + "/" + fileFolder;
                //console.log("---- copy", filePath, "to", dirFolder);

                if (!fs.existsSync(dirFolder)) {
                    fs.mkdirSync(dirFolder, {recursive: true});
                }
                fse.copySync(filePath, dirFolder + "/" + filename)
            }

            if (typeNameList.length == 0 && filePath.indexOf(projectName) > 0) {
                process()
            } else {
                typeNameList.forEach(typeName => {

                    if (pureFilename == typeName) {
                        process()
                    }
                })
            }
        });

        srcDir = './typechain';

        //导出types index.ts,common.d.ts

        let dirFolder = "../contract-artifacts/chaosverse-plugins/" + projectName + "/types";
        fse.copySync(srcDir + "/common.d.ts", dirFolder + "/common.d.ts")

        //export type { IERC20 } from "./IERC20";
        let content = "";
        if(typeNameList.length == 0){

        }
        else {
            typeNameList.forEach(typeName => {
                content += "export type { " + typeName + " } from \"./" + typeName + "\";\n";
                content += "export { " + typeName + "__factory } from \"./factories/" + typeName + "__factory\";\n";
            });
            fs.writeFileSync(dirFolder + "/index.ts", content);
        }

        // //console.log("content-----",content)

        //导出所有types

        allSrcFiles = [];
        Type.getAllFiles(srcDir, allSrcFiles)
        allSrcFiles.forEach(filePath => {

            let filename = filePath.substring(filePath.lastIndexOf("/") + 1);
            let fileFolder = filePath.substring(0, filePath.lastIndexOf("/"));
            fileFolder = fileFolder.replace("/typechain", "/types");

            let pureFilename = filename.split(".")[0]


            function process(){
                let dirFolder = "../contract-artifacts/chaosverse-plugins/" + projectName + "/" + fileFolder;
                //console.log("---- copy", filePath, "to", dirFolder);

                if (!fs.existsSync(dirFolder)) {
                    fs.mkdirSync(dirFolder, {recursive: true});
                }

                fse.copySync(filePath, dirFolder + "/" + filename)
            }

            if (typeNameList.length == 0) {
                process()
            } else {
                typeNameList.forEach(typeName => {
                    if (pureFilename == typeName || typeName + "__factory.ts" == filename) {
                        process()
                    }
                })
            }

        });

        //导出所有sol 接口
        srcDir = './contracts';

        allSrcFiles = [];
        Type.getAllFiles(srcDir, allSrcFiles)
        allSrcFiles.forEach(filePath => {

            let filename = filePath.substring(filePath.lastIndexOf("/") + 1);
            let fileFolder = filePath.substring(0, filePath.lastIndexOf("/"));

            let pureFilename = filename.split(".")[0]
            let ext = filename.split(".")[1];

            solFileList.forEach(soFile => {

                if (filename == soFile) {
                    let dirFolder = "../contract-artifacts/chaosverse-plugins/" + projectName + "/" + fileFolder;
                    //console.log("---- copy", filePath, "to", dirFolder);

                    if (!fs.existsSync(dirFolder)) {
                        fs.mkdirSync(dirFolder, {recursive: true});
                    }

                    fse.copySync(filePath, dirFolder + "/" + filename)
                }
            })
        });

        //导出deployment
        srcDir = './deployments';

        let dirDeploy = "../contract-artifacts/chaosverse-plugins/" + projectName + "/deployments";
        if (!fs.existsSync(dirDeploy)) {
            fs.mkdirSync(dirDeploy, {recursive: true});
        }
        fse.copySync(srcDir, dirDeploy)

        //console.log("---- copy", "./deployments", "to", dirDeploy);


        // //导出src
        // srcDir = './src';
        // let dirSrc = "../contract-artifacts/chaosverse-plugins/" + projectName + "/src";
        // if (!fs.existsSync(dirSrc)) {
        //     fs.mkdirSync(dirSrc, {recursive: true});
        // }
        // fse.copySync(srcDir, dirSrc)

        //console.log("---- copy", "./src", "to", dirSrc);

        //导出testcase
        srcDir = './test';
        // if (testFileList.length == 0) {
        //     let dirTest = "../contract-artifacts/chaosverse-plugins/" + projectName + "/test";
        //     if (!fs.existsSync(dirTest)) {
        //         fs.mkdirSync(dirTest, {recursive: true});
        //     }
        //     fse.copySync(srcDir, dirTest)
        //
        //     //console.log("---- copy", "./test", "to", dirTest);
        // } else {
        allSrcFiles = [];
        Type.getAllFiles(srcDir, allSrcFiles)
        allSrcFiles.forEach(filePath => {

            let filename = filePath.substring(filePath.lastIndexOf("/") + 1);
            let fileFolder = filePath.substring(0, filePath.lastIndexOf("/"));

            let pureFilename = filename.split(".")[0]
            let ext = filename.split(".")[1];

            testFileList.forEach(file => {

                if (filename == file) {
                    let dirFolder = "../contract-artifacts/chaosverse-plugins/" + projectName + "/" + fileFolder;
                    //console.log("---- copy", filePath, "to", dirFolder);

                    if (!fs.existsSync(dirFolder)) {
                        fs.mkdirSync(dirFolder, {recursive: true});
                    }

                    fse.copySync(filePath, dirFolder + "/" + filename)
                }
            })
        });
        // }


        if(handlerList && handlerList?.length > 0){

            srcDir = './src/sdk-v3/handler';

            allSrcFiles = [];
            Type.getAllFiles(srcDir, allSrcFiles)
            allSrcFiles.forEach(filePath => {

                let filename = filePath.substring(filePath.lastIndexOf("/") + 1);
                let fileFolder = filePath.substring(0, filePath.lastIndexOf("/"));

                let pureFilename = filename.split(".")[0]
                let ext = filename.split(".")[1];

                handlerList.forEach(file => {

                    if (filename == file) {
                        let dirFolder = "../contract-artifacts/chaosverse-plugins/" + projectName + "/" + fileFolder;
                        //console.log("---- copy", filePath, "to", dirFolder);

                        if (!fs.existsSync(dirFolder)) {
                            fs.mkdirSync(dirFolder, {recursive: true});
                        }

                        fse.copySync(filePath, dirFolder + "/" + filename)
                    }
                })
            });

        }






    }

    public static import(projectName: string) {
        let selfArtifacts = './artifacts/contracts';
        if (!fs.existsSync(selfArtifacts)) {
            fs.mkdirSync(selfArtifacts, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/artifacts/contracts", selfArtifacts);

        console.log("import artifacts successfully!");

        let selfTypes = './typechain';
        if (!fs.existsSync(selfTypes)) {
            fs.mkdirSync(selfTypes, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/types", selfTypes)

        console.log("import types successfully!");

        let selfSol = './contracts';
        if (!fs.existsSync(selfSol)) {
            fs.mkdirSync(selfSol, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/contracts", selfSol)

        console.log("import contracts successfully!");

        let selfDeploy = './deployments';
        if (!fs.existsSync(selfDeploy)) {
            fs.mkdirSync(selfDeploy, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/deployments", selfDeploy)

        console.log("import deployments successfully!");

        let selfSdk = './src/sdk-v3';
        if (!fs.existsSync(selfSdk)) {
            fs.mkdirSync(selfSdk, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/sdk-v3", selfSdk)

        console.log("import sdk-v3 successfully!");

        let selfTest = './test';
        if (!fs.existsSync(selfTest)) {
            fs.mkdirSync(selfTest, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/test", selfTest)

        console.log("import test successfully!");




    }
    public static importRelationPro(projectName:string){

        let selfArtifacts = './artifacts/contracts';
        if (!fs.existsSync(selfArtifacts)){
            fs.mkdirSync(selfArtifacts, { recursive: true });
        }
        fse.copySync("../contract-artifacts/"+projectName+"/artifacts/contracts",selfArtifacts);

        console.log("import artifacts successfully!");

        let selfTypes = './typechain';
        if (!fs.existsSync(selfTypes)){
            fs.mkdirSync(selfTypes, { recursive: true });
        }
        fse.copySync("../contract-artifacts/"+projectName+"/types", selfTypes)

        console.log("import typechain successfully!");

        let selfSol = './contracts';
        if (!fs.existsSync(selfSol)){
            fs.mkdirSync(selfSol, { recursive: true });
        }
        fse.copySync("../contract-artifacts/"+projectName+"/contracts", selfSol)

        console.log("import contracts successfully!");

        let selfDeploy = './deployments';
        if (!fs.existsSync(selfDeploy)){
            fs.mkdirSync(selfDeploy, { recursive: true });
        }
        fse.copySync("../contract-artifacts/"+projectName+"/deployments", selfDeploy)

        console.log("import deployments successfully!");

        let selfTest = './test';
        if (!fs.existsSync(selfTest)){
            fs.mkdirSync(selfTest, { recursive: true });
        }
        fse.copySync("../contract-artifacts/"+projectName+"/test", selfTest)

        console.log("import test successfully!");

        let selfSDK = './src/relation';
        if (!fs.existsSync(selfSDK)){
            fs.mkdirSync(selfSDK, { recursive: true });
        }
        fse.copySync("../contract-artifacts/"+projectName+"/relation", selfSDK)

        console.log("import relation successfully!");

    }
    public static getAllFiles(path: string, files: []) {
        fs.readdirSync(path).forEach(function (file) {
            var subpath = path + '/' + file;
            if (fs.lstatSync(subpath).isDirectory()) {
                Type.getAllFiles(subpath, files);
            } else {
                files.push(path + '/' + file);
            }
        });
        return files;
    }


    public static syncV3Artifacts(projectName:string) {
        //导出artifacts
        let selfDir = './artifacts/contracts/V3';
        if (!fs.existsSync(selfDir)) {
            fs.mkdirSync(selfDir, {recursive: true});
        }
        fse.copySync("../contract-artifacts/" + projectName + "/artifacts/contracts/V3", selfDir)

        console.log("import sdk-v3 artifacts successfully!");
        //导出artifacts
        //  selfDir = './artifacts/contracts/relation';
        // if (!fs.existsSync(selfDir)) {
        //     fs.mkdirSync(selfDir, {recursive: true});
        // }
        // fse.copySync("../contract-artifacts/relation-pro/artifacts/contracts/relation", selfDir)
        //
        // console.log("import relation artifacts successfully!");
    }



}

