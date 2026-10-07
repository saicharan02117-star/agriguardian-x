import {mkdir,writeFile} from 'node:fs/promises';

const OUTPUT=new URL('../vjh/data/agri-news.json',import.meta.url);
const MAX_ITEMS=36;
const queries=[
  {language:'en',regions:['india'],q:'India agriculture farmers crops MSP market schemes when:2d'},
  {language:'en',regions:['telangana','south','india'],q:'Telangana farmers agriculture crop weather market when:3d'},
  {language:'en',regions:['south','india'],q:'South India crop disease weather farmers when:3d'},
  {language:'en',regions:['india'],q:'groundnut maize cotton paddy tomato chilli India farmers when:5d'},
  {language:'te',regions:['telangana','south','india'],q:'తెలంగాణ వ్యవసాయం రైతులు పంట వాతావరణం మార్కెట్ when:3d'}
];

const fallbackImages={
  weather:'/vjh/assets/catalog/soil.jpg',
  market:'/vjh/assets/catalog/agriculture.jpg',
  disease:'/vjh/assets/diagnosis/agx-diagnosis-sheet.jpg',
  scheme:'/vjh/assets/catalog/agriculture.jpg'
};

function decode(value=''){
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
}
function text(value=''){return decode(value).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();}
function tag(block,name){return decode(block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`,'i'))?.[1]||'');}
function attr(block,name,attribute){return decode(block.match(new RegExp(`<${name}[^>]*${attribute}=["']([^"']+)["']`,'i'))?.[1]||'');}
function slug(value){return value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72)||`news-${Date.now()}`;}
function cropFor(value){
  const rules=[['Groundnut',/groundnut|peanut|వేరుశెనగ/i],['Maize',/maize|corn|మొక్కజొన్న/i],['Cotton',/cotton|పత్తి/i],['Paddy',/paddy|rice|వరి|ధాన్యం/i],['Tomato',/tomato|టమాట/i],['Chilli',/chilli|chili|మిరప/i],['Wheat',/wheat|గోధుమ/i],['Millet',/millet|bajra|jowar|ragi|చిరుధాన్య/i],['Pulses',/pulse|dal|gram|lentil|పప్పు/i]];
  return rules.find(([,pattern])=>pattern.test(value))?.[0]||'All';
}
function typeFor(value){
  if(/disease|pest|blight|virus|fung|insect|వ్యాధి|తెగులు/i.test(value))return'disease';
  if(/rain|weather|monsoon|drought|cyclone|temperature|వర్ష|వాతావరణ|కరువు/i.test(value))return'weather';
  if(/price|market|mandi|msp|procurement|export|import|ధర|మార్కెట్/i.test(value))return'market';
  return'scheme';
}
function extractImage(html=''){
  const patterns=[/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i,/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)/i,/<img[^>]+src=["'](https?:[^"']+)/i];
  return decode(patterns.map(pattern=>html.match(pattern)?.[1]).find(Boolean)||'');
}
async function thumbnailFor(url,type){
  try{
    const response=await fetch(url,{redirect:'follow',headers:{'user-agent':'AgriGuardianX-NewsBot/1.0 (+https://agriguardian-x-nutrient-ai.vercel.app)'},signal:AbortSignal.timeout(9000)});
    const html=await response.text();
    const image=extractImage(html);
    if(/^https:\/\//i.test(image))return{imageUrl:image,imageKind:'publisher-thumbnail'};
  }catch{}
  return{imageUrl:fallbackImages[type],imageKind:'category-fallback'};
}
async function fetchFeed(spec){
  const language=spec.language==='te'?'te':'en-IN';
  const ceid=spec.language==='te'?'IN:te':'IN:en';
  const url=`https://news.google.com/rss/search?q=${encodeURIComponent(spec.q)}&hl=${language}&gl=IN&ceid=${ceid}`;
  const response=await fetch(url,{headers:{'user-agent':'AgriGuardianX-NewsBot/1.0'},signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error(`RSS ${response.status}`);
  const xml=await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0,12).map(match=>{
    const block=match[1],rawTitle=text(tag(block,'title'));
    const source=text(tag(block,'source'))||rawTitle.split(' - ').at(-1)||'News source';
    const title=rawTitle.endsWith(` - ${source}`)?rawTitle.slice(0,-(` - ${source}`.length)):rawTitle;
    const description=text(tag(block,'description')).replace(title,'').trim();
    const publishedAt=new Date(tag(block,'pubDate')||Date.now()).toISOString();
    const articleUrl=text(tag(block,'link'));
    const joined=`${title} ${description}`;
    return{id:slug(`${title}-${publishedAt.slice(0,10)}`),title,summary:description||'Open the original source for the complete report and local applicability.',crop:cropFor(joined),type:typeFor(joined),regions:spec.regions,language:spec.language,source,publishedAt,articleUrl,sourceHome:attr(block,'source','url')};
  });
}

const settled=await Promise.allSettled(queries.map(fetchFeed));
const deduped=[];
for(const result of settled){
  if(result.status!=='fulfilled')continue;
  for(const item of result.value){
    const key=item.title.toLowerCase().replace(/\W/g,'').slice(0,80);
    if(!item.title||!item.articleUrl||deduped.some(existing=>existing.key===key))continue;
    deduped.push({...item,key});
  }
}
deduped.sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
const selected=deduped.slice(0,MAX_ITEMS);
const enriched=[];
for(const item of selected){
  const {key,...clean}=item;
  enriched.push({...clean,...await thumbnailFor(item.articleUrl,item.type)});
}
if(!enriched.length)throw new Error('No agriculture news items were collected; existing dataset was preserved.');
const dataset={schemaVersion:1,generatedAt:new Date().toISOString(),refreshPolicy:'Daily at 00:30 UTC (06:00 IST) through GitHub Actions',sourcePolicy:'Headlines, publisher names, publish times and links come from indexed news RSS. Original publishers remain authoritative.',items:enriched};
await mkdir(new URL('../vjh/data/',import.meta.url),{recursive:true});
await writeFile(OUTPUT,JSON.stringify(dataset,null,2)+'\n','utf8');
console.log(`Saved ${enriched.length} agriculture news records to ${OUTPUT.pathname}`);

