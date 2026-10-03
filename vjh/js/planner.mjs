const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const CROPS = [
  {id:'groundnut',name:'Groundnut',seasons:['Kharif','Rabi'],soils:['red','loam','black'],ph:[6,7.5],yield:9.4,price:6320,cost:32500,water:11,fertilizer:58,nutrients:{n:35,p:50,k:45},risk:.22},
  {id:'maize',name:'Maize',seasons:['Kharif','Rabi'],soils:['red','loam','black'],ph:[5.8,7.6],yield:24,price:2380,cost:36500,water:14,fertilizer:88,nutrients:{n:90,p:50,k:45},risk:.2},
  {id:'cotton',name:'Cotton',seasons:['Kharif'],soils:['black','red','loam'],ph:[5.8,8],yield:8.2,price:7480,cost:45500,water:18,fertilizer:102,nutrients:{n:70,p:40,k:45},risk:.32},
  {id:'chilli',name:'Chilli',seasons:['Kharif','Rabi'],soils:['red','loam'],ph:[6,7.3],yield:28,price:4100,cost:83500,water:22,fertilizer:122,nutrients:{n:75,p:50,k:50},risk:.42},
  {id:'tomato',name:'Tomato',seasons:['Kharif','Rabi','Summer'],soils:['red','loam'],ph:[6,7.2],yield:102,price:1480,cost:89500,water:20,fertilizer:128,nutrients:{n:85,p:55,k:80},risk:.46}
];

export const STRATEGIES = {
  balanced:{title:'Balanced plan',icon:'◎',description:'Balances agronomic suitability, profit, resource use and crop risk.',weights:{score:.58,profit:.18,water:.08,budget:.07,risk:.09}},
  profit:{title:'Maximum profit',icon:'₹',description:'Prioritises expected margin while retaining suitability and risk safeguards.',weights:{score:.38,profit:.47,water:.03,budget:.03,risk:.09}},
  water:{title:'Water saver',icon:'◒',description:'Favours suitable crops that create value with lower irrigation demand.',weights:{score:.42,profit:.12,water:.33,budget:.05,risk:.08}},
  budget:{title:'Low-budget plan',icon:'▤',description:'Favours suitable crops with lower cultivation cost and manageable risk.',weights:{score:.42,profit:.12,water:.05,budget:.33,risk:.08}}
};

function ratioScore(available, required){
  if(!Number.isFinite(available) || !Number.isFinite(required) || required <= 0) return 70;
  return clamp(available / required * 100, 0, 100);
}

function rotationScore(previous,crop){
  const prior = String(previous || '').toLowerCase();
  if(!prior || prior.includes('other') || prior.includes('none')) return 78;
  if(prior === crop.name.toLowerCase()) return 0;
  if(prior === 'groundnut' && crop.id !== 'groundnut') return 100;
  if(crop.id === 'groundnut' && ['maize','paddy','millet','cotton'].includes(prior)) return 96;
  return 82;
}

function nutrientScore(crop,farm){
  const supplied = ['n','p','k'].filter(key => Number.isFinite(farm[key]));
  if(!supplied.length) return 70;
  return supplied.reduce((total,key)=>total + ratioScore(farm[key],crop.nutrients[key]),0) / supplied.length;
}

export function assessCrop(crop,farm){
  const acres = Math.max(.25, Number(farm.land) || .25);
  const perAcre = {
    water:(Number(farm.water) || 0) / acres,
    fertilizer:(Number(farm.fertilizer) || 0) / acres,
    budget:(Number(farm.budget) || 0) / acres
  };
  const season = crop.seasons.includes(farm.season) ? 100 : 10;
  const soil = crop.soils.includes(farm.soil) ? 100 : 28;
  const phDistance = farm.ph < crop.ph[0] ? crop.ph[0] - farm.ph : farm.ph > crop.ph[1] ? farm.ph - crop.ph[1] : 0;
  const ph = clamp(100 - phDistance * 65, 10, 100);
  const factors = {
    season,
    soil,
    ph,
    water:ratioScore(perAcre.water,crop.water),
    budget:ratioScore(perAcre.budget,crop.cost),
    fertilizer:ratioScore(perAcre.fertilizer,crop.fertilizer),
    nutrients:nutrientScore(crop,farm),
    rotation:rotationScore(farm.previous,crop)
  };
  const weights = {season:.2,soil:.16,ph:.12,water:.14,budget:.1,fertilizer:.1,nutrients:.08,rotation:.1};
  const score = Math.round(Object.entries(weights).reduce((total,[key,weight])=>total + factors[key]*weight,0));
  const warnings = [];
  if(factors.season < 50) warnings.push(`not normally listed for ${farm.season}`);
  if(factors.soil < 50) warnings.push(`weak ${farm.soil}-soil match`);
  if(factors.water < 70) warnings.push(`water covers ${Math.round(factors.water)}% of the reference need`);
  if(factors.budget < 70) warnings.push(`budget covers ${Math.round(factors.budget)}% of the reference cost`);
  if(factors.fertilizer < 70) warnings.push(`fertilizer limit covers ${Math.round(factors.fertilizer)}% of the reference need`);
  if(factors.rotation === 0) warnings.push('same as the previous crop; rotation is preferred');
  const strengths = Object.entries(factors).filter(([,value])=>value >= 90).sort((a,b)=>b[1]-a[1]).map(([key])=>key);
  return {score,factors,warnings,strengths,eligible:factors.season >= 90 && score >= 48};
}

