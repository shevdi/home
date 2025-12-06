const packageJson = require('../package.json')
// const fs from 'fs';
const path = require('path')
const fsExtra = require('fs-extra')

const filesToCopy = packageJson.copyFiles || [];

copyFiles()

function copyFiles() {
  filesToCopy.forEach(({ src, dest }) => {
    const sourcePath = path.join(__dirname, src);
    const destinationPath = path.join(__dirname, dest);

    console.log('sourcePath', sourcePath)
    console.log('destinationPath', destinationPath)

    fsExtra.copy(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error(`Error copying ${sourcePath} to ${destinationPath}:`, err);
      } else {
        console.log(`Copied ${sourcePath} to ${destinationPath}`);
      }
    });
  });
}