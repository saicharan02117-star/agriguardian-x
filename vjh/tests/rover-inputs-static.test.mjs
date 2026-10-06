import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const [html,js,css]=await Promise.all([
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../js/app.js',import.meta.url),'utf8'),
  readFile(new URL('../styles.css',import.meta.url),'utf8')
]);

for(const id of ['disconnectRover','manualControl','autonomousControl','startMission','coverageMap','soilReportForm','inputCatalog','visualDiagnosis']){
  assert.match(html,new RegExp(`id="${id}"`),`missing ${id}`);
}

assert.match(js,/plantsPerRow:18/);
assert.match(js,/const ALL_PLANTS=/);
assert.match(js,/const INPUT_CATALOG=/);
assert.match(js,/const VISUAL_DIAGNOSIS=/);
assert.match(js,/postRoverCommand\('stop'/);
assert.match(js,/verified rate/i);
assert.match(css,/\.plant-node::before/);
assert.match(css,/\.route-overlay polyline/);
assert.match(css,/\.camera-grid/);

const htmlIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'duplicate HTML ids');
const jsRefs=[...js.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
assert.deepEqual([...new Set(jsRefs.filter(id=>!htmlIds.includes(id)))],[],'JavaScript references missing HTML ids');

console.log('rover, mapping, input catalog and soil report structural tests passed');
