import {extractSignals, classify} from '/optiforge/js/screening.js';
import {getGuidance, revisitText} from '/optiforge/js/farmerGuidance.js';
import {treatmentFor} from '/optiforge/js/treatmentRecommendations.js';
import {CATALOG, SOURCES} from '/optiforge/js/catalog.js';
import {CROPS, STRATEGIES, optimizeFarm} from '/vjh/js/planner.mjs';

const $ = id => document.getElementById(id);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const money = n => new Intl.NumberFormat('en-IN', {style: 'currency', currency: 'INR', maximumFractionDigits: 0}).format(Math.round(n || 0));
const number = n => new Intl.NumberFormat('en-IN', {maximumFractionDigits: 1}).format(n || 0);
const today = () => new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'});

const MARKET_DATA = {
  groundnut:{trend:[5950,6080,6010,6190,6250,6320],markets:[['Warangal',6320,840,12],['Khammam',6410,690,98],['Hyderabad',6550,520,155],['Nizamabad',6240,410,210]]},
  maize:{trend:[2210,2250,2290,2260,2340,2380],markets:[['Warangal',2380,1260,12],['Khammam',2420,980,98],['Hyderabad',2470,760,155],['Nizamabad',2350,1180,210]]},
  cotton:{trend:[7100,7180,7260,7310,7420,7480],markets:[['Warangal',7480,730,12],['Khammam',7560,680,98],['Hyderabad',7690,420,155],['Nizamabad',7440,890,210]]},
  chilli:{trend:[3620,3840,3750,3980,4050,4100],markets:[['Warangal',4100,340,12],['Khammam',4250,290,98],['Hyderabad',4380,260,155],['Nizamabad',3970,180,210]]},
  tomato:{trend:[1050,1320,980,1610,1420,1480],markets:[['Warangal',1480,510,12],['Khammam',1520,470,98],['Hyderabad',1690,710,155],['Nizamabad',1390,360,210]]},
  paddy:{trend:[2320,2340,2370,2390,2400,2420],markets:[['Warangal',2420,1320,12],['Khammam',2460,980,98],['Hyderabad',2510,620,155],['Nizamabad',2440,1210,210]]},
  millet:{trend:[2940,3010,2980,3060,3110,3180],markets:[['Warangal',3180,260,12],['Khammam',3210,220,98],['Hyderabad',3350,180,155],['Nizamabad',3140,240,210]]}
};

const FORECAST = [
  ['Today','31° / 24°','68%','Inspect drainage. Avoid afternoon spraying.'],
  ['Saturday','30° / 23°','54%','Scout early morning. Irrigate only after a moisture check.'],
  ['Sunday','32° / 24°','28%','A dry morning may suit verified field work.'],
  ['Monday','33° / 25°','22%','Watch heat stress and reduce midday water loss.'],
  ['Tuesday','31° / 24°','61%','Prepare drainage and check fungal-risk zones.']
];

const FIELD_CASES = [
  {id:'AGX-A-R02-P08',field:'Field A',row:2,plant:8,crop:'Tomato',condition:'Early blight pattern',severity:'Moderate',confidence:91,quality:94,damage:18,recovery:42,status:'revisit',approved:true,next:'Revisit today',signals:['concentric brown lesions','lower leaves affected','two nearby cases']},
  {id:'AGX-A-R03-P12',field:'Field A',row:3,plant:12,crop:'Tomato',condition:'Late blight risk',severity:'High',confidence:87,quality:90,damage:31,recovery:12,status:'pending',approved:false,next:'Farmer approval required',signals:['water-soaked patch','rapid edge browning','humid zone']},
  {id:'AGX-A-R03-P13',field:'Field A',row:3,plant:13,crop:'Tomato',condition:'Late blight risk',severity:'Moderate',confidence:82,quality:86,damage:22,recovery:8,status:'pending',approved:false,next:'Capture reverse leaf image',signals:['adjacent case cluster','irregular lesion','leaf wetness risk']},
  {id:'AGX-A-R05-P04',field:'Field A',row:5,plant:4,crop:'Tomato',condition:'Nutrient stress screening',severity:'Low',confidence:68,quality:78,damage:9,recovery:0,status:'review',approved:false,next:'Soil or tissue confirmation',signals:['interveinal yellowing','older leaf first','low model confidence']},
  {id:'AGX-A-R06-P17',field:'Field A',row:6,plant:17,crop:'Tomato',condition:'Early blight pattern',severity:'Moderate',confidence:89,quality:92,damage:16,recovery:67,status:'revisit',approved:true,next:'Final recovery photo',signals:['lesion area reduced','new growth clear','isolated case']},
  {id:'AGX-A-R01-P05',field:'Field A',row:1,plant:5,crop:'Tomato',condition:'Healthy',severity:'None',confidence:94,quality:96,damage:0,recovery:100,status:'recovered',approved:true,next:'Routine scouting',signals:['uniform colour','no lesion pattern','good image quality']}
];

