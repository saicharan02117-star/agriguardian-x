const IMG = {
  seed: '/vjh/assets/catalog/agriculture.jpg',
  fertilizer: '/vjh/assets/catalog/fertilizer.jpg',
  manure: '/vjh/assets/catalog/manure.jpg',
  bio: '/vjh/assets/catalog/bioinput.jpg',
  insecticide: '/vjh/assets/catalog/insecticide.jpg',
  fungicide: '/vjh/assets/catalog/fungicide.jpg',
  herbicide: '/vjh/assets/catalog/herbicide.jpg',
  nutrient: '/vjh/assets/catalog/nutrient.jpg',
  growth: '/vjh/assets/catalog/growth.jpg',
  amendment: '/vjh/assets/catalog/soil.jpg'
};

const ALL = ['Groundnut','Maize','Cotton','Paddy','Tomato','Chilli','Millet','Red gram','Green gram','Black gram','Soybean','Sorghum','Wheat','Bengal gram','Sunflower','Sesame','Sugarcane','Potato','Onion','Turmeric','Vegetables'];

const safeUse = {
  seed: 'Select only certified or truthfully labelled seed with a readable tag, crop/variety name, lot number, germination, purity, treatment disclosure and validity. Confirm local season and variety suitability.',
  fertilizer: 'Use only after a soil-test and crop-stage recommendation. Include nutrients already supplied by manure, irrigation water and earlier applications; calibrate placement equipment.',
  manure: 'Use mature, uncontaminated material. Composition varies widely, so record source, moisture and available analysis and include its contribution in the nutrient budget.',
  bio: 'Confirm organism/strain, viable count, crop/purpose registration, expiry, storage and compatibility. Living products can fail when overheated, expired or tank-mixed incorrectly.',
  insecticide: 'Use only when the target pest and economic threshold are confirmed. Verify crop, pest, formulation, IRAC group, PPE, pollinator protection, re-entry and pre-harvest interval on the current label.',
  fungicide: 'Confirm the disease before use. Rotate FRAC groups, avoid repeated solo use of the same mode of action, and follow the exact crop/formulation label, PPE and waiting period.',
  herbicide: 'Correct weed identification and crop stage are essential. Verify selectivity, soil type, nozzle, drift buffer, rain window and crop-specific label. Never use near sensitive crops without safeguards.',
  bactericide: 'Use only for a confirmed bacterial target and a registered crop label. Sanitation, clean seed, water management and removal of infected material often remain important.',
  nematicide: 'Confirm nematodes through root/soil sampling. Prioritize rotation, clean planting material and biological/cultural measures; follow restricted label and PPE requirements exactly.',
  nutrient: 'Confirm deficiency with soil/tissue testing and consider pH, salinity, roots and water. Micronutrients have narrow safe ranges; calculate from the exact product analysis.',
  amendment: 'Use only from a laboratory soil/water diagnosis and amendment requirement. Material purity, neutralizing value, fineness and transport cost change the effective value.',
  growth: 'Use only on a crop and growth stage listed on the current label. Small timing or concentration errors can reduce yield; do not copy rates across formulations.'
};

const categoryFor = subgroup => ['seed'].includes(subgroup) ? 'seed' : ['fertilizer'].includes(subgroup) ? 'fertilizer' : ['manure','bio'].includes(subgroup) ? 'manure' : ['nutrient','amendment'].includes(subgroup) ? 'nutrient' : 'pesticide';
const row = (subgroup,id,name,analysis,purpose,crops=ALL) => ({
  id, name, subgroup, category: categoryFor(subgroup), analysis, purpose,
  crops, crop: crops.length === ALL.length ? 'all' : crops[0],
  use: safeUse[subgroup],
  cost: subgroup === 'seed' ? 'Compare cost per viable, locally suitable plant—not packet price.' : 'Compare active nutrient/ingredient, labelled coverage, field need and total application cost.',
  image: IMG[subgroup] || IMG.bio,
  photoCredit: 'Agricultural reference photograph • Unsplash'
});

