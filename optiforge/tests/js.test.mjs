import assert from'node:assert/strict';import{recoveryState}from'../js/knowledge.js';
assert.equal(recoveryState('Moderate','Mild'),'Improving');assert.equal(recoveryState('Mild','Severe'),'Worsening');assert.equal(recoveryState('Mild','Mild'),'Stable');assert.equal(recoveryState(undefined,'Mild'),'Baseline');console.log('4 JavaScript assertions passed');
