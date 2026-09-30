export const CONDITIONS={
  healthy:{label:'Tomato leaf appears healthy',scientific:'No supported disease pattern detected',recommendation:'Continue routine monitoring. Record a new image if symptoms appear or plant condition changes.',caution:'This result covers only the three supported prototype classes.'},
  early:{label:'Suspected early blight',scientific:'Visual pattern consistent with Alternaria solani',recommendation:'Inspect older leaves for expanding spots with concentric rings. Remove heavily affected debris according to local guidance and seek crop-specific advice before applying treatment.',caution:'Early blight can resemble other leaf spots. Confirm before any chemical treatment.'},
  late:{label:'Suspected late blight',scientific:'Visual pattern consistent with Phytophthora infestans',recommendation:'Isolate and inspect the affected zone promptly. Look for rapidly expanding, water-soaked lesions and pale growth on leaf undersides during humid conditions. Seek local expert confirmation.',caution:'Late blight can spread quickly in favorable weather. The visual screen is not a laboratory diagnosis.'}
};

export function recoveryState(previous,current){
  const rank={Mild:1,Moderate:2,Severe:3};
  if(!previous||!rank[previous]||!rank[current])return 'Baseline';
  return rank[current]<rank[previous]?'Improving':rank[current]>rank[previous]?'Worsening':'Stable';
}
