import assert from'node:assert/strict';
import{recoveryState}from'../js/knowledge.js';
import{CATALOG,filterCatalog}from'../js/catalog.js';
import{FARMER_GUIDANCE,getGuidance,revisitText,speechText}from'../js/farmerGuidance.js';
import{treatmentFor}from'../js/treatmentRecommendations.js';

assert.equal(recoveryState('Moderate','Mild'),'Improving');
assert.equal(recoveryState('Mild','Severe'),'Worsening');
assert.equal(recoveryState('Mild','Mild'),'Stable');
assert.equal(recoveryState(undefined,'Mild'),'Baseline');
assert.ok(CATALOG.length>=20);
assert.ok(CATALOG.every(x=>x.source&&x.parts.length&&x.symptoms.length&&x.actions.length));
assert.ok(filterCatalog({crop:'Groundnut',part:'root'}).some(x=>x.id==='gnt-collar'));
assert.ok(filterCatalog({query:'curling'}).length>=2);

for(const key of['healthy','early','late']){
  const record=FARMER_GUIDANCE[key];
  assert.ok(record.source?.url.startsWith('https://'));
  assert.equal(record.revisit.length,2);
  const g=getGuidance(key,'en');
  assert.ok(g.title.length>20);
  assert.ok(g.meaning.length>40);
  assert.ok(g.now.length>=3);
  assert.ok(g.avoid.length>=2);
  assert.ok(g.prevention.length>=2);
  assert.ok(g.chemical.toLowerCase().includes('label'));
  assert.ok(revisitText(key,'en').length>15);
  assert.ok(speechText(key,'en').length>100);
}
assert.ok(getGuidance('early','en').chemical.includes('does not invent'));
assert.ok(getGuidance('late','en').apply.includes('registered product label'));
assert.ok(getGuidance('healthy','en').chemical.includes('confirmed need'));

const early=treatmentFor('tom-early');
assert.ok(early);
assert.ok(early.chemical.some(x=>/copper oxychloride/i.test(x.name)));
assert.ok(early.chemical.some(x=>/carbendazim/i.test(x.name)));
assert.ok(early.chemical.every(x=>x.rate.length>3));
assert.ok(early.nutrition.items.some(x=>/100:50:50/.test(x)));
assert.ok(/does not cure/i.test(early.diagnosisNote));
assert.ok(early.source.url.startsWith('https://'));

console.log('Farmer guidance, treatment recommendations, catalog and recovery assertions passed');
