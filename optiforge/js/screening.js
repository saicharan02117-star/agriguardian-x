const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

export async function extractSignals(file){
  if(!file||!/^image\/(jpeg|png|webp)$/.test(file.type))throw new Error('Choose a JPG, PNG or WebP image.');
  if(file.size>10*1024*1024)throw new Error('Image must be smaller than 10 MB.');
  const bmp=await createImageBitmap(file); const side=224;
  const canvas=document.createElement('canvas');canvas.width=side;canvas.height=side;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bmp,0,0,side,side);bmp.close?.();
  const d=ctx.getImageData(0,0,side,side).data;let green=0,brown=0,dark=0,pale=0,edge=0,usable=0,lum=0,lum2=0;
  let prev=0;
  for(let i=0;i<d.length;i+=4){const r=d[i],g=d[i+1],b=d[i+2],l=.299*r+.587*g+.114*b;lum+=l;lum2+=l*l;
    const sat=Math.max(r,g,b)-Math.min(r,g,b);if(sat>18){usable++;if(g>r*1.08&&g>b*1.08)green++;if(r>g*1.08&&g>b*.72&&r<190)brown++;if(l<72)dark++;if(g>r*.95&&g>b*1.05&&l>120)pale++;}if(i>0&&Math.abs(l-prev)>42)edge++;prev=l;}
  const n=side*side,mean=lum/n,contrast=Math.sqrt(Math.max(0,lum2/n-mean*mean));
  return{green:green/Math.max(1,usable),brown:brown/Math.max(1,usable),dark:dark/Math.max(1,usable),pale:pale/Math.max(1,usable),edge:edge/n,usable:usable/n,mean,contrast};
}

export function classify(s){
  const quality=clamp((s.usable*.65+s.contrast/100*.35),0,1);
  let raw={healthy:1.3*s.green-.7*s.brown-.25*s.dark,early:1.55*s.brown+.65*s.edge+.25*s.pale,late:1.05*s.dark+.9*s.pale+.45*s.brown+.3*(1-s.green)};
  const exp=Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,Math.exp(v*3)]));const sum=Object.values(exp).reduce((a,b)=>a+b,0);
  const probs=Object.fromEntries(Object.entries(exp).map(([k,v])=>[k,v/sum]));const sorted=Object.entries(probs).sort((a,b)=>b[1]-a[1]);
  const confidence=clamp(sorted[0][1]*(.7+.3*quality),0,1);const lesion=clamp(s.brown+s.dark*.65+s.pale*.35,0,1);
  const severity=lesion>.42?'Severe':lesion>.2?'Moderate':'Mild';
  const reasons=[`Leaf-colored pixels: ${Math.round(s.usable*100)}%.`,`Green signal: ${Math.round(s.green*100)}%; brown/dark lesion signal: ${Math.round((s.brown+s.dark)*50)}%.`,`Texture contrast score: ${Math.round(s.contrast)} / 100.`];
  const abstain=quality<.18||confidence<.42;
  return{key:sorted[0][0],confidence,severity,quality,probs,reasons,abstain};
}
