import { getDb } from '../lib/db.ts';

export interface SectorDefinition {
  id: string;
  slug: string;
  nameEn: string;
  nameMr: string;
  aliasesEn: string[];
  aliasesMr: string[];
  descriptionEn: string;
  descriptionMr: string;
}

export const SECTOR_TAXONOMY: SectorDefinition[] = [
  {
    id: 'sec-auto',
    slug: 'automobile',
    nameEn: 'Automobile & Auto Components',
    nameMr: 'वाहन व सुटे भाग उद्योग',
    aliasesEn: ['auto', 'automobile', 'automotive', 'vehicles', 'cars', 'motors', 'commercial vehicles', 'two wheelers', 'ev', 'tyres', 'auto components'],
    aliasesMr: ['वाहन', 'गाड्या', 'ऑटोमोबाईल', 'मोटार', 'दुचाकी', 'चारचाकी', 'इलेक्ट्रिक वाहने', 'ऑटो', 'टायर्स'],
    descriptionEn: 'Manufacturers of passenger vehicles, commercial vehicles, two-wheelers, three-wheelers, electric vehicles, and precision automotive components.',
    descriptionMr: 'प्रवासी वाहने, व्यावसायिक वाहने, दुचाकी, तीनचाकी, इलेक्ट्रिक वाहने आणि वाहनांचे सुटे भाग बनवणाऱ्या नामांकित कंपन्या.',
  },
  {
    id: 'sec-banking',
    slug: 'banking-finance',
    nameEn: 'Banking & Financial Services',
    nameMr: 'बँका व वित्तीय सेवा',
    aliasesEn: ['bank', 'banks', 'banking', 'finance', 'financial services', 'nbfc', 'psu bank', 'private bank', 'lending', 'housing finance', 'fintech', 'insurance', 'amc', 'wealth management'],
    aliasesMr: ['बँक', 'बँका', 'बँकिंग', 'वित्त', 'वित्तीय सेवा', 'कर्ज', 'गृहकर्ज', 'एनबीएफसी', 'फायनान्स', 'विमा'],
    descriptionEn: 'Commercial banks, public sector banks, non-banking financial companies (NBFCs), housing finance institutions, insurance, and asset management companies.',
    descriptionMr: 'सार्वजनिक व खाजगी बँका, वित्तीय संस्था (NBFCs), गृहकर्ज देणाऱ्या संस्था, विमा आणि संपत्ती व्यवस्थापन कंपन्या.',
  },
  {
    id: 'sec-it',
    slug: 'information-technology',
    nameEn: 'Information Technology & Software',
    nameMr: 'माहिती तंत्रज्ञान व सॉफ्टवेअर',
    aliasesEn: ['it', 'tech', 'technology', 'software', 'computers', 'saas', 'cloud', 'digital services', 'cybersecurity', 'ai', 'data science'],
    aliasesMr: ['आयटी', 'माहिती तंत्रज्ञान', 'सॉफ्टवेअर', 'टेक', 'तंत्रज्ञान', 'क्लाउड', 'डिजिटल सेवा'],
    descriptionEn: 'Global IT service providers, enterprise software developers, digital transformation firms, and technology consulting companies.',
    descriptionMr: 'सॉफ्टवेअर विकास, डिजिटल सेवा, सायबर सुरक्षा, क्लाउड तंत्रज्ञान आणि आयटी सेवा क्षेत्रातील आघाडीच्या कंपन्या.',
  },
  {
    id: 'sec-fmcg',
    slug: 'fmcg',
    nameEn: 'Fast-Moving Consumer Goods (FMCG)',
    nameMr: 'ग्राहकोपयोगी जलद गती वस्तू (FMCG)',
    aliasesEn: ['fmcg', 'consumer goods', 'packaged goods', 'foods', 'beverages', 'personal care', 'household products', 'oral care', 'toiletries'],
    aliasesMr: ['एफएमसीजी', 'ग्राहकोपयोगी', 'ग्राहकोपयोगी वस्तू', 'अन्नधान्य', 'पेये', 'सौंदर्य प्रसाधने', 'दैनंदिन वापराच्या वस्तू'],
    descriptionEn: 'Producers of packaged food, beverages, personal care items, household essentials, and daily consumption packaged goods.',
    descriptionMr: 'पॅक केलेले अन्नपदार्थ, शीतपेये, वैयक्तिक स्वच्छता व सौंदर्य प्रसाधने आणि दैनंदिन घरगुती वस्तूंचे उत्पादन करणाऱ्या कंपन्या.',
  },
  {
    id: 'sec-pharma',
    slug: 'healthcare-pharma',
    nameEn: 'Healthcare & Pharmaceuticals',
    nameMr: 'औषध निर्माण व आरोग्य सेवा',
    aliasesEn: ['pharma', 'pharmaceuticals', 'healthcare', 'drugs', 'medicines', 'biotech', 'hospitals', 'diagnostics', 'formulations', 'apis'],
    aliasesMr: ['फार्मा', 'औषधे', 'औषध निर्माण', 'आरोग्य सेवा', 'रुग्णालये', 'बायोटेक', 'लॅब', 'निदान केंद्रे'],
    descriptionEn: 'Manufacturers of generic and branded formulations, active pharmaceutical ingredients (APIs), biotechnology, and healthcare delivery hospitals.',
    descriptionMr: 'औषध निर्मिती (APIs व फॉर्म्युलेशन्स), बायोटेक्नॉलॉजी, हॉस्पिटल्स आणि वैद्यकीय चाचणी सेवा पुरवणाऱ्या कंपन्या.',
  },
  {
    id: 'sec-energy',
    slug: 'energy-power',
    nameEn: 'Oil, Gas, Energy & Power',
    nameMr: 'ऊर्जा, तेल, वायू व वीज निर्मिती',
    aliasesEn: ['oil', 'gas', 'energy', 'power', 'petroleum', 'refining', 'solar', 'wind', 'renewable energy', 'electricity', 'thermal'],
    aliasesMr: ['ऊर्जा', 'तेल', 'वायू', 'वीज', 'पेट्रोलियम', 'सौर ऊर्जा', 'पवन ऊर्जा', 'नवीकरणीय ऊर्जा', 'पॉवर'],
    descriptionEn: 'Exploration and production of crude oil and natural gas, petroleum refining, power generation (thermal, hydro, solar, wind), and transmission.',
    descriptionMr: 'कच्चे तेल व नैसर्गिक वायू उत्पादन, रिफायनरी, वीज निर्मिती (औष्णिक, जल, सौर, पवन) आणि वीज वितरण करणाऱ्या कंपन्या.',
  },
  {
    id: 'sec-metals',
    slug: 'metals-mining',
    nameEn: 'Metals, Steel & Mining',
    nameMr: 'धातू, पोलाद व खाणकाम',
    aliasesEn: ['metals', 'metal', 'steel', 'mining', 'iron', 'aluminum', 'copper', 'zinc', 'alloys', 'coal mining', 'pipes', 'tubes'],
    aliasesMr: ['धातू', 'स्टील', 'पोलाद', 'खाणकाम', 'लोखंड', 'अ‍ॅल्युमिनियम', 'तांबे', 'मिश्रधातू', 'कोळसा'],
    descriptionEn: 'Producers of steel, iron, aluminum, copper, zinc, precious metals, and mineral mining operations.',
    descriptionMr: 'स्टील, पोलाद, अ‍ॅल्युमिनियम, तांबे, जस्त उत्पादन आणि खनिज खाणकाम क्षेत्रातील आघाडीच्या कंपन्या.',
  },
  {
    id: 'sec-chemicals',
    slug: 'chemicals',
    nameEn: 'Chemicals & Fertilizers',
    nameMr: 'रासायनिक व खते उद्योग',
    aliasesEn: ['chemicals', 'specialty chemicals', 'fertilizers', 'agrochemicals', 'petrochemicals', 'polymers', 'industrial chemicals'],
    aliasesMr: ['रसायने', 'रासायनिक', 'खते', 'कृषी रसायने', 'स्पेशालिटी केमिकल्स', 'पॉलिमर'],
    descriptionEn: 'Manufacturers of specialty chemicals, agrochemicals, fertilizers, polymers, and basic industrial chemical compounds.',
    descriptionMr: 'स्पेशालिटी केमिकल्स, रासायनिक खते, कीटकनाशके, पॉलिमर आणि औद्योगिक रसायने बनवणाऱ्या कंपन्या.',
  },
  {
    id: 'sec-infra',
    slug: 'capital-goods-infra',
    nameEn: 'Capital Goods & Infrastructure',
    nameMr: 'भांडवली वस्तू, अभियांत्रिकी व पायाभूत सुविधा',
    aliasesEn: ['infra', 'infrastructure', 'capital goods', 'engineering', 'construction', 'machinery', 'heavy equipment', 'epc', 'cement', 'cables', 'wires'],
    aliasesMr: ['पायाभूत सुविधा', 'अभियांत्रिकी', 'भांडवली वस्तू', 'बांधकाम', 'यंत्रसामग्री', 'सिमेंट', 'इन्फ्रा'],
    descriptionEn: 'Engineering, procurement, and construction (EPC) companies, heavy machinery builders, cement, industrial equipment, and public infrastructure developers.',
    descriptionMr: 'पायाभूत सुविधा (रस्ते, पूल, रेल्वे), सिमेंट, अवजड यंत्रसामग्री निर्मिती, अभियांत्रिकी आणि औद्योगिक बांधकाम कंपन्या.',
  },
  {
    id: 'sec-durables',
    slug: 'consumer-durables',
    nameEn: 'Consumer Durables & Electronics',
    nameMr: 'टिकाऊ ग्राहक वस्तू व इलेक्ट्रॉनिक्स',
    aliasesEn: ['durables', 'consumer durables', 'electronics', 'appliances', 'home appliances', 'white goods', 'fans', 'lighting', 'paints', 'tiles', 'sanitaryware'],
    aliasesMr: ['टिकाऊ वस्तू', 'इलेक्ट्रॉनिक्स', 'घरगुती उपकरणे', 'टीव्ही', 'फ्रिज', 'वॉशिंग मशीन', 'लाईट्स व पंखे', 'रंग'],
    descriptionEn: 'Manufacturers of televisions, refrigerators, air conditioners, fans, kitchen appliances, paints, and consumer electronic goods.',
    descriptionMr: 'टीव्ही, फ्रीज, एअर कंडिशनर, वॉशिंग मशीन, पंखे, पेंट्स आणि घरगुती इलेक्ट्रॉनिक्स उपकरणे बनवणाऱ्या कंपन्या.',
  },
  {
    id: 'sec-telecom',
    slug: 'telecommunications',
    nameEn: 'Telecommunications',
    nameMr: 'दूरसंचार सेवा व नेटवर्क',
    aliasesEn: ['telecom', 'telecommunications', 'cellular', 'mobile networks', 'broadband', 'towers', 'optical fiber', '5g'],
    aliasesMr: ['दूरसंचार', 'टेलिकॉम', 'मोबाईल नेटवर्क', 'ब्रॉडबँड', 'टेलिकॉम टॉवर', 'ऑप्टिकल फायबर'],
    descriptionEn: 'Mobile network providers, telecom infrastructure operators, fiber-optic network providers, and communication services.',
    descriptionMr: 'मोबाईल नेटवर्क ऑपरेटर, दूरसंचार पायाभूत सुविधा (टॉवर्स), इंटरनेट ब्रॉडबँड आणि ऑप्टिकल फायबर सेवा कंपन्या.',
  },
  {
    id: 'sec-textiles',
    slug: 'textiles-apparel',
    nameEn: 'Textiles, Apparel & Fashion',
    nameMr: 'कापड, वस्त्रोद्योग व फॅशन',
    aliasesEn: ['textiles', 'textile', 'apparel', 'garments', 'fashion', 'clothing', 'cotton', 'yarn', 'silk', 'fabrics', 'lifestyle'],
    aliasesMr: ['कापड', 'वस्त्रोद्योग', 'फॅशन', 'कपडे', 'सुती कापड', 'धागा', 'गारमेंट्स'],
    descriptionEn: 'Spinning, weaving, textile processing, readymade garments, apparel exporters, and fashion lifestyle manufacturers.',
    descriptionMr: 'सुती व कृत्रिम धागा, कापड गिरण्या, तयार कपडे, फॅशन ब्रँड्स आणि वस्त्रोद्योग उत्पादक कंपन्या.',
  },
  {
    id: 'sec-realty',
    slug: 'real-estate',
    nameEn: 'Real Estate & Properties',
    nameMr: 'स्थावर मालमत्ता (रिअल इस्टेट)',
    aliasesEn: ['realty', 'real estate', 'property', 'properties', 'housing', 'residential', 'commercial real estate', 'reits'],
    aliasesMr: ['रिअल इस्टेट', 'स्थावर मालमत्ता', 'गृहनिर्माण', 'प्रॉपर्टी', 'जमीन', 'इमारती'],
    descriptionEn: 'Residential and commercial real estate developers, property managers, townships, and REITs.',
    descriptionMr: 'निवासी व व्यावसायिक गृहप्रकल्प, टाउनशिप, मॉल्स व व्यावसायिक संकुले उभारणाऱ्या बांधकाम कंपन्या.',
  },
  {
    id: 'sec-media',
    slug: 'media-entertainment',
    nameEn: 'Media & Entertainment',
    nameMr: 'प्रसारमाध्यमे व मनोरंजन',
    aliasesEn: ['media', 'entertainment', 'broadcasting', 'publishing', 'cinema', 'multiplexes', 'television', 'radio', 'streaming'],
    aliasesMr: ['प्रसारमाध्यमे', 'मनोरंजन', 'चित्रपट', 'टीव्ही चॅनेल्स', 'सिनेमागृहे', 'वृत्तपत्रे', 'मीडिया'],
    descriptionEn: 'Television broadcasting networks, film production studios, multiplex cinema operators, newspaper publishing, and digital entertainment.',
    descriptionMr: 'टेलिव्हिजन वाहिन्या, चित्रपट निर्मिती, मल्टिप्लेक्स थिएटर्स, वृत्तपत्र प्रकाशक आणि डिजिटल मीडिया कंपन्या.',
  },
  {
    id: 'sec-hospitality',
    slug: 'hospitality-tourism',
    nameEn: 'Hospitality, Hotels & Tourism',
    nameMr: 'हॉटेल्स, पर्यटन व आदरातिथ्य',
    aliasesEn: ['hotel', 'hotels', 'resorts', 'hospitality', 'tourism', 'restaurants', 'travel', 'leisure'],
    aliasesMr: ['हॉटेल्स', 'पर्यटन', 'आदरातिथ्य', 'रिसॉर्ट्स', 'उपाहारगृहे'],
    descriptionEn: 'Luxury hotel chains, boutique resorts, leisure destinations, travel agencies, and fine-dining restaurants.',
    descriptionMr: 'हॉटेल्स, रिसॉर्ट्स, रेस्टॉरंट्स आणि आंतरराष्ट्रीय पर्यटन सेवा देणाऱ्या नामांकित कंपन्या.',
  },
  {
    id: 'sec-logistics',
    slug: 'logistics-shipping',
    nameEn: 'Logistics, Shipping & Aviation',
    nameMr: 'वाहतूक, लॉजिस्टिक्स व शिपिंग',
    aliasesEn: ['logistics', 'shipping', 'ports', 'aviation', 'airlines', 'courier', 'transport', 'freight', 'warehousing'],
    aliasesMr: ['लॉजिस्टिक्स', 'वाहतूक', 'शिपिंग', 'बंदरे', 'विमान वाहतूक', 'गोदामे', 'मालवाहतूक'],
    descriptionEn: 'Port operators, commercial airlines, sea freight shipping, express courier services, supply chain, and container warehousing.',
    descriptionMr: 'सागरी बंदरे, मालवाहतूक जहाजे, विमान कंपन्या, एक्स्प्रेस कुरिअर सेवा आणि पुरवठा साखळी व वेअरहाऊसिंग कंपन्या.',
  },
  {
    id: 'sec-agriculture',
    slug: 'agriculture-sugar',
    nameEn: 'Agriculture, Sugar & Agro-Products',
    nameMr: 'शेती, साखर व कृषी उत्पादने',
    aliasesEn: ['agriculture', 'sugar', 'agro', 'tea', 'coffee', 'seeds', 'edible oil', 'poultry', 'dairy'],
    aliasesMr: ['शेती', 'साखर', 'कृषी', 'चहा', 'कॉफी', 'बियाणे', 'खाद्यतेल', 'दुग्धव्यवसाय'],
    descriptionEn: 'Sugar mills, distilleries, tea and coffee plantations, hybrid seed cultivation, edible oil processing, and dairy farming.',
    descriptionMr: 'साखर कारखाने, इथेनॉल प्रकल्प, चहा व कॉफीच्या बागा, बियाणे, खाद्यतेल आणि दुग्ध उत्पादक कृषी कंपन्या.',
  },
  {
    id: 'sec-paper',
    slug: 'paper-packaging',
    nameEn: 'Paper, Forest Products & Packaging',
    nameMr: 'कागद व पॅकेजिंग उद्योग',
    aliasesEn: ['paper', 'packaging', 'corrugated boxes', 'pulp', 'cartons', 'flexible packaging'],
    aliasesMr: ['कागद', 'पॅकेजिंग', 'पुठ्ठा', 'कागदी पिशव्या', 'कार्टन्स'],
    descriptionEn: 'Manufacturers of industrial paper, writing and printing paper, corrugated packaging, and flexible packaging solutions.',
    descriptionMr: 'औद्योगिक व छपाईचा कागद, पुठ्ठा, खोकी आणि आधुनिक पॅकेजिंग साहित्य तयार करणाऱ्या कंपन्या.',
  },
  {
    id: 'sec-services',
    slug: 'commercial-services',
    nameEn: 'Commercial Services & Trading',
    nameMr: 'व्यावसायिक सेवा व व्यापार',
    aliasesEn: ['services', 'trading', 'consulting', 'distribution', 'e-commerce', 'staffing', 'retail'],
    aliasesMr: ['सेवा', 'व्यापार', 'वितरण', 'सल्लागार', 'किरकोळ व्यापार', 'ई-कॉमर्स'],
    descriptionEn: 'Wholesale trading, retail store chains, business consulting, corporate staffing, security solutions, and commercial trading.',
    descriptionMr: 'घाऊक व किरकोळ व्यापार, व्यावसायिक सल्लागार, मनुष्यबळ पुरवठा आणि व्यापारी सेवा देणाऱ्या संस्था.',
  },
  {
    id: 'sec-diversified',
    slug: 'diversified',
    nameEn: 'Diversified Conglomerates',
    nameMr: 'विविध बहुक्षेत्रीय उद्योग',
    aliasesEn: ['diversified', 'conglomerate', 'holding company', 'multi-business', 'group'],
    aliasesMr: ['विविध उद्योग', 'बहुक्षेत्रीय', 'होल्डिंग कंपनी', 'उद्योग समूह'],
    descriptionEn: 'Large multi-business conglomerates operating across multiple unrelated industries and industrial sectors.',
    descriptionMr: 'एकाच वेळी अनेक वेगवेगळ्या औद्योगिक क्षेत्रांमध्ये कार्यरत असणारे मोठे बहुउद्योग समूह.',
  },
];