function normalize(value,min,max){
  return max === min ? .5 : clamp((value-min)/(max-min),0,1);
}

export function rankCrops(farm,strategy='balanced'){
  const assessed = CROPS.map(crop=>{
    const assessment = assessCrop(crop,farm);
    const yieldFactor = .65 + assessment.score / 100 * .35;
    const expectedYield = crop.yield * yieldFactor;
    const revenue = expectedYield * crop.price;
    const profit = revenue - crop.cost;
    return {...crop,...assessment,expectedYield,revenue,profit};
  });
  const ranges = {
    profit:[Math.min(...assessed.map(c=>c.profit)),Math.max(...assessed.map(c=>c.profit))],
    water:[Math.min(...assessed.map(c=>1/c.water)),Math.max(...assessed.map(c=>1/c.water))],
    budget:[Math.min(...assessed.map(c=>1/c.cost)),Math.max(...assessed.map(c=>1/c.cost))]
  };
  const weights = (STRATEGIES[strategy] || STRATEGIES.balanced).weights;
  return assessed.map(crop=>{
    const metrics = {score:crop.score/100,profit:normalize(crop.profit,...ranges.profit),water:normalize(1/crop.water,...ranges.water),budget:normalize(1/crop.cost,...ranges.budget),risk:1-crop.risk};
    let utility = Object.entries(weights).reduce((sum,[key,weight])=>sum + metrics[key]*weight,0);
    if(!crop.eligible) utility -= .18;
    if(crop.factors.rotation === 0) utility -= .12;
    return {...crop,metrics,utility};
  }).sort((a,b)=>Number(b.eligible)-Number(a.eligible) || b.utility-a.utility || b.score-a.score || b.profit-a.profit || a.name.localeCompare(b.name));
}

export function optimizeFarm(farm,strategy='balanced'){
  const selectedStrategy = strategy in STRATEGIES ? strategy : 'balanced';
  const crops = rankCrops(farm,selectedStrategy);
  const step = .25;
  let remaining = farm.land;
  const eligibleCount = crops.filter(crop=>crop.eligible).length;
  const used = {water:0,fertilizer:0,budget:0};
  const allocations = new Map();
  let guard = 0;
  while(remaining >= step - .001 && guard++ < 5000){
    const candidates = crops.filter(crop=>{
      const area = allocations.get(crop.id) || 0;
      const shareLimit = eligibleCount <= 1 ? 1 : selectedStrategy === 'profit' ? .7 : .58;
      const cap = Math.max(step,farm.land*shareLimit);
      return crop.eligible && area+step <= cap+.001 && used.water+crop.water*step <= farm.water+.001 && used.fertilizer+crop.fertilizer*step <= farm.fertilizer+.001 && used.budget+crop.cost*step <= farm.budget+.001;
    });
    if(!candidates.length) break;
    candidates.sort((a,b)=>{
      const adjusted = crop=>crop.utility*(1-(allocations.get(crop.id)||0)/(farm.land*.72));
      return adjusted(b)-adjusted(a) || b.score-a.score || a.name.localeCompare(b.name);
    });
    const crop = candidates[0];
    allocations.set(crop.id,(allocations.get(crop.id)||0)+step);
    used.water += crop.water*step;
    used.fertilizer += crop.fertilizer*step;
    used.budget += crop.cost*step;
    remaining -= step;
  }
  const rows = crops.filter(crop=>allocations.has(crop.id)).map(crop=>{
    const acres = allocations.get(crop.id);
    return {...crop,acres,totalYield:crop.expectedYield*acres,totalRevenue:crop.revenue*acres,totalProfit:crop.profit*acres,totalWater:crop.water*acres,totalFertilizer:crop.fertilizer*acres,totalCost:crop.cost*acres};
  }).sort((a,b)=>b.acres-a.acres || b.utility-a.utility);
  const totals = rows.reduce((sum,row)=>({yield:sum.yield+row.totalYield,revenue:sum.revenue+row.totalRevenue,profit:sum.profit+row.totalProfit,cost:sum.cost+row.totalCost,water:sum.water+row.totalWater,fertilizer:sum.fertilizer+row.totalFertilizer}),{yield:0,revenue:0,profit:0,cost:0,water:0,fertilizer:0});
  return {strategy:selectedStrategy,farm,crops,rows,totals,unused:{land:Math.max(0,farm.land-rows.reduce((sum,row)=>sum+row.acres,0)),water:Math.max(0,farm.water-totals.water),fertilizer:Math.max(0,farm.fertilizer-totals.fertilizer),budget:Math.max(0,farm.budget-totals.cost)},feasible:rows.length>0};
}
