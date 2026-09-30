export const TREATMENT_RECOMMENDATIONS={
  'tom-early':{
    title:'Tomato Early Blight — verified treatment plan',
    diagnosisNote:'Fertilizer does not cure Early Blight. Manage the fungal disease first, while keeping crop nutrition balanced.',
    immediate:[
      'Remove heavily infected leaves and crop debris from the affected zone.',
      'Improve airflow and avoid prolonged leaf wetness where practical.',
      'Inspect nearby tomato plants before deciding how much area needs treatment.'
    ],
    chemical:[
      {name:'Copper oxychloride',rate:'3 g/L of water',note:'ICAR Kharif Agro-Advisory 2025 lists this option for tomato early blight/fruit rot as symptoms appear.'},
      {name:'Carbendazim 12% + Mancozeb 63% WP',rate:'2 g/L of water',note:'ICAR Kharif Agro-Advisory 2025 lists this option for tomato early blight/fruit rot as symptoms appear.'}
    ],
    nutrition:{
      title:'Tomato nutrition support — not a disease treatment',
      items:[
        'ICAR Kharif Agro-Advisory 2025 lists a tomato fertilizer schedule of N:P:K = 100:50:50 kg/ha with FYM 10 t/ha.',
        'The same advisory recommends a micronutrient mixture during flowering and fruiting for better yield.'
      ],
      caution:'Use fertilizer only according to crop stage, soil test and local recommendation. Do not add extra nitrogen to try to cure leaf spots.'
    },
    source:{name:'ICAR Kharif Agro-Advisory 2025 — Tomato',url:'https://www.icar.gov.in/sites/default/files/Circulars/ICAR%20En-Kharif%20Agro-Advisories%20for%20Farmers%202025.pdf'},
    calculatorHint:'If you choose a registered product, enter the rate from its current local label below. The calculator then converts the verified label rate to your treated area.'
  },
  'tom-late':{
    title:'Tomato Late Blight — urgent verified management',
    diagnosisNote:'Late Blight can progress rapidly in cool, humid conditions. Fertilizer is not a treatment for the disease.',
    immediate:[
      'Separate and mark the affected zone and inspect nearby plants immediately.',
      'Avoid unnecessary movement through wet foliage between rows.',
      'Remove severely affected tissue only according to local crop-health guidance.'
    ],
    chemical:[
      {name:'Use only a currently registered tomato late-blight fungicide',rate:'Follow the exact local product label',note:'Product choice and resistance-management sequence depend on local registration and current advisory. Do not infer a dose from the AI result.'}
    ],
    nutrition:{
      title:'Tomato nutrition support — not a disease treatment',
      items:[
        'Maintain the locally recommended balanced NPK program for the crop stage.',
        'Correct a nutrient deficiency only when supported by soil/tissue testing or a qualified agricultural recommendation.'
      ],
      caution:'Do not use additional fertilizer as a substitute for Late Blight control.'
    },
    source:{name:'TNAU Agritech Portal — Tomato diseases',url:'https://agritech.tnau.ac.in/crop_protection/crop_prot_crop%20diseases_veg_tomato.html'},
    calculatorHint:'After selecting a locally registered product, copy the exact rate from its label into the calculator.'
  }
};

export function treatmentFor(id){
  return TREATMENT_RECOMMENDATIONS[id]||null;
}