const seedRows = [
  ['seed-groundnut','Groundnut certified seed','Kernel type, maturity, germination and treatment','Oilseed establishment; compare bunch/spreading type and duration',['Groundnut']],
  ['seed-maize','Maize certified seed / hybrid','Hybrid or composite status, maturity and germination','Grain, fodder, sweet-corn or baby-corn purpose must match',['Maize']],
  ['seed-paddy','Paddy certified seed / hybrid','Duration, grain type and ecosystem suitability','Choose for irrigated, rainfed, direct-seeded or transplanted system',['Paddy']],
  ['seed-cotton','Cotton approved seed','Hybrid/variety, fibre traits and current regulatory requirements','Match duration, pest refuge rules and market fibre requirement',['Cotton']],
  ['seed-tomato','Tomato certified seed / hybrid','Growth habit, maturity, resistance package and fruit market','Open-field or protected-cultivation tomato establishment',['Tomato']],
  ['seed-chilli','Chilli certified seed / hybrid','Fruit type, pungency, colour, duration and resistance package','Dry chilli or green chilli market-specific establishment',['Chilli']],
  ['seed-millet','Pearl/finger millet certified seed','Species, duration, grain or fodder purpose','Dryland cereal establishment',['Millet']],
  ['seed-sorghum','Sorghum certified seed / hybrid','Grain, fodder or dual-purpose type and maturity','Rainfed grain or fodder establishment',['Sorghum']],
  ['seed-redgram','Red gram certified seed','Duration, growth habit and wilt tolerance claim','Pulse crop establishment',['Red gram']],
  ['seed-greengram','Green gram certified seed','Duration and yellow-mosaic tolerance claim','Short-duration pulse establishment',['Green gram']],
  ['seed-blackgram','Black gram certified seed','Duration and disease tolerance claim','Pulse establishment for season and local system',['Black gram']],
  ['seed-chickpea','Bengal gram certified seed','Seed size, maturity and wilt tolerance claim','Chickpea establishment',['Bengal gram']],
  ['seed-soybean','Soybean certified seed','Maturity group, germination and seed treatment','Oilseed/pulse establishment',['Soybean']],
  ['seed-sunflower','Sunflower certified seed / hybrid','Oil content, maturity and hybrid status','Oilseed establishment',['Sunflower']],
  ['seed-sesame','Sesame certified seed','Seed colour, duration and shattering behaviour','Oilseed establishment',['Sesame']],
  ['seed-wheat','Wheat certified seed','Duration, grain quality and rust tolerance claim','Irrigated or limited-irrigation wheat establishment',['Wheat']],
  ['seed-onion','Onion seed / seedlings','Bulb colour, season, storage and bolting behaviour','Bulb crop establishment',['Onion']],
  ['seed-potato','Certified seed potato','Generation/class, tuber health, size and dormancy','Vegetative planting material for potato',['Potato']],
  ['seed-sugarcane','Disease-free sugarcane planting material','Variety, age, bud health and nursery source','Sett, bud-chip or nursery planting material',['Sugarcane']],
  ['seed-turmeric','Disease-free turmeric seed rhizome','Variety, rhizome health and source','Vegetative planting material for turmeric',['Turmeric']]
].map(([id,name,analysis,purpose,crops])=>row('seed',id,name,analysis,purpose,crops));