const NEWS_ITEMS = [
  {id:'disease-tomato',crop:'Tomato',type:'disease',regions:['telangana','south','india'],source:'Verified advisory feed placeholder',date:'Today',text:{
    en:['Tomato disease watch: inspect after humid weather','Check lower leaves for expanding brown or water-soaked lesions. Photograph both sides before deciding any treatment.'],
    te:['టమాటా వ్యాధి హెచ్చరిక: తేమ వాతావరణం తర్వాత పరిశీలించండి','కింది ఆకులపై పెరుగుతున్న గోధుమ లేదా నీటితో నిండిన మచ్చలను చూడండి. చికిత్స నిర్ణయానికి ముందు ఆకు రెండు వైపులా ఫోటో తీయండి.'],
    hi:['टमाटर रोग चेतावनी: नमी के बाद निरीक्षण करें','निचली पत्तियों पर फैलते भूरे या पानी जैसे धब्बे देखें। उपचार से पहले पत्ती के दोनों ओर की फोटो लें।'],
    ta:['தக்காளி நோய் எச்சரிக்கை: ஈரப்பதத்திற்குப் பின் ஆய்வு செய்யுங்கள்','கீழ் இலைகளில் விரியும் பழுப்பு அல்லது நீர்த்தழும்புகளைச் சரிபார்த்து, சிகிச்சைக்கு முன் இருபுறமும் படம் எடுக்கவும்.'],
    kn:['ಟೊಮೇಟೊ ರೋಗ ಎಚ್ಚರಿಕೆ: ತೇವಾಂಶದ ನಂತರ ಪರಿಶೀಲಿಸಿ','ಕೆಳ ಎಲೆಗಳಲ್ಲಿ ಹರಡುವ ಕಂದು ಅಥವಾ ನೀರಿನಂತಿರುವ ಕಲೆಗಳನ್ನು ನೋಡಿ. ಚಿಕಿತ್ಸೆಗೆ ಮುನ್ನ ಎರಡೂ ಬದಿಯ ಚಿತ್ರ ತೆಗೆಯಿರಿ.']
  }},
  {id:'weather-field',crop:'All',type:'weather',regions:['telangana','south'],source:'IMD agromet feed placeholder',date:'Today',text:{
    en:['Rain-window field advisory','Check drainage and root-zone moisture. Avoid routine spraying during rain or strong wind and follow the verified label window.'],
    te:['వర్ష సమయపు వ్యవసాయ సూచన','డ్రైనేజ్ మరియు వేరు ప్రాంత తేమను తనిఖీ చేయండి. వర్షం లేదా బలమైన గాలిలో సాధారణ స్ప్రే చేయవద్దు.'],
    hi:['वर्षा अवधि कृषि सलाह','जल निकासी और जड़ क्षेत्र की नमी जाँचें। वर्षा या तेज हवा में नियमित छिड़काव न करें।'],
    ta:['மழைக்கால வயல் அறிவுரை','வடிகால் மற்றும் வேர்ப்பகுதி ஈரத்தைச் சரிபார்க்கவும். மழை அல்லது பலத்த காற்றில் தெளிப்பதைத் தவிர்க்கவும்.'],
    kn:['ಮಳೆ ಅವಧಿಯ ಕೃಷಿ ಸಲಹೆ','ಒಳಚರಂಡಿ ಮತ್ತು ಬೇರು ವಲಯದ ತೇವಾಂಶ ಪರಿಶೀಲಿಸಿ. ಮಳೆ ಅಥವಾ ಬಲವಾದ ಗಾಳಿಯಲ್ಲಿ ಸಿಂಪಡಣೆ ತಪ್ಪಿಸಿ.']
  }},
  {id:'groundnut-watch',crop:'Groundnut',type:'disease',regions:['telangana','south','india'],source:'ICAR crop advisory placeholder',date:'This week',text:{
    en:['Groundnut leaf-spot scouting window','Walk a fixed W-pattern and compare new spots across rows. Record the hotspot before considering a field-wide response.'],
    te:['వేరుశెనగ ఆకుమచ్చల పరిశీలన సమయం','W ఆకారంలో పొలాన్ని పరిశీలించి వరుసల మధ్య కొత్త మచ్చలను పోల్చండి. మొత్తం పొలానికి చర్యకు ముందు హాట్‌స్పాట్‌ను నమోదు చేయండి.'],
    hi:['मूंगफली पत्ती-धब्बा निरीक्षण समय','W पैटर्न में खेत देखें और कतारों में नए धब्बों की तुलना करें। पूरे खेत के उपचार से पहले हॉटस्पॉट दर्ज करें।'],
    ta:['நிலக்கடலை இலைப்புள்ளி கண்காணிப்பு','W முறையில் வயலைச் சுற்றி வரிசைகளில் புதிய புள்ளிகளை ஒப்பிடவும். முழு வயல் நடவடிக்கைக்கு முன் பாதிப்பு இடத்தை பதிவு செய்யவும்.'],
    kn:['ಕಡಲೆ ಎಲೆಚುಕ್ಕೆ ಪರಿಶೀಲನೆ','W ಮಾದರಿಯಲ್ಲಿ ಹೊಲ ಪರಿಶೀಲಿಸಿ ಸಾಲುಗಳಲ್ಲಿನ ಹೊಸ ಕಲೆಗಳನ್ನು ಹೋಲಿಸಿ. ಸಂಪೂರ್ಣ ಹೊಲ ಕ್ರಮಕ್ಕೂ ಮುನ್ನ ಹಾಟ್‌ಸ್ಪಾಟ್ ದಾಖಲಿಸಿ.']
  }},
  {id:'market-maize',crop:'Maize',type:'market',regions:['telangana','india'],source:'eNAM / Agmarknet feed placeholder',date:'This week',text:{
    en:['Maize selling checklist before transport','Compare modal rate, grade, arrival volume and transport-adjusted net price before choosing a mandi.'],
    te:['మొక్కజొన్న అమ్మకానికి ముందు తనిఖీ జాబితా','మార్కెట్ ఎంచుకునే ముందు మోడల్ ధర, గ్రేడ్, వచ్చిన పరిమాణం మరియు రవాణా తర్వాత నికర ధరను పోల్చండి.'],
    hi:['मक्का बेचने से पहले जाँच सूची','मंडी चुनने से पहले मॉडल भाव, ग्रेड, आवक और परिवहन के बाद शुद्ध भाव की तुलना करें।'],
    ta:['மக்காச்சோளம் விற்பனைக்கு முன் சரிபார்ப்பு','சந்தையைத் தேர்வதற்கு முன் மாதிரி விலை, தரம், வரத்து மற்றும் போக்குவரத்துக்குப் பிந்தைய நிகர விலையை ஒப்பிடவும்.'],
    kn:['ಮೆಕ್ಕೆಜೋಳ ಮಾರಾಟದ ಮುನ್ನ ಪರಿಶೀಲನೆ','ಮಾರುಕಟ್ಟೆ ಆಯ್ಕೆಗೂ ಮುನ್ನ ಮಾದರಿ ದರ, ಗ್ರೇಡ್, ಆಗಮನ ಮತ್ತು ಸಾರಿಗೆ ನಂತರದ ನಿವ್ವಳ ದರ ಹೋಲಿಸಿ.']
  }},
  {id:'scheme-national',crop:'All',type:'scheme',regions:['india'],source:'Government agriculture feed placeholder',date:'National update',text:{
    en:['Nationwide schemes and farmer-service updates','Review eligibility, official deadline and required documents only on the responsible government portal before applying.'],
    te:['దేశవ్యాప్త పథకాలు మరియు రైతు సేవల సమాచారం','దరఖాస్తు ముందు అర్హత, అధికారిక గడువు మరియు పత్రాలను సంబంధిత ప్రభుత్వ పోర్టల్‌లో ధృవీకరించండి.'],
    hi:['देशव्यापी योजनाएँ और किसान सेवा अपडेट','आवेदन से पहले पात्रता, आधिकारिक समय सीमा और दस्तावेज संबंधित सरकारी पोर्टल पर सत्यापित करें।'],
    ta:['நாடு முழுவதும் திட்டங்கள் மற்றும் விவசாய சேவைகள்','விண்ணப்பிக்கும் முன் தகுதி, அதிகாரப்பூர்வ கடைசி தேதி மற்றும் ஆவணங்களை அரசு தளத்தில் சரிபார்க்கவும்.'],
    kn:['ರಾಷ್ಟ್ರವ್ಯಾಪಿ ಯೋಜನೆಗಳು ಮತ್ತು ರೈತ ಸೇವೆಗಳು','ಅರ್ಜಿ ಮೊದಲು ಅರ್ಹತೆ, ಅಧಿಕೃತ ಗಡುವು ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಸಂಬಂಧಿತ ಸರ್ಕಾರಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ.']
  }}
];

const FARMER_GROUPS = [
  {id:'FG-101',name:'Warangal Tomato Harvest Circle',crop:'Tomato',operation:'Harvesting',distance:6,members:7,acres:24,window:'12–15 Oct',saving:28},
  {id:'FG-102',name:'Hanamkonda Maize Machine Share',crop:'Maize',operation:'Harvesting',distance:11,members:5,acres:31,window:'18–21 Oct',saving:24},
  {id:'FG-103',name:'Parkal Groundnut Transport Pool',crop:'Groundnut',operation:'Transport',distance:19,members:9,acres:38,window:'20–24 Oct',saving:21},
  {id:'FG-104',name:'Narsampet Cotton Labour Group',crop:'Cotton',operation:'Labour',distance:34,members:12,acres:46,window:'25–30 Oct',saving:18},
  {id:'FG-105',name:'Warangal Chilli Load Share',crop:'Chilli',operation:'Transport',distance:8,members:4,acres:16,window:'14–17 Oct',saving:16}
];

const TARGET_CROPS=['Tomato','Chilli','Maize','Cotton','Groundnut'];
const nutrientSource={name:'TNAU Agritech Portal — Mineral nutrition and deficiency diagnosis',url:'https://agritech.tnau.ac.in/agriculture/agri_min_nutri_def_symptoms.html'};
const salinitySource={name:'TNAU Agritech Portal — Salinity and sodicity',url:'https://agritech.tnau.ac.in/agriculture/agri_salinity_about.html'};
const nutrient=(id,name,parts,symptoms,confirm,actions,sourceInfo=nutrientSource)=>({id,crop:'Target crops',crops:TARGET_CROPS,name,type:'Nutrient stress',parts,symptoms,confirm,actions,sourceInfo});
const NUTRIENT_RECORDS=[
  nutrient('nut-n','Nitrogen deficiency',['leaf','whole plant'],['General pale-green or yellow appearance, often beginning on older leaves','Reduced growth and thin canopy'],'Compare old and new leaves, review recent fertilizer history, and confirm with soil or plant analysis.',['Use a soil-test and crop-stage recommendation','Correct the nutrient balance rather than adding urea blindly','Recheck colour and growth after the recommended interval']),
  nutrient('nut-p','Phosphorus deficiency',['leaf','root','whole plant'],['Stunting with dark-green foliage','Older leaves may develop purple or reddish colour depending on crop'],'Check soil phosphorus, pH, root health and cold or waterlogged conditions that can reduce uptake.',['Use a soil-test-based phosphorus recommendation','Correct drainage or root-zone problems first','Avoid assuming every purple leaf needs extra phosphorus']),
  nutrient('nut-k','Potassium deficiency',['leaf'],['Marginal yellowing or scorching, usually first on older leaves','Weak stems or reduced stress tolerance'],'Confirm soil or tissue potassium and rule out salinity, drought and leaf disease.',['Apply only a crop-specific, test-based potassium source','Correct irrigation and salinity problems','Do not place concentrated fertilizer against roots']),
  nutrient('nut-ca','Calcium deficiency',['young leaf','growing point','fruit'],['Distorted young growth or growing-point damage','Blossom-end rot can occur in tomato fruit when calcium movement is disrupted'],'Check root-zone moisture consistency, salinity, root injury and tissue analysis; leaf symptoms alone are not enough.',['Maintain even root-zone moisture','Use soil/tissue-test and crop-stage guidance','Do not treat blossom-end rot by excessive foliar mixing']),
  nutrient('nut-mg','Magnesium deficiency',['older leaf'],['Interveinal yellowing on older leaves while veins stay greener','Advanced symptoms may include marginal necrosis'],'Confirm magnesium status and rule out potassium imbalance, root damage and leaf disease.',['Use a test-based magnesium correction','Balance potassium, calcium and magnesium','Monitor older and middle leaves after correction']),
  nutrient('nut-s','Sulfur deficiency',['young leaf','whole plant'],['Uniform pale colour that often appears first on younger leaves','Thin stems and slow growth'],'Compare leaf age pattern with nitrogen deficiency and confirm through soil or plant analysis.',['Follow crop-specific sulfur recommendation','Include organic matter and balanced nutrition where suitable','Avoid diagnosis from colour alone']),
  nutrient('nut-b','Boron deficiency',['young leaf','growing point','flower','fruit'],['Brittle or distorted young tissue and growing-point injury','Poor flowering, fruit set or internal cracking can occur in sensitive crops'],'Use soil/tissue analysis because the safe range between deficiency and toxicity can be narrow.',['Use only crop-specific, test-based boron guidance','Measure precisely from a verified product analysis','Do not repeat boron application without confirmation']),
  nutrient('nut-zn','Zinc deficiency',['young leaf','whole plant'],['Small leaves, shortened internodes or pale bands depending on crop','Maize may show broad pale bands beside the midrib'],'Confirm soil/tissue zinc and check high pH or excess phosphorus that can limit uptake.',['Use a crop-specific test-based zinc correction','Address pH and root-zone constraints','Do not reuse a dose from another crop']),
  nutrient('nut-fe','Iron deficiency',['young leaf'],['Interveinal chlorosis first on young leaves while veins remain green','Severe cases may turn nearly white'],'Check soil pH, waterlogging and root health; confirm with plant or soil analysis.',['Correct drainage and pH constraints where possible','Use only a crop-appropriate iron source and verified rate','Do not confuse iron chlorosis with viral yellowing']),
  nutrient('nut-mn','Manganese deficiency',['young leaf','middle leaf'],['Interveinal chlorosis with small necrotic specks in some crops','Pattern may resemble iron deficiency'],'Use tissue analysis and consider high soil pH or excessive liming.',['Use a test-based crop recommendation','Correct soil reaction where practical','Avoid repeated micronutrient mixtures without diagnosis']),
  nutrient('nut-cu','Copper deficiency',['young leaf','shoot','flower'],['Young leaves may twist or wilt and shoots may die back','Poor flowering or weak stems can occur in sensitive crops'],'Confirm with soil/tissue analysis and review high organic-matter conditions.',['Use only a verified crop-specific copper recommendation','Avoid confusing a fungicide copper rate with a nutrition rate','Prevent repeated accumulation in soil']),
  nutrient('nut-mo','Molybdenum deficiency',['leaf','whole plant'],['General chlorosis and poor growth resembling nitrogen deficiency','Leaf margins may scorch or distort in some crops'],'Check soil pH and tissue status; acidic soil can restrict availability.',['Correct soil pH only from a soil-test recommendation','Use a crop-specific trace-element rate','Avoid unmeasured application because required amounts are small']),
  nutrient('nut-cl','Chloride deficiency',['leaf','root','whole plant'],['Wilting, chlorosis or reduced root growth is possible but field deficiency is uncommon','Excess chloride can cause marginal scorch and salinity injury'],'Confirm irrigation-water and soil chloride; distinguish deficiency from the more common toxicity or salinity problem.',['Use water and soil testing before correction','Treat salinity and drainage constraints when excess is confirmed','Do not add chloride based on visual symptoms alone']),
  nutrient('nut-ni','Nickel deficiency',['young leaf','seed'],['Field deficiency is rare; poor seed viability or unusual leaf-tip symptoms may occur','Symptoms are not reliable for visual diagnosis'],'Require laboratory tissue analysis and qualified interpretation.',['Do not apply nickel from a photo diagnosis','Use specialist, crop-specific advice only','Record the laboratory result and product analysis']),
  nutrient('stress-na','Sodium / salinity toxicity risk',['older leaf','root','whole plant'],['Marginal leaf burn, stunting or apparent drought despite wet soil','Poor germination, root growth and nutrient imbalance in saline or sodic soil'],'Test soil electrical conductivity, pH, exchangeable sodium and irrigation-water quality. Sodium deficiency is not the normal diagnosis for these target crops.',['Improve drainage and use a soil-reclamation plan based on testing','Select crop and variety according to measured salinity tolerance','Do not add gypsum or other amendments without a soil-based requirement'],salinitySource)
];
const KNOWLEDGE_RECORDS=[...CATALOG,...NUTRIENT_RECORDS];

