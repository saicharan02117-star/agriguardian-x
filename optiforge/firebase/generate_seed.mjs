import {CATALOG,SOURCES} from '../js/catalog.js';
import {writeFileSync} from 'node:fs';

const payload={
  generatedAt:new Date().toISOString(),
  sources:Object.entries(SOURCES).map(([id,s])=>({id,name:s.name,url:s.url,reviewStatus:'reviewed'})),
  conditions:CATALOG.map(x=>({
    id:x.id,crop:x.crop,name:x.name,conditionType:x.type,affectedParts:x.parts,
    symptoms:x.symptoms,confirmation:x.confirm,actions:x.actions,sourceId:x.source,
    reviewStatus:'reviewed'
  }))
};
writeFileSync(new URL('seed-data.json',import.meta.url),JSON.stringify(payload,null,2));
console.log(`Exported ${payload.conditions.length} condition records and ${payload.sources.length} sources.`);