const fertilizerRows = [
  ['fert-urea','Urea','Typically 46% N — verify bag','Concentrated nitrogen source'],
  ['fert-neem-urea','Neem-coated urea','Typically 46% N with approved coating — verify bag','Nitrogen source with regulated coating'],
  ['fert-dap','DAP','Typically 18-46-0 — verify bag','Nitrogen and phosphorus source'],
  ['fert-mop','MOP / muriate of potash','Typically 0-0-60 K₂O — verify bag','Potassium source; chloride sensitivity matters'],
  ['fert-sop','SOP / sulphate of potash','Typically about 0-0-50 K₂O plus sulfur — verify bag','Potassium option for chloride-sensitive situations when recommended'],
  ['fert-ssp','Single super phosphate','Typically 16% P₂O₅ plus sulfur/calcium — verify bag','Phosphorus with sulfur/calcium contribution'],
  ['fert-tsp','Triple super phosphate','Concentrated phosphate grade varies — verify bag','Phosphorus source where registered and recommended'],
  ['fert-ammonium-sulphate','Ammonium sulphate','About 20.6% N plus sulfur — verify bag','Nitrogen and sulfur source'],
  ['fert-can','Calcium ammonium nitrate','Nitrogen grade varies — verify bag','Nitrate/ammonium nitrogen with calcium contribution'],
  ['fert-npk-10-26-26','NPK complex 10-26-26','10-26-26 grade — verify bag','Multi-nutrient complex for a matching soil-test gap'],
  ['fert-npk-12-32-16','NPK complex 12-32-16','12-32-16 grade — verify bag','Multi-nutrient complex with higher phosphorus'],
  ['fert-np-20-20-0-13','NP complex 20-20-0-13','20-20-0 plus sulfur — verify bag','Nitrogen, phosphorus and sulfur source'],
  ['fert-npk-15-15-15','NPK complex 15-15-15','Balanced 15-15-15 — verify bag','Balanced grade only when the recommendation matches'],
  ['fert-water-soluble','Water-soluble NPK grades','Examples include 19-19-19, 13-0-45 and MAP; verify pack','Fertigation/foliar-compatible grades only under a specific plan'],
  ['fert-map','Mono-ammonium phosphate','Typical grade varies around 12-61-0 — verify pack','Concentrated water-soluble phosphorus and nitrogen'],
  ['fert-calcium-nitrate','Calcium nitrate','Calcium and nitrate-N analysis varies','Calcium/nitrogen source in compatible systems']
].map(v=>row('fertilizer',...v));

const organicRows = [
  ['manure-fym','Well-decomposed farmyard manure','Variable organic matter and nutrients','Soil organic matter, structure and nutrient contribution','manure'],
  ['manure-compost','Mature compost','Feedstock and analysis vary','Stabilized organic amendment','manure'],
  ['manure-vermi','Vermicompost','Moisture, carbon and nutrient analysis vary','Stabilized organic matter and biological activity','manure'],
  ['manure-green','Green manure crop','Biomass and nutrient contribution vary','In-situ biomass and soil cover','manure'],
  ['manure-neemcake','Neem cake','Oilcake composition varies','Organic amendment with nutrient and bioactive contribution','manure'],
  ['manure-groundnutcake','Groundnut cake','Nutrient analysis varies by processing','Concentrated organic nutrient source where economical','manure'],
  ['manure-poultry','Composted poultry manure','Often nutrient-rich; analysis and salinity vary','Organic nutrient source requiring careful testing','manure'],
  ['bio-rhizobium','Rhizobium inoculant','Crop/host-specific strain and viable count','Biological nitrogen fixation support for compatible legumes','bio'],
  ['bio-azotobacter','Azotobacter inoculant','Strain and viable count vary','Free-living nitrogen-fixing bio-input where labelled','bio'],
  ['bio-azospirillum','Azospirillum inoculant','Strain and viable count vary','Associative biological nitrogen support where labelled','bio'],
  ['bio-psb','Phosphate-solubilizing bacteria','Organism and viable count vary','Phosphorus-mobilization bio-input'],
  ['bio-kmb','Potassium-mobilizing bacteria','Organism and viable count vary','Potassium-mobilization bio-input'],
  ['bio-mycorrhiza','Mycorrhizal inoculant','Propagule count and species vary','Root symbiosis support under compatible conditions'],
  ['bio-trichoderma','Trichoderma bio-input','Strain, viable count and formulation matter','Registered seed/soil/root-zone biological disease management'],
  ['bio-pseudomonas','Pseudomonas fluorescens bio-input','Strain and viable count matter','Registered biological plant-health or disease-management use']
].map(([id,name,analysis,purpose,subgroup='bio'])=>row(subgroup,id,name,analysis,purpose));

