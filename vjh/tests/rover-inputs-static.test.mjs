import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FARM_INPUT_CATALOG,SEED_LIBRARY,CATALOG_STATS} from '../js/farm-input-catalog.mjs';

const [html,js,css,healthDatasetText,newsDatasetText]=await Promise.all([
  readFile(new URL('../index.html',import.meta.url),'utf8'),
  readFile(new URL('../js/app.js',import.meta.url),'utf8'),
  readFile(new URL('../styles.css',import.meta.url),'utf8'),
  readFile(new URL('../data/crop-health-dataset.json',import.meta.url),'utf8'),
  readFile(new URL('../data/agri-news.json',import.meta.url),'utf8')
]);

const healthDataset=JSON.parse(healthDatasetText);
const newsDataset=JSON.parse(newsDatasetText);

for(const id of ['cameraBaseUrl','localCameraStream','captureLocalFrame','soilReportForm','healthSoilMount','inputCatalog','visualDiagnosis']){
  assert.match(html,new RegExp(`id="${id}"`),`missing ${id}`);
}

assert.doesNotMatch(html,/data-view="rover"/,'rover controls must not appear in primary navigation');
assert.match(html,/<section id="rover"[^>]* hidden>/,'legacy rover console must stay inaccessible');

assert.match(js,/plantsPerRow:18/);
assert.match(js,/const ALL_PLANTS=/);
assert.match(js,/const INPUT_CATALOG=/);
assert.match(js,/const VISUAL_DIAGNOSIS=/);
assert.match(js,/\/capture/);
assert.match(js,/TextDetector/);
assert.match(js,/verified rate/i);
assert.match(css,/\.plant-node::before/);
assert.match(css,/\.route-overlay polyline/);
assert.match(css,/\.camera-grid/);
assert.ok(CATALOG_STATS.total>=100,'expanded catalog should contain at least 100 references');
assert.equal(FARM_INPUT_CATALOG.length,new Set(FARM_INPUT_CATALOG.map(item=>item.id)).size,'catalog ids must be unique');
assert.ok(Object.keys(SEED_LIBRARY).length>=20,'seed optimizer should cover at least 20 crops');
for(const item of FARM_INPUT_CATALOG){
  assert.ok(item.image.startsWith('/vjh/assets/'),'catalog photos must be local and deployment-safe');
  assert.ok(item.use&&item.analysis&&item.purpose,`catalog guidance missing for ${item.id}`);
}

assert.ok(healthDataset.records.length>=50,'crop-health dataset should have broad reviewed coverage');
assert.deepEqual(new Set(healthDataset.records.map(item=>item.type)),new Set(['Disease','Pest','Nutrient deficiency','Abiotic stress']));
for(const crop of ['Groundnut','Maize','Cotton','Paddy','Tomato','Chilli']){
  assert.ok(healthDataset.records.some(item=>item.crop===crop),`missing crop-health coverage for ${crop}`);
}
assert.ok(newsDataset.items.length>=7,'saved news dataset should be seeded before daily refresh');
assert.ok(newsDataset.items.some(item=>item.language==='te'),'saved news dataset should include Telugu');
for(const item of newsDataset.items){
  assert.ok(item.title&&item.articleUrl&&item.imageUrl&&item.publishedAt,`incomplete news record ${item.id}`);
}
assert.match(js,/crop-health-dataset\.json/);
assert.match(js,/agri-news\.json/);

const htmlIds=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
assert.equal(new Set(htmlIds).size,htmlIds.length,'duplicate HTML ids');
const jsRefs=[...js.matchAll(/\$\('([^']+)'\)/g)].map(match=>match[1]);
const dynamicIds=['soilReportImage','soilReportPreview','soilUploadText','extractSoilValues','soilExtractionStatus'];
assert.deepEqual([...new Set(jsRefs.filter(id=>!htmlIds.includes(id)&&!dynamicIds.includes(id)))],[],'JavaScript references missing HTML ids');

console.log('rover, mapping, input catalog and soil report structural tests passed');