// Top specific companies mapping (Nifty 50 + Key Index leaders)
const EXACT_SYMBOL_MAP: Record<string, { slug: string; industryEn: string; industryMr: string }> = {
  // Automobiles
  'TATAMOTORS': { slug: 'automobile', industryEn: 'Automobiles - Commercial & PV', industryMr: 'व्यावसायिक व प्रवासी वाहने' },
  'MARUTI': { slug: 'automobile', industryEn: 'Passenger Cars & Utility Vehicles', industryMr: 'प्रवासी मोटारी' },
  'M&M': { slug: 'automobile', industryEn: 'Automobiles & Farm Equipment', industryMr: 'वाहने व कृषी यंत्रसामग्री' },
  'BAJAJ-AUTO': { slug: 'automobile', industryEn: 'Two & Three Wheelers', industryMr: 'दुचाकी व तीनचाकी वाहने' },
  'EICHERMOT': { slug: 'automobile', industryEn: 'Motorcycles & Commercial Vehicles', industryMr: 'मोटारसायकल व व्यावसायिक वाहने' },
  'HEROMOTOCO': { slug: 'automobile', industryEn: 'Two Wheelers', industryMr: 'दुचाकी वाहने' },
  'TVSMOTOR': { slug: 'automobile', industryEn: 'Two & Three Wheelers', industryMr: 'दुचाकी व तीनचाकी वाहने' },
  'ASHOKLEY': { slug: 'automobile', industryEn: 'Commercial Vehicles', industryMr: 'व्यावसायिक वाहने' },
  'BHARATFORG': { slug: 'automobile', industryEn: 'Auto Ancillaries & Forgings', industryMr: 'ऑटो सुटे भाग व फोर्जिंग' },
  'MRF': { slug: 'automobile', industryEn: 'Tyres & Rubber Products', industryMr: 'टायर्स व रबर उत्पादने' },
  'APOLLOTYRE': { slug: 'automobile', industryEn: 'Tyres & Rubber Products', industryMr: 'टायर्स व रबर उत्पादने' },
  'BALKRISIND': { slug: 'automobile', industryEn: 'Off-Highway Tyres', industryMr: 'विशिष्ट औद्योगिक टायर्स' },
  'BOSCHLTD': { slug: 'automobile', industryEn: 'Auto Parts & Systems', industryMr: 'ऑटो पार्ट्स व इलेक्ट्रॉनिक्स' },
  'MOTHERSON': { slug: 'automobile', industryEn: 'Auto Wiring & Components', industryMr: 'ऑटो वायरिंग व सुटे भाग' },

  // Banking & Financial Services
  'HDFCBANK': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'ICICIBANK': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'SBIN': { slug: 'banking-finance', industryEn: 'Public Sector Bank', industryMr: 'सार्वजनिक क्षेत्रातील बँक' },
  'KOTAKBANK': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'AXISBANK': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'BAJFINANCE': { slug: 'banking-finance', industryEn: 'NBFC - Retail Lending', industryMr: 'वित्तीय संस्था - ग्राहक कर्ज' },
  'BAJAJFINSV': { slug: 'banking-finance', industryEn: 'Financial Services & Insurance', industryMr: 'वित्तीय सेवा व विमा' },
  'INDUSINDBK': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'BANKBARODA': { slug: 'banking-finance', industryEn: 'Public Sector Bank', industryMr: 'सार्वजनिक क्षेत्रातील बँक' },
  'PNB': { slug: 'banking-finance', industryEn: 'Public Sector Bank', industryMr: 'सार्वजनिक क्षेत्रातील बँक' },
  'CANBK': { slug: 'banking-finance', industryEn: 'Public Sector Bank', industryMr: 'सार्वजनिक क्षेत्रातील बँक' },
  'UNIONBANK': { slug: 'banking-finance', industryEn: 'Public Sector Bank', industryMr: 'सार्वजनिक क्षेत्रातील बँक' },
  'IDFCFIRSTB': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'FEDERALBNK': { slug: 'banking-finance', industryEn: 'Private Sector Bank', industryMr: 'खाजगी क्षेत्रातील बँक' },
  'MUTHOOTFIN': { slug: 'banking-finance', industryEn: 'Gold Loans NBFC', industryMr: 'सुवर्ण कर्ज वित्तीय संस्था' },
  'CHOLAFIN': { slug: 'banking-finance', industryEn: 'Vehicle Finance NBFC', industryMr: 'वाहन कर्ज वित्तीय संस्था' },
  'SHRIRAMFIN': { slug: 'banking-finance', industryEn: 'Commercial Vehicle NBFC', industryMr: 'व्यावसायिक वित्तीय संस्था' },
  'CDSL': { slug: 'banking-finance', industryEn: 'Securities Depository Services', industryMr: 'डिपॉझिटरी व रोखे सेवा' },
  'MCX': { slug: 'banking-finance', industryEn: 'Commodity Exchange', industryMr: 'कमोडिटी एक्सचेंज' },
  'BSE': { slug: 'banking-finance', industryEn: 'Stock Exchange', industryMr: 'शेअर बाजार' },

  // IT & Software
  'TCS': { slug: 'information-technology', industryEn: 'IT Services & Consulting', industryMr: 'आयटी सेवा व सल्लागार' },
  'INFY': { slug: 'information-technology', industryEn: 'IT Services & Digital', industryMr: 'आयटी सेवा व डिजिटल' },
  'HCLTECH': { slug: 'information-technology', industryEn: 'IT Services & Engineering', industryMr: 'आयटी सेवा व अभियांत्रिकी' },
  'WIPRO': { slug: 'information-technology', industryEn: 'IT Services & Consulting', industryMr: 'आयटी सेवा व सल्लागार' },
  'TECHM': { slug: 'information-technology', industryEn: 'IT & Telecom Services', industryMr: 'आयटी व टेलिकॉम सेवा' },
  'LTIM': { slug: 'information-technology', industryEn: 'IT Consulting & Services', industryMr: 'आयटी सल्लागार व सेवा' },
  'PERSISTENT': { slug: 'information-technology', industryEn: 'Digital Product Engineering', industryMr: 'डिजिटल उत्पादन अभियांत्रिकी' },
  'COFORGE': { slug: 'information-technology', industryEn: 'IT Solutions & Services', industryMr: 'आयटी सोल्यूशन्स व सेवा' },
  'MPHASIS': { slug: 'information-technology', industryEn: 'Cloud & Cognitive Services', industryMr: 'क्लाउड व कॉग्निटिव्ह सेवा' },
  'TATAELXSI': { slug: 'information-technology', industryEn: 'Design & Technology Services', industryMr: 'डिझाईन व तंत्रज्ञान सेवा' },
  'KPITTECH': { slug: 'information-technology', industryEn: 'Automotive Software Services', industryMr: 'ऑटोमोटिव्ह सॉफ्टवेअर सेवा' },
  'ZOMATO': { slug: 'information-technology', industryEn: 'E-Commerce & Food Delivery', industryMr: 'ई-कॉमर्स व फूड डिलिव्हरी' },
  'NAUKRI': { slug: 'information-technology', industryEn: 'Online Classifieds & Tech', industryMr: 'ऑनलाईन प्लॅटफॉर्म' },

  // FMCG
  'HINDUNILVR': { slug: 'fmcg', industryEn: 'FMCG - Household & Personal Care', industryMr: 'घरगुती व वैयक्तिक काळजी उत्पादने' },
  'ITC': { slug: 'fmcg', industryEn: 'FMCG, Cigarettes, Hotels & Paper', industryMr: 'ग्राहकोपयोगी वस्तू, हॉटेल्स व कागद' },
  'NESTLEIND': { slug: 'fmcg', industryEn: 'Packaged Foods & Beverages', industryMr: 'पॅक केलेले अन्नपदार्थ व पेये' },
  'BRITANNIA': { slug: 'fmcg', industryEn: 'Biscuits, Dairy & Bakery', industryMr: 'बिस्किटे, बेकरी व दुग्ध उत्पादने' },
  'DABUR': { slug: 'fmcg', industryEn: 'Ayurvedic & Natural Health Care', industryMr: 'आयुर्वेदिक व नैसर्गिक आरोग्य उत्पादने' },
  'MARICO': { slug: 'fmcg', industryEn: 'Hair Oils & Health Foods', industryMr: 'केसांचे तेल व आरोग्यदायी अन्न' },
  'GODREJCP': { slug: 'fmcg', industryEn: 'Personal Wash & Household Insecticides', industryMr: 'घरगुती कीटकनाशके व साबण' },
  'VBL': { slug: 'fmcg', industryEn: 'Carbonated Soft Drinks Bottling', industryMr: 'शीतपेये व बॉटलिंग' },
  'COLPAL': { slug: 'fmcg', industryEn: 'Oral Care & Toothpastes', industryMr: 'टूथपेस्ट व दंत स्वच्छता' },
  'PGHH': { slug: 'fmcg', industryEn: 'Feminine & Healthcare Products', industryMr: 'आरोग्य व स्वच्छता उत्पादने' },
  'TATACONSUM': { slug: 'fmcg', industryEn: 'Tea, Coffee, Salt & Foods', industryMr: 'चहा, कॉफी, मीठ व अन्नपदार्थ' },
  'EMAMILTD': { slug: 'fmcg', industryEn: 'Ayurvedic & Personal Care', industryMr: 'आयुर्वेदिक सौंदर्य उत्पादने' },

  // Healthcare & Pharma
  'SUNPHARMA': { slug: 'healthcare-pharma', industryEn: 'Specialty & Generic Pharmaceuticals', industryMr: 'स्पेशालिटी व जेनेरिक औषधे' },
  'DRREDDY': { slug: 'healthcare-pharma', industryEn: 'Generic Formulations & APIs', industryMr: 'जेनेरिक औषधे व APIs' },
  'CIPLA': { slug: 'healthcare-pharma', industryEn: 'Respiratory & Anti-infectives', industryMr: 'श्वसन व अँटीबायोटिक औषधे' },
  'DIVISLAB': { slug: 'healthcare-pharma', industryEn: 'Active Pharma Ingredients (APIs)', industryMr: 'औषध निर्मितीसाठी लागणारे APIs' },
  'APOLLOHOSP': { slug: 'healthcare-pharma', industryEn: 'Multi-Specialty Hospital Network', industryMr: 'सुपर-स्पेशालिटी रुग्णालये व फार्मसी' },
  'LUPIN': { slug: 'healthcare-pharma', industryEn: 'Generic Drugs & Formulations', industryMr: 'जेनेरिक औषधे' },
  'AUROPHARMA': { slug: 'healthcare-pharma', industryEn: 'Generic Formulations & Peptides', industryMr: 'जेनेरिक औषधे व पेप्टाइड्स' },
  'TORNTPHARM': { slug: 'healthcare-pharma', industryEn: 'Cardiovascular & CNS Medicines', industryMr: 'हृदयरोग व मेंदू विकार औषधे' },
  'ALKEM': { slug: 'healthcare-pharma', industryEn: 'Anti-infectives & Formulations', industryMr: 'अँटी-इन्फेक्टीव्ह औषधे' },
  'MANKIND': { slug: 'healthcare-pharma', industryEn: 'Consumer Healthcare & Formulations', industryMr: 'आरोग्य उत्पादने व औषधे' },
  'ABBOTT': { slug: 'healthcare-pharma', industryEn: 'Pharmaceuticals & Formulations', industryMr: 'औषध निर्मिती' },
  'ABBOTINDIA': { slug: 'healthcare-pharma', industryEn: 'Pharmaceuticals & Formulations', industryMr: 'औषध निर्मिती' },

  // Energy & Power
  'RELIANCE': { slug: 'energy-power', industryEn: 'Oil Refining, Petrochemicals & Telecom', industryMr: 'तेल शुद्धीकरण, पेट्रोकेमिकल्स व टेलिकॉम' },
  'ONGC': { slug: 'energy-power', industryEn: 'Oil & Natural Gas Exploration', industryMr: 'कच्चे तेल व नैसर्गिक वायू उत्खनन' },
  'NTPC': { slug: 'energy-power', industryEn: 'Thermal & Renewable Power Generation', industryMr: 'औष्णिक व सौर वीज निर्मिती' },
  'POWERGRID': { slug: 'energy-power', industryEn: 'Electric Power Transmission', industryMr: 'वीज वहन व ट्रान्समिशन' },
  'BPCL': { slug: 'energy-power', industryEn: 'Petroleum Refining & Marketing', industryMr: 'पेट्रोलियम शुद्धीकरण व विपणन' },
  'IOC': { slug: 'energy-power', industryEn: 'Petroleum Refining & Retail', industryMr: 'पेट्रोलियम रिफायनरी व विक्री' },
  'COALINDIA': { slug: 'energy-power', industryEn: 'Coal Mining & Production', industryMr: 'कोळसा खाणकाम व उत्पादन' },
  'GAIL': { slug: 'energy-power', industryEn: 'Natural Gas Transmission & Marketing', industryMr: 'नैसर्गिक वायू वितरण व पाइपलाईन' },
  'TATAPOWER': { slug: 'energy-power', industryEn: 'Integrated Power & Renewable Solar', industryMr: 'वीज निर्मिती व सौर ऊर्जा' },
  'ADANIGREEN': { slug: 'energy-power', industryEn: 'Solar & Wind Renewable Energy', industryMr: 'सौर व पवन ऊर्जा प्रकल्प' },
  'ADANIPOWER': { slug: 'energy-power', industryEn: 'Thermal Power Generation', industryMr: 'औष्णिक वीज निर्मिती' },
  'NHPC': { slug: 'energy-power', industryEn: 'Hydroelectric Power Generation', industryMr: 'जलविद्युत निर्मिती' },

  // Metals & Mining
  'TATASTEEL': { slug: 'metals-mining', industryEn: 'Integrated Steel Manufacturing', industryMr: 'एकात्मिक पोलाद निर्मिती' },
  'JSWSTEEL': { slug: 'metals-mining', industryEn: 'Flat & Long Steel Products', industryMr: 'पोलाद व स्टील उत्पादने' },
  'HINDALCO': { slug: 'metals-mining', industryEn: 'Aluminum & Copper Products', industryMr: 'अ‍ॅल्युमिनियम व तांबे उत्पादन' },
  'VEDL': { slug: 'metals-mining', industryEn: 'Zinc, Lead, Silver & Oil', industryMr: 'जस्त, शिसे, चांदी व खनिजे' },
  'JINDALSTEL': { slug: 'metals-mining', industryEn: 'Steel & Power Infrastructure', industryMr: 'स्टील व पॉवर' },
  'SAIL': { slug: 'metals-mining', industryEn: 'Public Sector Steel Production', industryMr: 'सार्वजनिक क्षेत्रातील पोलाद निर्मिती' },
  'NMDC': { slug: 'metals-mining', industryEn: 'Iron Ore Mining', industryMr: 'लोहखनिज खाणकाम' },
  'NATIONALUM': { slug: 'metals-mining', industryEn: 'Bauxite Mining & Alumina Refining', industryMr: 'बॉक्साईट खाण व अ‍ॅल्युमिना' },
  '20MICRONS': { slug: 'metals-mining', industryEn: 'Industrial Minerals & Micronized Products', industryMr: 'औद्योगिक खनिजे' },

  // Chemicals
  'PIDILITIND': { slug: 'chemicals', industryEn: 'Adhesives, Sealants & Construction Chemicals', industryMr: 'अ‍ॅडहेसिव्ह, फेविकॉल व बांधकाम रसायने' },
  'SRF': { slug: 'chemicals', industryEn: 'Fluorochemicals & Technical Textiles', industryMr: 'फ्लोरोकेमिकल्स व तांत्रिक कापड' },
  'AARTIIND': { slug: 'chemicals', industryEn: 'Specialty Chemicals & Intermediates', industryMr: 'स्पेशालिटी रसायने' },
  'DEEPAKNTR': { slug: 'chemicals', industryEn: 'Sodium Nitrite, Phenol & Acetone', industryMr: 'सोडियम नायट्राइट व फेनॉल' },
  'TATACHEM': { slug: 'chemicals', industryEn: 'Soda Ash, Bicarb & Agro Sciences', industryMr: 'सोडा अ‍ॅश व औद्योगिक रसायने' },
  'UPL': { slug: 'chemicals', industryEn: 'Agrochemicals & Crop Protection', industryMr: 'कृषी रसायने व पीक संरक्षण' },
  'COROMANDEL': { slug: 'chemicals', industryEn: 'Fertilizers & Nutrients', industryMr: 'रासायनिक खते व पोषक घटक' },
  'ATUL': { slug: 'chemicals', industryEn: 'Dyes, Polymers & Crop Protection', industryMr: 'रंग, पॉलिमर व रसायने' },

  // Capital Goods & Infra
  'LT': { slug: 'capital-goods-infra', industryEn: 'Engineering, Procurement & Construction', industryMr: 'अभियांत्रिकी व पायाभूत सुविधा' },
  'SIEMENS': { slug: 'capital-goods-infra', industryEn: 'Industrial Automation & Smart Grid', industryMr: 'औद्योगिक ऑटोमेशन व ऊर्जा यंत्रणा' },
  'ABB': { slug: 'capital-goods-infra', industryEn: 'Electrification & Robotics', industryMr: 'विद्युतीकरण व रोबोटिक्स' },
  'BHEL': { slug: 'capital-goods-infra', industryEn: 'Power Plant Equipment & Heavy Electricals', industryMr: 'विद्युत निर्मिती उपकरणे' },
  'HAVELLS': { slug: 'consumer-durables', industryEn: 'Fast Moving Electrical Goods', industryMr: 'विद्युत उपकरणे, केबल्स व स्विचेस' },
  'CUMMINSIND': { slug: 'capital-goods-infra', industryEn: 'Diesel & Natural Gas Engines', industryMr: 'डिझेल इंजिन व जनरेटर्स' },
  'THERMAX': { slug: 'capital-goods-infra', industryEn: 'Boilers, Heating & Water Treatment', industryMr: 'बॉयलर्स व जलशुद्धीकरण यंत्रणा' },
  'HAL': { slug: 'capital-goods-infra', industryEn: 'Aerospace & Defence Aircraft', industryMr: 'संरक्षण विमान व एरोस्पेस निर्मिती' },
  'BEL': { slug: 'capital-goods-infra', industryEn: 'Defence Electronics & Radars', industryMr: 'संरक्षण इलेक्ट्रॉनिक्स व रडार' },
  'ACC': { slug: 'capital-goods-infra', industryEn: 'Cement & Building Materials', industryMr: 'सिमेंट व बांधकाम साहित्य' },
  'AMBUJACEM': { slug: 'capital-goods-infra', industryEn: 'Cement & Concrete', industryMr: 'सिमेंट व काँक्रीट' },
  'ULTRACEMCO': { slug: 'capital-goods-infra', industryEn: 'Grey & White Cement', industryMr: 'सिमेंट उद्योग' },

  // Consumer Durables
  'TITAN': { slug: 'consumer-durables', industryEn: 'Jewellery, Watches & Eyewear', industryMr: 'दागिने (तनिष्क), घड्याळे व चष्मे' },
  'VOLTAS': { slug: 'consumer-durables', industryEn: 'Air Conditioning & Commercial Refrigeration', industryMr: 'एअर कंडिशनर व रेफ्रिजरेशन' },
  'WHIRLPOOL': { slug: 'consumer-durables', industryEn: 'Home Appliances - Refrigerators & Washers', industryMr: 'रेफ्रिजरेटर्स व वॉशिंग मशीन' },
  'CROMPTON': { slug: 'consumer-durables', industryEn: 'Fans, Lighting & Home Appliances', industryMr: 'पंख्यांची निर्मिती, दिवे व उपकरणे' },
  'BLUESTARCO': { slug: 'consumer-durables', industryEn: 'Air Conditioners & Water Purifiers', industryMr: 'एसी व जलशुद्धीकरण उपकरणे' },

  // Telecom
  'BHARTIARTL': { slug: 'telecommunications', industryEn: 'Mobile Telecom Services & 5G', industryMr: 'मोबाईल टेलिकॉम सेवा व ५जी' },
  'INDUSTOWER': { slug: 'telecommunications', industryEn: 'Telecom Tower Infrastructure', industryMr: 'मोबाईल टॉवर पायाभूत सुविधा' },
  'TATACOMM': { slug: 'telecommunications', industryEn: 'Enterprise Data & Cloud Connectivity', industryMr: 'डेटा नेटवर्क व क्लाउड कनेक्टिव्हिटी' },
  'IDEA': { slug: 'telecommunications', industryEn: 'Cellular Mobile Services', industryMr: 'मोबाईल दूरसंचार सेवा' },

  // Realty
  'DLF': { slug: 'real-estate', industryEn: 'Residential & Commercial Real Estate', industryMr: 'निवासी व व्यावसायिक बांधकाम' },
  'GODREJPROP': { slug: 'real-estate', industryEn: 'Residential Real Estate Development', industryMr: 'निवासी गृहप्रकल्प' },
  'OBEROIRLTY': { slug: 'real-estate', industryEn: 'Premium Residential & Commercial Towers', industryMr: 'प्रीमियम गृहप्रकल्प व मॉल्स' },
  'PHOENIXLTD': { slug: 'real-estate', industryEn: 'Retail Shopping Malls & Commercial Spaces', industryMr: 'शॉपिंग मॉल्स व व्यावसायिक संकुले' },
  'PRESTIGE': { slug: 'real-estate', industryEn: 'Townships & Commercial Parks', industryMr: 'टाउनशिप व टेक पार्क्स' },

  // Hospitality
  'INDHOTEL': { slug: 'hospitality-tourism', industryEn: 'Luxury Hotels & Resorts (Taj)', industryMr: 'लक्झरी हॉटेल्स व रिसॉर्ट्स (ताज)' },
  'EIHOTEL': { slug: 'hospitality-tourism', industryEn: 'Hotels & Resorts (Oberoi)', industryMr: 'हॉटेल्स व रिसॉर्ट्स (ओबेरॉय)' },
  'LEMONTREE': { slug: 'hospitality-tourism', industryEn: 'Mid-Scale Business Hotels', industryMr: 'बिझनेस हॉटेल्स' },

  // Logistics & Travel
  'IRCTC': { slug: 'logistics-shipping', industryEn: 'Railway Ticketing, Tourism & Catering', industryMr: 'रेल्वे तिकीट, पर्यटन व कॅटरिंग' },
  'INDIGO': { slug: 'logistics-shipping', industryEn: 'Passenger Airline Transportation', industryMr: 'विमान प्रवासी वाहतूक (इंडिगो)' },
  'CONCOR': { slug: 'logistics-shipping', industryEn: 'Container Rail Freight Logistics', industryMr: 'रेल्वे कंटेनर मालवाहतूक' },
  'BLUEDART': { slug: 'logistics-shipping', industryEn: 'Air Express Courier & Cargo', industryMr: 'एक्स्प्रेस कुरिअर व कार्गो' },
  'DELHIVERY': { slug: 'logistics-shipping', industryEn: 'Supply Chain & E-Commerce Logistics', industryMr: 'ई-कॉमर्स लॉजिस्टिक सेवा' },

  // Paints & Coatings
  'ASIANPAINT': { slug: 'consumer-durables', industryEn: 'Decorative Paints & Home Decor', industryMr: 'घरगुती रंग (पेंट्स) व डेकोर' },
  'BERGEPAINT': { slug: 'consumer-durables', industryEn: 'Decorative & Industrial Paints', industryMr: 'औद्योगिक व घरगुती रंग' },
  'KANSAINER': { slug: 'consumer-durables', industryEn: 'Automotive & Decorative Paints', industryMr: 'ऑटोमोटिव्ह व डेकोरेटिव्ह रंग' },
};