const state = {
  farm:null,
  plan:null,
  plans:{},
  strategy:'balanced',
  health:null,
  healthGuidance:null,
  treatment:'natural',
  voiceContext:'plan',
  location:null,
  objectUrl:null,
  roverCapture:null,
  selectedCase:'AGX-A-R03-P12'
};

function toast(message){
  $('toast').textContent = message;
  $('toast').hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $('toast').hidden = true, 3200);
}

function showView(id){
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === id));
  document.querySelectorAll('.nav').forEach(button => button.classList.toggle('active', button.dataset.view === id));
  window.scrollTo({top:0,behavior:'smooth'});
  if(id === 'market') renderMarket();
  if(id === 'knowledge') renderKnowledge();
  if(id === 'records') renderRecords();
  if(id === 'command') renderCommandCentre();
  if(id === 'news') renderNews();
  if(id === 'connect') renderFarmerGroups();
}

document.querySelectorAll('.nav').forEach(button => button.addEventListener('click', () => showView(button.dataset.view)));
document.addEventListener('click', event => {
  const go = event.target.closest('[data-go]');
  if(go) showView(go.dataset.go);
});

function readFarm(overrides={}){
  return {
    district:$('district').value.trim() || 'Warangal',
    season:$('season').value,
    land:Number($('land').value),
    soil:$('soil').value,
    ph:Number($('ph').value || 6.8),
    water:Number($('water').value),
    fertilizer:Number($('fertilizer').value),
    budget:Number($('budget').value),
    previous:$('previous').value,
    priority:$('priority').value,
    n:$('nitrogen').value === '' ? null : Number($('nitrogen').value),
    p:$('phosphorus').value === '' ? null : Number($('phosphorus').value),
    k:$('potassium').value === '' ? null : Number($('potassium').value),
    ...overrides
  };
}

function planReasons(plan){
  const top = plan.crops[0];
  const runnerUp = plan.crops[1];
  const suppliedNutrients = ['n','p','k'].filter(key=>Number.isFinite(plan.farm[key])).map(key=>key.toUpperCase());
  const reasons = [
    `${top.name} ranks first for the ${STRATEGIES[plan.strategy].title.toLowerCase()} with a ${top.score}% agronomic suitability score.`,
    `Strong signals: ${top.strengths.slice(0,4).join(', ') || 'available farm resources'}.`,
    runnerUp ? `${runnerUp.name} is the next alternative at ${runnerUp.score}% suitability${runnerUp.warnings.length ? `; watch ${runnerUp.warnings[0]}` : ''}.` : 'No second crop is available in the current dataset.',
    `${number(plan.totals.water)} lakh litres of the available ${number(plan.farm.water)} lakh litres are allocated; the remaining water stays visible as a buffer.`,
    `The plan keeps ${money(plan.unused.budget)} unallocated instead of assuming every rupee must be spent.`,
    suppliedNutrients.length ? `${suppliedNutrients.join(', ')} soil-test indices are included in crop ranking.` : 'NPK indices were not entered, so nutrient matching is neutral rather than guessed.'
  ];
  if(plan.unused.land > .01) reasons.push(`${number(plan.unused.land)} acres remain unallocated because one or more resource constraints prevent a safe additional crop block.`);
  return reasons;
}

function renderPlan(plan,save=true){
  state.plan = plan;
  state.strategy = plan.strategy;
  $('planEmpty').hidden = true;
  $('planReport').hidden = false;
  const top = plan.crops[0];
  $('planHeadline').textContent = STRATEGIES[plan.strategy].title;
  $('planContext').textContent = `${plan.farm.district} • ${plan.farm.season} • ${number(plan.farm.land)} acres • ${plan.farm.soil} soil`;
  $('planStatus').textContent = plan.feasible ? 'Feasible prototype plan' : 'Constraints need review';
  $('totalProduction').textContent = `${number(plan.totals.yield)} q`;
  $('totalProfit').textContent = money(plan.totals.profit);
  $('waterSaved').textContent = `${number(plan.unused.water)} lakh L`;
  $('budgetSaved').textContent = money(plan.unused.budget);
  $('topCrop').textContent = top.name;
  $('topReason').textContent = `${top.score}% suitability. Selected using ${STRATEGIES[plan.strategy].title.toLowerCase()}, crop rotation and the entered resource limits.`;
  $('decisionSignals').innerHTML = Object.entries(top.factors).map(([key,value])=>`<span class="signal ${value<50?'weak':value<75?'medium':''}"><b>${key.toUpperCase()}</b>${Math.round(value)}%</span>`).join('');
  $('cropCards').innerHTML = plan.crops.slice(0,3).map((crop,index)=>`<article class="crop-card ${index===0?'top':''}"><span class="rank">#${index+1} recommendation</span><h3>${crop.name}</h3><div class="score-track"><i style="width:${crop.score}%"></i></div><dl><dt>Suitability</dt><dd>${crop.score}%</dd><dt>Expected yield</dt><dd>${number(crop.expectedYield)} q/acre</dd><dt>Water</dt><dd>${crop.water} lakh L/acre</dd><dt>Estimated margin</dt><dd>${money(crop.profit)}/acre</dd><dt>Decision</dt><dd>${crop.eligible?'Season-ready':'Review'}</dd></dl>${crop.warnings.length?`<p class="crop-warning">${crop.warnings.slice(0,2).join(' • ')}</p>`:'<p class="crop-ok">No major input constraint detected.</p>'}</article>`).join('');
  $('allocationRows').innerHTML = plan.rows.length ? plan.rows.map(row=>`<tr><td>${row.name}</td><td>${number(row.acres)} ac</td><td>${number(row.totalWater)} lakh L</td><td>${number(row.totalFertilizer)} kg</td><td>${money(row.totalCost)}</td><td>${number(row.totalYield)} q</td><td>${money(row.totalProfit)}</td></tr>`).join('') : '<tr><td colspan="7">No feasible allocation. Increase at least one constrained resource.</td></tr>';
  $('planReasons').innerHTML = planReasons(plan).map(reason=>`<p>${reason}</p>`).join('');
  $('waterScenario').value = clamp(plan.farm.water,10,200);
  $('budgetScenario').value = clamp(plan.farm.budget,50000,1000000);
  $('landScenario').value = clamp(plan.farm.land,1,25);
  updateScenarioOutputs();
  renderStrategies();
  renderMarket();
  updateWeatherLocation();
  if(save){
    const plans = load('agx-vjh-plans');
    plans.unshift({id:crypto.randomUUID?.()||String(Date.now()),createdAt:new Date().toISOString(),strategy:plan.strategy,farm:plan.farm,totals:plan.totals,topCrop:top.name});
    localStorage.setItem('agx-vjh-plans',JSON.stringify(plans.slice(0,20)));
  }
}

