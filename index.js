/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const convertCsvToXlsx = require('@aternus/csv-to-xlsx');

let ipDir = './src';
let opDir = './out';
let rootProjDirName = 'file-filters';

let strToLookFor = [];
let opFileContent = 'filePath,  ComponentName';

function checkIfReactComponent(fileContent) {
  let isMatch = true;
  strToLookFor.forEach((str) => {
    if (!fileContent.includes(`${str}`)) {
      isMatch = isMatch && false;
    }
    isMatch = isMatch && true;
  });
  return isMatch;
  // const reactStr = fileContent.includes('import React');
  // const styledJSXStr = fileContent.includes('<style jsx>');
}

function writeToContent(filePath) {
  const componentName = filePath.split('/').pop().split('.')[0];
  const pathName = filePath.split(rootProjDirName)[1];
  opFileContent = `${opFileContent} \n ${pathName}, \t ${componentName}`;
}

// eslint-disable-next-line consistent-return
function getAllComponentsName(fofPath) {
  try {
    if (fs.existsSync(fofPath) && fs.lstatSync(fofPath).isDirectory()) {
      const filesOrFolder = fs.readdirSync(fofPath);
      filesOrFolder.forEach((fof) => {
        const tempPath = path.join(fofPath, `/${fof}`);
        getAllComponentsName(tempPath);
      });
    } else {
      const fileExtension = path.extname(fofPath);
      if (
        fileExtension === '.js' ||
        fileExtension === '.ts' ||
        fileExtension === '.jsx' ||
        fileExtension === '.tsx'
      ) {
        const data = fs.readFileSync(fofPath, 'utf8');
        if (checkIfReactComponent(data.toString())) {
          return writeToContent(fofPath);
        }
      }
    }
  } catch (err) {
    console.error(err);
    // eslint-disable-next-line consistent-return
    return;
  }
}

function writeOutputs() {
  try{
    if (fs.existsSync(path.join(__dirname, `${opDir}`))) {
      fs.rmdirSync(path.join(__dirname, `${opDir}`), { recursive: true });
    }
    fs.mkdirSync(path.join(__dirname, `${opDir}`));
    fs.writeFile(
      path.join(__dirname, `${opDir}/out.csv`),
      opFileContent, (err) => {
        if (err) {
          console.error('failed to write', err);
          return;
        }
        const source = path.join(__dirname, `${opDir}/out.csv`);
        const destination = path.join(__dirname, `${opDir}/out.xlsx`);
        convertCsvToXlsx(source, destination);
        console.log('written successfully');
      },
    );
  }catch(err){
    console.error(err);
  }
}

function main(inputDir, filterStr, projectDirectoryName, outputDir) {
  try {
    // redeclaring variables
    strToLookFor = [...filterStr];
    ipDir = inputDir || ipDir;
    opDir = outputDir || opDir;
    rootProjDirName = projectDirectoryName || rootProjDirName;

    const basePath = path.join(__dirname, ipDir);
    getAllComponentsName(basePath);
    writeOutputs();
  } catch (err) {
    console.error(err);
    return;
  }
}

// main(ipDir, ['import React', '<style jsx>'], rootProjDirName, opDir);

module.exports = main;
