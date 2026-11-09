import type { ContentPackStory } from "./content-pack-types";

/**
 * Bilingual explainers, part A. Every factual claim is drawn from the cited source or
 * from the constitutional text; each piece is inserted in "review" status so an editor
 * verifies it (and the Hindi) before publication.
 */
export const CONTENT_PACK_A: ContentPackStory[] = [
  {
    key: "start-here-reservation-record",
    topic: "Latest",
    kind: "Explainer",
    state: "National",
    source: "Constitution of India, Legislative Department, Government of India",
    sourceUrl: "https://legislative.gov.in/constitution-of-india/",
    sourcePublishedOn: null,
    eyebrow: "Start here",
    title: "Reservation in India: what the law allows, what the courts capped, and what the state won’t publish",
    dek: "Seventy-five years of constitutional amendments and court rulings have built the system. The data that would show whether it works is still being withheld.",
    read: 7,
    tone: "Latest",
    body: `Reservation is the most argued-over policy in Indian public life, and one of the least measured. This is the record in one place: what the Constitution permits, where the Supreme Court has drawn lines, and where governments have chosen not to tell the public what they know.

::: Key facts
- Articles 15(4) and 16(4) let the state make special provisions for socially and educationally backward classes, Scheduled Castes and Scheduled Tribes.
- In 1992 the Supreme Court held in Indra Sawhney that reservations should not normally exceed 50%.
- Central government jobs reserve 27% for Other Backward Classes, a policy announced in August 1990 on the Mandal Commission’s recommendation.
- The 103rd Amendment of 2019 added up to 10% for economically weaker sections outside those groups. The Supreme Court upheld it 3:2 in November 2022.

## What the law allows

The Constitution begins with equality before the law in Article 14, then explicitly permits special measures for groups that history excluded. Those permissions were not all in the original text. Article 15(4) was added by the First Amendment in 1951, after the Supreme Court struck down a Madras government order on college admissions. Almost every major expansion since then has followed the same pattern: a court ruling, then a constitutional amendment.

## Where the courts drew lines

The courts have accepted reservation as constitutional while repeatedly setting conditions: a 50% ceiling except in extraordinary situations, the exclusion of a “creamy layer” among backward classes, and quantifiable data before reservation in promotions. Several state laws that breached the ceiling, including Maharashtra’s 2018 Maratha quota and Bihar’s 2023 increase to 65%, were struck down.

## What the state has not published

? The debate runs on numbers nobody has been shown.

The 2011 Socio-Economic and Caste Census collected caste data, and in 2021 the Centre told the Supreme Court that data was unusable. The Rohini Commission’s report on how the OBC quota is shared among more than 2,600 communities was submitted in July 2023 and has not been made public. The OBC creamy-layer income limit has not been revised since 2017.

## How to read this archive

Every record on The Signal 24 shows its source, its date and its verification status. Where the public record has a gap, we say so rather than fill it. Start with the [Accountability Watch on the front page](https://thesignal24.com/#accountability), then follow any topic through the archive.`,
    hi: {
      eyebrow: "यहाँ से शुरू करें",
      title: "भारत में आरक्षण: क़ानून क्या इजाज़त देता है, अदालतों ने क्या सीमा बाँधी, और सरकार क्या नहीं बताती",
      dek: "पचहत्तर साल के संविधान संशोधनों और अदालती फ़ैसलों ने यह व्यवस्था बनाई है। यह व्यवस्था काम कर रही है या नहीं, यह बताने वाले आंकड़े आज भी रोके हुए हैं।",
      body: `आरक्षण भारत के सार्वजनिक जीवन की सबसे ज़्यादा बहस वाली नीति है, और सबसे कम मापी गई भी। यह रिकॉर्ड एक जगह है: संविधान क्या इजाज़त देता है, सुप्रीम कोर्ट ने कहाँ रेखाएँ खींचीं, और सरकारों ने कहाँ वह जानकारी जनता से छिपाए रखी जो उनके पास है।

::: मुख्य तथ्य
- अनुच्छेद 15(4) और 16(4) सरकार को सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों, अनुसूचित जातियों और अनुसूचित जनजातियों के लिए विशेष प्रावधान करने की अनुमति देते हैं।
- 1992 में इंद्रा साहनी मामले में सुप्रीम कोर्ट ने कहा कि आरक्षण सामान्य तौर पर 50% से ज़्यादा नहीं होना चाहिए।
- केंद्र सरकार की नौकरियों में अन्य पिछड़ा वर्ग (ओबीसी) के लिए 27% आरक्षण है, जिसकी घोषणा मंडल आयोग की सिफ़ारिश पर अगस्त 1990 में हुई।
- 2019 के 103वें संशोधन ने इन समूहों से बाहर के आर्थिक रूप से कमज़ोर वर्गों (ईडब्ल्यूएस) के लिए 10% तक आरक्षण जोड़ा। नवंबर 2022 में सुप्रीम कोर्ट ने इसे 3:2 से बरक़रार रखा।

## क़ानून क्या इजाज़त देता है

संविधान अनुच्छेद 14 में क़ानून के सामने बराबरी से शुरू होता है, और फिर उन समूहों के लिए विशेष उपायों की साफ़ इजाज़त देता है जिन्हें इतिहास ने बाहर रखा। ये सभी प्रावधान मूल संविधान में नहीं थे। अनुच्छेद 15(4) 1951 में पहले संशोधन से जोड़ा गया, जब सुप्रीम कोर्ट ने कॉलेज दाख़िलों पर मद्रास सरकार का एक आदेश रद्द कर दिया था। तब से लगभग हर बड़ा विस्तार इसी क्रम में हुआ है: पहले अदालत का फ़ैसला, फिर संविधान संशोधन।

## अदालतों ने कहाँ रेखा खींची

अदालतों ने आरक्षण को संवैधानिक माना है, लेकिन बार-बार शर्तें भी रखी हैं: असाधारण हालात को छोड़कर 50% की सीमा, पिछड़े वर्गों में “क्रीमी लेयर” को बाहर रखना, और पदोन्नति में आरक्षण से पहले ठोस आंकड़े। सीमा तोड़ने वाले कई राज्य क़ानून रद्द हुए, जिनमें महाराष्ट्र का 2018 का मराठा आरक्षण और बिहार का 2023 में आरक्षण 65% करने वाला क़ानून शामिल हैं।

## सरकार ने क्या प्रकाशित नहीं किया

? बहस उन आंकड़ों पर चल रही है जो किसी को दिखाए ही नहीं गए।

2011 की सामाजिक-आर्थिक और जाति जनगणना में जाति के आंकड़े जुटाए गए, और 2021 में केंद्र ने सुप्रीम कोर्ट से कहा कि ये आंकड़े इस्तेमाल लायक नहीं हैं। ओबीसी आरक्षण 2,600 से ज़्यादा समुदायों में कैसे बँट रहा है, इस पर रोहिणी आयोग की रिपोर्ट जुलाई 2023 में सौंपी गई और अब तक सार्वजनिक नहीं हुई। ओबीसी क्रीमी लेयर की आय सीमा 2017 के बाद से नहीं बदली।

## इस अभिलेखागार को कैसे पढ़ें

द सिग्नल 24 का हर रिकॉर्ड अपना स्रोत, अपनी तारीख़ और अपनी सत्यापन स्थिति दिखाता है। जहाँ सार्वजनिक रिकॉर्ड में कमी है, हम उसे गढ़कर नहीं भरते, साफ़ बताते हैं। [पहले पन्ने पर जवाबदेही वाला खंड](https://thesignal24.com/hi#accountability) देखिए, और फिर किसी भी विषय को अभिलेखागार में आगे तक पढ़िए।`,
    },
    verificationNotes:
      "Draft for editor review. Check each article reference against the constitutional text and the linked judgments before publishing; check the Hindi against the English.",
  },
  {
    key: "constitution-article-by-article",
    topic: "Courts & Policy",
    kind: "Explainer",
    state: "National",
    source: "Constitution of India, Legislative Department, Government of India",
    sourceUrl: "https://legislative.gov.in/constitution-of-india/",
    sourcePublishedOn: null,
    eyebrow: "The text",
    title: "What the Constitution actually says about reservation, article by article",
    dek: "Most of the reservation framework was not in the original 1950 text. It was added amendment by amendment, usually within months of a court ruling the government did not like.",
    read: 6,
    tone: "Courts",
    body: `Political speeches treat reservation as a single promise. The constitutional text is a stack of separate provisions, most added after 1950, each with its own conditions.

::: The provisions
- **Article 14:** equality before the law.
- **Article 15(4):** special provisions for socially and educationally backward classes, SCs and STs. Added by the First Amendment, 1951.
- **Article 15(5):** reservation in admissions, including private educational institutions, except minority institutions. Added by the 93rd Amendment, 2005.
- **Articles 15(6) and 16(6):** up to 10% for economically weaker sections. Added by the 103rd Amendment, 2019.
- **Article 16(4):** reservation in public appointments for backward classes not adequately represented.
- **Article 16(4A):** reservation in promotions for SCs and STs. Added by the 77th Amendment, 1995.
- **Article 16(4B):** unfilled reserved vacancies carried forward as a separate class. Added by the 81st Amendment, 2000.
- **Article 335:** claims of SCs and STs to be considered consistently with the efficiency of administration.
- **Article 342A:** lists of socially and educationally backward classes. Added by the 102nd Amendment, 2018, and rewritten by the 105th Amendment, 2021.

## A pattern of court first, amendment second

The First Amendment followed the Supreme Court’s 1951 decision in State of Madras v. Champakam Dorairajan, which struck down a caste-based admissions order. The 77th Amendment followed Indra Sawhney (1992), which had barred reservation in promotions. The 105th Amendment followed the Maratha judgment of May 2021, in which a 3:2 majority read Parliament’s own 102nd Amendment as removing states’ power to identify backward classes. The Centre said that was never its intention, and Parliament passed a further amendment within months to restore that power.

? What does this pattern tell us?

It tells us that Parliament has repeatedly legislated without anticipating how its own words would be read, and then legislated again in a hurry. Each amendment came with a stated purpose; few came with the data the courts later asked for.

## What the text does not say

The Constitution does not fix any percentage for SC, ST or OBC reservation in jobs or education. The 50% ceiling comes from the Supreme Court, not the text. The only percentage the text itself sets is the “ten per cent” maximum for economically weaker sections.`,
    hi: {
      eyebrow: "मूल पाठ",
      title: "आरक्षण पर संविधान असल में क्या कहता है, अनुच्छेद-दर-अनुच्छेद",
      dek: "आरक्षण का ज़्यादातर ढाँचा 1950 के मूल पाठ में नहीं था। इसे एक-एक संशोधन से जोड़ा गया, अक्सर किसी ऐसे अदालती फ़ैसले के कुछ ही महीनों बाद जो सरकार को पसंद नहीं आया।",
      body: `राजनीतिक भाषण आरक्षण को एक ही वादे की तरह पेश करते हैं। संविधान का पाठ अलग-अलग प्रावधानों का ढेर है, जिनमें से ज़्यादातर 1950 के बाद जोड़े गए, और हर एक की अपनी शर्तें हैं।

::: प्रावधान
- **अनुच्छेद 14:** क़ानून के सामने बराबरी।
- **अनुच्छेद 15(4):** सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों, एससी और एसटी के लिए विशेष प्रावधान। पहले संशोधन, 1951 से जोड़ा गया।
- **अनुच्छेद 15(5):** दाख़िलों में आरक्षण, निजी शिक्षण संस्थानों समेत, अल्पसंख्यक संस्थानों को छोड़कर। 93वें संशोधन, 2005 से जोड़ा गया।
- **अनुच्छेद 15(6) और 16(6):** आर्थिक रूप से कमज़ोर वर्गों के लिए 10% तक। 103वें संशोधन, 2019 से जोड़ा गया।
- **अनुच्छेद 16(4):** उन पिछड़े वर्गों के लिए सरकारी नियुक्तियों में आरक्षण जिनका प्रतिनिधित्व पर्याप्त नहीं है।
- **अनुच्छेद 16(4A):** एससी और एसटी के लिए पदोन्नति में आरक्षण। 77वें संशोधन, 1995 से जोड़ा गया।
- **अनुच्छेद 16(4B):** ख़ाली रह गई आरक्षित रिक्तियाँ अलग वर्ग के रूप में आगे ले जाई जाएँ। 81वें संशोधन, 2000 से जोड़ा गया।
- **अनुच्छेद 335:** एससी और एसटी के दावों पर प्रशासन की दक्षता के साथ तालमेल रखते हुए विचार।
- **अनुच्छेद 342A:** सामाजिक और शैक्षणिक रूप से पिछड़े वर्गों की सूचियाँ। 102वें संशोधन, 2018 से जोड़ा गया, और 105वें संशोधन, 2021 से दोबारा लिखा गया।

## पहले अदालत, फिर संशोधन का सिलसिला

पहला संशोधन 1951 में सुप्रीम कोर्ट के ‘मद्रास राज्य बनाम चंपकम दोराइराजन’ फ़ैसले के बाद आया, जिसमें जाति के आधार पर दाख़िले का एक आदेश रद्द हुआ था। 77वाँ संशोधन इंद्रा साहनी (1992) के बाद आया, जिसने पदोन्नति में आरक्षण पर रोक लगा दी थी। 105वाँ संशोधन मई 2021 के मराठा फ़ैसले के बाद आया, जिसमें 3:2 के बहुमत ने संसद के ही 102वें संशोधन का यह अर्थ निकाला कि राज्यों से पिछड़े वर्ग पहचानने का अधिकार छिन गया है। केंद्र ने कहा कि उसका ऐसा इरादा कभी नहीं था, और संसद ने कुछ ही महीनों में एक और संशोधन पास करके यह अधिकार लौटा दिया।

? यह सिलसिला हमें क्या बताता है?

यह बताता है कि संसद ने बार-बार यह सोचे बिना क़ानून बनाया कि उसके अपने शब्दों का क्या अर्थ निकाला जाएगा, और फिर जल्दबाज़ी में दोबारा क़ानून बनाया। हर संशोधन के साथ एक घोषित मक़सद था; बहुत कम के साथ वे आंकड़े थे जो बाद में अदालतों ने माँगे।

## पाठ क्या नहीं कहता

संविधान नौकरियों या शिक्षा में एससी, एसटी या ओबीसी आरक्षण का कोई प्रतिशत तय नहीं करता। 50% की सीमा सुप्रीम कोर्ट से आती है, संविधान के पाठ से नहीं। पाठ ख़ुद जो एकमात्र प्रतिशत तय करता है, वह आर्थिक रूप से कमज़ोर वर्गों के लिए “दस प्रतिशत” की अधिकतम सीमा है।`,
    },
    verificationNotes:
      "Draft for editor review. Verify each amendment number and year against the official Constitution text (Legislative Department) and confirm the 3:2 reading on Article 342A in the Maratha judgment.",
  },
  {
    key: "before-1950-history",
    topic: "History",
    kind: "Explainer",
    state: "National",
    source: "Wikipedia: Poona Pact (secondary reference; replace with primary archival source)",
    sourceUrl: "https://en.wikipedia.org/wiki/Poona_Pact",
    sourcePublishedOn: null,
    eyebrow: "Before the Constitution",
    title: "Before 1950: a princely order in Kolhapur, a pact in a Poona jail, and the seats that came out of it",
    dek: "Reservation did not begin with the Constitution. It began with administrators and reformers who decided that a closed bureaucracy was a political problem.",
    read: 5,
    tone: "History",
    body: `When the Constituent Assembly wrote special provisions into the Constitution, it was not inventing the idea. It was inheriting four decades of experiments, arguments and bargains.

::: Key dates
- **26 July 1902:** Shahu Maharaj of Kolhapur orders that 50% of vacancies in the state’s service be filled from backward classes.
- **1921:** The Justice Party government in the Madras Presidency issues its first communal government order on representation in public services.
- **August 1932:** The British Communal Award grants separate electorates to the “depressed classes”.
- **24 September 1932:** The Poona Pact, signed at Yerwada jail, replaces separate electorates with seats reserved within a joint electorate.

## Kolhapur, 1902

The order from the ruler of a princely state was blunt: of the posts falling vacant from that date, half were to go to backward classes. The reasoning was administrative as much as moral. A government staffed by a narrow set of castes, the order’s defenders argued, would govern for that set.

## Madras and the communal orders

In the Madras Presidency, the Justice Party’s government issued communal government orders from 1921 to distribute public appointments among communities. A later version of that order was the one struck down by the Supreme Court in 1951, which led directly to the First Amendment.

## The Poona Pact

? Who should represent the depressed classes in the legislature, and who should elect them?

The Communal Award of 1932 answered with separate electorates. Gandhi fasted against it. B. R. Ambedkar negotiated an alternative: seats reserved for the depressed classes but elected by a joint electorate. The pact signed on 24 September 1932 reserved 148 seats in provincial legislatures, roughly double the number under the Award. Reserved constituencies for Scheduled Castes in today’s legislatures descend from that bargain.

## Why this matters now

Each of these arrangements was justified by a claim about representation, and each was contested. The argument about whether representation is being achieved is a hundred years old. What has changed is that the state now has the means to measure it, and has chosen, more than once, not to publish the measurement.`,
    hi: {
      eyebrow: "संविधान से पहले",
      title: "1950 से पहले: कोल्हापुर का एक शाही आदेश, पूना की जेल में एक समझौता, और उससे निकली सीटें",
      dek: "आरक्षण संविधान से शुरू नहीं हुआ। यह उन प्रशासकों और सुधारकों से शुरू हुआ जिन्होंने माना कि मुट्ठी भर जातियों की नौकरशाही एक राजनीतिक समस्या है।",
      body: `संविधान सभा ने जब संविधान में विशेष प्रावधान लिखे, तो वह कोई नया विचार नहीं गढ़ रही थी। उसे चार दशकों के प्रयोग, बहसें और समझौते विरासत में मिले थे।

::: अहम तारीख़ें
- **26 जुलाई 1902:** कोल्हापुर के शाहू महाराज ने आदेश दिया कि राज्य की सेवा में 50% रिक्तियाँ पिछड़े वर्गों से भरी जाएँ।
- **1921:** मद्रास प्रेसिडेंसी में जस्टिस पार्टी की सरकार ने सरकारी सेवाओं में प्रतिनिधित्व पर अपना पहला सांप्रदायिक सरकारी आदेश जारी किया।
- **अगस्त 1932:** ब्रिटिश कम्युनल अवॉर्ड ने “दलित वर्गों” को पृथक निर्वाचन दिया।
- **24 सितंबर 1932:** यरवदा जेल में हुए पूना समझौते ने पृथक निर्वाचन की जगह संयुक्त निर्वाचन के भीतर आरक्षित सीटें तय कीं।

## कोल्हापुर, 1902

एक रियासत के शासक का आदेश सीधा था: उस तारीख़ से ख़ाली होने वाले पदों में से आधे पिछड़े वर्गों को मिलेंगे। तर्क जितना नैतिक था, उतना ही प्रशासनिक भी। इस आदेश के समर्थकों का कहना था कि जिस सरकार में गिनी-चुनी जातियों के लोग बैठे हों, वह उन्हीं के लिए शासन करेगी।

## मद्रास और सांप्रदायिक आदेश

मद्रास प्रेसिडेंसी में जस्टिस पार्टी की सरकार ने 1921 से सरकारी नियुक्तियों को समुदायों में बाँटने के लिए सांप्रदायिक सरकारी आदेश जारी किए। इसी आदेश का एक बाद का रूप 1951 में सुप्रीम कोर्ट ने रद्द किया, और उसी से सीधे पहला संविधान संशोधन निकला।

## पूना समझौता

? विधायिका में दलित वर्गों का प्रतिनिधित्व कौन करे, और उन्हें चुने कौन?

1932 के कम्युनल अवॉर्ड का जवाब था पृथक निर्वाचन। गांधी ने इसके ख़िलाफ़ अनशन किया। बी. आर. आंबेडकर ने एक विकल्प पर समझौता किया: सीटें दलित वर्गों के लिए आरक्षित हों, लेकिन उन्हें संयुक्त मतदाता चुनें। 24 सितंबर 1932 को हुए समझौते ने प्रांतीय विधायिकाओं में 148 सीटें आरक्षित कीं, जो अवॉर्ड की तुलना में लगभग दोगुनी थीं। आज की विधायिकाओं में अनुसूचित जातियों के लिए आरक्षित निर्वाचन क्षेत्र उसी समझौते से निकले हैं।

## आज यह क्यों मायने रखता है

इन सभी व्यवस्थाओं को प्रतिनिधित्व के किसी दावे पर सही ठहराया गया, और हर एक पर विवाद हुआ। प्रतिनिधित्व हासिल हो रहा है या नहीं, यह बहस सौ साल पुरानी है। बदला यह है कि आज सरकार के पास इसे मापने के साधन हैं, और उसने एक से ज़्यादा बार वह माप प्रकाशित न करने का फ़ैसला किया है।`,
    },
    verificationNotes:
      "Draft for editor review. The linked source is secondary. Replace with primary or scholarly sources for the 1902 Kolhapur order, the 1921 Madras communal G.O. and the text of the Poona Pact before publishing. Sources disagree on 147 vs 148 seats; 148 is the most widely cited figure.",
  },
  {
    key: "indra-sawhney-1992",
    topic: "Courts & Policy",
    kind: "Paper note",
    state: "National",
    source: "Supreme Court of India, Indra Sawhney v. Union of India (16 November 1992)",
    sourceUrl: "https://indiankanoon.org/search/?formInput=Indra%20Sawhney%20vs%20Union%20of%20India%2016%20November%201992",
    sourcePublishedOn: "1992-11-16",
    eyebrow: "The judgment that set the ceiling",
    title: "Indra Sawhney, 1992: the 50% ceiling, the creamy layer, and a promise on promotions that Parliament reversed",
    dek: "A nine-judge bench upheld the OBC quota but attached conditions. Governments have spent three decades amending around them.",
    read: 6,
    tone: "Courts",
    body: `On 16 November 1992, a nine-judge bench of the Supreme Court decided the challenge to the Mandal reservations. The majority judgment is still the most cited reservation ruling in the country.

::: What the court held
- The 27% reservation for Other Backward Classes in central government jobs was upheld.
- The “creamy layer”, the socially advanced among backward classes, must be excluded.
- Reservations should not exceed 50%, except in extraordinary situations.
- Reservation under Article 16(4) applies to initial appointments, not promotions.
- A separate 10% reservation for economically backward people among the non-reserved, introduced by an office memorandum in September 1991, was struck down.

## What governments did next

The creamy-layer exclusion was implemented by an office memorandum dated 8 September 1993, which set the income limit at ₹1 lakh a year. The limit was later raised to ₹2.5 lakh in 2004, ₹4.5 lakh in 2008, ₹6 lakh in 2013 and ₹8 lakh in September 2017. It has not moved since.

The bar on promotions lasted three years. Parliament inserted Article 16(4A) through the 77th Amendment in 1995 to restore reservation in promotions for SCs and STs.

The economic criterion struck down in 1992 returned in 2019 as the 103rd Amendment, this time written into the Constitution itself.

? Has the 50% ceiling held?

In law, largely yes: the Supreme Court used it to strike down Maharashtra’s Maratha quota in 2021. In practice, Tamil Nadu’s 69% has stood since 1994 under a law placed in the Ninth Schedule, and the EWS quota operates outside the 50% calculation after the 2022 judgment upheld it.

## Why it still matters

Indra Sawhney asked governments to justify departures from the rule with evidence. Thirty years on, the question in most reservation cases is the same: where is the data?`,
    hi: {
      eyebrow: "जिस फ़ैसले ने सीमा तय की",
      title: "इंद्रा साहनी, 1992: 50% की सीमा, क्रीमी लेयर, और पदोन्नति पर एक रोक जिसे संसद ने पलट दिया",
      dek: "नौ जजों की पीठ ने ओबीसी आरक्षण को बरक़रार रखा, लेकिन शर्तों के साथ। सरकारें तीन दशक से उन शर्तों के इर्द-गिर्द संशोधन करती रही हैं।",
      body: `16 नवंबर 1992 को सुप्रीम कोर्ट की नौ जजों की पीठ ने मंडल आरक्षण को दी गई चुनौती पर फ़ैसला सुनाया। बहुमत का यह फ़ैसला आज भी देश में आरक्षण पर सबसे ज़्यादा उद्धृत किया जाने वाला फ़ैसला है।

::: अदालत ने क्या कहा
- केंद्र सरकार की नौकरियों में अन्य पिछड़ा वर्ग के लिए 27% आरक्षण बरक़रार रखा गया।
- “क्रीमी लेयर”, यानी पिछड़े वर्गों में सामाजिक रूप से आगे बढ़ चुके लोगों को, बाहर रखना होगा।
- असाधारण हालात को छोड़कर आरक्षण 50% से ज़्यादा नहीं होना चाहिए।
- अनुच्छेद 16(4) के तहत आरक्षण शुरुआती नियुक्ति पर लागू है, पदोन्नति पर नहीं।
- सितंबर 1991 के एक कार्यालय ज्ञापन से लाया गया, ग़ैर-आरक्षित वर्गों के आर्थिक रूप से पिछड़े लोगों के लिए 10% का अलग आरक्षण रद्द कर दिया गया।

## उसके बाद सरकारों ने क्या किया

क्रीमी लेयर को बाहर रखने का नियम 8 सितंबर 1993 के कार्यालय ज्ञापन से लागू हुआ, जिसमें आय सीमा ₹1 लाख सालाना रखी गई। बाद में यह सीमा 2004 में ₹2.5 लाख, 2008 में ₹4.5 लाख, 2013 में ₹6 लाख और सितंबर 2017 में ₹8 लाख की गई। तब से यह नहीं बदली।

पदोन्नति पर रोक तीन साल चली। संसद ने 1995 में 77वें संशोधन से अनुच्छेद 16(4A) जोड़कर एससी और एसटी के लिए पदोन्नति में आरक्षण बहाल कर दिया।

1992 में रद्द हुआ आर्थिक आधार 2019 में 103वें संशोधन के रूप में लौटा, इस बार सीधे संविधान में लिखकर।

? क्या 50% की सीमा टिकी रही?

क़ानून में, काफ़ी हद तक हाँ: सुप्रीम कोर्ट ने 2021 में इसी आधार पर महाराष्ट्र का मराठा आरक्षण रद्द किया। व्यवहार में, तमिलनाडु का 69% आरक्षण 1994 से नौवीं अनुसूची में रखे गए क़ानून के तहत चल रहा है, और 2022 के फ़ैसले के बाद ईडब्ल्यूएस आरक्षण 50% के हिसाब से बाहर चलता है।

## यह आज भी क्यों मायने रखता है

इंद्रा साहनी फ़ैसले ने सरकारों से कहा था कि नियम से हटें तो सबूत के साथ। तीस साल बाद भी ज़्यादातर आरक्षण मामलों में सवाल वही है: आंकड़े कहाँ हैं?`,
    },
    verificationNotes:
      "Draft for editor review. Replace the Indian Kanoon search link with the direct judgment link (AIR 1993 SC 477; (1992) Supp 3 SCC 217). Creamy-layer revision dates checked against DoPT/NCBC records: 8.9.1993, 9.3.2004, 14.10.2008, 27.5.2013, 13.9.2017.",
  },
];