$('farmForm').addEventListener('submit',event=>{
  event.preventDefault();
  const farm = readFarm();
  if(!farm.land || !farm.water || !farm.fertilizer || !farm.budget){ toast('Enter valid land, water, fertilizer and budget values.'); return; }
  state.farm = farm;
  state.plans = Object.fromEntries(Object.keys(STRATEGIES).map(strategy=>[strategy,optimizeFarm(farm,strategy)]));
  const selected = farm.priority in STRATEGIES ? farm.priority : 'balanced';
  renderPlan(state.plans[selected]);
  toast('Optimized farm plan created.');
});

function renderStrategies(){
  if(!state.farm){ $('strategyCards').innerHTML='<div class="empty-records">Create a farm plan to compare resource-allocation strategies.</div>'; return; }
  if(!Object.keys(state.plans).length) state.plans=Object.fromEntries(Object.keys(STRATEGIES).map(key=>[key,optimizeFarm(state.farm,key)]));
  $('strategyCards').innerHTML = Object.entries(STRATEGIES).map(([key,item])=>{
    const plan=state.plans[key];
    return `<article class="strategy-card ${state.strategy===key?'active':''}"><span class="strategy-icon">${item.icon}</span><h2>${item.title}</h2><p>${item.description}</p><div class="strategy-kpis"><span>Profit<b>${money(plan.totals.profit)}</b></span><span>Water use<b>${number(plan.totals.water)} lakh L</b></span><span>Cost<b>${money(plan.totals.cost)}</b></span><span>Production<b>${number(plan.totals.yield)} q</b></span></div><button data-strategy="${key}">Apply this plan</button></article>`;
  }).join('');
  document.querySelectorAll('[data-strategy]').forEach(button=>button.onclick=()=>{renderPlan(state.plans[button.dataset.strategy]);showView('plan');});
}

function updateScenarioOutputs(){
  $('waterOut').textContent=`${$('waterScenario').value} lakh L`;
  $('budgetOut').textContent=money(Number($('budgetScenario').value));
  $('landOut').textContent=`${$('landScenario').value} acres`;
}
['waterScenario','budgetScenario','landScenario'].forEach(id=>$(id).addEventListener('input',updateScenarioOutputs));
$('runScenario').onclick=()=>{
  if(!state.farm){toast('Create the original farm plan first.');return;}
  const changed={...state.farm,water:Number($('waterScenario').value),budget:Number($('budgetScenario').value),land:Number($('landScenario').value)};
  const result=optimizeFarm(changed,state.strategy);
  $('scenarioTitle').textContent=`${STRATEGIES[state.strategy].title}: changed resources`;
  const profitChange=result.totals.profit-state.plan.totals.profit;
  const yieldChange=result.totals.yield-state.plan.totals.yield;
  $('scenarioMetrics').innerHTML=`<div><span>New profit</span><b>${money(result.totals.profit)}</b></div><div><span>Profit change</span><b>${profitChange>=0?'+':''}${money(profitChange)}</b></div><div><span>New production</span><b>${number(result.totals.yield)} q</b></div><div><span>Production change</span><b>${yieldChange>=0?'+':''}${number(yieldChange)} q</b></div>`;
  $('scenarioNote').textContent=result.unused.land>.01?`${number(result.unused.land)} acres remain unallocated because the changed resources are insufficient for another safe quarter-acre block.`:'The changed resources support allocation of all selected land.';
};

function updateWeatherLocation(){
  const district=state.farm?.district||$('district').value||'Warangal';
  $('weatherLocation').textContent=`${district.toUpperCase()} • PROTOTYPE FORECAST`;
}
$('forecastList').innerHTML=FORECAST.map(day=>`<div class="forecast-row"><strong>${day[0]}</strong><span>${day[1]}</span><small>Rain ${day[2]}</small><em>${day[3]}</em></div>`).join('');

function populateMarket(){
  $('marketCrop').innerHTML=CROPS.map(crop=>`<option value="${crop.id}">${crop.name}</option>`).join('');
  $('marketCrop').value='groundnut';
}

function marketAnalysis(){
  const crop=CROPS.find(item=>item.id===$('marketCrop').value)||CROPS[0];
  const data=MARKET_DATA[crop.id];
  const unitTransport=Number($('transportCost').value||0);
  const markets=data.markets.map(([name,rate,arrival,distance])=>{const transport=unitTransport*Math.max(.2,distance/100);return{name,rate,arrival,distance,transport,net:rate-transport};}).sort((a,b)=>b.net-a.net);
  return{crop,data,markets,best:markets[0],unitTransport};
}

function renderMarket(){
  if(!$('marketCrop').options.length) populateMarket();
  const {crop,data,markets,best}=marketAnalysis();
  $('marketSummaryTitle').textContent=`${crop.name}: ${best.name} has the best net prototype rate`;
  $('marketSummaryText').textContent=`After the entered transport assumption, ${best.name} gives an estimated net rate of ${money(best.net)} per quintal. Confirm quality grade, commission, arrival timing and the official market rate before transport.`;
  const low=Math.min(...data.trend),high=Math.max(...data.trend),latest=data.trend.at(-1);
  $('marketKpis').innerHTML=`<article><span>Latest demo rate</span><b>${money(latest)}</b><small>per quintal</small></article><article><span>Six-period range</span><b>${money(low)}–${money(high)}</b><small>prototype history</small></article>`;
  const min=Math.min(...data.trend)*.92,max=Math.max(...data.trend)*1.04;
  $('priceTrend').innerHTML=data.trend.map((value,index)=>`<div class="trend-bar"><b>${money(value).replace('₹','')}</b><i style="height:${30+(value-min)/(max-min)*105}px"></i><span>P${index+1}</span></div>`).join('');
  $('marketRows').innerHTML=markets.map((market,index)=>`<tr><td>${market.name}${index===0?' • best net':''}</td><td>${money(market.rate)}/q</td><td>${number(market.arrival)} q</td><td>${money(market.transport)}/q</td><td>${money(market.net)}/q</td></tr>`).join('');
  const allocated=state.plan?.rows.find(row=>row.id===crop.id);
  const area=allocated?.acres||1;
  const yieldTotal=(allocated?.totalYield||crop.yield*area);
  const baseCost=crop.cost*area;
  const scenarios=[['Low price',latest*.8,'A weak-price outcome'],['Expected price',latest,'Current demonstration modal rate'],['High price',latest*1.2,'A favourable-price outcome']];
  $('profitScenarios').innerHTML=scenarios.map((scenario,index)=>{const profit=yieldTotal*(scenario[1]-best.transport)-baseCost;return`<article class="price-scenario ${index===1?'expected':''}"><span>${scenario[0]}</span><b>${money(profit)}</b><p>${scenario[2]} at ${money(scenario[1])}/q for ${number(yieldTotal)} q estimated production.</p></article>`}).join('');
}
['marketCrop','homeMarket','transportCost'].forEach(id=>$(id).addEventListener('input',renderMarket));

function load(key){
  try{return JSON.parse(localStorage.getItem(key)||'[]')}catch{return[]}
}

function renderRecords(){
  const plans=load('agx-vjh-plans'),plants=load('agx-vjh-plants'),feedback=load('agx-vjh-feedback');
  $('planCount').textContent=plans.length;
  $('plantCount').textContent=new Set(plants.map(item=>`${item.field}-${item.row}-${item.plant}`)).size;
  $('followupCount').textContent=plants.filter(item=>!item.closed).length;
  $('feedbackCount').textContent=feedback.length;
  const records=[...plans.map(item=>({type:'Farm plan',title:`${item.topCrop} • ${STRATEGIES[item.strategy]?.title||item.strategy}`,detail:`${item.farm.district}, ${item.farm.land} acres • Expected profit ${money(item.totals.profit)}`,createdAt:item.createdAt,context:'recommendation'})),...plants.map(item=>({type:'Plant record',title:`${item.condition} • ${item.field}/${item.row}/${item.plant}`,detail:`${item.severity} • Revisit ${item.revisit}`,createdAt:item.createdAt,context:'plant'}))].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  $('recordList').innerHTML=records.length?records.map(item=>`<article class="record-card"><div><span class="section-kicker">${item.type}</span><h3>${item.title}</h3><p>${item.detail}</p><time>${new Date(item.createdAt).toLocaleString('en-IN')}</time></div><button class="context-voice" data-context="${item.context}">Ask about record</button></article>`).join(''):'<div class="empty-records"><h2>No saved records yet</h2><p>Create a farm plan or analyse and save a plant image.</p></div>';
  bindContextButtons();
}