// Keyword-based classification heuristics
const KEYWORD_PATTERNS: Array<{
  keywords: string[];
  slug: string;
  industryEn: string;
  industryMr: string;
}> = [
  // Banking, NBFC, AMC & Financial
  {
    keywords: [
      'bank', 'finance', 'finvest', 'financial', 'leasing', 'securities', 'capital', 'credit', 'invest',
      'wealth', 'nbfc', 'fincap', 'holdings', 'amc', 'wam', 'fund', 'mortgage', 'asset', 'trust',
      'microfinance', 'fintech', 'insurance', 'brok', 'mutual fund', 'chit fund'
    ],
    slug: 'banking-finance',
    industryEn: 'Banking & Financial Services',
    industryMr: 'बँका व वित्तीय सेवा',
  },
  // Pharma & Healthcare
  {
    keywords: [
      'pharma', 'drug', 'medic', 'laborator', 'biotech', 'hospital', 'remed', 'health', 'clinic',
      'lifescience', 'therap', 'formulat', 'diagnost', 'biomed', 'surgical', 'injectable', 'pathol',
      'care', 'curative', 'ayurved', 'homeo', 'herb', 'dx limited', 'dx ltd'
    ],
    slug: 'healthcare-pharma',
    industryEn: 'Pharmaceuticals & Healthcare',
    industryMr: 'औषध निर्माण व आरोग्य सेवा',
  },
  // IT & Tech
  {
    keywords: [
      'technol', 'software', 'infotech', 'digital', 'systems', 'cyber', 'computers', 'solut',
      'info sys', 'data', 'consultancy', 'knowledgeware', 'infoway', 'web', 'internet', 'e-com',
      'cloud', 'telecom', 'networks', 'analytics', 'teletec'
    ],
    slug: 'information-technology',
    industryEn: 'Information Technology & Software',
    industryMr: 'माहिती तंत्रज्ञान व सॉफ्टवेअर',
  },
  // Hospitality & Tourism
  {
    keywords: ['hotel', 'resort', 'palace', 'motel', 'inn', 'lodg', 'restaurant', 'dine', 'hospitality', 'tourism', 'holiday'],
    slug: 'hospitality-tourism',
    industryEn: 'Hotels, Resorts & Tourism',
    industryMr: 'हॉटेल्स, रिसॉर्ट्स व पर्यटन',
  },
  // Automobile
  {
    keywords: ['motor', 'auto', 'wheel', 'tyre', 'tire', 'vehic', 'engine', 'clutch', 'brake', 'castings', 'forging', 'piston', 'batter', 'exide', 'ancillar'],
    slug: 'automobile',
    industryEn: 'Automotive & Components',
    industryMr: 'वाहन व सुटे भाग',
  },
  // Chemicals & Fertilizers
  {
    keywords: [
      'chemic', 'organics', 'petrochem', 'fertiliz', 'resin', 'polymer', 'pigment', 'dye', 'pesticid',
      'carbon', 'alkali', 'acid', 'chlor', 'aether', 'specialty', 'catalyst', 'aroma', 'flavour', 'fragrance',
      'adhesive', 'coating', 'latex', 'amine', 'aniline', 'phosph'
    ],
    slug: 'chemicals',
    industryEn: 'Chemicals & Allied Products',
    industryMr: 'रासायनिक उत्पादने',
  },
  // Metals & Mining
  {
    keywords: [
      'steel', 'iron', 'metal', 'alloy', 'min', 'copper', 'zinc', 'alum', 'forge', 'ore', 'tube',
      'pipe', 'wires', 'ferro', 'ingot', 'aeroflex', 'seamless', 'smelt', 'foundry', 'refract', 'lead'
    ],
    slug: 'metals-mining',
    industryEn: 'Metals & Mining',
    industryMr: 'धातू व खाणकाम',
  },
  // Energy & Power
  {
    keywords: ['power', 'energy', 'oil', 'gas', 'petrol', 'solar', 'wind', 'electr', 'hydro', 'thermal', 'refin', 'fuel', 'renew', 'solonics'],
    slug: 'energy-power',
    industryEn: 'Power & Energy',
    industryMr: 'ऊर्जा व वीज',
  },
  // Infrastructure & Construction
  {
    keywords: ['infra', 'construct', 'engineer', 'cement', 'build', 'project', 'struct', 'heavy', 'equip', 'machin', 'contract', 'weld', 'crane', 'valve', 'pump', 'switchgear'],
    slug: 'capital-goods-infra',
    industryEn: 'Infrastructure & Capital Goods',
    industryMr: 'पायाभूत सुविधा व अभियांत्रिकी',
  },
  // Real Estate
  {
    keywords: ['realt', 'estate', 'proper', 'housing', 'homes', 'shelter', 'land', 'develop', 'residency', 'realtor', 'township'],
    slug: 'real-estate',
    industryEn: 'Real Estate & Properties',
    industryMr: 'स्थावर मालमत्ता (रिअल इस्टेट)',
  },
  // Textiles, Fashion & Apparel
  {
    keywords: [
      'textil', 'fabric', 'yarn', 'cotton', 'silk', 'garment', 'apparel', 'fashion', 'mills',
      'wool', 'denim', 'knit', 'spin', 'weav', 'lifestyle', 'clothing', 'hosiery', 'linen'
    ],
    slug: 'textiles-apparel',
    industryEn: 'Textiles & Apparel',
    industryMr: 'कापड व वस्त्रोद्योग',
  },
  // FMCG & Consumer Goods
  {
    keywords: ['food', 'beverag', 'snack', 'biscuit', 'consumer', 'dairy', 'milk', 'cream', 'soap', 'detergent', 'personal care', 'confection', 'spice', 'flavor'],
    slug: 'fmcg',
    industryEn: 'Consumer Goods & Foods',
    industryMr: 'ग्राहकोपयोगी वस्तू व अन्नपदार्थ',
  },
  // Agriculture & Sugar
  {
    keywords: ['sugar', 'agro', 'seed', 'tea', 'coffee', 'plantat', 'grain', 'crop', 'distill', 'solv', 'edible oil', 'poultry'],
    slug: 'agriculture-sugar',
    industryEn: 'Agro & Sugar Industry',
    industryMr: 'कृषी व साखर उद्योग',
  },
  // Paper & Packaging
  {
    keywords: ['paper', 'packag', 'board', 'pulp', 'carton', 'corrugat', 'poly', 'plastic', 'contain', 'foil', 'laminat', 'corrug'],
    slug: 'paper-packaging',
    industryEn: 'Paper & Packaging',
    industryMr: 'कागद व पॅकेजिंग',
  },
  // Media & Entertainment
  {
    keywords: ['media', 'entertain', 'film', 'cinema', 'broadcast', 'publish', 'print', 'news', 'network', 'tele', 'studio', 'advertis', 'music', 'theatre'],
    slug: 'media-entertainment',
    industryEn: 'Media & Entertainment',
    industryMr: 'प्रसारमाध्यमे व मनोरंजन',
  },
  // Logistics & Transport
  {
    keywords: ['logistic', 'shipping', 'port', 'freight', 'transp', 'cargo', 'courier', 'express', 'airway', 'aviation', 'warehous', 'freight', 'haulage'],
    slug: 'logistics-shipping',
    industryEn: 'Logistics & Cargo',
    industryMr: 'लॉजिस्टिक्स व वाहतूक',
  },
  // Consumer Durables
  {
    keywords: ['applianc', 'electron', 'lamp', 'light', 'furnitur', 'glass', 'crockery', 'jewel', 'watch', 'clock', 'ceramic', 'tiles', 'sanitary', 'decor', 'ply'],
    slug: 'consumer-durables',
    industryEn: 'Consumer Durables & Electronics',
    industryMr: 'टिकाऊ ग्राहक वस्तू व इलेक्ट्रॉनिक्स',
  },
  // Commercial & Retail Services
  {
    keywords: ['trad', 'servic', 'retail', 'distribut', 'commercial', 'enterpris', 'venture', 'exim', 'export', 'import', 'mart', 'bazaar', 'merchand', 'suppl'],
    slug: 'commercial-services',
    industryEn: 'Commercial Services & Trading',
    industryMr: 'व्यावसायिक सेवा व व्यापार',
  },
  // Telecommunications
  {
    keywords: ['telecom', 'cellular', 'mobile', 'broadband', 'optical fiber', '5g', 'tower'],
    slug: 'telecommunications',
    industryEn: 'Telecommunications',
    industryMr: 'दूरसंचार सेवा व नेटवर्क',
  },
];

