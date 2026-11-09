import type { ContentPackStory } from "./content-pack-types";

/** Bilingual explainers, part C: data, income limits, commissions, EWS. */
export const CONTENT_PACK_C: ContentPackStory[] = [
  {
    key: "counting-caste-secc-census",
    topic: "Data & Notes",
    kind: "Explainer",
    state: "National",
    source: "The Leaflet: Centre tells SC it did not make results of 2011 caste census public because it is flawed",
    sourceUrl: "https://theleaflet.in/centre-tells-sc-that-it-did-not-make-results-of-2011-caste-census-public-because-it-is-flawed/",
    sourcePublishedOn: "2021-09-23",
    eyebrow: "Counting caste",
    title: "Collected, then called unusable: the caste data India paid for and never saw",
    dek: "The last full caste count in a census was in 1931. The 2011 caste data was gathered and then buried. Census 2027 promises a count, and the notification that launched it did not mention caste.",
    read: 7,
    tone: "Data",
    body: `India decides who gets reserved seats, how large each quota is, and whether a group is backward, without a current national count of caste. That is a choice successive governments have made, not an accident.

::: The record
- **1931:** the last census to publish a full caste enumeration.
- **2011:** the Socio-Economic and Caste Census (SECC) collects caste data from households across the country.
- **2016:** the government tells a parliamentary committee that 98.87% of individual caste and religion data is error-free.
- **2021:** in an affidavit in the Supreme Court, the Centre says the SECC caste data is unusable for official purposes. In December 2021 the court declines Maharashtra’s request to order its release.
- **2 October 2023:** Bihar publishes its own caste survey.
- **16 June 2025:** the Centre notifies Census 2027, with a reference date of 1 March 2027. The government has said caste will be enumerated. The Wire reported that the gazette notification did not mention caste.

## What Bihar showed

Bihar’s survey reported that Extremely Backward Classes made up 36.01% of the state’s population and Backward Classes about 27.1%, together more than 63%. Scheduled Castes were 19.65%. Whatever one thinks of the policy the state then built on it, the survey demonstrated that a government can count caste and publish the result.

? If 98.87% of the data was error-free in 2016, how did it become unusable by 2021?

The Centre has not published the error audit that would answer this. Maharashtra argued exactly that contradiction in court. The data was not released, and no independent body has been allowed to test the government’s claim.

## What to watch in Census 2027

- Whether the caste question appears on the final schedule.
- What list of categories enumerators use, and whether respondents can answer freely.
- Whether caste tables are released on a fixed date, or left to political discretion.

A census that counts caste and then delays the tables would repeat 2011 under a new name.`,
    hi: {
      eyebrow: "जाति की गिनती",
      title: "पहले जुटाए, फिर बेकार बताए: वे जाति आंकड़े जिनका पैसा भारत ने चुकाया और जो कभी दिखे नहीं",
      dek: "जनगणना में आख़िरी पूरी जाति गिनती 1931 में हुई थी। 2011 के जाति आंकड़े जुटाए गए और फिर दबा दिए गए। जनगणना 2027 गिनती का वादा करती है, और जिस अधिसूचना से इसकी शुरुआत हुई उसमें जाति का ज़िक्र तक नहीं था।",
      body: `भारत तय करता है कि आरक्षित सीटें किसे मिलें, हर कोटा कितना बड़ा हो, और कौन-सा समूह पिछड़ा है, और यह सब जाति की किसी मौजूदा राष्ट्रीय गिनती के बिना होता है। यह एक के बाद एक आई सरकारों का फ़ैसला है, कोई संयोग नहीं।

::: रिकॉर्ड
- **1931:** आख़िरी जनगणना जिसने पूरी जाति गणना प्रकाशित की।
- **2011:** सामाजिक-आर्थिक और जाति जनगणना (SECC) देश भर के घरों से जाति के आंकड़े जुटाती है।
- **2016:** सरकार एक संसदीय समिति से कहती है कि व्यक्तियों की जाति और धर्म से जुड़े 98.87% आंकड़े त्रुटिरहित हैं।
- **2021:** सुप्रीम कोर्ट में एक हलफ़नामे में केंद्र कहता है कि SECC के जाति आंकड़े आधिकारिक इस्तेमाल लायक नहीं हैं। दिसंबर 2021 में अदालत महाराष्ट्र की यह माँग ठुकरा देती है कि इन्हें जारी करने का आदेश दिया जाए।
- **2 अक्टूबर 2023:** बिहार अपना जाति सर्वे प्रकाशित करता है।
- **16 जून 2025:** केंद्र जनगणना 2027 की अधिसूचना जारी करता है, संदर्भ तिथि 1 मार्च 2027। सरकार ने कहा है कि जाति गिनी जाएगी। ‘द वायर’ के मुताबिक़ गज़ट अधिसूचना में जाति का ज़िक्र नहीं था।

## बिहार ने क्या दिखाया

बिहार के सर्वे के मुताबिक़ अति पिछड़ा वर्ग राज्य की आबादी का 36.01% और पिछड़ा वर्ग लगभग 27.1% है, दोनों मिलकर 63% से ज़्यादा। अनुसूचित जातियाँ 19.65% हैं। उसके आधार पर राज्य ने जो नीति बनाई, उसके बारे में राय जो भी हो, इस सर्वे ने दिखा दिया कि सरकार जाति गिन सकती है और नतीजे प्रकाशित कर सकती है।

? अगर 2016 में 98.87% आंकड़े त्रुटिरहित थे, तो 2021 तक वे बेकार कैसे हो गए?

केंद्र ने वह त्रुटि-जाँच प्रकाशित नहीं की जिससे इसका जवाब मिलता। महाराष्ट्र ने अदालत में ठीक यही विरोधाभास उठाया था। आंकड़े जारी नहीं हुए, और किसी स्वतंत्र संस्था को सरकार के दावे को परखने नहीं दिया गया।

## जनगणना 2027 में किस पर नज़र रखें

- अंतिम प्रश्नावली में जाति का सवाल है या नहीं।
- गणनाकार श्रेणियों की कौन-सी सूची इस्तेमाल करते हैं, और क्या लोग खुलकर जवाब दे सकते हैं।
- जाति तालिकाएँ किसी तय तारीख़ पर जारी होती हैं, या राजनीतिक मर्ज़ी पर छोड़ दी जाती हैं।

जो जनगणना जाति गिनकर उसकी तालिकाएँ टाल दे, वह नए नाम से 2011 को ही दोहराएगी।`,
    },
    verificationNotes:
      "Draft for editor review. The 98.87% figure is the 2016 statement to a parliamentary committee as reported in coverage of the 2021 hearings (The Leaflet; Caravan). Add the Supreme Court order of December 2021, the Bihar survey release (2 October 2023), and the Census 2027 gazette notification as direct sources.",
  },
  {
    key: "eight-lakh-line",
    topic: "Data & Notes",
    kind: "Explainer",
    state: "National",
    source: "ThePrint: Centre tells SC it has decided to retain Rs 8 lakh income criteria for determining EWS",
    sourceUrl: "https://theprint.in/india/centre-tells-sc-that-it-has-decided-to-retain-rs-8-lakh-income-criteria-for-determining-ews/793409",
    sourcePublishedOn: "2022-01-02",
    eyebrow: "The ₹8 lakh line",
    title: "One number, two very different tests: how ₹8 lakh came to decide both OBC and EWS eligibility",
    dek: "The OBC creamy-layer limit has been ₹8 lakh since 2017. The EWS limit has been ₹8 lakh since 2019. They measure different things, and neither has been revised.",
    read: 6,
    tone: "Data",
    body: `The figure of ₹8 lakh a year now decides eligibility for two separate reservation systems. The coincidence has been convenient for governments and confusing for applicants.

::: Two limits, same number
- **OBC creamy layer:** ₹8 lakh since the Department of Personnel’s office memorandum of 13 September 2017. Income from salaries and agricultural land is excluded when applying it.
- **EWS:** ₹8 lakh gross annual family income since 2019, counting income from all sources, including farming. Families are also excluded if they own 5 acres or more of agricultural land, a flat of 1,000 sq ft or more, or a residential plot above set limits.

## How the EWS line was defended

When the Supreme Court questioned the basis for the EWS limit during the NEET-PG counselling dispute in 2021, the Centre set up a three-member committee. Its report, dated 31 December 2021, concluded that ₹8 lakh struck a “fine balance” and argued that it was not mechanically borrowed from the OBC limit, because the two tests count income differently. In January 2022 the Centre told the court it would keep the limit.

? How many families does the line actually cover?

We could not find any official estimate published by the government of how many families fall under the EWS threshold, or how many OBC families are excluded by the creamy-layer test. Without those numbers, no one outside government can say whether either line is too high, too low, or doing what it was meant to do.

## The frozen OBC limit

The creamy-layer limit was meant to be reviewed periodically. In August 2025, Parliament’s committee on OBC welfare called its revision the “need of the hour”. The Ministry of Social Justice told the committee there was no proposal under consideration. Eight years of inflation have passed with the limit unchanged. In real terms, every year of inaction tightens the test.`,
    hi: {
      eyebrow: "₹8 लाख की रेखा",
      title: "एक आंकड़ा, दो बिल्कुल अलग कसौटियाँ: ₹8 लाख कैसे ओबीसी और ईडब्ल्यूएस दोनों की पात्रता तय करने लगा",
      dek: "ओबीसी क्रीमी लेयर की सीमा 2017 से ₹8 लाख है। ईडब्ल्यूएस की सीमा 2019 से ₹8 लाख है। दोनों अलग चीज़ें मापती हैं, और किसी में भी संशोधन नहीं हुआ।",
      body: `₹8 लाख सालाना का आंकड़ा अब आरक्षण की दो अलग व्यवस्थाओं में पात्रता तय करता है। यह संयोग सरकारों के लिए सुविधाजनक रहा है और आवेदकों के लिए उलझन भरा।

::: दो सीमाएँ, एक ही आंकड़ा
- **ओबीसी क्रीमी लेयर:** कार्मिक विभाग के 13 सितंबर 2017 के कार्यालय ज्ञापन से ₹8 लाख। इसे लागू करते समय वेतन और खेती की ज़मीन से होने वाली आय नहीं गिनी जाती।
- **ईडब्ल्यूएस:** 2019 से परिवार की कुल सालाना आय ₹8 लाख, जिसमें खेती समेत सभी स्रोतों की आय गिनी जाती है। जिन परिवारों के पास 5 एकड़ या उससे ज़्यादा खेती की ज़मीन, 1,000 वर्ग फ़ुट या उससे बड़ा फ़्लैट, या तय सीमा से बड़ा आवासीय प्लॉट है, वे भी बाहर हैं।

## ईडब्ल्यूएस रेखा का बचाव कैसे हुआ

2021 में नीट-पीजी काउंसलिंग विवाद के दौरान जब सुप्रीम कोर्ट ने ईडब्ल्यूएस सीमा का आधार पूछा, तो केंद्र ने तीन सदस्यों की एक समिति बनाई। 31 दिसंबर 2021 की उसकी रिपोर्ट ने कहा कि ₹8 लाख “संतुलित” सीमा है, और तर्क दिया कि इसे ओबीसी सीमा से यांत्रिक रूप से नहीं लिया गया, क्योंकि दोनों कसौटियाँ आय अलग तरह से गिनती हैं। जनवरी 2022 में केंद्र ने अदालत को बताया कि वह यह सीमा बनाए रखेगा।

? यह रेखा असल में कितने परिवारों को कवर करती है?

हमें सरकार का प्रकाशित ऐसा कोई आधिकारिक अनुमान नहीं मिला कि कितने परिवार ईडब्ल्यूएस सीमा के भीतर आते हैं, या क्रीमी लेयर कसौटी से कितने ओबीसी परिवार बाहर होते हैं। इन आंकड़ों के बिना सरकार से बाहर कोई नहीं बता सकता कि कोई भी रेखा बहुत ऊँची है, बहुत नीची है, या वह कर रही है जिसके लिए बनी थी।

## जमी हुई ओबीसी सीमा

क्रीमी लेयर सीमा की समय-समय पर समीक्षा होनी थी। अगस्त 2025 में ओबीसी कल्याण पर संसदीय समिति ने इसके संशोधन को “समय की ज़रूरत” बताया। सामाजिक न्याय मंत्रालय ने समिति से कहा कि ऐसा कोई प्रस्ताव विचाराधीन नहीं है। सीमा बदले बिना आठ साल की महँगाई गुज़र चुकी है। असल में, हर साल की निष्क्रियता यह कसौटी और सख़्त कर देती है।`,
    },
    verificationNotes:
      "Draft for editor review. Add the DoPT OM of 13.9.2017 (NCBC copy: ncbc.nic.in/Writereaddata/OM8Lakha.pdf), the EWS OM of 2019, the committee report of 31.12.2021 and the August 2025 parliamentary committee report as direct sources. Confirm that the government has not published an eligible-population estimate.",
  },
  {
    key: "mandal-to-rohini",
    topic: "History",
    kind: "Explainer",
    state: "National",
    source: "Business Standard: The Mandal Commission decoded",
    sourceUrl: "https://business-standard.com/india-news/the-mandal-commission-decoded-how-obc-reservation-came-into-effect-123102000445_1.html",
    sourcePublishedOn: "2023-10-20",
    eyebrow: "Two commissions",
    title: "Mandal waited a decade to be implemented. Rohini’s report has not even been published",
    dek: "India’s two most important commissions on backward classes share a history: governments that received their findings and then sat on them.",
    read: 6,
    tone: "History",
    body: `Two commissions shaped how India thinks about Other Backward Classes. Both reported to governments that preferred not to act on them, at least not quickly.

::: Mandal
- Constituted on 1 January 1979 as the Second Backward Classes Commission, chaired by B. P. Mandal.
- Reported on 31 December 1980. It identified 3,743 castes as backward, estimated OBCs at about 52% of the population using 1931 census data, and recommended 27% reservation to stay within the 50% limit.
- Implemented only after Prime Minister V. P. Singh’s announcement in August 1990; the office memorandum on 27% reservation in central services was issued on 13 August 1990.
- Upheld by the Supreme Court in Indra Sawhney (1992), with the creamy layer excluded.

## Ten years in a drawer

For almost a decade after 1980, successive governments neither implemented the Mandal report nor rejected it. When it was finally acted upon, it was announced suddenly, without the public preparation that a change of that size needed, and the country paid for that in months of unrest.

::: Rohini
- Set up in October 2017 to examine how the central OBC quota is shared among more than 2,600 listed communities, and whether it should be sub-categorised.
- Its term was extended 14 times.
- Submitted its report to the President on 31 July 2023.
- Its findings have not been made public.

? What is the government waiting for?

The Rohini Commission was created to answer whether a handful of communities take most of the OBC quota’s benefits. That is an empirical question, and the commission was given years and public money to answer it. The answer exists. It sits with the government. In 2024 ThePrint described the report as in “cold storage”. Holding it back does not make the question go away. It just ensures that the debate goes on without the evidence.`,
    hi: {
      eyebrow: "दो आयोग",
      title: "मंडल को लागू होने में दस साल लगे। रोहिणी की रिपोर्ट तो प्रकाशित तक नहीं हुई",
      dek: "पिछड़े वर्गों पर भारत के दो सबसे अहम आयोगों का इतिहास एक जैसा है: सरकारें जिन्होंने निष्कर्ष लिए और फिर उन पर बैठ गईं।",
      body: `दो आयोगों ने तय किया कि भारत अन्य पिछड़े वर्गों के बारे में कैसे सोचता है। दोनों ने ऐसी सरकारों को रिपोर्ट दी जिन्होंने उन पर अमल न करना बेहतर समझा, कम से कम जल्दी तो नहीं।

::: मंडल
- 1 जनवरी 1979 को दूसरे पिछड़ा वर्ग आयोग के रूप में गठित, अध्यक्ष बी. पी. मंडल।
- 31 दिसंबर 1980 को रिपोर्ट दी। 3,743 जातियों को पिछड़ा माना, 1931 की जनगणना के आंकड़ों से ओबीसी को आबादी का लगभग 52% आँका, और 50% की सीमा के भीतर रहने के लिए 27% आरक्षण की सिफ़ारिश की।
- प्रधानमंत्री वी. पी. सिंह की अगस्त 1990 की घोषणा के बाद ही लागू हुआ; केंद्रीय सेवाओं में 27% आरक्षण का कार्यालय ज्ञापन 13 अगस्त 1990 को जारी हुआ।
- सुप्रीम कोर्ट ने इंद्रा साहनी (1992) में इसे बरक़रार रखा, क्रीमी लेयर को बाहर रखते हुए।

## दस साल दराज़ में

1980 के बाद लगभग एक दशक तक एक के बाद एक आई सरकारों ने मंडल रिपोर्ट को न लागू किया, न ख़ारिज किया। जब आख़िरकार उस पर अमल हुआ, तो उसकी घोषणा अचानक हुई, उस सार्वजनिक तैयारी के बिना जो इतने बड़े बदलाव के लिए ज़रूरी थी, और देश ने इसकी क़ीमत महीनों की अशांति से चुकाई।

::: रोहिणी
- अक्टूबर 2017 में यह जाँचने के लिए बना कि केंद्रीय ओबीसी आरक्षण 2,600 से ज़्यादा सूचीबद्ध समुदायों में कैसे बँट रहा है, और क्या इसका उप-वर्गीकरण होना चाहिए।
- इसका कार्यकाल 14 बार बढ़ाया गया।
- 31 जुलाई 2023 को राष्ट्रपति को रिपोर्ट सौंपी।
- इसके निष्कर्ष सार्वजनिक नहीं किए गए।

? सरकार किस बात का इंतज़ार कर रही है?

रोहिणी आयोग इस सवाल का जवाब देने के लिए बना था कि क्या मुट्ठी भर समुदाय ओबीसी आरक्षण का ज़्यादातर लाभ ले रहे हैं। यह आंकड़ों का सवाल है, और आयोग को इसके लिए सालों का समय और जनता का पैसा मिला। जवाब मौजूद है। वह सरकार के पास है। 2024 में ‘द प्रिंट’ ने लिखा कि रिपोर्ट “ठंडे बस्ते” में है। इसे रोके रखने से सवाल ख़त्म नहीं होता। बस इतना तय होता है कि बहस सबूत के बिना चलती रहे।`,
    },
    verificationNotes:
      "Draft for editor review. The 3,743 and 52% figures are from the Mandal report as summarised by Business Standard; add the report itself as a source. Rohini facts follow ThePrint and SCC Online; add a link to the commission's notification (2 October 2017) and confirm the report has not since been tabled.",
  },
  {
    key: "ews-judgment-2022",
    topic: "Courts & Policy",
    kind: "Paper note",
    state: "National",
    source: "Supreme Court Observer: EWS Reservation (Janhit Abhiyan v. Union of India)",
    sourceUrl: "https://www.scobserver.in/court-case/reservations-for-economically-weaker-sections",
    sourcePublishedOn: "2022-11-07",
    eyebrow: "The EWS judgment",
    title: "The EWS quota passed Parliament in two days and survived the Supreme Court by one vote",
    dek: "The 103rd Amendment was introduced and passed within days in January 2019. In November 2022 a five-judge bench upheld it 3:2, and the dissent asked a question the government has never answered with data.",
    read: 6,
    tone: "Courts",
    body: `The 103rd Amendment created reservation of up to 10% for economically weaker sections who are not covered by SC, ST or OBC reservation. It moved through Parliament at a speed rarely seen for a constitutional amendment, in January 2019, months before a general election, and came into force on 14 January 2019.

::: The judgment, 7 November 2022
- **Majority (3):** Justices Dinesh Maheshwari, Bela M. Trivedi and J. B. Pardiwala upheld the amendment. Economic criteria alone can justify reservation, and the amendment does not violate the Constitution’s basic structure.
- **Dissent (2):** Chief Justice U. U. Lalit and Justice S. Ravindra Bhat accepted that economic reservation is permissible in principle, but held that excluding poor SC, ST and OBC families from the EWS quota is discriminatory.

## The question the dissent asked

? Why is a poor family excluded from the poor-family quota because of its caste?

Justice Bhat’s answer was that the exclusion violated the equality code. The majority answered that those groups already have their own reservation. Both sides argued from principle. Neither had in front of it what a policy of this size should have come with: published data on how many families fall within the EWS definition, by group.

## What the record shows about the process

- The amendment was passed without a commission report or a published estimate of the eligible population.
- The income limit of ₹8 lakh was later questioned by the Supreme Court in 2021, and defended by a committee the government appointed only after the court asked.
- Whether the 50% ceiling applies to EWS was settled in its favour by the majority, which treated the ceiling as applying to reservations for backward classes.

The EWS quota is now constitutionally secure. Whether it reaches the families it was designed for is still unmeasured.`,
    hi: {
      eyebrow: "ईडब्ल्यूएस फ़ैसला",
      title: "ईडब्ल्यूएस आरक्षण दो दिन में संसद से पास हुआ और सुप्रीम कोर्ट में एक वोट से बचा",
      dek: "103वाँ संशोधन जनवरी 2019 में कुछ ही दिनों में पेश हुआ और पास हुआ। नवंबर 2022 में पाँच जजों की पीठ ने इसे 3:2 से बरक़रार रखा, और असहमति वाले जजों ने ऐसा सवाल पूछा जिसका जवाब सरकार ने कभी आंकड़ों से नहीं दिया।",
      body: `103वें संशोधन ने उन आर्थिक रूप से कमज़ोर वर्गों के लिए 10% तक आरक्षण बनाया जो एससी, एसटी या ओबीसी आरक्षण के दायरे में नहीं आते। यह संशोधन जनवरी 2019 में, आम चुनाव से कुछ महीने पहले, उस रफ़्तार से संसद से गुज़रा जो संविधान संशोधन के लिए शायद ही देखी जाती है, और 14 जनवरी 2019 को लागू हो गया।

::: फ़ैसला, 7 नवंबर 2022
- **बहुमत (3):** जस्टिस दिनेश माहेश्वरी, बेला एम. त्रिवेदी और जे. बी. पारदीवाला ने संशोधन को बरक़रार रखा। सिर्फ़ आर्थिक आधार भी आरक्षण को सही ठहरा सकता है, और यह संशोधन संविधान के मूल ढाँचे का उल्लंघन नहीं करता।
- **असहमति (2):** मुख्य न्यायाधीश यू. यू. ललित और जस्टिस एस. रवींद्र भट ने माना कि आर्थिक आरक्षण सिद्धांत रूप में जायज़ है, लेकिन कहा कि ग़रीब एससी, एसटी और ओबीसी परिवारों को ईडब्ल्यूएस कोटे से बाहर रखना भेदभाव है।

## असहमति ने जो सवाल पूछा

? किसी ग़रीब परिवार को उसकी जाति के कारण ग़रीबों के कोटे से बाहर क्यों रखा जाए?

जस्टिस भट का जवाब था कि यह बहिष्कार समानता के सिद्धांत का उल्लंघन है। बहुमत का जवाब था कि उन समूहों के लिए पहले से अपना आरक्षण है। दोनों पक्षों ने सिद्धांत से तर्क दिया। किसी के सामने वह नहीं था जो इतनी बड़ी नीति के साथ आना चाहिए था: इस पर प्रकाशित आंकड़े कि हर समूह में कितने परिवार ईडब्ल्यूएस परिभाषा में आते हैं।

## प्रक्रिया के बारे में रिकॉर्ड क्या दिखाता है

- संशोधन किसी आयोग की रिपोर्ट या पात्र आबादी के किसी प्रकाशित अनुमान के बिना पास हुआ।
- ₹8 लाख की आय सीमा पर 2021 में सुप्रीम कोर्ट ने सवाल उठाया, और उसका बचाव एक ऐसी समिति ने किया जिसे सरकार ने अदालत के पूछने के बाद ही बनाया।
- 50% की सीमा ईडब्ल्यूएस पर लागू होती है या नहीं, यह बहुमत ने इसके पक्ष में तय किया, यह मानते हुए कि वह सीमा पिछड़े वर्गों के आरक्षण पर लागू होती है।

ईडब्ल्यूएस आरक्षण अब संवैधानिक रूप से सुरक्षित है। यह उन परिवारों तक पहुँच रहा है या नहीं जिनके लिए बना था, यह अब भी मापा नहीं गया।`,
    },
    verificationNotes:
      "Draft for editor review. Add the judgment PDF (sci.gov.in, 7 November 2022) as the primary source; the existing policy ledger record already links it. Add the Lok Sabha and Rajya Sabha passage dates from parliamentary records rather than relying on 'two days'.",
  },
];