function renderKnowledge(){
  const crop=$('knowledgeCrop').value,query=$('knowledgeSearch').value.trim().toLowerCase();
  const records=KNOWLEDGE_RECORDS.filter(record=>(crop==='All'||record.crop===crop||record.crops?.includes(crop))&&(!query||[record.name,record.type,...record.symptoms,...record.parts].join(' ').toLowerCase().includes(query)));
  $('knowledgeList').innerHTML=records.length?records.map(record=>`<button class="knowledge-item" data-record="${record.id}"><span>${record.crop} • ${record.type}</span><b>${record.name}</b><small>${record.parts.join(', ')}</small></button>`).join(''):'<div class="empty-records">No reviewed record matches this search.</div>';
  document.querySelectorAll('[data-record]').forEach(button=>button.onclick=()=>showKnowledgeRecord(button.dataset.record));
  if(records.length)showKnowledgeRecord(records[0].id);
}

function showKnowledgeRecord(id){
  const record=KNOWLEDGE_RECORDS.find(item=>item.id===id);
  if(!record)return;
  document.querySelectorAll('[data-record]').forEach(button=>button.classList.toggle('active',button.dataset.record===id));
  const source=record.sourceInfo||SOURCES[record.source];
  $('knowledgeDetail').innerHTML=`<span class="section-kicker">REVIEWED RECORD • ${record.type.toUpperCase()}</span><h2>${record.crop}: ${record.name}</h2><div class="knowledge-meta">${record.parts.map(part=>`<span>${part}</span>`).join('')}<span>Dataset v1.0</span><span>Knowledge guidance</span></div><h3>Common field signs</h3><ul>${record.symptoms.map(item=>`<li>${item}</li>`).join('')}</ul><h3>How to confirm in the field</h3><p>${record.confirm}</p><h3>Safe next actions</h3><ul>${record.actions.map(item=>`<li>${item}</li>`).join('')}</ul><h3>Source provenance</h3><p><a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.name}</a></p><div class="safety-note"><b>Model boundary</b><span>This reviewed record supports farmer guidance. It is not an additional trained image class unless the Evidence page explicitly says so.</span></div>`;
}

$('knowledgeCrop').addEventListener('change',renderKnowledge);
$('knowledgeSearch').addEventListener('input',renderKnowledge);

let objectUrl=null;
$('imageInput').onchange=event=>{
  const file=event.target.files[0];
  if(!file)return;
  if(objectUrl)URL.revokeObjectURL(objectUrl);
  objectUrl=URL.createObjectURL(file);
  $('preview').src=objectUrl;
  $('preview').style.display='block';
  $('dropText').style.display='none';
  $('analyse').disabled=false;
  $('healthReport').hidden=true;
  $('healthEmpty').hidden=false;
};

$('locate').onclick=()=>{
  if(!navigator.geolocation){toast('Location is not available in this browser.');return;}
  $('locationText').textContent='Requesting location…';
  navigator.geolocation.getCurrentPosition(position=>{
    state.location={latitude:Number(position.coords.latitude.toFixed(6)),longitude:Number(position.coords.longitude.toFixed(6))};
    $('locationText').textContent=`${state.location.latitude}, ${state.location.longitude}`;
  },()=>{$('locationText').textContent='Location permission not granted';});
};

function titleForHealth(key){return key==='early'?'Suspected Tomato Early Blight':key==='late'?'Suspected Tomato Late Blight':'Tomato leaf appears healthy';}

$('analyse').onclick=async()=>{
  const file=$('imageInput').files[0];
  if(!file)return;
  $('analyse').disabled=true;
  $('analyse').textContent='Analysing uploaded image…';
  try{
    const result=classify(await extractSignals(file));
    state.health=result;
    const lang=$('language').value;
    const guidance=getGuidance(result.key,lang);
    state.healthGuidance=guidance;
    $('healthEmpty').hidden=true;
    $('healthReport').hidden=false;
    $('condition').textContent=result.abstain?'Uncertain image result':titleForHealth(result.key);
    $('confidence').textContent=result.abstain?'Expert review':`${Math.round(result.confidence*100)}% confidence`;
    $('severity').textContent=result.abstain?'Not assigned':result.severity;
    $('quality').textContent=`${Math.round(result.quality*100)}%`;
    $('plantIdentity').textContent=`${$('field').value} • Row ${$('row').value} • Plant/zone ${$('plant').value}${state.location?` • ${state.location.latitude}, ${state.location.longitude}`:''}`;
    const now=result.abstain?['Take another clear, close image in even lighting.','Check both leaf surfaces and the nearby stem.','Request local expert review before treatment.']:guidance.now;
    const avoid=result.abstain?['Do not select a pesticide from this uncertain image.','Do not treat the confidence score as a biological confirmation.']:guidance.avoid;
    $('guideNow').innerHTML=now.map(item=>`<p>${item}</p>`).join('');
    $('guideAvoid').innerHTML=avoid.map(item=>`<p>${item}</p>`).join('');
    $('guideMeaning').textContent=result.abstain?'The image quality or supported-class confidence is too low for a reliable screening result.':guidance.meaning;
    $('guideSource').href=guidance.source.url;
    $('guideSource').textContent=guidance.source.name;
    state.treatment='natural';
    document.querySelectorAll('.treatment-tab').forEach(tab=>tab.classList.toggle('active',tab.dataset.treatment==='natural'));
    renderTreatment();
  }catch(error){console.error(error);toast(error.message||'The image could not be analysed.');}
  finally{$('analyse').disabled=false;$('analyse').textContent='Analyse uploaded image';}
};

function treatmentModel(){
  if(!state.health||state.health.abstain)return{natural:['Retake a clear image and confirm the condition before treatment.'],integrated:['Pause treatment selection until diagnosis is confirmed.'],conventional:['Do not select a chemical product or dose from an uncertain result.']};
  if(state.health.key==='healthy')return{natural:['Continue routine field hygiene and scouting.','Maintain crop-stage nutrition according to soil testing and local recommendations.'],integrated:['Monitor the plant and nearby rows.','Record new symptoms before selecting any intervention.'],conventional:['No chemical treatment is recommended from a healthy screening result.']};
  const guide=state.healthGuidance;
  const verified=treatmentFor(state.health.key==='early'?'tom-early':'tom-late');
  return{
    natural:[guide.now[0],guide.field,'Use a biological or botanical option only when a verified local agricultural source recommends it for the confirmed condition.'],
    integrated:[...guide.now.slice(0,3),'Start with sanitation and scouting, then use a verified biological option where suitable.','Use a targeted registered chemical only when severity, confirmation and local guidance justify it.'],
    conventional:[...(verified?.immediate||guide.now.slice(0,3)),...(verified?.chemical||[]).map(item=>`${item.name}: ${item.rate}. ${item.note}`),'Follow the current local product label for protective equipment, timing, interval and pre-harvest requirements.']
  };
}

function renderTreatment(){
  const labels={natural:'Natural / organic pathway',integrated:'Integrated pest management pathway',conventional:'Conventional pathway'};
  const content=treatmentModel()[state.treatment];
  $('treatmentContent').innerHTML=`<h4>${labels[state.treatment]}</h4><ol>${content.map(item=>`<li>${item}</li>`).join('')}</ol><p class="treatment-warning">Never mix products unless the current registered label expressly permits the mixture. Weather, crop stage, diagnosis confirmation and farmer approval remain required.</p>`;
}

document.querySelectorAll('.treatment-tab').forEach(tab=>tab.onclick=()=>{state.treatment=tab.dataset.treatment;document.querySelectorAll('.treatment-tab').forEach(item=>item.classList.toggle('active',item===tab));renderTreatment();});
$('calculateDose').onclick=()=>{
  const area=Number($('treatArea').value),rate=Number($('labelRate').value),reference=$('labelReference').value.trim(),unit=$('rateUnit').value;
  if(!area||!rate||!reference){$('doseResult').textContent='Enter area, a verified label rate and the label or expert reference.';return;}
  $('doseResult').innerHTML=`Total product quantity: <b>${number(area*rate)} ${unit}</b> for ${number(area)} acres at the verified rate of ${number(rate)} ${unit}/acre. This multiplication does not replace the product label or approve a tank mixture.`;
};

$('savePlant').onclick=()=>{
  if(!state.health){toast('Analyse a plant image first.');return;}
  const plants=load('agx-vjh-plants');
  const key=state.health.key;
  plants.unshift({id:crypto.randomUUID?.()||String(Date.now()),createdAt:new Date().toISOString(),field:$('field').value,row:$('row').value,plant:$('plant').value,condition:$('condition').textContent,severity:state.health.severity,confidence:state.health.confidence,location:state.location,revisit:state.health.abstain?'After a clear re-capture':revisitText(key,'en'),closed:false});
  localStorage.setItem('agx-vjh-plants',JSON.stringify(plants.slice(0,50)));
  toast('Plant record and revisit plan saved.');
};