const nutrientRows = [
  ['nut-zinc-sulphate','Zinc sulphate','Zn and sulfur percentage depend on hydrate/form','Zinc correction where confirmed','nutrient'],
  ['nut-boron','Boron source / borax / boric formulation','B concentration varies; narrow safe range','Boron correction where laboratory-confirmed','nutrient'],
  ['nut-ferrous','Ferrous sulphate / iron source','Iron percentage and chelation vary','Iron correction under crop/pH-specific guidance','nutrient'],
  ['nut-manganese','Manganese sulphate','Mn analysis varies','Manganese correction where confirmed','nutrient'],
  ['nut-copper','Copper sulphate / copper nutrient source','Copper analysis varies','Trace copper correction where confirmed','nutrient'],
  ['nut-molybdenum','Molybdenum source','Very low-use trace nutrient; analysis varies','Molybdenum correction only after confirmation','nutrient'],
  ['nut-magnesium','Magnesium sulphate','Magnesium and sulfur analysis varies','Magnesium correction where confirmed','nutrient'],
  ['nut-chelated-mix','Chelated micronutrient mixture','Chelating agent and element percentages vary','Multi-micronutrient correction only for a matching diagnosis','nutrient'],
  ['nut-silicon','Silicon source','Plant-available silicon varies','Supplement where crop/system recommendation supports it','nutrient'],
  ['amend-gypsum','Agricultural gypsum','Calcium, sulfur and purity vary','Calcium/sulfur supply or sodic-soil reclamation when tested','amendment'],
  ['amend-lime','Agricultural lime','Neutralizing value and fineness vary','Acid-soil pH correction from lime requirement','amendment'],
  ['amend-dolomite','Dolomitic lime','Calcium, magnesium and neutralizing value vary','Acid-soil correction with magnesium contribution'],
  ['amend-elemental-s','Elemental sulfur amendment','Sulfur purity and particle size vary','Specialist pH/sulfur management under testing'],
  ['amend-humic','Humic/fulvic soil conditioner','Composition and evidence vary by product','Soil conditioner; not a replacement for required nutrients']
].map(v=>row(v[4]||'amendment',...v.slice(0,4)));

