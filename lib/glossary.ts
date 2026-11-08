export interface GlossaryTerm {
  key: string;
  en: string;
  mr: string;
  definitionEn: string;
  definitionMr: string;
}

export const FINANCIAL_GLOSSARY: Record<string, GlossaryTerm> = {
  marketCap: {
    key: 'marketCap',
    en: 'Market Capitalization',
    mr: 'बाजार भांडवल (मार्केट कॅप)',
    definitionEn: 'The total value of a company\'s shares of stock.',
    definitionMr: 'कंपनीच्या सर्व समभागांचे एकूण बाजार मूल्य.',
  },
  peRatio: {
    key: 'peRatio',
    en: 'P/E Ratio',
    mr: 'पी/ई प्रमाण (P/E)',
    definitionEn: 'Price to Earnings ratio: stock price divided by earnings per share.',
    definitionMr: 'किंमत आणि नफा यांचे प्रमाण: शेअरचा भाव भागिले प्रति शेअर नफा.',
  },
  pbRatio: {
    key: 'pbRatio',
    en: 'P/B Ratio',
    mr: 'पी/बी प्रमाण (P/B)',
    definitionEn: 'Price to Book ratio: stock price divided by book value per share.',
    definitionMr: 'बाजार भाव आणि पुस्तकी मूल्य यांचे प्रमाण.',
  },
  dividendYield: {
    key: 'dividendYield',
    en: 'Dividend Yield',
    mr: 'लाभांश दर (डिव्हिडंड यील्ड)',
    definitionEn: 'Annual dividend payout as a percentage of the stock price.',
    definitionMr: 'शेअरच्या भावाच्या तुलनेत मिळणारा वार्षिक लाभांश.',
  },
  roe: {
    key: 'roe',
    en: 'Return on Equity (ROE)',
    mr: 'भांडवलावरील परतावा (ROE)',
    definitionEn: 'Net income returned as a percentage of shareholders equity.',
    definitionMr: 'भागधारकांच्या भांडवलावर मिळणारा निव्वळ परतावा टक्केवारी.',
  },
  roce: {
    key: 'roce',
    en: 'ROCE',
    mr: 'गुंतवलेल्या भांडवलावरील परतावा (ROCE)',
    definitionEn: 'Return on Capital Employed: profitability and capital efficiency.',
    definitionMr: 'व्यवसायात प्रत्यक्ष वापरलेल्या भांडवलावर मिळणारा नफा.',
  },
  eps: {
    key: 'eps',
    en: 'Earnings Per Share (EPS)',
    mr: 'प्रति समभाग नफा (EPS)',
    definitionEn: 'Company\'s profit divided by the outstanding shares.',
    definitionMr: 'एका शेअरमागे कंपनीने कमावलेला निव्वळ नफा.',
  },
  faceValue: {
    key: 'faceValue',
    en: 'Face Value',
    mr: 'दर्शनी मूल्य',
    definitionEn: 'The nominal or dollar/rupee value of a security as stated by the issuer.',
    definitionMr: 'कंपनीने ठरवून दिलेले शेअरचे मूळ अधिकृत मूल्य.',
  },
  debtToEquity: {
    key: 'debtToEquity',
    en: 'Debt to Equity',
    mr: 'कर्ज-भागभांडवल प्रमाण',
    definitionEn: 'Total liabilities divided by shareholders\' equity.',
    definitionMr: 'कंपनीचे एकूण कर्ज आणि भागभांडवल यांचे गुणोत्तर.',
  },
  fiftyTwoWeekHigh: {
    key: 'fiftyTwoWeekHigh',
    en: '52-Week High',
    mr: '५२ आठवड्यांचा उच्चांक',
    definitionEn: 'Highest price at which a stock traded during the past 52 weeks.',
    definitionMr: 'मागील एका वर्षात (५२ आठवड्यांत) शेअरने गाठलेला सर्वोच्च भाव.',
  },
  fiftyTwoWeekLow: {
    key: 'fiftyTwoWeekLow',
    en: '52-Week Low',
    mr: '५२ आठवड्यांचा नीचांक',
    definitionEn: 'Lowest price at which a stock traded during the past 52 weeks.',
    definitionMr: 'मागील एका वर्षात (५२ आठवड्यांत) शेअरचा सर्वात कमी भाव.',
  },
  promoterHolding: {
    key: 'promoterHolding',
    en: 'Promoter Holding',
    mr: 'प्रवर्तक भागभांडवल',
    definitionEn: 'Percentage of shares held by company founders and promoters.',
    definitionMr: 'कंपनीच्या मूळ संस्थापकांकडे असलेली शेअरची टक्केवारी.',
  },
  fiiHolding: {
    key: 'fiiHolding',
    en: 'FII Holding',
    mr: 'परदेशी संस्थात्मक गुंतवणूक (FII)',
    definitionEn: 'Shares held by foreign institutional investors.',
    definitionMr: 'परदेशी गुंतवणूक संस्थांकडे असलेली शेअरची हिस्सेदारी.',
  },
  diiHolding: {
    key: 'diiHolding',
    en: 'DII Holding',
    mr: 'देशांतर्गत संस्थात्मक गुंतवणूक (DII)',
    definitionEn: 'Shares held by domestic mutual funds, LIC, banks, etc.',
    definitionMr: 'भारतीय म्युच्युअल फंड, एलआयसी, विमा कंपन्यांची हिस्सेदारी.',
  },
  cagr: {
    key: 'cagr',
    en: 'CAGR (Compound Annual Growth Rate)',
    mr: 'चक्रवाढ वार्षिक वाढ दर (CAGR)',
    definitionEn: 'The mean annual growth rate of an investment over a specified period.',
    definitionMr: 'गुंतवणुकीवर दरवर्षी सरासरी चक्रवाढ पद्धतीने झालेली वाढ.',
  },
  revenue: {
    key: 'revenue',
    en: 'Revenue / Sales',
    mr: 'एकूण महसूल / विक्री',
    definitionEn: 'Total money brought in by a company from sales.',
    definitionMr: 'कंपनीने वस्तू किंवा सेवा विकून मिळवलेली एकूण रक्कम.',
  },
  operatingProfit: {
    key: 'operatingProfit',
    en: 'Operating Profit (EBITDA)',
    mr: 'कार्यचालन नफा (ऑपरेटिंग प्रॉफिट)',
    definitionEn: 'Profit before interest and taxes from core operations.',
    definitionMr: 'व्याजाचा आणि कर भरण्यापूर्वी मुख्य व्यवसायातून झालेला नफा.',
  },
  netProfit: {
    key: 'netProfit',
    en: 'Net Profit (PAT)',
    mr: 'निव्वळ नफा (करानंतर)',
    definitionEn: 'The total earnings after all expenses, taxes, and interest.',
    definitionMr: 'सर्व खर्च, व्याज आणि कर वजा केल्यानंतर हाती उरलेला निव्वळ नफा.',
  },
  netWorth: {
    key: 'netWorth',
    en: 'Net Worth',
    mr: 'निव्वळ मालमत्ता (नेटवर्थ)',
    definitionEn: 'Total assets minus total liabilities.',
    definitionMr: 'एकूण मालमत्तेतून सर्व देणे वजा करून उरणारे मूल्य.',
  },
};