function setVoiceContext(context){
  state.voiceContext=context;
  const names={plan:'Farm planning',recommendation:'Current crop recommendation',optimizer:'Strategy comparison',market:'Market and profit analysis',weather:"Today's weather and field actions",irrigation:'Irrigation decision',plant:'Current plant diagnosis',treatment:`${state.treatment} treatment pathway`,rover:'Rover and camera connection',command:'Closed-loop field command',news:'Personalised crop news',connect:'Nearby farmer collaboration'};
  $('voiceContext').textContent=`Context: ${names[context]||'Farm planning'}`;
}

function bindContextButtons(){
  document.querySelectorAll('.context-voice').forEach(button=>button.onclick=()=>{setVoiceContext(button.dataset.context);openVoice();});
}

function openVoice(){ $('voicePanel').hidden=false; setTimeout(()=>$('voiceQuestion').focus(),30); }
function closeVoice(){ $('voicePanel').hidden=true; }
$('voiceFab').onclick=()=>{setVoiceContext(document.querySelector('.view.active')?.id||'plan');openVoice();};
$('voiceClose').onclick=closeVoice;

function contextualAnswer(question){
  const lang=$('language').value;
  const q=question.toLowerCase();
  const plan=state.plan;
  const top=plan?.rows[0]||plan?.crops[0];
  const market=marketAnalysis();
  if(lang==='te'){
    if(q.includes('వాతావరణ')||q.includes('వర్ష')||q.includes('స్ప్రే')||state.voiceContext==='weather')return 'ఈ రోజు సాయంత్రం వర్షం మరియు గాలి ప్రమాదం ఉన్న prototype forecast చూపిస్తోంది. ఇప్పుడే field drainage, affected rows మరియు soil moisture పరిశీలించండి. మధ్యాహ్నం spray చేయవద్దు. Dry, low-wind window వచ్చిన తర్వాత verified product label ప్రకారం మాత్రమే నిర్ణయం తీసుకోండి.';
    if(q.includes('మందు')||q.includes('ట్రీట్మెంట్')||state.voiceContext==='treatment')return `మీరు ${state.treatment} treatment pathway చూస్తున్నారు. ముందుగా diagnosis మరియు severityను ధృవీకరించండి. లేబుల్ అనుమతి లేకుండా products కలపకండి. Exact quantity కోసం registered label rate, treated area మరియు referenceను calculatorలో ఇవ్వాలి.`;
    if(q.includes('మార్కెట్')||q.includes('ధర')||q.includes('లాభ')||state.voiceContext==='market')return `${market.crop.name} కోసం prototype data ప్రకారం ${market.best.name}లో transport తర్వాత net rate ${money(market.best.net)} per quintalగా ఉంది. ఇది guaranteed live rate కాదు. అమ్మే ముందు official mandi rate, quality grade మరియు transport chargeను confirm చేయండి.`;
    if(q.includes('వార్త')||q.includes('న్యూస్')||state.voiceContext==='news')return 'Agri Newsలో పంట, ప్రాంతం, భాష మరియు సమాచారం రకాన్ని ఎంచుకోండి. ప్రస్తుతం ఉన్నవి prototype articles. Live deploymentలో ICAR, IMD, eNAM మరియు రాష్ట్ర వ్యవసాయ శాఖల verified feeds మాత్రమే ఉపయోగించాలి.';
    if(q.includes('రైతు')||q.includes('హార్వెస్ట్')||state.voiceContext==='connect')return 'Nearby Farmers Connect ద్వారా ఒకే పంట మరియు సమీప harvest window ఉన్న రైతులు machinery, labour లేదా transport ఖర్చును పంచుకోవచ్చు. చేరే ముందు quotation, operator, తేదీ మరియు written cost splitను ధృవీకరించాలి.';
    if(q.includes('నీరు')||q.includes('water')||state.voiceContext==='irrigation')return plan?`ప్రస్తుత plan ${number(plan.totals.water)} లక్షల లీటర్ల నీరు allocate చేసి ${number(plan.unused.water)} లక్షల లీటర్ల buffer ఉంచుతోంది. ఈ రోజు rain chance ఉన్నందున soil moisture చూసి మాత్రమే irrigation ఇవ్వండి.`:'ముందుగా farm plan create చేయండి. తరువాత available water మరియు crop requirement ఆధారంగా allocation చెబుతాను.';
    if(state.voiceContext==='plant')return state.health?`${$('condition').textContent}. Confidence ${Math.round(state.health.confidence*100)} శాతం. ఇప్పుడు పక్క మొక్కలను పరిశీలించండి, clear symptomsను record చేయండి, మరియు verified guidance లేకుండా మొత్తం పొలానికి spray చేయవద్దు.`:'ముందుగా clear tomato leaf photo upload చేసి analyse చేయండి.';
    return plan?`${top.name} ప్రస్తుతం strongest recommendation. ${number(top.acres||0)} acres allocationతో expected total profit ${money(plan.totals.profit)}. Strategy మార్చి water-saving లేదా low-budget outcomeను compare చేయవచ్చు.`:'Farm details ఇవ్వండి. Soil, season, land, water, fertilizer మరియు budget ఆధారంగా crop plan తయారుచేస్తాను.';
  }
  if(/weather|rain|spray|wind/.test(q)||state.voiceContext==='weather')return 'The prototype forecast shows a higher rain and wind risk this afternoon. Inspect drainage, affected rows and soil moisture now. Avoid spraying this afternoon. Use a dry, low-wind window and follow the verified product label.';
  if(/medicine|chemical|dose|treatment|mix/.test(q)||state.voiceContext==='treatment')return `You are viewing the ${state.treatment} treatment pathway. Confirm the diagnosis and severity first. Never mix products unless the current registered label expressly permits it. The calculator requires the verified label rate, treated area and reference before calculating quantity.`;
  if(/market|price|profit|mandi|sell/.test(q)||state.voiceContext==='market')return `For ${market.crop.name}, the prototype comparison currently shows ${market.best.name} with the best transport-adjusted rate of ${money(market.best.net)} per quintal. This is not a guaranteed live price. Confirm the official mandi rate, grade and transport charge before selling.`;
  if(/news|alert|advisory|scheme/.test(q)||state.voiceContext==='news')return 'Choose the crop, region, language and news type in Agri News. The current articles demonstrate personalisation. A live release should accept only timestamped, verified feeds from ICAR, IMD, eNAM/Agmarknet and responsible agriculture departments.';
  if(/nearby|farmer|harvest|share|group/.test(q)||state.voiceContext==='connect')return 'Nearby Farmers Connect groups farmers with a compatible crop, operation and date window to share machinery, labour or transport costs. Verify the quotation, operator, schedule and written cost split before sharing contact details or committing.';
  if(/water|irrigat/.test(q)||state.voiceContext==='irrigation')return plan?`The current plan allocates ${number(plan.totals.water)} lakh litres and retains ${number(plan.unused.water)} lakh litres as a buffer. Because rain is possible, inspect root-zone moisture before irrigation.`:'Create a farm plan first so I can compare crop water needs with the available water.';
  if(state.voiceContext==='plant')return state.health?`${$('condition').textContent} with ${Math.round(state.health.confidence*100)} percent model confidence. Inspect nearby plants, record clear symptoms and do not spray the whole field without confirmation and verified guidance.`:'Upload and analyse a clear tomato leaf image first.';
  if(state.voiceContext==='rover')return $('roverMode').value==='mock'?'The rover connector is in demonstration mode. Manual photo upload is active now. When the rover is ready, enter its base URL and enable live mode; the website will use the same capture record format.':'The site will request status and captures from the configured rover URL. If hardware changes, keep the standard API response format unchanged.';
  if(state.voiceContext==='knowledge')return `The reviewed knowledge base currently contains ${KNOWLEDGE_RECORDS.length} disease, pest and nutrient-stress records across tomato, chilli, maize, cotton and groundnut. Nutrient guidance includes primary, secondary and micronutrients plus sodium and salinity toxicity risk. Only three tomato image classes are currently validated for automatic screening.`;
  return plan?`${top.name} is the current strongest recommendation. The plan estimates ${money(plan.totals.profit)} total profit and keeps ${number(plan.unused.water)} lakh litres of water unused. Compare the other strategies before approval.`:'Enter the farm soil, season, land, water, fertilizer and budget so I can build a constrained crop plan.';
}

function addMessage(text,type){const div=document.createElement('div');div.className=type==='farmer'?'farmer-message':'agent-message';div.textContent=text;$('voiceMessages').append(div);$('voiceMessages').scrollTop=$('voiceMessages').scrollHeight;}

$('askButton').onclick=()=>{
  const question=$('voiceQuestion').value.trim();
  if(!question){toast('Enter or speak a question.');return;}
  addMessage(question,'farmer');
  const answer=contextualAnswer(question);
  addMessage(answer,'agent');
  $('voiceQuestion').value='';
  if('speechSynthesis' in window){speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(answer);utterance.lang=$('language').value==='te'?'te-IN':'en-IN';utterance.rate=.9;speechSynthesis.speak(utterance);}
};

