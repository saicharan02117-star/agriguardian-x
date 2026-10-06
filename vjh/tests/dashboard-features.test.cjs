const assert = require('node:assert/strict');
const {chromium} = require('../../optiforge/node_modules/playwright');

(async()=>{
  const browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/vjh/',{waitUntil:'networkidle'});

  await page.getByRole('button',{name:'Build optimized crop plan'}).click();
  assert.equal(await page.locator('#topCrop').textContent(),'Maize');

  await page.getByRole('button',{name:'Rover'}).click();
  await page.locator('#testRover').click();
  assert.match(await page.locator('#roverState').textContent(),/connected/i);
  await page.locator('[data-rover-command="forward"]').click();
  assert.match(await page.locator('#missionState').textContent(),/Manual: forward/);
  await page.locator('[data-drive-mode="autonomous"]').click();
  await page.locator('#startMission').click();
  assert.match(await page.locator('#missionState').textContent(),/Autonomous mission running/);
  await page.locator('#pauseMission').click();
  assert.match(await page.locator('#missionState').textContent(),/Paused safely/);
  await page.locator('#disconnectRover').click();
  assert.match(await page.locator('#roverState').textContent(),/disconnected/i);

  await page.getByRole('button',{name:'Field command'}).click();
  assert.equal(await page.locator('.plant-node').count(),144);
  assert.equal(await page.locator('.passport-item').count(),144);
  assert.match(await page.locator('#mapPlantInfo').textContent(),/Select a plant/);
  assert.match(await page.locator('#savingsResult').textContent(),/3,520/);
  await page.locator('#approveTreatment').click();
  assert.match(await page.locator('#approveTreatment').textContent(),/already approved/);
  await page.locator('#completeRevisit').click();
  assert.match(await page.locator('#passportDetail').textContent(),/recovered/i);
  await page.locator('#soilReportForm button[type="submit"]').click();
  assert.match(await page.locator('#irrigationReport').textContent(),/litres estimated/);

  await page.getByRole('button',{name:'Inputs & seeds'}).click();
  assert.ok(await page.locator('.input-card').count()>=15);
  assert.equal(await page.locator('.visual-card').count(),6);
  await page.locator('#inputRate').fill('2');
  await page.locator('#inputReference').fill('Verified label');
  await page.locator('#calculateInputDose').click();
  assert.match(await page.locator('#inputDoseResult').textContent(),/2 kg/);

  await page.getByRole('button',{name:'Agri news'}).click();
  await page.locator('#newsCrop').selectOption({label:'Groundnut'});
  await page.locator('#newsType').selectOption('disease');
  await page.locator('#newsLanguage').selectOption('te');
  assert.equal(await page.locator('.news-card').count(),1);
  assert.match(await page.locator('.news-card h3').textContent(),/వేరుశెనగ/);
  await page.locator('#saveWatchlist').click();
  assert.match(await page.locator('#watchlistStatus').textContent(),/watchlist active/);

  await page.getByRole('button',{name:'Farmer connect'}).click();
  assert.ok(await page.locator('.farmer-group').count()>=3);
  await page.locator('[data-join-group]').first().click();
  assert.match(await page.locator('.farmer-group').first().textContent(),/Interest recorded/);
  await page.locator('#calculateGroupSavings').click();
  assert.match(await page.locator('#groupSavingsResult').textContent(),/6,250/);
  await page.locator('#createFarmerGroup').click();
  assert.match(await page.locator('#createdGroupStatus').textContent(),/group drafted/);

  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Field command'}).click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth),true);
  assert.deepEqual(errors,[]);
  await browser.close();
  console.log('dashboard feature tests passed');
})().catch(error=>{console.error(error);process.exit(1);});
