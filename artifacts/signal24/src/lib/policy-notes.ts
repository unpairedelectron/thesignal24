/**
 * Analysis for policy-ledger records: why the change matters in practice and the
 * questions it leaves unanswered. Keyed by policy slug; shown on /policies/:slug by
 * the app and the page server. Facts restate the record's own sources; keep them in
 * step when a record's court status changes.
 */
import type { Bilingual } from './key-figures';

export type PolicyNote = { why: Bilingual; questions: Bilingual[] };

export const POLICY_NOTES: Record<string, PolicyNote> = {
  'census-2027-caste-enumeration': {
    why: {
      en: 'Every quota in India rests on population and representation figures that are decades old. Since 1951, censuses have counted only Scheduled Castes and Scheduled Tribes, so there is no official count of OBC communities at all; the Mandal Commission worked from 1931 data. A caste count could, for the first time in ninety-six years, let courts and governments test claims of backwardness and over-representation against evidence. Whether it does depends on things not yet announced: how thousands of caste names are grouped, and when the tables are published.',
      hi: 'भारत का हर आरक्षण दशकों पुराने आबादी और प्रतिनिधित्व के आंकड़ों पर टिका है। 1951 के बाद की जनगणनाओं में सिर्फ़ अनुसूचित जातियाँ और जनजातियाँ गिनी गईं, इसलिए ओबीसी समुदायों की कोई आधिकारिक गिनती है ही नहीं; मंडल आयोग ने 1931 के आंकड़ों से काम चलाया। जाति गणना छियानवे साल में पहली बार अदालतों और सरकारों को पिछड़ेपन और ज़रूरत से ज़्यादा प्रतिनिधित्व के दावों को सबूत पर परखने का मौक़ा दे सकती है। ऐसा होगा या नहीं, यह उन बातों पर टिका है जिनकी अभी घोषणा नहीं हुई: हज़ारों जाति-नामों को कैसे समूहों में बाँटा जाएगा, और तालिकाएँ कब प्रकाशित होंगी।',
    },
    questions: [
      { en: 'When will caste tables be published, and will they be published in full?', hi: 'जाति की तालिकाएँ कब प्रकाशित होंगी, और क्या वे पूरी प्रकाशित होंगी?' },
      { en: 'Who decides how caste names are grouped, and will that method be published before the count?', hi: 'जाति-नामों को समूहों में कौन बाँटेगा, और क्या यह तरीक़ा गिनती से पहले प्रकाशित होगा?' },
      { en: 'What happens to the 2011 SECC caste data that was collected and never released?', hi: '2011 की एसईसीसी के उन जाति आंकड़ों का क्या होगा जो जुटाए गए और कभी जारी नहीं हुए?' },
    ],
  },
  'ugc-equity-regulations-2026': {
    why: {
      en: 'Campus caste discrimination has been governed since 2012 by rules the UGC itself treated as largely advisory. The 2026 regulations would have made equity committees and helplines mandatory in every institution. The Supreme Court’s stay means students are back under the 2012 rules, by order under Article 142, while the Centre considers whether to rewrite the definition the court questioned. Every month the stay lasts is a month in which a complaint goes to a committee with no binding powers.',
      hi: 'कैंपस में जातिगत भेदभाव 2012 से ऐसे नियमों से चल रहा है जिन्हें यूजीसी ख़ुद काफ़ी हद तक सलाह भर मानता रहा। 2026 के नियम हर संस्थान में समता समितियाँ और हेल्पलाइन अनिवार्य करते। सुप्रीम कोर्ट की रोक का मतलब है कि छात्र अनुच्छेद 142 के आदेश से फिर 2012 के नियमों के तहत हैं, जबकि केंद्र सोच रहा है कि अदालत ने जिस परिभाषा पर सवाल उठाया, उसे दोबारा लिखा जाए या नहीं। रोक का हर महीना ऐसा महीना है जिसमें शिकायत बिना बाध्यकारी अधिकार वाली समिति के पास जाती है।',
    },
    questions: [
      { en: 'When will the Centre tell the Supreme Court what it intends to change, and will the revised text be published for comment?', hi: 'केंद्र सुप्रीम कोर्ट को कब बताएगा कि वह क्या बदलना चाहता है, और क्या संशोधित मसौदा राय के लिए प्रकाशित होगा?' },
      { en: 'How many caste-discrimination complaints have institutions received under the 2012 rules, and how many were upheld?', hi: '2012 के नियमों के तहत संस्थानों को जातिगत भेदभाव की कितनी शिकायतें मिलीं, और कितनी सही पाई गईं?' },
      { en: 'Which institutions have functioning equity cells today, and who checks?', hi: 'आज किन संस्थानों में समता प्रकोष्ठ सचमुच काम कर रहे हैं, और इसकी जाँच कौन करता है?' },
    ],
  },
  'sc-st-sub-classification-2024': {
    why: {
      en: 'For twenty years E.V. Chinnaiah treated the Scheduled Castes of a state as one class, so the communities that benefited least from the quota had no legal way to get a share of it. Davinder Singh changed that, but it gave states a power, not a duty, and it tied that power to data on representation that most states have not published. The judgment also opened an argument about a creamy layer for SCs and STs, which the Union Cabinet rejected within days.',
      hi: 'बीस साल तक ई. वी. चिन्नैया फ़ैसले ने किसी राज्य की अनुसूचित जातियों को एक ही वर्ग माना, इसलिए आरक्षण से सबसे कम फ़ायदा पाने वाले समुदायों के पास उसमें अपना हिस्सा पाने का कोई क़ानूनी रास्ता नहीं था। दविंदर सिंह फ़ैसले ने यह बदला, पर राज्यों को अधिकार दिया, ज़िम्मेदारी नहीं, और उस अधिकार को प्रतिनिधित्व के उन आंकड़ों से बाँध दिया जिन्हें ज़्यादातर राज्यों ने प्रकाशित नहीं किया। इस फ़ैसले ने एससी और एसटी के लिए क्रीमी लेयर की बहस भी खोली, जिसे केंद्रीय कैबिनेट ने कुछ ही दिनों में ख़ारिज कर दिया।',
    },
    questions: [
      { en: 'Which states have published the representation data a sub-classification law would need?', hi: 'किन राज्यों ने वे प्रतिनिधित्व आंकड़े प्रकाशित किए हैं जिनकी उप-वर्गीकरण क़ानून को ज़रूरत होगी?' },
      { en: 'How will a state show that a sub-group is inadequately represented, cadre by cadre?', hi: 'कोई राज्य कैसे दिखाएगा कि कोई उप-समूह कैडर-दर-कैडर अपर्याप्त रूप से प्रतिनिधित्व पा रहा है?' },
      { en: 'If the creamy-layer remarks are not binding, what guidance will courts follow when the first sub-classification law is challenged?', hi: 'अगर क्रीमी लेयर वाली टिप्पणियाँ बाध्यकारी नहीं हैं, तो पहले उप-वर्गीकरण क़ानून को चुनौती मिलने पर अदालतें किस मार्गदर्शन पर चलेंगी?' },
    ],
  },
  'maharashtra-sebc-act-2024': {
    why: {
      en: 'Maharashtra has legislated a Maratha quota three times in ten years. The 2018 law was struck down by the Supreme Court in 2021 because the state could not show an extraordinary situation to cross the 50% ceiling. The 2024 Act rests on a new commission report, but it faces the same ceiling and the same test. Until the Bombay High Court decides, students and job applicants are making choices under a law whose validity is unknown.',
      hi: 'महाराष्ट्र ने दस साल में तीन बार मराठा आरक्षण का क़ानून बनाया। 2018 का क़ानून सुप्रीम कोर्ट ने 2021 में रद्द कर दिया, क्योंकि राज्य 50% की सीमा पार करने के लिए असाधारण हालात नहीं दिखा सका। 2024 का अधिनियम एक नई आयोग रिपोर्ट पर टिका है, पर उसके सामने वही सीमा और वही कसौटी है। जब तक बॉम्बे हाई कोर्ट फ़ैसला नहीं करता, छात्र और नौकरी के उम्मीदवार ऐसे क़ानून के तहत फ़ैसले ले रहे हैं जिसकी वैधता अनिश्चित है।',
    },
    questions: [
      { en: 'What extraordinary situation does the Shukre Commission report identify that the 2018 Gaikwad report did not?', hi: 'शुक्रे आयोग की रिपोर्ट कौन-सी असाधारण स्थिति बताती है जो 2018 की गायकवाड़ रिपोर्ट ने नहीं बताई थी?' },
      { en: 'How many admissions and appointments have been made under the 2024 Act, and what happens to them if it falls?', hi: '2024 के अधिनियम के तहत कितने दाख़िले और नियुक्तियाँ हुईं, और अगर यह क़ानून गिरा तो उनका क्या होगा?' },
      { en: 'Why has the full-bench hearing had to restart more than once?', hi: 'पूर्ण पीठ की सुनवाई एक से ज़्यादा बार नए सिरे से क्यों शुरू करनी पड़ी?' },
    ],
  },
  'bihar-reservation-amendments-2023': {
    why: {
      en: 'Bihar ran a caste survey, published its results and legislated on them within weeks, which made it one of the clearest tests yet of whether new data can justify crossing the 50% ceiling. The Patna High Court said it could not, and the Supreme Court declined to pause that ruling, so recruitment and admissions in Bihar are back at the pre-2023 levels while the appeal waits.',
      hi: 'बिहार ने जाति सर्वेक्षण कराया, उसके नतीजे प्रकाशित किए और कुछ ही हफ़्तों में उन पर क़ानून बनाया, इसलिए यह अब तक की सबसे साफ़ परीक्षाओं में से एक बना कि क्या नए आंकड़े 50% की सीमा पार करने को सही ठहरा सकते हैं। पटना हाई कोर्ट ने कहा कि नहीं, और सुप्रीम कोर्ट ने उस फ़ैसले पर रोक लगाने से इनकार किया, इसलिए अपील लंबित रहने तक बिहार में भर्ती और दाख़िले 2023 से पहले के स्तर पर लौट आए हैं।',
    },
    questions: [
      { en: 'Did the state publish representation data by cadre, or only population shares from the survey?', hi: 'क्या राज्य ने कैडर-वार प्रतिनिधित्व के आंकड़े प्रकाशित किए, या सिर्फ़ सर्वे से निकले आबादी के हिस्से?' },
      { en: 'When will the Supreme Court hear the appeal on its merits?', hi: 'सुप्रीम कोर्ट अपील पर गुण-दोष के आधार पर सुनवाई कब करेगा?' },
      { en: 'Why was the law not placed in the Ninth Schedule, as the state had asked, and what would that have changed?', hi: 'राज्य की माँग के मुताबिक़ यह क़ानून नौवीं अनुसूची में क्यों नहीं डाला गया, और उससे क्या बदलता?' },
    ],
  },
  '103rd-constitutional-amendment-ews-reservation': {
    why: {
      en: 'The 103rd Amendment was the first to base reservation on income rather than social backwardness, and it was passed by both Houses within two days of its introduction. The Supreme Court upheld it 3:2, and the dissent objected to poor SC, ST and OBC families being kept out of it. Because it sits outside the 50% ceiling, central reservation now totals 59.5%. The size of the quota was fixed without a published estimate of how many families meet the test.',
      hi: '103वाँ संशोधन पहला था जिसने आरक्षण को सामाजिक पिछड़ेपन की जगह आय पर आधारित किया, और पेश होने के दो दिन के भीतर दोनों सदनों से पास हो गया। सुप्रीम कोर्ट ने इसे 3:2 से बरक़रार रखा, और असहमति वाली राय ने ग़रीब एससी, एसटी और ओबीसी परिवारों को इससे बाहर रखने पर आपत्ति की। क्योंकि यह 50% की सीमा से बाहर है, केंद्र में कुल आरक्षण अब 59.5% है। आरक्षण का आकार इस बात के किसी प्रकाशित अनुमान के बिना तय हुआ कि कितने परिवार इस कसौटी पर खरे उतरते हैं।',
    },
    questions: [
      { en: 'How many families does the ₹8 lakh EWS test cover, and on what data was 10% chosen?', hi: '₹8 लाख की ईडब्ल्यूएस कसौटी कितने परिवारों को दायरे में लेती है, और 10% किन आंकड़ों पर चुना गया?' },
      { en: 'How many EWS seats and posts go unfilled each year?', hi: 'हर साल ईडब्ल्यूएस की कितनी सीटें और पद ख़ाली रह जाते हैं?' },
      { en: 'Will the income line ever be revised, and by what method?', hi: 'क्या आय सीमा कभी बदली जाएगी, और किस तरीक़े से?' },
    ],
  },
  'obc-creamy-layer-8-lakh-2017': {
    why: {
      en: 'An income line that is never revised tightens every year. Since 2017, prices and nominal incomes have risen while the ₹8 lakh figure has stayed fixed, so families with the same real standard of living are steadily pushed over it and out of the OBC quota. A parliamentary committee called revision the need of the hour in 2025. The same number also became the EWS limit in 2019, even though the two tests count income in different ways.',
      hi: 'जो आय सीमा कभी नहीं बदलती, वह हर साल और सख़्त होती जाती है। 2017 से क़ीमतें और नाममात्र आय बढ़ी हैं, पर ₹8 लाख का आंकड़ा जस का तस है, इसलिए उतने ही वास्तविक जीवन-स्तर वाले परिवार धीरे-धीरे इस सीमा के पार और ओबीसी आरक्षण से बाहर धकेले जा रहे हैं। एक संसदीय समिति ने 2025 में इसके संशोधन को समय की ज़रूरत बताया। यही संख्या 2019 में ईडब्ल्यूएस की सीमा भी बनी, हालाँकि दोनों कसौटियाँ आय अलग-अलग तरीक़े से गिनती हैं।',
    },
    questions: [
      { en: 'When will the ceiling next be revised, and will revisions be tied to an index?', hi: 'सीमा अगली बार कब बदलेगी, और क्या बदलाव को किसी सूचकांक से जोड़ा जाएगा?' },
      { en: 'How many OBC candidates are excluded each year as creamy layer?', hi: 'हर साल कितने ओबीसी उम्मीदवार क्रीमी लेयर मानकर बाहर किए जाते हैं?' },
      { en: 'Why does the same ₹8 lakh figure serve two tests that measure income differently?', hi: 'आय को अलग-अलग तरह मापने वाली दो कसौटियों के लिए एक ही ₹8 लाख का आंकड़ा क्यों?' },
    ],
  },
  'reservation-in-promotion-77th-amendment': {
    why: {
      en: 'Parliament has repeatedly amended the Constitution to protect reservation in promotions for SCs and STs, and the Supreme Court has upheld those changes while insisting on data. That condition is where the policy keeps stalling: governments promote, or stop promoting, and then go to court without the cadre-wise figures the judgments require. The 2022 ruling made the unit of measurement the cadre, which means the data has to exist post by post, not department by department.',
      hi: 'संसद ने एससी और एसटी के लिए पदोन्नति में आरक्षण बचाने के लिए बार-बार संविधान बदला, और सुप्रीम कोर्ट ने उन बदलावों को बरक़रार रखा, पर आंकड़ों पर ज़ोर देते हुए। यही शर्त है जहाँ नीति बार-बार अटकती है: सरकारें पदोन्नति करती हैं या रोकती हैं, और फिर उन कैडर-वार आंकड़ों के बिना अदालत जाती हैं जो फ़ैसले माँगते हैं। 2022 के फ़ैसले ने माप की इकाई कैडर को बनाया, यानी आंकड़े विभाग-दर-विभाग नहीं, पद-दर-पद होने चाहिए।',
    },
    questions: [
      { en: 'Which ministries have published cadre-wise representation data for SCs and STs?', hi: 'किन मंत्रालयों ने एससी और एसटी के कैडर-वार प्रतिनिधित्व के आंकड़े प्रकाशित किए हैं?' },
      { en: 'How many promotions are held up by pending litigation on this question?', hi: 'इस सवाल पर लंबित मुक़दमों के कारण कितनी पदोन्नतियाँ रुकी हैं?' },
      { en: 'How often is the data reviewed, as the 2022 judgment requires?', hi: '2022 के फ़ैसले के मुताबिक़ आंकड़ों की समीक्षा कितनी बार होती है?' },
    ],
  },
  'mandal-office-memorandum-1990': {
    why: {
      en: 'The 1990 memorandum turned a report that had waited a decade into policy, and the 1992 judgment that upheld it still sets the basic rules: a 50% ceiling, a creamy-layer exclusion and no reservation in promotions for backward classes. Most of today’s disputes, from the Rohini Commission’s sub-categorisation work to the creamy-layer income line, trace back to the questions it left open, chiefly how benefits are spread within the OBC list.',
      hi: '1990 के ज्ञापन ने दस साल से इंतज़ार कर रही एक रिपोर्ट को नीति बना दिया, और उसे बरक़रार रखने वाला 1992 का फ़ैसला आज भी बुनियादी नियम तय करता है: 50% की सीमा, क्रीमी लेयर का बहिष्कार और पिछड़े वर्गों के लिए पदोन्नति में आरक्षण नहीं। आज के ज़्यादातर विवाद, रोहिणी आयोग के उप-वर्गीकरण के काम से लेकर क्रीमी लेयर की आय सीमा तक, उन्हीं सवालों से निकलते हैं जो उसने खुले छोड़े, ख़ासकर यह कि ओबीसी सूची के भीतर फ़ायदे कैसे बँटते हैं।',
    },
    questions: [
      { en: 'What share of central OBC posts has gone to each community on the list, and why is that data not published?', hi: 'केंद्र के ओबीसी पदों का कितना हिस्सा सूची के हर समुदाय को मिला, और ये आंकड़े प्रकाशित क्यों नहीं होते?' },
      { en: 'When will the Rohini Commission’s report on sub-categorisation be made public?', hi: 'उप-वर्गीकरण पर रोहिणी आयोग की रिपोर्ट कब सार्वजनिक होगी?' },
      { en: 'Is the 27% figure still the right one, and on what count would anyone know?', hi: 'क्या 27% का आंकड़ा अब भी सही है, और किस गिनती से यह पता चलेगा?' },
    ],
  },
  'first-amendment-article-15-4-1951': {
    why: {
      en: 'Article 15(4) is where reservation in education begins. The Supreme Court’s Champakam Dorairajan ruling in April 1951 held that the Constitution as first written did not allow community-wise allocation of seats, and Parliament answered by amending it about ten weeks later. That pattern, a court striking down a measure and Parliament changing the Constitution in response, has repeated itself through the history of reservation, from promotions to the EWS quota.',
      hi: 'शिक्षा में आरक्षण की शुरुआत अनुच्छेद 15(4) से होती है। अप्रैल 1951 के सुप्रीम कोर्ट के चंपकम दोराईराजन फ़ैसले ने कहा कि मूल संविधान समुदाय के आधार पर सीटें बाँटने की अनुमति नहीं देता, और संसद ने लगभग दस हफ़्ते बाद संविधान बदलकर जवाब दिया। यह ढर्रा, यानी अदालत का कोई उपाय रद्द करना और जवाब में संसद का संविधान बदलना, आरक्षण के इतिहास में बार-बार दोहराया गया है, पदोन्नति से लेकर ईडब्ल्यूएस आरक्षण तक।',
    },
    questions: [
      { en: 'Which groups did the 1951 debates expect Article 15(4) to cover, and how far has that list moved?', hi: '1951 की बहसों में अनुच्छेद 15(4) से किन समूहों के दायरे में आने की उम्मीद थी, और वह सूची कितनी बदली है?' },
      { en: 'How many constitutional amendments since 1951 have answered a court ruling on reservation?', hi: '1951 से अब तक कितने संविधान संशोधन आरक्षण पर अदालती फ़ैसलों के जवाब में आए?' },
      { en: 'Has any government published how educational reservation has changed enrolment, institution by institution?', hi: 'क्या किसी सरकार ने प्रकाशित किया है कि शिक्षा में आरक्षण ने संस्थान-दर-संस्थान दाख़िले कैसे बदले?' },
    ],
  },
};