$('micButton').onclick=()=>{
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){toast('Speech input is unavailable here. Type the question instead.');return;}
  const recognition=new Recognition();
  recognition.lang=$('language').value==='te'?'te-IN':'en-IN';
  recognition.interimResults=false;
  $('micButton').textContent='Listening…';
  recognition.onresult=event=>{$('voiceQuestion').value=event.results[0][0].transcript;};
  recognition.onerror=()=>toast('Voice input could not be captured. You can type the question.');
  recognition.onend=()=>{$('micButton').textContent='🎙 Tap to speak';};
  recognition.start();
};

$('voiceFeedback').onchange=()=>{
  if(!$('voiceFeedback').value)return;
  const items=load('agx-vjh-feedback');
  items.unshift({createdAt:new Date().toISOString(),context:state.voiceContext,rating:$('voiceFeedback').value});
  localStorage.setItem('agx-vjh-feedback',JSON.stringify(items.slice(0,100)));
  toast('Feedback saved for review.');
};

$('testRover').onclick=async()=>{
  const mode=$('roverMode').value;
  if(mode==='mock'){
    $('roverState').textContent='Demonstration rover ready';
    $('roverDetail').textContent='Manual image upload is active. Live rover capture can be enabled after the rover is assembled.';
    $('cameraState').textContent='Manual upload active';
    $('lastContact').textContent='Just now';
    toast('Mock adapter is ready; no hardware connection was attempted.');
    return;
  }
  const base=$('roverUrl').value.replace(/\/$/,'');
  $('roverState').textContent='Testing live rover…';
  try{
    const controller=new AbortController();setTimeout(()=>controller.abort(),5000);
    const response=await fetch(`${base}/status`,{signal:controller.signal});
    if(!response.ok)throw new Error(`Status ${response.status}`);
    const data=await response.json();
    $('roverState').textContent='Live rover connected';
    $('roverDetail').textContent=`${data.deviceId||$('roverLabel').value} responded with a compatible status record.`;
    $('cameraState').textContent=data.camera?.status||'Connected';
    $('lastContact').textContent='Just now';
    toast('Live rover connection verified.');
  }catch(error){
    $('roverState').textContent='Live rover not reachable';
    $('roverDetail').textContent='Keep manual upload active. Check the rover URL, power, Wi-Fi and CORS configuration after the hardware is ready.';
    toast('Could not reach the rover. Manual upload remains available.');
  }
};

$('requestCapture').onclick=()=>{
  if($('roverMode').value==='live'){toast('Live capture will be enabled after the rover endpoint is available.');return;}
  state.roverCapture={field:'Field A',row:'03',plant:'12',source:'Mock rover adapter',capturedAt:new Date().toISOString()};
  $('roverFrame').innerHTML='<div><span>✓</span><b>Capture metadata received</b><small>Use manual upload for the actual image in this build</small></div>';
  $('captureSource').textContent='Mock rover adapter';
  $('lastContact').textContent='Just now';
  $('pendingCaptures').textContent='1';
  $('openCapture').disabled=false;
};

$('openCapture').onclick=()=>{showView('health');toast('Rover integration is reserved. Upload the current plant photo manually for now.');};

function readObject(key){
  try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return{}}
}

function fieldCases(){
  const overrides=readObject('agx-vjh-case-state');
  return FIELD_CASES.map(item=>({...item,...(overrides[item.id]||{})}));
}

function saveCaseChange(id,change){
  const overrides=readObject('agx-vjh-case-state');
  overrides[id]={...(overrides[id]||{}),...change};
  localStorage.setItem('agx-vjh-case-state',JSON.stringify(overrides));
}

function selectedFieldCase(){
  return fieldCases().find(item=>item.id===state.selectedCase)||fieldCases()[0];
}

function renderCoverageMap(){
  const critical=new Set([14,15]),monitor=new Set([7,28,35]),unscanned=new Set([38,39,40,41,42,43,44,45,46,47]);
  $('coverageMap').innerHTML=Array.from({length:48},(_,index)=>{
    const status=unscanned.has(index)?'unscanned':critical.has(index)?'critical':monitor.has(index)?'monitor':'healthy';
    const row=Math.floor(index/6)+1,position=index%6+1;
    return `<button class="field-cell ${status}" type="button" title="Row ${row}, scan block ${position}: ${status}" aria-label="Row ${row}, block ${position}, ${status}"><span>R${row}</span><b>${position}</b></button>`;
  }).join('');
  $('outbreakAlert').innerHTML='<b>Cluster warning • Row 3</b><span>Two neighbouring high-risk observations increase the prototype spread-risk score. Inspect the next five plants in both directions before any field-wide action.</span>';
}

function renderPassportDetail(item){
  if(!item){$('passportDetail').innerHTML='<p>No plant matches this filter.</p>';return;}
  state.selectedCase=item.id;
  document.querySelectorAll('[data-passport]').forEach(button=>button.classList.toggle('active',button.dataset.passport===item.id));
  const gate=item.confidence>=80?'Action may be reviewed':'Hold for recapture / expert review';
  $('passportDetail').innerHTML=`<div class="passport-id"><span>${item.id}</span><em class="status-${item.status}">${item.status}</em></div><h3>${item.crop}: ${item.condition}</h3><p>${item.field} • Row ${item.row} • Plant ${item.plant}</p><div class="passport-metrics"><span>Severity<b>${item.severity}</b></span><span>AI confidence<b>${item.confidence}%</b></span><span>Affected area<b>${item.damage}%</b></span><span>Recovery<b>${item.recovery}%</b></span></div><div class="recovery-track"><i style="width:${item.recovery}%"></i></div><h4>Explainable signals</h4><ul>${item.signals.map(signal=>`<li>${signal}</li>`).join('')}</ul><div class="confidence-gate ${item.confidence<80?'hold':''}"><b>${gate}</b><span>${item.confidence>=80?'Image confidence clears the prototype review threshold; farmer approval is still required.':'Confidence is below the action threshold. Improve evidence before treatment selection.'}</span></div><p class="next-action"><b>Next:</b> ${item.next}</p>`;
  renderCareTimeline(item);
}

function renderCareTimeline(item){
  const stages=[
    ['Detected',true,`${item.condition} • ${item.confidence}% confidence`],
    ['Passport created',true,`${item.field}, Row ${item.row}, Plant ${item.plant}`],
    ['Farmer approval',item.approved,item.approved?'Action approved and recorded':'Waiting for farmer decision'],
    ['Targeted action',item.approved,item.approved?'Affected plant/zone only':'Not started'],
    ['Revisit',item.status==='recovered',item.status==='recovered'?`Recovery verified at ${item.recovery}%`:item.next]
  ];
  $('careTimeline').innerHTML=stages.map(([name,done,detail],index)=>`<article class="${done?'done':''}"><i>${done?'✓':index+1}</i><div><b>${name}</b><span>${detail}</span></div></article>`).join('');
  $('approveTreatment').disabled=item.approved||item.confidence<80;
  $('approveTreatment').textContent=item.approved?'Action already approved':item.confidence<80?'Evidence required before approval':'Approve recommended action';
  $('completeRevisit').disabled=!item.approved||item.status==='recovered';
}

function renderCommandCentre(){
  const cases=fieldCases();
  const filter=$('passportFilter').value;
  const filtered=cases.filter(item=>filter==='all'||(filter==='pending'&&!item.approved)||(filter==='revisit'&&item.status==='revisit')||(filter==='recovered'&&item.status==='recovered'));
  const pending=cases.filter(item=>!item.approved).length;
  const completed=cases.filter(item=>item.recovery>0);
  const recovery=completed.length?completed.reduce((sum,item)=>sum+item.recovery,0)/completed.length:0;
  $('commandTracked').textContent=cases.length;
  $('commandCoverage').textContent='79%';
  $('commandApprovals').textContent=pending;
  $('commandRecovery').textContent=`${Math.round(recovery)}%`;
  $('commandRisk').textContent='High • R3';
  renderCoverageMap();
  $('passportList').innerHTML=filtered.length?filtered.map(item=>`<button type="button" data-passport="${item.id}" class="passport-item ${item.id===state.selectedCase?'active':''}"><span><b>${item.id}</b><small>${item.field} • R${item.row} • P${item.plant}</small></span><em class="status-${item.status}">${item.status}</em><strong>${item.recovery}%</strong></button>`).join(''):'<div class="empty-records">No plant matches this filter.</div>';
  document.querySelectorAll('[data-passport]').forEach(button=>button.onclick=()=>renderPassportDetail(cases.find(item=>item.id===button.dataset.passport)));
  const selected=filtered.find(item=>item.id===state.selectedCase)||filtered[0]||cases[0];
  renderPassportDetail(selected);
  calculateInputSavings();
}

function calculateInputSavings(){
  const field=Number($('savingFieldArea').value),affected=Number($('savingAffectedArea').value),rate=Number($('savingRate').value),unitCost=Number($('savingUnitCost').value);
  if(!field||!affected||affected>field||rate<0||unitCost<0){$('savingsResult').innerHTML='<b>Check the areas</b><span>Affected area must be greater than zero and no larger than the field.</span>';return;}
  const whole=field*rate,targeted=affected*rate,avoided=whole-targeted,costSaved=avoided*unitCost;
  $('savingsResult').innerHTML=`<div><span>Whole-field input</span><b>${number(whole)} units</b></div><div><span>Targeted input</span><b>${number(targeted)} units</b></div><div><span>Input avoided</span><b>${number(avoided)} units</b></div><div><span>Estimated saving</span><b>${money(costSaved)}</b></div><p>${Math.round((avoided/whole)*100)}% of the entered input is potentially avoided by treating only the affected ${number(affected)} acres. Verify diagnosis, product label and measured field area.</p>`;
}

