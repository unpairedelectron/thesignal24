import type { ContentPackStory } from "./content-pack-types";

/**
 * Bilingual reporting, part D: the 2026 record (UGC equity rules, Census 2027, state
 * quota litigation), a documents-only desk report on eligibility paperwork, an archive
 * piece on the First Amendment, and one labelled editorial. Every factual claim is tied
 * to the linked source; pending matters are described as pending, with the date we
 * last checked. Sarcasm is aimed at institutions, never at communities.
 */
export const CONTENT_PACK_D: ContentPackStory[] = [
  {
    key: "ugc-equity-regulations-2026",
    topic: "Latest",
    kind: "Article",
    state: "National",
    source: "LiveLaw: Explainer on the UGC (Promotion of Equity in Higher Education Institutions) Regulations, 2026",
    sourceUrl:
      "https://www.livelaw.in/top-stories/supreme-court-ugc-promotion-of-equity-in-higher-education-institutions-regulations-2026-sc-st-obc-caste-discrimination-equity-committees-520913",
    sourcePublishedOn: "2026-01-29",
    eyebrow: "Campus equity rules",
    title: "Notified on 13 January, stayed on 29 January, “under reconsideration” ever since: the UGC’s equity rules",
    dek: "The regulator took six years to write rules against caste discrimination on campus and sixteen days to have them stayed. Ten months later, the Centre is still thinking about a committee to think about them.",
    read: 6,
    tone: "Latest",
    body: `On 13 January 2026 the University Grants Commission notified the UGC (Promotion of Equity in Higher Education Institutions) Regulations, 2026. They were meant to replace the 2012 regulations, which were largely advisory, with binding duties: every institution would set up an equity committee and a 24-hour equity helpline, and the UGC could act against institutions that failed to comply.

Sixteen days later, on 29 January, the Supreme Court stayed them.

::: The record
- **13 January 2026:** UGC notifies the 2026 equity regulations, superseding the 2012 rules.
- **29 January 2026:** The Supreme Court stays them, calling the framework prima facie vague and capable of misuse, and uses Article 142 to keep the 2012 regulations in force.
- **20 August 2026:** The Solicitor General tells the court the Union government is reconsidering the regulations and has not decided what to do.
- **5 November 2026:** The Centre tells the court it is considering a special committee to re-examine them.

## Where the rules came from

The regulations trace back to a public-interest petition filed in 2019 by the mothers of Rohith Vemula and Payal Tadvi, two students whose deaths became national symbols of caste discrimination on campus. The court pressed the UGC for years to produce an enforceable framework. When it finally arrived, it lasted just over two weeks.

## What went wrong

The fight was over one clause. Regulation 3(1)(c) defined “caste-based discrimination” as discrimination only on the basis of caste or tribe against members of the Scheduled Castes, Scheduled Tribes and Other Backward Classes. Petitioners argued that this left students and teachers outside those categories with no protection under the caste clause. The court asked why a separate, narrower definition was needed at all when Regulation 3(1)(e) already defined discrimination broadly.

? A regulator had six years to draft one definition. It could not survive a first hearing.

The court did not rule on the merits. It stayed the rules pending a full hearing. That is the point: the UGC handed the court a text vague enough to stay at first sight, and the students the rules were meant to protect are now back under the advisory 2012 framework the UGC itself had decided was not enough.

## What happens now

As of our last check, no revised draft has been published and no committee has been formally announced. The 2012 regulations remain in force. We will update this record when the Centre files anything more specific than an intention.`,
    hi: {
      eyebrow: "कैंपस समता नियम",
      title: "13 जनवरी को अधिसूचित, 29 जनवरी को रोक, और तब से “पुनर्विचार के अधीन”: यूजीसी के समता नियम",
      dek: "कैंपस पर जातिगत भेदभाव के ख़िलाफ़ नियम लिखने में नियामक को छह साल लगे और उन पर रोक लगने में सोलह दिन। दस महीने बाद केंद्र अब भी एक समिति बनाने के बारे में सोच रहा है, जो उन पर सोचेगी।",
      body: `13 जनवरी 2026 को विश्वविद्यालय अनुदान आयोग (यूजीसी) ने यूजीसी (उच्च शिक्षा संस्थानों में समता संवर्धन) विनियम, 2026 अधिसूचित किए। इनका मक़सद 2012 के उन विनियमों की जगह लेना था जो ज़्यादातर सलाह भर थे। नए नियम बाध्यकारी थे: हर संस्थान में समता समिति और 24 घंटे की समता हेल्पलाइन होगी, और नियम न मानने वाले संस्थानों पर यूजीसी कार्रवाई कर सकेगा।

सोलह दिन बाद, 29 जनवरी को, सुप्रीम कोर्ट ने इन पर रोक लगा दी।

::: रिकॉर्ड
- **13 जनवरी 2026:** यूजीसी ने 2026 के समता विनियम अधिसूचित किए, जो 2012 के नियमों की जगह लेने थे।
- **29 जनवरी 2026:** सुप्रीम कोर्ट ने इन पर रोक लगाई, ढाँचे को प्रथम दृष्टया अस्पष्ट और दुरुपयोग के लायक़ बताया, और अनुच्छेद 142 के तहत 2012 के विनियम लागू रखे।
- **20 अगस्त 2026:** सॉलिसिटर जनरल ने अदालत से कहा कि केंद्र सरकार विनियमों पर पुनर्विचार कर रही है और अभी तय नहीं किया है कि क्या करना है।
- **5 नवंबर 2026:** केंद्र ने अदालत को बताया कि वह इनकी दोबारा जाँच के लिए एक विशेष समिति बनाने पर विचार कर रहा है।

## नियम कहाँ से आए

ये विनियम 2019 में रोहित वेमुला और पायल तड़वी की माँओं की जनहित याचिका से निकले। दोनों छात्रों की मौत कैंपस पर जातिगत भेदभाव का राष्ट्रीय प्रतीक बन गई थी। अदालत बरसों तक यूजीसी से लागू किए जा सकने वाले ढाँचे की माँग करती रही। जब वह आख़िरकार आया, तो दो हफ़्ते से थोड़ा ज़्यादा टिका।

## गड़बड़ी कहाँ हुई

लड़ाई एक धारा पर थी। विनियम 3(1)(c) ने “जाति-आधारित भेदभाव” को केवल अनुसूचित जाति, अनुसूचित जनजाति और अन्य पिछड़ा वर्ग के सदस्यों के ख़िलाफ़ जाति या जनजाति के आधार पर भेदभाव के रूप में परिभाषित किया। याचिकाकर्ताओं का तर्क था कि इससे इन वर्गों से बाहर के छात्रों और शिक्षकों को जाति वाली धारा के तहत कोई सुरक्षा नहीं मिलती। अदालत ने पूछा कि जब विनियम 3(1)(e) में भेदभाव की व्यापक परिभाषा पहले से है, तो अलग और संकरी परिभाषा की ज़रूरत क्या थी।

? नियामक के पास एक परिभाषा लिखने के लिए छह साल थे। वह पहली सुनवाई भी पार नहीं कर सकी।

अदालत ने गुण-दोष पर फ़ैसला नहीं दिया। उसने पूरी सुनवाई तक नियमों पर रोक लगाई। बात यही है: यूजीसी ने अदालत को इतना अस्पष्ट पाठ थमाया कि पहली नज़र में ही रोक लग गई, और जिन छात्रों की सुरक्षा के लिए ये नियम थे, वे फिर उसी सलाहकारी 2012 वाले ढाँचे के भरोसे हैं जिसे यूजीसी ख़ुद नाकाफ़ी मान चुका था।

## अब आगे क्या

हमारी आख़िरी जाँच तक न कोई संशोधित मसौदा प्रकाशित हुआ है, न कोई समिति औपचारिक रूप से घोषित हुई है। 2012 के विनियम लागू हैं। केंद्र जब किसी इरादे से ज़्यादा ठोस चीज़ दाख़िल करेगा, हम यह रिकॉर्ड अपडेट करेंगे।`,
    },
    verificationNotes:
      "Dates checked against LiveLaw (explainer and 20 Aug 2026 report) and Business Today (5 Nov 2026). Last checked 10 Nov 2026; re-check status before each update.",
  },
  {
    key: "census-2027-caste-count",
    topic: "Data & Notes",
    kind: "Explainer",
    state: "National",
    source: "Business Today: Initial phase of Census 2027 to begin on April 1 (Registrar General notification)",
    sourceUrl:
      "https://www.businesstoday.in/india/story/initial-phase-of-census-2027-to-begin-on-april-1-houselisting-to-be-done-within-30-day-period-509920-2026-01-08",
    sourcePublishedOn: "2026-01-08",
    eyebrow: "Census 2027",
    title: "India will count caste for the first time since 1931. Here is what to check before you believe the tables",
    dek: "The enumeration is coming in February 2027. The classification codes, the release timetable and access to the raw data have not been published. Those three things decide whether the count settles anything.",
    read: 7,
    tone: "Data",
    body: `For ninety-five years India has argued about caste numbers without having any. The last census to publish a full caste count was taken in 1931. Every census since 1951 has counted Scheduled Castes and Scheduled Tribes, and nobody else. Census 2027 is meant to end that.

::: Key facts
- **Decision:** In April 2025 the Union Cabinet decided that caste enumeration would be part of the next census.
- **Phase 1, houselisting:** 1 April to 30 September 2026, with each state and Union Territory given a 30-day window and an optional self-enumeration period before it.
- **Phase 2, population enumeration:** February 2027, with 1 March 2027 as the reference date for most of the country. Caste is recorded in this phase.
- **Format:** India’s first digital census, with enumerators using mobile devices.

## Why this matters

Almost every argument in this archive runs into the same wall: no current data. Courts have struck down state quota laws for lacking quantifiable data. The Rohini Commission’s work on how the OBC quota is shared has not been published. The 2011 Socio-Economic and Caste Census caste data was declared unusable. A clean national count would, for the first time, give courts, governments and the public a common denominator.

## What has not been published yet

? A caste count is only as good as the list it counts against.

- **The code list.** Respondents describe their caste in their own words; someone has to map thousands of names, spellings and synonyms onto a classification. SECC 2011 produced over 46 lakh distinct entries, which is part of why it was declared unusable. The method for Census 2027 should be public before enumeration, not after.
- **The release timetable.** Census tables have historically taken years. A date for caste tables should be committed to now.
- **Raw data access.** Researchers need anonymised unit-level data to test the tables. Publishing only summary totals invites the same distrust that buried SECC.

## How we will cover it

We will track each notification, publish the questionnaire wording as filed, and record every promised date beside the date it was actually met. If the caste tables arrive on time with their method attached, we will say so. We would genuinely enjoy writing that story.`,
    hi: {
      eyebrow: "जनगणना 2027",
      title: "1931 के बाद भारत पहली बार जाति गिनेगा। तालिकाओं पर भरोसा करने से पहले ये बातें जाँचिए",
      dek: "गणना फ़रवरी 2027 में होगी। वर्गीकरण कोड, जारी करने की समय-सारणी और कच्चे आंकड़ों तक पहुँच, ये तीनों अभी प्रकाशित नहीं हुए। यही तीन बातें तय करेंगी कि गिनती से कुछ सुलझेगा या नहीं।",
      body: `पचानवे साल से भारत जाति के आंकड़ों पर बहस कर रहा है, बिना किसी आंकड़े के। पूरी जाति गणना प्रकाशित करने वाली आख़िरी जनगणना 1931 में हुई थी। 1951 के बाद की हर जनगणना ने अनुसूचित जातियों और अनुसूचित जनजातियों को गिना, और किसी को नहीं। जनगणना 2027 इसे ख़त्म करने वाली है।

::: मुख्य तथ्य
- **फ़ैसला:** अप्रैल 2025 में केंद्रीय कैबिनेट ने तय किया कि अगली जनगणना में जाति की गणना होगी।
- **पहला चरण, मकान सूचीकरण:** 1 अप्रैल से 30 सितंबर 2026, हर राज्य और केंद्रशासित प्रदेश को 30 दिन की अवधि, और उससे पहले स्व-गणना का वैकल्पिक मौक़ा।
- **दूसरा चरण, जनसंख्या गणना:** फ़रवरी 2027, देश के ज़्यादातर हिस्से के लिए संदर्भ तिथि 1 मार्च 2027। जाति इसी चरण में दर्ज होगी।
- **तरीक़ा:** भारत की पहली डिजिटल जनगणना, जिसमें प्रगणक मोबाइल उपकरण इस्तेमाल करेंगे।

## यह क्यों अहम है

इस अभिलेखागार की लगभग हर बहस एक ही दीवार से टकराती है: ताज़ा आंकड़े नहीं हैं। अदालतों ने मापने योग्य आंकड़ों के अभाव में राज्यों के आरक्षण क़ानून रद्द किए हैं। ओबीसी कोटे के बँटवारे पर रोहिणी आयोग का काम प्रकाशित नहीं हुआ। 2011 की सामाजिक-आर्थिक और जाति जनगणना के जाति आंकड़े बेकार घोषित कर दिए गए। एक साफ़ राष्ट्रीय गणना पहली बार अदालतों, सरकारों और जनता को एक साझा आधार देगी।

## अभी क्या प्रकाशित नहीं हुआ

? जाति की गिनती उतनी ही अच्छी होगी जितनी वह सूची, जिसके आधार पर गिना जाए।

- **कोड सूची।** लोग अपनी जाति अपने शब्दों में बताते हैं; किसी को हज़ारों नामों, वर्तनियों और पर्यायों को एक वर्गीकरण में बिठाना होता है। 2011 की जनगणना (SECC) में 46 लाख से ज़्यादा अलग-अलग प्रविष्टियाँ आईं, और यही एक वजह थी कि उसे बेकार बताया गया। जनगणना 2027 का तरीक़ा गणना से पहले सार्वजनिक होना चाहिए, बाद में नहीं।
- **जारी करने की समय-सारणी।** जनगणना तालिकाओं में ऐतिहासिक रूप से बरसों लगे हैं। जाति तालिकाओं की तारीख़ अभी तय होनी चाहिए।
- **कच्चे आंकड़ों तक पहुँच।** तालिकाओं को परखने के लिए शोधकर्ताओं को गुमनाम इकाई-स्तरीय आंकड़े चाहिए। केवल कुल योग छापने से वही अविश्वास पैदा होगा जिसने SECC को दफ़ना दिया।

## हम इसे कैसे कवर करेंगे

हम हर अधिसूचना पर नज़र रखेंगे, प्रश्नावली की भाषा वैसी ही छापेंगे जैसी दाख़िल हुई, और हर वादा की गई तारीख़ के साथ वह तारीख़ दर्ज करेंगे जब वादा सच में पूरा हुआ। अगर जाति तालिकाएँ अपने तरीक़े के साथ समय पर आती हैं, तो हम यह कहेंगे। सच कहें तो वह ख़बर लिखने में हमें मज़ा आएगा।`,
    },
    verificationNotes:
      "Phase dates checked against Business Today (8 Jan 2026) reporting the Registrar General's notification. SECC 46 lakh distinct entries is the figure given by the government in Parliament; confirm wording before re-use.",
  },
  {
    key: "bihar-65-percent-law",
    topic: "States",
    kind: "Paper note",
    state: "Bihar",
    source: "Supreme Court Observer: What is the Bihar government’s 65 percent reservation quota challenge in the Supreme Court?",
    sourceUrl:
      "https://www.scobserver.in/journal/what-is-the-bihar-governments-65-percent-reservation-quota-challenge-in-the-supreme-court/",
    sourcePublishedOn: "2024-07-29",
    eyebrow: "State watch / Bihar",
    title: "Bihar counted its castes, raised the quota to 65%, and lost in the High Court within seven months",
    dek: "It did what the Centre would not: it published a caste count. Then it wrote a law the Patna High Court found had skipped the part where you show the courts why the count justifies breaching the ceiling.",
    read: 6,
    tone: "States",
    body: `Bihar is the one government in this archive that did the thing everyone else says is impossible. It counted. Then it ran straight into the 50% ceiling, at speed.

::: The record
- **2 October 2023:** Bihar releases its caste survey. Extremely Backward Classes are 36.01% of the population, Backward Classes 27.12%, Scheduled Castes 19.65%, Scheduled Tribes 1.68% and the unreserved category 15.52%.
- **November 2023:** The legislature raises reservation for SC, ST, EBC and BC from 50% to 65% in state jobs and education. With the 10% EWS quota, the total reaches 75%.
- **20 June 2024:** The Patna High Court strikes down both amendments as violating Articles 14, 15 and 16.
- **29 July 2024:** The Supreme Court refuses to stay the High Court’s order, grants leave to appeal and lists the matter for hearing.

## Why it fell

The Indra Sawhney ceiling allows reservation above 50% only in extraordinary situations, and the state has to prove them. The High Court found that Bihar had gone by population share, not by an assessment of whether these groups were inadequately represented in public services, which is the test the Constitution actually sets.

? A survey tells you who lives in the state. It does not tell you who is missing from its offices.

That is not a small distinction. Bihar had the population data in hand. What it did not publish alongside the law was the representation data: who holds the state’s jobs and seats, by category, today. That is the evidence a court asks for first, and it was the evidence the state did not lead with.

## Where it stands

The state’s appeals are pending in the Supreme Court. As of our last check, we found no final judgment. Until there is one, the 65% law is not in force, and the 50% arrangement applies. Bihar has also asked for the law to be placed in the Ninth Schedule, the route Tamil Nadu used in 1994 to protect its 69% quota. That request, too, is pending.

## The lesson for other states

Counting is necessary. It is not sufficient. Every state planning to breach the ceiling should publish its representation data with the bill, not scramble for it in the appeal.`,
    hi: {
      eyebrow: "राज्यों पर नज़र / बिहार",
      title: "बिहार ने जातियाँ गिनीं, आरक्षण 65% किया, और सात महीने के भीतर हाई कोर्ट में हार गया",
      dek: "उसने वह किया जो केंद्र ने नहीं किया: जाति की गिनती प्रकाशित की। फिर ऐसा क़ानून लिखा जिसमें, पटना हाई कोर्ट के मुताबिक़, वह हिस्सा ही छूट गया जहाँ अदालत को दिखाना होता है कि गिनती सीमा तोड़ने को सही क्यों ठहराती है।",
      body: `इस अभिलेखागार में बिहार अकेली सरकार है जिसने वह किया जिसे बाक़ी सब नामुमकिन बताते हैं। उसने गिनती की। फिर वह पूरी रफ़्तार से 50% की सीमा से टकरा गया।

::: रिकॉर्ड
- **2 अक्टूबर 2023:** बिहार ने जाति सर्वेक्षण जारी किया। आबादी में अत्यंत पिछड़ा वर्ग 36.01%, पिछड़ा वर्ग 27.12%, अनुसूचित जाति 19.65%, अनुसूचित जनजाति 1.68% और अनारक्षित वर्ग 15.52%।
- **नवंबर 2023:** विधानमंडल ने राज्य की नौकरियों और शिक्षा में एससी, एसटी, ईबीसी और बीसी का आरक्षण 50% से बढ़ाकर 65% किया। 10% ईडब्ल्यूएस मिलाकर कुल 75% हो गया।
- **20 जून 2024:** पटना हाई कोर्ट ने दोनों संशोधनों को अनुच्छेद 14, 15 और 16 का उल्लंघन बताकर रद्द कर दिया।
- **29 जुलाई 2024:** सुप्रीम कोर्ट ने हाई कोर्ट के आदेश पर रोक से इनकार किया, अपील की अनुमति दी और मामला सुनवाई के लिए सूचीबद्ध किया।

## यह क्यों गिरा

इंद्रा साहनी की सीमा 50% से ज़्यादा आरक्षण केवल असाधारण हालात में मानती है, और उन हालात को साबित करना सरकार का काम है। हाई कोर्ट ने पाया कि बिहार ने आबादी में हिस्से को आधार बनाया, इस आकलन को नहीं कि इन वर्गों का सरकारी सेवाओं में प्रतिनिधित्व अपर्याप्त है या नहीं, जबकि संविधान की असली कसौटी यही है।

? सर्वेक्षण बताता है कि राज्य में कौन रहता है। यह नहीं बताता कि उसके दफ़्तरों से कौन ग़ायब है।

यह छोटा फ़र्क़ नहीं है। बिहार के पास आबादी के आंकड़े थे। क़ानून के साथ उसने प्रतिनिधित्व के आंकड़े प्रकाशित नहीं किए: आज राज्य की नौकरियाँ और सीटें किस वर्ग के पास कितनी हैं। अदालत सबसे पहले यही सबूत माँगती है, और सरकार ने इसी से शुरुआत नहीं की।

## अभी स्थिति क्या है

राज्य की अपीलें सुप्रीम कोर्ट में लंबित हैं। हमारी आख़िरी जाँच तक कोई अंतिम फ़ैसला नहीं मिला। तब तक 65% वाला क़ानून लागू नहीं है और 50% वाली व्यवस्था चल रही है। बिहार ने इस क़ानून को नौवीं अनुसूची में डालने की माँग भी की है, वही रास्ता जिससे तमिलनाडु ने 1994 में अपना 69% आरक्षण बचाया था। वह माँग भी लंबित है।

## दूसरे राज्यों के लिए सबक़

गिनती ज़रूरी है। काफ़ी नहीं। सीमा तोड़ने की योजना बना रहे हर राज्य को अपने प्रतिनिधित्व के आंकड़े विधेयक के साथ छापने चाहिए, अपील के दौरान हड़बड़ी में नहीं ढूँढ़ने चाहिए।`,
    },
    verificationNotes:
      "Survey shares, amendment and court dates checked against SC Observer and LiveLaw (29 Jul 2024). Appeal status: no final judgment found as of 10 Nov 2026; re-check before update.",
  },
  {
    key: "maratha-quota-third-attempt",
    topic: "States",
    kind: "Article",
    state: "Maharashtra",
    source: "Free Press Journal: Bombay HC begins fresh hearing on petitions challenging 10 per cent Maratha quota",
    sourceUrl:
      "https://www.freepressjournal.in/mumbai/bombay-hc-begins-fresh-hearing-on-petitions-challenging-10-per-cent-maratha-quota",
    sourcePublishedOn: null,
    eyebrow: "State watch / Maharashtra",
    title: "Three Maratha quota laws in ten years, and the third one’s court hearing keeps starting over",
    dek: "Maharashtra has legislated a Maratha quota in 2014, 2018 and 2024. Two died in court. The third has spent more time waiting for a bench than being argued before one.",
    read: 6,
    tone: "States",
    body: `If there were a prize for persistence in legislating against a known legal ceiling, Maharashtra would keep it on a shelf next to its commission reports.

::: Three attempts
- **2014:** An ordinance grants a 16% Maratha quota in jobs and education. The Bombay High Court stays it in November 2014.
- **2018:** The Socially and Educationally Backward Class (SEBC) Act grants 16%. In June 2019 the High Court upholds it but cuts it to 12% in education and 13% in jobs. On 5 May 2021 the Supreme Court strikes the law down in Jaishri Laxmanrao Patil, holding that no extraordinary situation justified breaching the 50% ceiling, and declines to revisit Indra Sawhney.
- **2024:** On 20 February 2024, after a report by the Maharashtra State Backward Class Commission chaired by retired Justice Sunil Shukre, a special session of the legislature passes a new SEBC Act granting 10%.

## The current case

Petitions challenging the 2024 Act, and the Shukre Commission report it rests on, are before a full bench of the Bombay High Court. The hearing has had to begin afresh more than once as the bench changed; the most recent restart was reported in October 2026. The Supreme Court has asked the High Court to decide the matter quickly, because admissions keep happening while the law’s validity is unknown.

? How many admission cycles can run on a law nobody knows will survive?

## What the state has not shown

The 2021 judgment told Maharashtra exactly what was missing: evidence that Marathas were inadequately represented in public services, and an extraordinary situation that justified exceeding the ceiling. Whether the Shukre report supplies that evidence is now the question before the court. The state could have made that question easy by publishing the full underlying data with the bill. It published the conclusion.

## Who pays for the uncertainty

Not the legislators. Students and job applicants, in every category, who apply under a rule that may be struck down after they have relied on it. A state that keeps passing laws into litigation owes them, at minimum, a decided case.`,
    hi: {
      eyebrow: "राज्यों पर नज़र / महाराष्ट्र",
      title: "दस साल में मराठा आरक्षण के तीन क़ानून, और तीसरे की अदालती सुनवाई बार-बार शुरू से हो रही है",
      dek: "महाराष्ट्र ने 2014, 2018 और 2024 में मराठा आरक्षण का क़ानून बनाया। दो अदालत में ख़त्म हो गए। तीसरे ने बहस से ज़्यादा वक़्त बेंच के इंतज़ार में बिताया है।",
      body: `अगर किसी जानी-पहचानी क़ानूनी सीमा के ख़िलाफ़ बार-बार क़ानून बनाने का कोई पुरस्कार होता, तो महाराष्ट्र उसे अपनी आयोग रिपोर्टों के बगल में अलमारी पर सजाकर रखता।

::: तीन कोशिशें
- **2014:** एक अध्यादेश से नौकरियों और शिक्षा में 16% मराठा आरक्षण। बॉम्बे हाई कोर्ट ने नवंबर 2014 में उस पर रोक लगाई।
- **2018:** सामाजिक और शैक्षणिक रूप से पिछड़ा वर्ग (एसईबीसी) अधिनियम से 16%। जून 2019 में हाई कोर्ट ने इसे बरक़रार रखा, लेकिन शिक्षा में 12% और नौकरियों में 13% कर दिया। 5 मई 2021 को सुप्रीम कोर्ट ने जयश्री लक्ष्मणराव पाटिल मामले में क़ानून रद्द किया, कहा कि 50% सीमा तोड़ने को सही ठहराने वाला कोई असाधारण हालात नहीं था, और इंद्रा साहनी पर दोबारा विचार से इनकार किया।
- **2024:** सेवानिवृत्त न्यायमूर्ति सुनील शुक्रे की अध्यक्षता वाले महाराष्ट्र राज्य पिछड़ा वर्ग आयोग की रिपोर्ट के बाद, 20 फ़रवरी 2024 को विधानमंडल के विशेष सत्र ने 10% आरक्षण वाला नया एसईबीसी अधिनियम पास किया।

## मौजूदा मामला

2024 के अधिनियम और उसकी बुनियाद शुक्रे आयोग रिपोर्ट को चुनौती देने वाली याचिकाएँ बॉम्बे हाई कोर्ट की पूर्ण पीठ के सामने हैं। पीठ बदलने के कारण सुनवाई एक से ज़्यादा बार शुरू से करनी पड़ी है; सबसे ताज़ा नई शुरुआत अक्टूबर 2026 में रिपोर्ट हुई। सुप्रीम कोर्ट ने हाई कोर्ट से जल्द फ़ैसला करने को कहा है, क्योंकि क़ानून की वैधता तय न होने के बावजूद दाख़िले होते जा रहे हैं।

? ऐसे क़ानून पर कितने दाख़िला सत्र चल सकते हैं, जिसके टिकने का किसी को पता नहीं?

## सरकार ने क्या नहीं दिखाया

2021 के फ़ैसले ने महाराष्ट्र को साफ़ बताया था कि क्या कमी है: इस बात का सबूत कि सरकारी सेवाओं में मराठों का प्रतिनिधित्व अपर्याप्त है, और ऐसे असाधारण हालात जो सीमा पार करने को सही ठहराएँ। शुक्रे रिपोर्ट वह सबूत देती है या नहीं, अब अदालत के सामने यही सवाल है। सरकार विधेयक के साथ पूरे आधारभूत आंकड़े छापकर यह सवाल आसान बना सकती थी। उसने केवल निष्कर्ष छापा।

## अनिश्चितता की क़ीमत कौन चुकाता है

विधायक नहीं। हर वर्ग के छात्र और नौकरी के उम्मीदवार, जो ऐसे नियम के तहत आवेदन करते हैं जो उनके भरोसा करने के बाद रद्द हो सकता है। जो सरकार बार-बार मुक़दमे में जाने वाले क़ानून पास करती है, उस पर कम से कम एक तय फ़ैसले का क़र्ज़ बनता है।`,
    },
    verificationNotes:
      "2014/2018/2021 history is the standard public record (Jaishri Laxmanrao Patil v. Chief Minister, 5 May 2021). 2024 Act date and October 2026 restart per Free Press Journal; confirm current bench and listing before update.",
  },
  {
    key: "certificate-paper-chase",
    topic: "Ground Reports",
    kind: "Explainer",
    state: "National",
    source: "SCC Online: DoPT OM No. 36039/1/2019-Estt (Res) dated 31 January 2019 on EWS reservation",
    sourceUrl:
      "https://www.scconline.com/blog/post/2019/02/02/economically-weaker-section-ews-reservation-for-ewss-in-direct-recruitment-in-civil-posts-and-services-in-government-of-india/",
    sourcePublishedOn: "2019-02-02",
    eyebrow: "Desk report / from the documents",
    title: "Before the seat, the certificate: the paper chase every reserved-category applicant runs, year after year",
    dek: "A desk report from the government’s own memoranda. No interviews, no anecdotes: just the rules an applicant has to satisfy before a quota means anything, and the dates designed to trip them up.",
    read: 6,
    tone: "Ground",
    body: `Policy debates talk about percentages. Applicants deal with tehsil offices. This is a desk report built only from the government’s published rules: what a candidate has to produce, issued by whom, and valid for how long. It is not field reporting, and we have not interviewed anyone for it. Field reports, with consent and documents, will follow.

::: What the EWS rule requires
- **Income:** gross annual family income below ₹8 lakh, from all sources, for the financial year before the year of application.
- **Assets that disqualify, regardless of income:** 5 acres of agricultural land or more; a residential flat of 1,000 sq ft or more; a residential plot of 100 sq yards or more in notified municipalities, or 200 sq yards or more elsewhere.
- **Issued by:** a designated revenue authority, typically a Tehsildar or above.
- **Source:** DoPT Office Memorandum No. 36039/1/2019-Estt (Res), 31 January 2019.

## The calendar problem

An EWS certificate speaks to one financial year. An OBC non-creamy-layer certificate is also tied to recent income. Recruitment and admission calendars, meanwhile, run on their own dates. An applicant can be eligible in substance and still fail on timing: a certificate dated a few weeks after a cut-off, or for the wrong financial year, is a common ground for rejection in published recruitment notices.

? The rule is about who is disadvantaged. The rejection is about which month the stamp was dated.

## Central and state formats are not the same

A certificate valid for a state government job may not be accepted for a central one. Central recruitment requires the community to be on the central OBC list and the certificate to be in the central format. Families moving between state and central applications can need two different documents for one identity.

## What a functioning system would do

- Issue eligibility certificates digitally, with a public verification link, so applicants are not re-queueing every year.
- Align certificate validity with the recruitment and admission calendar, and publish the cut-off date in the first line of every notice.
- Publish, every year, how many applications were rejected for certificate defects, by category. Nobody currently has to report that number, which is presumably why nobody does.

We are collecting recruitment notices and rejection lists for a data follow-up. If you have one, the community noticeboard is open, and documents beat anecdotes.`,
    hi: {
      eyebrow: "डेस्क रिपोर्ट / दस्तावेज़ों से",
      title: "सीट से पहले प्रमाणपत्र: वह काग़ज़ी दौड़ जो आरक्षित वर्ग का हर उम्मीदवार साल-दर-साल दौड़ता है",
      dek: "सरकार के अपने ज्ञापनों से बनी डेस्क रिपोर्ट। न इंटरव्यू, न क़िस्से: बस वे नियम जिन्हें पूरा किए बिना कोटा का कोई मतलब नहीं, और वे तारीख़ें जो उम्मीदवार को लड़खड़ाने के लिए बनी लगती हैं।",
      body: `नीतिगत बहसें प्रतिशत की बात करती हैं। उम्मीदवार तहसील के दफ़्तरों से जूझते हैं। यह डेस्क रिपोर्ट केवल सरकार के प्रकाशित नियमों से बनी है: उम्मीदवार को क्या पेश करना है, कौन जारी करेगा, और वह कितने समय तक मान्य रहेगा। यह ज़मीनी रिपोर्टिंग नहीं है, और इसके लिए हमने किसी का इंटरव्यू नहीं लिया। सहमति और दस्तावेज़ों के साथ ज़मीनी रिपोर्टें आगे आएँगी।

::: ईडब्ल्यूएस नियम क्या माँगता है
- **आय:** आवेदन वाले साल से पहले के वित्त वर्ष में, सभी स्रोतों से परिवार की सकल सालाना आय ₹8 लाख से कम।
- **संपत्ति जो आय के बावजूद अयोग्य बनाती है:** 5 एकड़ या ज़्यादा कृषि भूमि; 1,000 वर्ग फ़ुट या ज़्यादा का आवासीय फ़्लैट; अधिसूचित नगरपालिकाओं में 100 वर्ग गज़ या ज़्यादा का आवासीय प्लॉट, या दूसरी जगहों पर 200 वर्ग गज़ या ज़्यादा।
- **कौन जारी करेगा:** नामित राजस्व अधिकारी, आम तौर पर तहसीलदार या उससे ऊपर।
- **स्रोत:** कार्मिक एवं प्रशिक्षण विभाग (DoPT) का कार्यालय ज्ञापन संख्या 36039/1/2019-Estt (Res), 31 जनवरी 2019।

## कैलेंडर की समस्या

ईडब्ल्यूएस प्रमाणपत्र एक वित्त वर्ष की बात करता है। ओबीसी नॉन-क्रीमी लेयर प्रमाणपत्र भी हाल की आय से जुड़ा है। उधर भर्ती और दाख़िले के कैलेंडर अपनी तारीख़ों पर चलते हैं। कोई उम्मीदवार असल में पात्र होकर भी समय पर चूक सकता है: कट-ऑफ़ के कुछ हफ़्ते बाद की तारीख़ वाला, या ग़लत वित्त वर्ष का प्रमाणपत्र, प्रकाशित भर्ती सूचनाओं में अस्वीकृति का आम कारण है।

? नियम इस बारे में है कि वंचित कौन है। अस्वीकृति इस बारे में है कि मुहर किस महीने लगी।

## केंद्र और राज्य के प्रारूप एक नहीं हैं

राज्य सरकार की नौकरी के लिए मान्य प्रमाणपत्र केंद्र की नौकरी के लिए शायद न माना जाए। केंद्रीय भर्ती में समुदाय का केंद्रीय ओबीसी सूची में होना और प्रमाणपत्र का केंद्रीय प्रारूप में होना ज़रूरी है। राज्य और केंद्र दोनों जगह आवेदन करने वाले परिवारों को एक ही पहचान के लिए दो अलग दस्तावेज़ चाहिए हो सकते हैं।

## एक काम करने वाली व्यवस्था क्या करती

- पात्रता प्रमाणपत्र डिजिटल रूप में, सार्वजनिक सत्यापन लिंक के साथ जारी करती, ताकि उम्मीदवार हर साल फिर कतार में न लगें।
- प्रमाणपत्र की वैधता को भर्ती और दाख़िले के कैलेंडर से मिलाती, और हर सूचना की पहली पंक्ति में कट-ऑफ़ तारीख़ छापती।
- हर साल प्रकाशित करती कि प्रमाणपत्र की कमी के कारण कितने आवेदन, किस वर्ग में, अस्वीकार हुए। अभी किसी को यह आंकड़ा बताना नहीं पड़ता, शायद इसीलिए कोई नहीं बताता।

हम एक आंकड़ा-आधारित फ़ॉलो-अप के लिए भर्ती सूचनाएँ और अस्वीकृति सूचियाँ जुटा रहे हैं। अगर आपके पास कोई है, तो सामुदायिक नोटिसबोर्ड खुला है, और दस्तावेज़ क़िस्सों से बेहतर हैं।`,
    },
    verificationNotes:
      "EWS criteria checked against SCC Online's reproduction of DoPT OM dated 31 Jan 2019 (and the Supreme Court's 9 Oct 2023 judgment quoting it). Explicitly a documents-only desk report; no field claims.",
  },
  {
    key: "first-amendment-1951",
    topic: "History",
    kind: "Archive",
    state: "Tamil Nadu",
    source: "Supreme Court of India: State of Madras v. Srimathi Champakam Dorairajan, [1951] 1 SCR 525",
    sourceUrl: "https://main.sci.gov.in/jonew/judis/1194.pdf",
    sourcePublishedOn: "1951-04-09",
    eyebrow: "From the archive / 1951",
    title: "Fifteen months in: how a Madras admissions case forced the Constitution’s first rewrite",
    dek: "In April 1951 the Supreme Court struck down Madras’s communal admissions order. By June, Parliament had amended the Constitution. It remains the fastest the Republic has ever moved on reservation.",
    read: 5,
    tone: "History",
    body: `The Constitution came into force on 26 January 1950. Its first serious collision with the reservation question took barely a year.

::: The record
- **The order:** Madras Presidency had, since the 1920s, allocated seats in its government medical and engineering colleges by community, under what was known as the Communal G.O.
- **The challenge:** Champakam Dorairajan, who said she had been denied a medical seat because of the order, petitioned the Madras High Court under Article 226, invoking Articles 15(1) and 29(2). The High Court agreed.
- **9 April 1951:** The Supreme Court upheld the High Court. The Directive Principles, it held, must conform to and run subsidiary to the fundamental rights in Part III. The communal order fell.
- **18 June 1951:** The Constitution (First Amendment) Act inserts Article 15(4), allowing the state to make special provisions for socially and educationally backward classes and for Scheduled Castes and Scheduled Tribes.

## Why it matters now

Article 15(4) is the foundation that almost every later reservation law in education stands on. It exists because a court found the original text did not permit what Madras was doing, and Parliament decided, within ten weeks, that it should.

? Ten weeks from judgment to amendment. Some current reports have been waiting three years for a cover page.

## Reading it honestly

The case is often told as a simple story of court versus Parliament. It is more interesting than that. The court applied the text as written; Parliament changed the text openly, with debate, in public. Both institutions did their job in the open, and the public could see who decided what. That is the standard this archive holds today’s governments to. Not that they agree with any side of the argument, but that they decide on the record.`,
    hi: {
      eyebrow: "अभिलेखागार से / 1951",
      title: "पंद्रह महीने बाद: मद्रास के एक दाख़िला मामले ने संविधान का पहला संशोधन कैसे करवाया",
      dek: "अप्रैल 1951 में सुप्रीम कोर्ट ने मद्रास का सांप्रदायिक दाख़िला आदेश रद्द किया। जून तक संसद संविधान संशोधित कर चुकी थी। आरक्षण पर गणतंत्र इससे तेज़ कभी नहीं चला।",
      body: `संविधान 26 जनवरी 1950 को लागू हुआ। आरक्षण के सवाल से उसकी पहली गंभीर टक्कर में मुश्किल से एक साल लगा।

::: रिकॉर्ड
- **आदेश:** मद्रास प्रेसीडेंसी 1920 के दशक से अपने सरकारी मेडिकल और इंजीनियरिंग कॉलेजों की सीटें समुदाय के आधार पर बाँटती थी, जिसे सांप्रदायिक जी.ओ. कहा जाता था।
- **चुनौती:** चंपकम दोरैराजन ने, जिनका कहना था कि इस आदेश के कारण उन्हें मेडिकल सीट नहीं मिली, अनुच्छेद 226 के तहत मद्रास हाई कोर्ट में याचिका दी और अनुच्छेद 15(1) और 29(2) का हवाला दिया। हाई कोर्ट ने उनकी बात मानी।
- **9 अप्रैल 1951:** सुप्रीम कोर्ट ने हाई कोर्ट का फ़ैसला बरक़रार रखा। अदालत ने कहा कि नीति-निदेशक तत्वों को भाग III के मौलिक अधिकारों के अनुरूप और उनके अधीन चलना होगा। सांप्रदायिक आदेश रद्द हो गया।
- **18 जून 1951:** संविधान (पहला संशोधन) अधिनियम ने अनुच्छेद 15(4) जोड़ा, जिससे सरकार सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों और अनुसूचित जातियों व जनजातियों के लिए विशेष प्रावधान कर सकती है।

## आज यह क्यों अहम है

शिक्षा में आरक्षण का लगभग हर बाद का क़ानून अनुच्छेद 15(4) की नींव पर खड़ा है। यह इसलिए मौजूद है क्योंकि एक अदालत ने पाया कि मूल पाठ मद्रास के क़दम की इजाज़त नहीं देता, और संसद ने दस हफ़्ते के भीतर तय किया कि देना चाहिए।

? फ़ैसले से संशोधन तक दस हफ़्ते। कुछ मौजूदा रिपोर्टें तीन साल से कवर पेज का इंतज़ार कर रही हैं।

## इसे ईमानदारी से पढ़ना

इस मामले को अक्सर अदालत बनाम संसद की सीधी कहानी की तरह सुनाया जाता है। यह उससे ज़्यादा दिलचस्प है। अदालत ने पाठ को वैसा ही लागू किया जैसा लिखा था; संसद ने पाठ को खुलेआम, बहस के साथ, सार्वजनिक रूप से बदला। दोनों संस्थाओं ने अपना काम खुले में किया, और जनता देख सकती थी कि किसने क्या तय किया। यही वह कसौटी है जिस पर यह अभिलेखागार आज की सरकारों को परखता है। यह नहीं कि वे बहस के किसी एक पक्ष से सहमत हों, बल्कि यह कि वे रिकॉर्ड पर फ़ैसला करें।`,
    },
    verificationNotes:
      "Judgment date and holding per the Supreme Court Reports text ([1951] 1 SCR 525, 9 Apr 1951). First Amendment assent date 18 Jun 1951 is the standard constitutional record.",
  },
  {
    key: "opinion-sixteen-days",
    topic: "Latest",
    kind: "Opinion",
    state: "National",
    byline: "The Signal 24 editorial board",
    source: "Business Today: Centre to review UGC equity rules, tells Supreme Court it may form panel",
    sourceUrl:
      "https://www.businesstoday.in/india/story/centre-to-review-ugc-equity-rules-tells-supreme-court-it-may-form-panel-565970-2026-11-05",
    sourcePublishedOn: "2026-11-05",
    eyebrow: "Opinion",
    title: "Sixteen days to get stayed, ten months to “reconsider”: the government’s speed depends on who is waiting",
    dek: "Students on Indian campuses are still protected by rules the regulator itself called inadequate. The Centre’s answer, after ten months, is that it might appoint a committee.",
    read: 4,
    tone: "Opinion",
    body: `The UGC took years to produce rules against caste discrimination on campus. It produced a definition so loosely drafted that the Supreme Court stayed the whole framework at the first hearing. That was January. It is now November, and the Centre’s latest update to the court is that it is considering a committee.

Not a revised rule. Not a draft for consultation. A committee, under consideration.

## Two kinds of speed

Indian governments can move fast. The EWS amendment went through both Houses of Parliament in two days in January 2019. The First Amendment, after the Champakam case, took ten weeks in 1951. When the will exists, the drafting gets done.

> Delay is a decision. It is just one that nobody has to sign.

On campus equity, there is no will in evidence. The fix the court pointed to was narrow: explain why one clause defines caste discrimination more narrowly than the general definition two lines below it, or redraft it so that it does not. That is days of work for a competent drafting team, not seasons.

## Who is waiting

Every side of this fight is waiting. Students from SC, ST and OBC communities, for whom the rules were written after two deaths, are back under advisory guidelines. Students outside those categories, who said the rules ignored them, have no revised text to respond to either. The only party that seems comfortable with the wait is the one that drafted the problem.

## What the Centre should do this month

- **Publish a revised draft** of Regulation 3(1)(c) for public comment, with a 30-day window.
- **File a timeline** with the Supreme Court, with dates, not intentions.
- **Report, institution by institution,** whether the 2012 equity bodies that are supposed to exist actually do, because those are the only protection anyone has right now.

None of this requires the government to pick a side. It only requires it to stop treating “we are reconsidering” as a policy.`,
    hi: {
      eyebrow: "राय",
      title: "रोक लगने में सोलह दिन, “पुनर्विचार” में दस महीने: सरकार की रफ़्तार इस पर निर्भर है कि इंतज़ार कौन कर रहा है",
      dek: "भारतीय कैंपसों के छात्र अब भी उन नियमों के भरोसे हैं जिन्हें ख़ुद नियामक नाकाफ़ी बता चुका है। दस महीने बाद केंद्र का जवाब है कि वह शायद एक समिति बनाए।",
      body: `कैंपस पर जातिगत भेदभाव के ख़िलाफ़ नियम बनाने में यूजीसी को बरसों लगे। उसने इतनी ढीली परिभाषा लिखी कि सुप्रीम कोर्ट ने पहली ही सुनवाई में पूरे ढाँचे पर रोक लगा दी। वह जनवरी था। अब नवंबर है, और अदालत को केंद्र की ताज़ा जानकारी यह है कि वह एक समिति पर विचार कर रहा है।

संशोधित नियम नहीं। परामर्श के लिए मसौदा नहीं। विचाराधीन एक समिति।

## दो तरह की रफ़्तार

भारतीय सरकारें तेज़ चल सकती हैं। जनवरी 2019 में ईडब्ल्यूएस संशोधन दो दिन में संसद के दोनों सदनों से पास हो गया। 1951 में चंपकम मामले के बाद पहला संशोधन दस हफ़्ते में हुआ। जब इच्छा होती है, मसौदा बन जाता है।

> देरी भी एक फ़ैसला है। बस ऐसा फ़ैसला जिस पर किसी को दस्तख़त नहीं करने पड़ते।

कैंपस समता पर ऐसी कोई इच्छा दिखती नहीं। अदालत ने जिस सुधार की ओर इशारा किया, वह संकरा था: बताइए कि एक धारा जातिगत भेदभाव को उससे दो पंक्ति नीचे दी गई सामान्य परिभाषा से संकरा क्यों बताती है, या उसे दोबारा ऐसे लिखिए कि ऐसा न हो। किसी काबिल मसौदा टीम के लिए यह दिनों का काम है, मौसमों का नहीं।

## इंतज़ार कौन कर रहा है

इस लड़ाई का हर पक्ष इंतज़ार कर रहा है। एससी, एसटी और ओबीसी समुदायों के छात्र, जिनके लिए दो मौतों के बाद ये नियम लिखे गए, फिर सलाहकारी दिशानिर्देशों के भरोसे हैं। इन वर्गों से बाहर के छात्र, जिनका कहना था कि नियमों ने उन्हें नज़रअंदाज़ किया, उनके पास भी जवाब देने के लिए कोई संशोधित पाठ नहीं है। इंतज़ार से इकलौता सहज पक्ष वही दिखता है जिसने समस्या का मसौदा लिखा था।

## केंद्र को इसी महीने क्या करना चाहिए

- विनियम 3(1)(c) का **संशोधित मसौदा** 30 दिन की अवधि के साथ सार्वजनिक टिप्पणी के लिए **प्रकाशित करे**।
- सुप्रीम कोर्ट में तारीख़ों के साथ **समय-सारणी दाख़िल करे**, इरादों के साथ नहीं।
- **संस्थान-दर-संस्थान बताए** कि 2012 के नियमों के तहत जो समता निकाय होने चाहिए, वे सच में हैं या नहीं, क्योंकि अभी किसी के पास बस यही सुरक्षा है।

इनमें से किसी के लिए सरकार को कोई पक्ष चुनने की ज़रूरत नहीं। बस इतना ज़रूरी है कि वह “हम पुनर्विचार कर रहे हैं” को नीति मानना बंद करे।`,
    },
    verificationNotes:
      "Opinion. Facts relied on: UGC notification 13 Jan 2026, stay 29 Jan 2026, Centre's 20 Aug and 5 Nov 2026 statements (LiveLaw, Business Today); EWS bill passage 8–9 Jan 2019; First Amendment June 1951.",
  },
];
