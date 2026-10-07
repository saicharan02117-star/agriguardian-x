import {cp,mkdir,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';

const projectRoot=join(dirname(fileURLToPath(import.meta.url)),'..');
const outputRoot=join(projectRoot,'esp32-local-site','data');

await mkdir(join(outputRoot,'vjh'),{recursive:true});
await mkdir(join(outputRoot,'optiforge'),{recursive:true});
await cp(join(projectRoot,'vjh'),join(outputRoot,'vjh'),{recursive:true,force:true});
await cp(join(projectRoot,'optiforge','js'),join(outputRoot,'optiforge','js'),{recursive:true,force:true});
await writeFile(join(outputRoot,'index.html'),'<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/vjh/"><title>AgriGuardian X Local</title>\n');

console.log(`ESP32 LittleFS website prepared at ${outputRoot}`);