$('passportFilter').onchange=renderCommandCentre;
$('approveTreatment').onclick=()=>{
  const item=selectedFieldCase();
  if(item.confidence<80){toast('Confidence is below the approval threshold. Capture better evidence first.');return;}
  saveCaseChange(item.id,{approved:true,status:'revisit',next:'Revisit in 3 days'});
  renderCommandCentre();toast('Farmer approval recorded. Targeted follow-up is now scheduled.');
};
$('completeRevisit').onclick=()=>{
  const item=selectedFieldCase();
  const recovery=Math.min(100,Math.max(item.recovery+25,72));
  saveCaseChange(item.id,{status:'recovered',recovery,damage:Math.max(0,item.damage-12),next:'Routine scouting'});
  renderCommandCentre();toast('Recovery revisit recorded and passport updated.');
};
$('calculateSavings').onclick=calculateInputSavings;
$('syncRecords').onclick=()=>{$('offlineQueue').textContent='0';toast('Prototype field queue synchronized.');};
$('printFieldReport').onclick=()=>{
  const cases=fieldCases();
  const report=['AGRIGUARDIAN X — FIELD HEALTH REPORT',`Generated: ${new Date().toLocaleString('en-IN')}`,'',`Plants tracked: ${cases.length}`,'Field coverage: 79%','Outbreak risk: High in Row 3','',...cases.map(item=>`${item.id} | ${item.condition} | severity ${item.severity} | confidence ${item.confidence}% | recovery ${item.recovery}% | ${item.next}`),'','Decision-support prototype: verify diagnoses and all treatment choices with reviewed sources, product labels and qualified local guidance.'].join('\n');
  const url=URL.createObjectURL(new Blob([report],{type:'text/plain'}));
  const link=document.createElement('a');link.href=url;link.download='AgriGuardian-X-Field-Report.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),500);
  toast('Field report downloaded.');
};

function renderNews(){
  const crop=$('newsCrop').value,type=$('newsType').value,region=$('newsRegion').value,lang=$('newsLanguage').value;
  const items=NEWS_ITEMS.filter(item=>(crop==='all'||item.crop==='All'||item.crop===crop)&&(type==='all'||item.type===type)&&item.regions.includes(region));
  const labels={en:'updates matched',te:'సరిపోలిన సమాచారం',hi:'मिलान किए गए अपडेट',ta:'பொருந்திய செய்திகள்',kn:'ಹೊಂದಾಣಿಕೆಯ ಸುದ್ದಿಗಳು'};
  $('newsBrief').innerHTML=`<div><span class="section-kicker">PERSONALISED BRIEF</span><h2>${crop==='all'?'All selected crops':crop} • ${items.length} ${labels[lang]}</h2><p>${region==='india'?'Nationwide India':region==='south'?'South India':'Telangana'} • disease, weather, market and scheme filters remain under farmer control.</p></div><span class="news-count">${items.length}</span>`;
  $('newsList').innerHTML=items.length?items.map(item=>{const copy=item.text[lang]||item.text.en;return`<article class="news-card"><div><span class="news-type ${item.type}">${item.type}</span><span>${item.crop}</span><time>${item.date}</time></div><h3>${copy[0]}</h3><p>${copy[1]}</p><footer><span>${item.source}</span><button type="button" class="text-link" data-news-save="${item.id}">Save update</button></footer></article>`}).join(''):'<div class="empty-records"><h2>No matching update</h2><p>Try All crops, All updates or a wider region.</p></div>';
  document.querySelectorAll('[data-news-save]').forEach(button=>button.onclick=()=>{const saved=load('agx-vjh-saved-news');if(!saved.includes(button.dataset.newsSave))saved.push(button.dataset.newsSave);localStorage.setItem('agx-vjh-saved-news',JSON.stringify(saved));toast('News update saved on this device.');});
  const watch=readObject('agx-vjh-watchlist');
  if(watch.crop){$('watchlistStatus').innerHTML=`<b>${watch.crop} watchlist active</b><span>${watch.district} • ${watch.languageLabel}</span>`;}
}

['newsCrop','newsRegion','newsLanguage','newsType'].forEach(id=>$(id).addEventListener('change',renderNews));
$('saveWatchlist').onclick=()=>{
  const languageLabel=$('newsLanguage').selectedOptions[0].textContent;
  const watch={crop:$('watchCrop').value,district:$('watchDistrict').value.trim()||'Warangal',language:$('newsLanguage').value,languageLabel};
  localStorage.setItem('agx-vjh-watchlist',JSON.stringify(watch));
  $('newsCrop').value=watch.crop;$('watchlistStatus').innerHTML=`<b>${watch.crop} watchlist active</b><span>${watch.district} • ${languageLabel}</span>`;renderNews();toast('Personalised crop watchlist saved.');
};

function renderFarmerGroups(){
  const crop=$('connectCrop').value,operation=$('connectOperation').value,radius=Number($('connectRadius').value),joined=load('agx-vjh-joined-groups');
  const groups=FARMER_GROUPS.filter(item=>(crop==='all'||item.crop===crop)&&(operation==='all'||item.operation===operation)&&item.distance<=radius);
  $('farmerGroups').innerHTML=groups.length?groups.map(group=>`<article class="farmer-group"><div class="group-main"><span class="group-crop">${group.crop}</span><h3>${group.name}</h3><p>${group.operation} • ${group.window} • approximately ${group.distance} km away</p></div><div class="group-stats"><span>Members<b>${group.members+(joined.includes(group.id)?1:0)}</b></span><span>Combined land<b>${group.acres} ac</b></span><span>Estimated saving<b>${group.saving}%</b></span></div><button type="button" data-join-group="${group.id}" ${joined.includes(group.id)?'disabled':''}>${joined.includes(group.id)?'Interest recorded':'Request to join'}</button></article>`).join(''):'<div class="empty-records"><h2>No compatible group in this range</h2><p>Increase the distance or create a local group below.</p></div>';
  document.querySelectorAll('[data-join-group]').forEach(button=>button.onclick=()=>{const items=load('agx-vjh-joined-groups');if(!items.includes(button.dataset.joinGroup))items.push(button.dataset.joinGroup);localStorage.setItem('agx-vjh-joined-groups',JSON.stringify(items));renderFarmerGroups();toast('Interest recorded privately on this device. No contact details were shared.');});
  calculateGroupSavings();
}

function calculateGroupSavings(){
  const acres=Number($('yourAcres').value),nearby=Number($('groupAcres').value),individual=Number($('individualCost').value),group=Number($('groupCost').value);
  if(!acres||individual<0||group<0){$('groupSavingsResult').textContent='Enter valid acreage and costs.';return;}
  const solo=acres*individual,shared=acres*group,saved=Math.max(0,solo-shared),percent=solo?Math.round(saved/solo*100):0;
  $('groupSavingsResult').innerHTML=`<div><span>Individual estimate</span><b>${money(solo)}</b></div><div><span>Your group estimate</span><b>${money(shared)}</b></div><div><span>Your estimated saving</span><b>${money(saved)}</b></div><p>${number(acres+nearby)} combined acres could reduce your entered operation cost by approximately ${percent}%. Confirm quotations, operator, transport and the written split before committing.</p>`;
}

['connectCrop','connectOperation','connectRadius'].forEach(id=>$(id).addEventListener('change',renderFarmerGroups));
$('calculateGroupSavings').onclick=calculateGroupSavings;
$('createFarmerGroup').onclick=()=>{
  const crop=$('newGroupCrop').value,operation=$('newGroupOperation').value,acres=Number($('newGroupAcres').value),date=$('newGroupDate').value;
  if(!acres||!date){toast('Enter acreage and a preferred date.');return;}
  const record={crop,operation,acres,date,createdAt:new Date().toISOString()};localStorage.setItem('agx-vjh-created-group',JSON.stringify(record));
  const formattedDate=new Date(date+'T00:00:00').toLocaleDateString('en-IN');
  $('createdGroupStatus').innerHTML=`<b>${crop} ${operation.toLowerCase()} group drafted</b><span>${number(acres)} acres • preferred date ${formattedDate} • contact remains private</span>`;
  toast('Demonstration farmer group created on this device.');
};

const savedGroup=readObject('agx-vjh-created-group');
if(savedGroup.crop){const savedDate=new Date(savedGroup.date+'T00:00:00').toLocaleDateString('en-IN');$('createdGroupStatus').innerHTML=`<b>${savedGroup.crop} ${savedGroup.operation.toLowerCase()} group drafted</b><span>${number(savedGroup.acres)} acres • preferred date ${savedDate} • contact remains private</span>`;}
const groupDate=new Date();groupDate.setDate(groupDate.getDate()+7);$('newGroupDate').value=groupDate.toISOString().slice(0,10);

populateMarket();
renderStrategies();
renderMarket();
renderRecords();
renderKnowledge();
renderNews();
renderFarmerGroups();
renderCommandCentre();
updateWeatherLocation();
bindContextButtons();
renderTreatment();