const protectionRows = [
  ['insect-azadirachtin','Azadirachtin botanical','Concentration/formulation varies','Botanical insect management for labelled crop-pest uses','insecticide'],
  ['insect-bt','Bacillus thuringiensis (Bt)','Strain, potency and formulation vary','Young susceptible caterpillar management where labelled','insecticide'],
  ['insect-beauveria','Beauveria bassiana','Strain and viable count vary','Biological insect management under suitable conditions','insecticide'],
  ['insect-metarrhizium','Metarhizium anisopliae','Strain and viable count vary','Biological insect management where registered','insecticide'],
  ['insect-emamectin','Emamectin benzoate','Formulation concentration varies','Caterpillar control only on labelled crop-pest uses','insecticide'],
  ['insect-spinosad','Spinosad','Formulation concentration varies','Selected insect management where labelled','insecticide'],
  ['insect-spinetoram','Spinetoram','Formulation concentration varies','Selected thrips/caterpillar uses where labelled','insecticide'],
  ['insect-chlorantraniliprole','Chlorantraniliprole','Formulation concentration varies','Diamide insecticide for labelled target pests','insecticide'],
  ['insect-flubendiamide','Flubendiamide','Registration/formulation status must be verified','Diamide insecticide only where currently permitted and labelled','insecticide'],
  ['insect-imidacloprid','Imidacloprid','Formulation and seed/soil/foliar use differ','Systemic insecticide for labelled sucking-pest uses','insecticide'],
  ['insect-thiamethoxam','Thiamethoxam','Formulation and use pattern vary','Systemic insecticide/seed treatment only where labelled','insecticide'],
  ['insect-acetamiprid','Acetamiprid','Formulation concentration varies','Sucking-pest management where labelled','insecticide'],
  ['insect-fipronil','Fipronil','Granule/liquid formulations differ','Soil or foliar insect uses only where labelled','insecticide'],
  ['insect-indoxacarb','Indoxacarb','Formulation concentration varies','Caterpillar management where labelled','insecticide'],
  ['fung-mancozeb','Mancozeb','Formulation concentration varies','Multi-site protectant fungicide where labelled','fungicide'],
  ['fung-copper','Copper oxychloride / copper fungicide','Metallic copper equivalent varies','Protectant fungicide/bactericide uses where labelled','fungicide'],
  ['fung-sulfur','Wettable sulfur','Sulfur concentration varies','Fungicide/acaricide uses where labelled; heat sensitivity matters','fungicide'],
  ['fung-carbendazim','Carbendazim','Registration, formulation and crop uses must be verified','Systemic fungicide only where currently permitted and labelled','fungicide'],
  ['fung-hexaconazole','Hexaconazole','Formulation concentration varies','Triazole fungicide for labelled diseases','fungicide'],
  ['fung-propiconazole','Propiconazole','Formulation concentration varies','Triazole fungicide for labelled diseases','fungicide'],
  ['fung-tebuconazole','Tebuconazole','Formulation concentration varies','Triazole fungicide or seed treatment where labelled','fungicide'],
  ['fung-azoxystrobin','Azoxystrobin','Formulation/mixture varies','QoI fungicide for labelled diseases','fungicide'],
  ['fung-metalaxyl-mz','Metalaxyl + mancozeb mixture','Ratio and formulation vary','Oomycete disease management only where labelled','fungicide'],
  ['fung-tricyclazole','Tricyclazole','Current crop registration and formulation must be verified','Rice blast management only where permitted and labelled','fungicide'],
  ['bact-streptocycline','Agricultural antibiotic combination','Current legal status and crop label must be verified','Specialist bacterial disease use only when officially permitted','bactericide'],
  ['bact-copper','Copper-based bactericide','Metallic copper equivalent varies','Protectant bacterial disease management where labelled','bactericide'],
  ['herb-glyphosate','Glyphosate','Salt and acid-equivalent concentration vary','Non-selective systemic weed control only in labelled situations','herbicide'],
  ['herb-pendimethalin','Pendimethalin','Formulation concentration varies','Pre-emergence residual weed control in labelled crops','herbicide'],
  ['herb-atrazine','Atrazine','Formulation concentration varies','Selective weed control in labelled crops such as maize only','herbicide'],
  ['herb-pretilachlor','Pretilachlor','Formulation/safener status varies','Rice weed control under labelled water/stage conditions','herbicide'],
  ['herb-bispyribac','Bispyribac-sodium','Formulation concentration varies','Post-emergence rice weed control where labelled','herbicide'],
  ['herb-quizalofop','Quizalofop-ethyl','Formulation concentration varies','Post-emergence grass control in labelled broadleaf crops','herbicide'],
  ['herb-imazethapyr','Imazethapyr','Formulation concentration varies','Selective weed control in labelled legumes/soybean systems','herbicide'],
  ['herb-2-4-d','2,4-D','Salt/ester and concentration vary','Broadleaf weed control only on labelled crops/stages','herbicide'],
  ['nema-paecilomyces','Purpureocillium lilacinum bio-nematicide','Strain and viable count vary','Biological nematode suppression where registered','nematicide'],
  ['nema-chemical','Registered chemical nematicide','Active ingredient and restrictions vary','Last-resort nematode management after confirmed diagnosis','nematicide'],
  ['pgr-ga3','Gibberellic acid (GA3)','Concentration and formulation vary','Crop growth/flower/fruit response only at labelled stages','growth'],
  ['pgr-ethephon','Ethephon','Concentration and formulation vary','Ripening/flowering/growth regulation only where labelled','growth'],
  ['pgr-nnaa','NAA / naphthalene acetic acid','Concentration/formulation vary','Plant growth regulation only on labelled crop-stage uses','growth'],
  ['pgr-triacontanol','Triacontanol','Concentration/formulation vary','Plant growth regulator where registered and labelled','growth']
].map(([id,name,analysis,purpose,subgroup])=>row(subgroup,id,name,analysis,purpose));

export const FARM_INPUT_CATALOG = [...seedRows,...fertilizerRows,...organicRows,...nutrientRows,...protectionRows];
export const INPUT_CROPS = ALL;
export const INPUT_SUBGROUPS = [...new Set(FARM_INPUT_CATALOG.map(item=>item.subgroup))];
export const CATALOG_STATS = FARM_INPUT_CATALOG.reduce((acc,item)=>{acc.total++;acc[item.category]=(acc[item.category]||0)+1;if(item.subgroup!==item.category)acc[item.subgroup]=(acc[item.subgroup]||0)+1;return acc;},{total:0});

const seed = (name,strength,score,cost,note)=>[name,strength,score,cost,note];
export const SEED_LIBRARY = Object.fromEntries(ALL.filter(crop=>crop!=='Vegetables').map(crop=>[crop,[
  seed(`Certified public ${crop} variety`,'budget',80,1800,'Lower-cost certified option; verify the notified variety for your district and season'),
  seed(`Short-duration ${crop} variety`,'water',87,2600,'Reduces seasonal exposure where officially recommended'),
  seed(`${crop} hybrid / high-yield option`,'yield',89,4200,'Higher potential only when the production system, market and local recommendation fit')
]]));
