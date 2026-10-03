import assert from 'node:assert/strict';
import {optimizeFarm, rankCrops} from '../js/planner.mjs';

const base = {season:'Kharif',soil:'red',ph:6.8,water:70,fertilizer:450,budget:250000,land:5,previous:'Groundnut',n:null,p:null,k:null};

assert.equal(rankCrops(base,'balanced')[0].name,'Maize','rotation-aware default must not always return Groundnut');
assert.equal(rankCrops(base,'profit')[0].name,'Tomato','profit priority must change the recommendation');

const summer = {...base,season:'Summer',soil:'loam',water:200,fertilizer:800,budget:700000,previous:'Maize',n:100,p:90,k:100};
for(const strategy of ['balanced','profit','water','budget']){
  assert.equal(rankCrops(summer,strategy)[0].name,'Tomato',`Summer recommendation must remain season-eligible for ${strategy}`);
  assert.equal(optimizeFarm(summer,strategy).unused.land,0,`single eligible Summer crop should be allowed to use available land for ${strategy}`);
}

const dry = {...base,season:'Rabi',water:58,fertilizer:350,budget:210000,previous:'Maize',n:45,p:55,k:50};
assert.equal(rankCrops(dry,'water')[0].name,'Groundnut','water strategy should retain Groundnut when inputs support it');

for(const farm of [base,summer,dry]){
  for(const strategy of ['balanced','profit','water','budget']){
    const plan = optimizeFarm(farm,strategy);
    assert.ok(plan.crops.length === 5,'all candidate crops stay visible');
    assert.ok(plan.rows.every(row=>row.eligible),'allocation must exclude out-of-season crops');
    assert.ok(plan.totals.water <= farm.water + .001,'allocation must respect water');
    assert.ok(plan.totals.fertilizer <= farm.fertilizer + .001,'allocation must respect fertilizer');
    assert.ok(plan.totals.cost <= farm.budget + .001,'allocation must respect budget');
  }
}

console.log('planner tests passed');