export async function runClassification() {
  const db = getDb();
  console.log('--- Initializing Sector Taxonomy Table ---');

  // Insert or replace all sector taxonomy records
  const insertTaxonomy = db.prepare(`
    INSERT INTO sector_taxonomy (
      id, slug, name_en, name_mr, aliases_en, aliases_mr, description_en, description_mr
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      name_en = excluded.name_en,
      name_mr = excluded.name_mr,
      aliases_en = excluded.aliases_en,
      aliases_mr = excluded.aliases_mr,
      description_en = excluded.description_en,
      description_mr = excluded.description_mr
  `);

  for (const s of SECTOR_TAXONOMY) {
    insertTaxonomy.run(
      s.id,
      s.slug,
      s.nameEn,
      s.nameMr,
      JSON.stringify(s.aliasesEn),
      JSON.stringify(s.aliasesMr),
      s.descriptionEn,
      s.descriptionMr
    );
  }
  console.log(`Populated ${SECTOR_TAXONOMY.length} normalized sector taxonomies.`);

  // Create taxonomy lookup map
  const taxonomyMap = new Map<string, SectorDefinition>();
  for (const s of SECTOR_TAXONOMY) {
    taxonomyMap.set(s.slug, s);
  }

  // Fetch all companies
  const companies = db.prepare('SELECT id, isin, nse_symbol, bse_code, bse_scrip_id, name FROM company').all() as any[];
  console.log(`Classifying ${companies.length} companies across all sectors...`);

  const updateCompanyStmt = db.prepare(`
    UPDATE company
    SET sector = ?, sector_mr = ?, industry = ?, industry_mr = ?, sector_slug = ?, updated_at = ?
    WHERE isin = ?
  `);

  const now = new Date().toISOString();
  let exactMatchCount = 0;
  let keywordMatchCount = 0;
  let defaultMatchCount = 0;

  db.exec('BEGIN TRANSACTION;');
  try {
    for (const comp of companies) {
      const isin = comp.isin;
      const nse = comp.nse_symbol ? comp.nse_symbol.toUpperCase() : '';
      const scripId = comp.bse_scrip_id ? comp.bse_scrip_id.toUpperCase() : '';
      const name = comp.name ? comp.name.toLowerCase() : '';

      let chosenSlug = '';
      let industryEn = '';
      let industryMr = '';

      // 1. Check exact symbol mappings
      if (nse && EXACT_SYMBOL_MAP[nse]) {
        const m = EXACT_SYMBOL_MAP[nse];
        chosenSlug = m.slug;
        industryEn = m.industryEn;
        industryMr = m.industryMr;
        exactMatchCount++;
      } else if (scripId && EXACT_SYMBOL_MAP[scripId]) {
        const m = EXACT_SYMBOL_MAP[scripId];
        chosenSlug = m.slug;
        industryEn = m.industryEn;
        industryMr = m.industryMr;
        exactMatchCount++;
      } else {
        // 2. High-precision keyword classifier on company name
        let matched = false;
        for (const pattern of KEYWORD_PATTERNS) {
          for (const kw of pattern.keywords) {
            if (name.includes(kw)) {
              chosenSlug = pattern.slug;
              industryEn = pattern.industryEn;
              industryMr = pattern.industryMr;
              matched = true;
              keywordMatchCount++;
              break;
            }
          }
          if (matched) break;
        }

        // 3. Fallback to diversified or commercial services
        if (!matched) {
          chosenSlug = 'diversified';
          industryEn = 'Diversified Operations';
          industryMr = 'विविध औद्योगिक कामकाज';
          defaultMatchCount++;
        }
      }

      const sectorDef = taxonomyMap.get(chosenSlug)!;
      updateCompanyStmt.run(
        sectorDef.nameEn,
        sectorDef.nameMr,
        industryEn,
        industryMr,
        chosenSlug,
        now,
        isin
      );
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }

  console.log(`Classification complete!`);
  console.log(`- Exact index constituent matches: ${exactMatchCount}`);
  console.log(`- Keyword pattern matches: ${keywordMatchCount}`);
  console.log(`- Fallback diversified matches: ${defaultMatchCount} (${((defaultMatchCount / companies.length) * 100).toFixed(1)}%)`);

  // Report distribution
  const counts = db.prepare(`
    SELECT sector_slug, sector, count(*) as count
    FROM company
    GROUP BY sector_slug
    ORDER BY count DESC
  `).all() as any[];

  console.log('\nSector Distribution Across Universe:');
  for (const c of counts) {
    console.log(`- ${c.sector} (${c.sector_slug}): ${c.count} companies`);
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('classifyCompanies')) {
  runClassification().catch(console.error);
}
