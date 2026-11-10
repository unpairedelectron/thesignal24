/**
 * Addenda, part A: the deeper record, the hard questions, and how to check it yourself,
 * appended to each pack story's body. Questions are aimed at named institutions and
 * office-holders, never at communities. Facts restate the linked sources or the
 * constitutional and statutory record.
 */
export type Addendum = { en: string; hi: string };

const Q_EN = "::: [questions] The questions they won’t answer";
const Q_HI = "::: [questions] वे सवाल, जिनका जवाब वे नहीं देंगे";
const C_EN = "::: [check] Check it yourself";
const C_HI = "::: [check] ख़ुद जाँचिए";

export const ADDENDA_A: Record<string, Addendum> = {
  "ugc-equity-regulations-2026": {
    en: `## Why a narrow definition was always going to fail

Anti-discrimination rules live or die on their definitions. A clause that names who can be discriminated against invites two attacks at once: from people it leaves out, and from institutions looking for a reason not to act. The UGC drafted a framework with binding committees and helplines, which was the hard part, and then gave its opponents the easiest possible target.

The 2012 regulations that are back in force asked institutions to appoint anti-discrimination officers and act on complaints, but the UGC has never published how many institutions complied, how many complaints were filed, or how many were resolved. A regulator that cannot say whether its old rules worked was always going to struggle to defend new ones.

${Q_EN}
- How many universities appointed the anti-discrimination officers the 2012 regulations required, and why has the UGC never published the number?
- Who in the UGC approved the final wording of Regulation 3(1)(c), and was a legal opinion taken on it before notification?
- How many caste-discrimination complaints have Indian campuses recorded since 2012, and how many ended in action?
- Why has the Centre needed ten months to decide whether to redraft one clause?
- Will the revised draft be published for public comment before it is notified, or will students again learn the rules from the gazette?

${C_EN}
- Read the stay order and the 20 August and 5 November hearings on the Supreme Court’s website (sci.gov.in) or through LiveLaw’s case coverage.
- Read the 2012 regulations on the UGC website (ugc.gov.in) and compare what they require with what your own institution displays.
- File an RTI with the UGC at rtionline.gov.in asking for the number of complaints received under the 2012 regulations, year by year.
- Ask your university, in writing, for the name of its anti-discrimination officer and the number of complaints it has recorded.`,
    hi: `## संकरी परिभाषा का गिरना तय क्यों था

भेदभाव-विरोधी नियम अपनी परिभाषाओं पर टिकते या गिरते हैं। जो धारा यह तय करे कि भेदभाव किसके साथ हो सकता है, उस पर दो तरफ़ से हमला होता है: उनकी ओर से जिन्हें वह छोड़ देती है, और उन संस्थानों की ओर से जो कार्रवाई न करने का बहाना ढूँढ़ते हैं। यूजीसी ने बाध्यकारी समितियों और हेल्पलाइनों वाला ढाँचा बनाया, जो मुश्किल हिस्सा था, और फिर विरोधियों को सबसे आसान निशाना थमा दिया।

फिर से लागू हुए 2012 के विनियम संस्थानों से भेदभाव-विरोधी अधिकारी नियुक्त करने और शिकायतों पर कार्रवाई करने को कहते हैं, लेकिन यूजीसी ने कभी नहीं बताया कि कितने संस्थानों ने इसका पालन किया, कितनी शिकायतें आईं, या कितनी सुलझीं। जो नियामक यह न बता सके कि उसके पुराने नियम काम कर रहे थे या नहीं, उसके लिए नए नियमों का बचाव मुश्किल होना ही था।

${Q_HI}
- 2012 के विनियमों के तहत कितने विश्वविद्यालयों ने भेदभाव-विरोधी अधिकारी नियुक्त किए, और यूजीसी ने यह संख्या कभी प्रकाशित क्यों नहीं की?
- यूजीसी में विनियम 3(1)(c) की अंतिम भाषा को किसने मंज़ूरी दी, और क्या अधिसूचना से पहले उस पर क़ानूनी राय ली गई?
- 2012 से भारतीय कैंपसों में जातिगत भेदभाव की कितनी शिकायतें दर्ज हुईं, और कितनों पर कार्रवाई हुई?
- एक धारा को दोबारा लिखने का फ़ैसला करने में केंद्र को दस महीने क्यों लगे?
- क्या संशोधित मसौदा अधिसूचना से पहले सार्वजनिक टिप्पणी के लिए प्रकाशित होगा, या छात्र फिर से नियम गज़ट से ही जानेंगे?

${C_HI}
- रोक का आदेश और 20 अगस्त व 5 नवंबर की सुनवाइयाँ सुप्रीम कोर्ट की वेबसाइट (sci.gov.in) पर या लाइवलॉ की कवरेज में पढ़िए।
- यूजीसी की वेबसाइट (ugc.gov.in) पर 2012 के विनियम पढ़िए और मिलाइए कि आपका संस्थान उनमें से क्या दिखाता है।
- rtionline.gov.in पर यूजीसी को आरटीआई भेजिए और 2012 के विनियमों के तहत मिली शिकायतों की साल-दर-साल संख्या माँगिए।
- अपने विश्वविद्यालय से लिखित में उसके भेदभाव-विरोधी अधिकारी का नाम और दर्ज शिकायतों की संख्या पूछिए।`,
  },
  "census-2027-caste-count": {
    en: `## What happened the last time India tried

The 2011 Socio-Economic and Caste Census was run separately from the main census, by the Ministry of Rural Development and the Ministry of Housing and Urban Poverty Alleviation, with caste recorded as free text. The socio-economic tables were released in 2015. The caste tables never were. In 2015 the government announced an expert group under the then vice-chairman of NITI Aayog to classify the caste returns; its work has never been published.

Census 2027 is different on paper: caste is part of the statutory census, conducted under the Census Act, 1948, by the Registrar General. That matters, because census data is meant to be published. Whether it is published quickly, completely, and with a method anyone can check is a choice the government has not yet announced.

${Q_EN}
- What happened to the expert group announced in 2015 to classify SECC caste data, and why was its work never published?
- Will the Registrar General publish the caste code directory before enumeration begins, so enumerators and respondents know how answers will be classified?
- Will OBC status be recorded as a category, or only individual caste names, leaving classification to be done later and out of sight?
- On what date will caste tables be released, and will the government commit to that date now?
- Will anonymised unit-level data be made available to researchers, as it is for other national surveys?

${C_EN}
- Read the census notifications in the Gazette of India at egazette.gov.in, and the Registrar General’s releases at censusindia.gov.in.
- Search Lok Sabha and Rajya Sabha questions on caste enumeration at sansad.in; ministers’ written answers are on the record.
- File an RTI with the Office of the Registrar General of India (Ministry of Home Affairs) asking for the caste code directory and the planned tabulation schedule.
- Compare what is promised now with what was promised for SECC in 2011. Keep the dates.`,
    hi: `## पिछली बार भारत ने कोशिश की तो क्या हुआ

2011 की सामाजिक-आर्थिक और जाति जनगणना मुख्य जनगणना से अलग चलाई गई, ग्रामीण विकास मंत्रालय और आवास एवं शहरी गरीबी उन्मूलन मंत्रालय द्वारा, और जाति को मुक्त पाठ के रूप में दर्ज किया गया। सामाजिक-आर्थिक तालिकाएँ 2015 में जारी हुईं। जाति तालिकाएँ कभी नहीं। 2015 में सरकार ने जाति आंकड़ों के वर्गीकरण के लिए नीति आयोग के तत्कालीन उपाध्यक्ष के नेतृत्व में एक विशेषज्ञ समूह की घोषणा की; उसका काम कभी प्रकाशित नहीं हुआ।

काग़ज़ पर जनगणना 2027 अलग है: जाति वैधानिक जनगणना का हिस्सा है, जो जनगणना अधिनियम, 1948 के तहत महापंजीयक करते हैं। यह अहम है, क्योंकि जनगणना के आंकड़े प्रकाशित होने के लिए होते हैं। वे जल्दी, पूरे और जाँचे जा सकने वाले तरीक़े के साथ छपेंगे या नहीं, यह फ़ैसला सरकार ने अभी घोषित नहीं किया है।

${Q_HI}
- SECC जाति आंकड़ों के वर्गीकरण के लिए 2015 में घोषित विशेषज्ञ समूह का क्या हुआ, और उसका काम कभी प्रकाशित क्यों नहीं हुआ?
- क्या महापंजीयक गणना शुरू होने से पहले जाति कोड निर्देशिका प्रकाशित करेंगे, ताकि प्रगणकों और लोगों को पता हो कि जवाब कैसे वर्गीकृत होंगे?
- क्या ओबीसी स्थिति एक श्रेणी के रूप में दर्ज होगी, या केवल जातियों के नाम, ताकि वर्गीकरण बाद में और नज़रों से दूर हो?
- जाति तालिकाएँ किस तारीख़ को जारी होंगी, और क्या सरकार अभी वह तारीख़ तय करेगी?
- क्या दूसरे राष्ट्रीय सर्वेक्षणों की तरह शोधकर्ताओं को गुमनाम इकाई-स्तरीय आंकड़े मिलेंगे?

${C_HI}
- जनगणना की अधिसूचनाएँ egazette.gov.in पर भारत के राजपत्र में, और महापंजीयक की विज्ञप्तियाँ censusindia.gov.in पर पढ़िए।
- sansad.in पर जाति गणना से जुड़े लोकसभा और राज्यसभा के सवाल खोजिए; मंत्रियों के लिखित जवाब रिकॉर्ड पर हैं।
- भारत के महापंजीयक कार्यालय (गृह मंत्रालय) को आरटीआई भेजकर जाति कोड निर्देशिका और तालिकाएँ बनाने की योजना माँगिए।
- आज के वादों को 2011 में SECC के वादों से मिलाइए। तारीख़ें सँभालकर रखिए।`,
  },
  "bihar-65-percent-law": {
    en: `## What the courts actually ask for

Since Indra Sawhney, a state that wants to go above 50% has had to show two things: that the groups it wants to benefit are backward, and that they are inadequately represented in the services, set against the ceiling’s purpose of keeping equality of opportunity for everyone else. Population share is relevant, but it is not the test. Representation in government jobs and seats is.

That is why the gap in Bihar’s case matters. The state counted its people in 2023 and published the shares within months, which no other government has done. It did not publish, alongside the law, a cadre-by-cadre account of who holds Bihar’s government posts. Without that, the High Court treated the survey as an argument about numbers in the population rather than evidence of exclusion from the state.

${Q_EN}
- Has the Bihar government compiled caste-wise data on who holds posts in its own departments, and if so, why was it not placed before the High Court?
- Why did the state legislate within weeks of the survey rather than first publishing a representation study?
- What has happened to recruitment under the reservation roster while the appeal is pending, and how many posts were filled under the struck-down rules?
- Will the Union government act on Bihar’s request to place the law in the Ninth Schedule, and if not, will it say why?
- When the Supreme Court hears the appeal, will the state finally file the representation data it should have published with the bill?

${C_EN}
- Read the Patna High Court judgment of 20 June 2024 on the High Court’s website or Indian Kanoon, and the Supreme Court order of 29 July 2024 at sci.gov.in.
- Read the Bihar caste survey report released by the state government on 2 October 2023.
- File an RTI with Bihar’s General Administration Department asking for caste-wise representation in state services, cadre by cadre.
- Track the appeal’s listing on the Supreme Court’s case status page.`,
    hi: `## अदालतें असल में क्या माँगती हैं

इंद्रा साहनी के बाद से, 50% से ऊपर जाने की चाह रखने वाले राज्य को दो बातें दिखानी होती हैं: कि जिन समूहों को वह लाभ देना चाहता है वे पिछड़े हैं, और कि सेवाओं में उनका प्रतिनिधित्व अपर्याप्त है, बाक़ी सबके लिए अवसर की बराबरी बनाए रखने के सीमा के उद्देश्य के सामने। आबादी में हिस्सा प्रासंगिक है, पर कसौटी वह नहीं। कसौटी है सरकारी नौकरियों और सीटों में प्रतिनिधित्व।

इसीलिए बिहार के मामले की कमी अहम है। राज्य ने 2023 में अपनी आबादी गिनी और महीनों के भीतर हिस्सेदारी प्रकाशित कर दी, जो किसी और सरकार ने नहीं किया। लेकिन क़ानून के साथ उसने यह कैडर-दर-कैडर हिसाब प्रकाशित नहीं किया कि बिहार के सरकारी पदों पर कौन है। उसके बिना हाई कोर्ट ने सर्वेक्षण को सरकार से बहिष्कार के सबूत के बजाय आबादी के आंकड़ों की दलील माना।

${Q_HI}
- क्या बिहार सरकार ने अपने विभागों में पदों पर कौन है, इसके जाति-वार आंकड़े जुटाए हैं, और अगर हाँ, तो उन्हें हाई कोर्ट के सामने क्यों नहीं रखा गया?
- राज्य ने पहले प्रतिनिधित्व का अध्ययन प्रकाशित करने के बजाय सर्वेक्षण के हफ़्तों के भीतर क़ानून क्यों बनाया?
- अपील लंबित रहने के दौरान आरक्षण रोस्टर के तहत भर्ती का क्या हुआ, और रद्द हुए नियमों के तहत कितने पद भरे गए?
- क्या केंद्र सरकार इस क़ानून को नौवीं अनुसूची में डालने के बिहार के अनुरोध पर कार्रवाई करेगी, और नहीं तो क्या वजह बताएगी?
- जब सुप्रीम कोर्ट अपील सुनेगा, क्या राज्य आख़िरकार वह प्रतिनिधित्व डेटा पेश करेगा जो उसे विधेयक के साथ छापना चाहिए था?

${C_HI}
- 20 जून 2024 का पटना हाई कोर्ट फ़ैसला हाई कोर्ट की वेबसाइट या इंडियन कानून पर, और 29 जुलाई 2024 का सुप्रीम कोर्ट आदेश sci.gov.in पर पढ़िए।
- 2 अक्टूबर 2023 को राज्य सरकार द्वारा जारी बिहार जाति सर्वेक्षण रिपोर्ट पढ़िए।
- बिहार के सामान्य प्रशासन विभाग को आरटीआई भेजकर राज्य सेवाओं में कैडर-दर-कैडर जाति-वार प्रतिनिधित्व माँगिए।
- सुप्रीम कोर्ट के केस स्टेटस पेज पर अपील की सुनवाई पर नज़र रखिए।`,
  },
  "maratha-quota-third-attempt": {
    en: `## The same question, asked three times

Each Maratha quota law has rested on a commission report. The 2018 law relied on the Maharashtra State Backward Class Commission chaired by Justice M.G. Gaikwad; the Supreme Court found in 2021 that it did not establish the extraordinary situation needed to go past 50%. The 2024 law relies on the commission chaired by Justice Sunil Shukre. The legal question has not changed. Only the report has.

In between, the state has also pursued a second route: recognising Marathas with Kunbi records as Kunbi, an existing OBC caste, through certificate drives and government resolutions. That route has its own litigation and its own critics among existing OBC groups. Two routes to the same goal, both in court, with no full data published for either, is not a policy. It is a holding pattern with a press office.

${Q_EN}
- What did the Shukre Commission find that the Gaikwad Commission did not, and why is the underlying survey data not public?
- How many Maratha candidates have been admitted or appointed under the 2024 Act while its validity is undecided, and what happens to them if it falls?
- Has the state calculated how many existing OBC beneficiaries would be affected by Kunbi certificates issued to Marathas?
- Why has Maharashtra never published caste-wise representation in its own services, the evidence courts have asked for since 1992?
- Who decided to legislate a third time before the second judgment’s reasoning had been answered with data?

${C_EN}
- Read Jaishri Laxmanrao Patil v. Chief Minister (5 May 2021) on the Supreme Court website or Indian Kanoon.
- Read the Maharashtra SEBC Act, 2024 in the Maharashtra government gazette.
- File an RTI with Maharashtra’s Social Justice and Special Assistance Department for the Shukre Commission’s survey methodology and sample size.
- Follow the Bombay High Court cause list for the full-bench hearing.`,
    hi: `## एक ही सवाल, तीन बार

मराठा आरक्षण का हर क़ानून किसी आयोग की रिपोर्ट पर टिका रहा है। 2018 का क़ानून न्यायमूर्ति एम.जी. गायकवाड़ की अध्यक्षता वाले महाराष्ट्र राज्य पिछड़ा वर्ग आयोग पर टिका था; 2021 में सुप्रीम कोर्ट ने पाया कि उससे 50% पार करने के लिए ज़रूरी असाधारण हालात साबित नहीं होते। 2024 का क़ानून न्यायमूर्ति सुनील शुक्रे की अध्यक्षता वाले आयोग पर टिका है। क़ानूनी सवाल नहीं बदला। बस रिपोर्ट बदली है।

बीच में राज्य ने एक दूसरा रास्ता भी अपनाया: कुनबी रिकॉर्ड वाले मराठों को प्रमाणपत्र अभियानों और सरकारी प्रस्तावों के ज़रिए कुनबी, यानी पहले से ओबीसी जाति, के रूप में मान्यता। उस रास्ते के अपने मुक़दमे हैं और मौजूदा ओबीसी समूहों के बीच अपने आलोचक। एक ही लक्ष्य के दो रास्ते, दोनों अदालत में, और किसी का भी पूरा डेटा प्रकाशित नहीं: यह नीति नहीं है। यह प्रेस दफ़्तर वाला इंतज़ार है।

${Q_HI}
- शुक्रे आयोग ने ऐसा क्या पाया जो गायकवाड़ आयोग ने नहीं पाया था, और आधारभूत सर्वेक्षण डेटा सार्वजनिक क्यों नहीं है?
- 2024 के अधिनियम की वैधता तय न होने के दौरान कितने मराठा उम्मीदवारों को दाख़िला या नियुक्ति मिली, और अगर क़ानून गिरा तो उनका क्या होगा?
- क्या राज्य ने हिसाब लगाया है कि मराठों को दिए गए कुनबी प्रमाणपत्रों से मौजूदा ओबीसी लाभार्थियों पर कितना असर पड़ेगा?
- महाराष्ट्र ने अपनी सेवाओं में जाति-वार प्रतिनिधित्व कभी प्रकाशित क्यों नहीं किया, जबकि अदालतें 1992 से यही सबूत माँग रही हैं?
- दूसरे फ़ैसले के तर्क का आंकड़ों से जवाब दिए बिना तीसरी बार क़ानून बनाने का फ़ैसला किसने किया?

${C_HI}
- जयश्री लक्ष्मणराव पाटिल बनाम मुख्यमंत्री (5 मई 2021) सुप्रीम कोर्ट की वेबसाइट या इंडियन कानून पर पढ़िए।
- महाराष्ट्र सरकार के राजपत्र में महाराष्ट्र एसईबीसी अधिनियम, 2024 पढ़िए।
- महाराष्ट्र के सामाजिक न्याय और विशेष सहायता विभाग को आरटीआई भेजकर शुक्रे आयोग के सर्वेक्षण का तरीक़ा और नमूने का आकार माँगिए।
- पूर्ण पीठ की सुनवाई के लिए बॉम्बे हाई कोर्ट की कॉज़ लिस्ट पर नज़र रखिए।`,
  },
  "certificate-paper-chase": {
    en: `## The OBC side of the counter

For OBC candidates in central recruitment, the test is the non-creamy-layer certificate. The income line is ₹8 lakh a year, but the test is not simply this year’s income: under the Department of Personnel and Training’s rules, the limit applies to gross annual income over three consecutive years, and income from salaries and from agricultural land is not counted for that purpose, while parents’ status as government servants is assessed separately by rank. In practice, two families with the same bank balance can land on opposite sides of the line.

That complexity is not an accident of drafting; it is decades of office memoranda layered on top of each other. The people who pay for it are applicants who must translate those memoranda into the right certificate, from the right office, in the right format, before the right date.

${Q_EN}
- Why has the Department of Personnel and Training never published a single, consolidated guide to the creamy-layer test, instead of decades of separate memoranda?
- How many applications to central recruitment are rejected each year for certificate defects, and why does no agency publish the number?
- Why can’t eligibility certificates be issued digitally, once, with a public verification link, instead of being re-obtained every year?
- Who decided that EWS and OBC eligibility should use the same ₹8 lakh figure with different rules for counting it?
- When were these income limits last reviewed against inflation, and where is that review?

${C_EN}
- Read the DoPT office memoranda on EWS (31 January 2019) and the OBC creamy layer at dopt.gov.in, under the reservation section.
- Check the exact cut-off date and certificate format in the recruitment notice before you apply. They differ by exam.
- If your application is rejected for a certificate defect, ask in writing for the specific reason and the rule relied on.
- File an RTI with the recruiting body asking how many applications were rejected for certificate defects in the last cycle.`,
    hi: `## खिड़की का ओबीसी पक्ष

केंद्रीय भर्ती में ओबीसी उम्मीदवारों के लिए कसौटी नॉन-क्रीमी लेयर प्रमाणपत्र है। आय सीमा ₹8 लाख सालाना है, लेकिन कसौटी सिर्फ़ इस साल की आय नहीं: कार्मिक एवं प्रशिक्षण विभाग के नियमों के तहत यह सीमा लगातार तीन वर्षों की सकल वार्षिक आय पर लागू होती है, और इसके लिए वेतन और कृषि भूमि से होने वाली आय नहीं गिनी जाती, जबकि माता-पिता के सरकारी कर्मचारी होने की स्थिति अलग से पद के हिसाब से आँकी जाती है। व्यवहार में, एक जैसे बैंक बैलेंस वाले दो परिवार रेखा के अलग-अलग तरफ़ पहुँच सकते हैं।

यह जटिलता मसौदे की चूक नहीं है; यह दशकों के कार्यालय ज्ञापनों की परतें हैं। इसकी क़ीमत वे उम्मीदवार चुकाते हैं जिन्हें इन ज्ञापनों को सही दफ़्तर से, सही प्रारूप में, सही तारीख़ से पहले सही प्रमाणपत्र में बदलना होता है।

${Q_HI}
- कार्मिक एवं प्रशिक्षण विभाग ने दशकों के अलग-अलग ज्ञापनों के बजाय क्रीमी लेयर कसौटी पर एक समेकित मार्गदर्शिका कभी प्रकाशित क्यों नहीं की?
- हर साल केंद्रीय भर्ती में प्रमाणपत्र की कमी के कारण कितने आवेदन ख़ारिज होते हैं, और कोई एजेंसी यह संख्या प्रकाशित क्यों नहीं करती?
- पात्रता प्रमाणपत्र हर साल दोबारा बनवाने के बजाय एक बार, डिजिटल रूप में, सार्वजनिक सत्यापन लिंक के साथ क्यों जारी नहीं हो सकते?
- किसने तय किया कि ईडब्ल्यूएस और ओबीसी पात्रता एक ही ₹8 लाख का आंकड़ा, गिनने के अलग नियमों के साथ, इस्तेमाल करेंगी?
- इन आय सीमाओं की महँगाई के हिसाब से आख़िरी समीक्षा कब हुई, और वह समीक्षा कहाँ है?

${C_HI}
- dopt.gov.in के आरक्षण खंड में ईडब्ल्यूएस (31 जनवरी 2019) और ओबीसी क्रीमी लेयर पर डीओपीटी के कार्यालय ज्ञापन पढ़िए।
- आवेदन से पहले भर्ती सूचना में सटीक कट-ऑफ़ तारीख़ और प्रमाणपत्र का प्रारूप जाँचिए। हर परीक्षा में ये अलग होते हैं।
- अगर प्रमाणपत्र की कमी के कारण आवेदन ख़ारिज हो, तो लिखित में सटीक कारण और लागू नियम पूछिए।
- भर्ती संस्था को आरटीआई भेजकर पूछिए कि पिछले चक्र में प्रमाणपत्र की कमी के कारण कितने आवेदन ख़ारिज हुए।`,
  },
  "first-amendment-1951": {
    en: `## What else the First Amendment did

The amendment that inserted Article 15(4) also did two other things that still shape Indian law. It widened the grounds on which free speech can be restricted under Article 19(2), and it created the Ninth Schedule, a list of laws shielded from challenge on the ground that they violate fundamental rights. The Ninth Schedule was built for land reform. It later became the place where Tamil Nadu’s 69% reservation law was put in 1994, and where Bihar asked in 2024 for its 65% law to be put.

In 2007, in I.R. Coelho, the Supreme Court held that laws added to the Ninth Schedule after 24 April 1973 can still be tested against the Constitution’s basic structure. The shield is real, but it is not absolute.

${Q_EN}
- Parliament could amend the Constitution in ten weeks in 1951; why does it now take years to table a commission report?
- Why has the Ninth Schedule become the destination for state quota laws that governments expect to lose in court?
- How many laws in the Ninth Schedule have actually been reviewed since I.R. Coelho, and which are still waiting?
- Would today’s Parliament debate a constitutional amendment on reservation as openly as the Provisional Parliament did in 1951?

${C_EN}
- Read the Supreme Court’s judgment in State of Madras v. Champakam Dorairajan (1951) on the court’s website.
- Read the Constitution (First Amendment) Act, 1951 on the Legislative Department’s website (legislative.gov.in).
- Read the Provisional Parliament debates of May–June 1951 in the parliamentary digital library (eparlib.sansad.in).
- Read I.R. Coelho v. State of Tamil Nadu (2007) for the limits of the Ninth Schedule.`,
    hi: `## पहले संशोधन ने और क्या किया

अनुच्छेद 15(4) जोड़ने वाले संशोधन ने दो और काम किए, जो आज भी भारतीय क़ानून को आकार देते हैं। उसने अनुच्छेद 19(2) के तहत अभिव्यक्ति की आज़ादी पर पाबंदी के आधार बढ़ाए, और नौवीं अनुसूची बनाई, यानी उन क़ानूनों की सूची जिन्हें मौलिक अधिकारों के उल्लंघन के आधार पर चुनौती से बचाया गया। नौवीं अनुसूची भूमि सुधार के लिए बनी थी। बाद में वहीं 1994 में तमिलनाडु का 69% आरक्षण क़ानून रखा गया, और वहीं 2024 में बिहार ने अपने 65% क़ानून को रखने की माँग की।

2007 में आई.आर. कोएल्हो मामले में सुप्रीम कोर्ट ने कहा कि 24 अप्रैल 1973 के बाद नौवीं अनुसूची में जोड़े गए क़ानूनों को भी संविधान के मूल ढाँचे पर परखा जा सकता है। ढाल असली है, पर पूर्ण नहीं।

${Q_HI}
- 1951 में संसद दस हफ़्ते में संविधान संशोधित कर सकी; अब किसी आयोग की रिपोर्ट सदन में रखने में बरसों क्यों लगते हैं?
- नौवीं अनुसूची उन राज्य आरक्षण क़ानूनों की मंज़िल क्यों बन गई है, जिनके अदालत में हारने की सरकारें उम्मीद करती हैं?
- आई.आर. कोएल्हो के बाद नौवीं अनुसूची के कितने क़ानूनों की असल में समीक्षा हुई, और कौन-से अब भी इंतज़ार में हैं?
- क्या आज की संसद आरक्षण पर संविधान संशोधन पर उतनी खुली बहस करेगी जितनी 1951 में अंतरिम संसद ने की थी?

${C_HI}
- मद्रास राज्य बनाम चंपकम दोरैराजन (1951) का फ़ैसला सुप्रीम कोर्ट की वेबसाइट पर पढ़िए।
- विधायी विभाग की वेबसाइट (legislative.gov.in) पर संविधान (पहला संशोधन) अधिनियम, 1951 पढ़िए।
- संसद की डिजिटल लाइब्रेरी (eparlib.sansad.in) में मई–जून 1951 की अंतरिम संसद की बहसें पढ़िए।
- नौवीं अनुसूची की सीमाओं के लिए आई.आर. कोएल्हो बनाम तमिलनाडु राज्य (2007) पढ़िए।`,
  },
  "opinion-sixteen-days": {
    en: `## The cost of a stayed rule is not abstract

While the Centre reconsiders, every caste-discrimination complaint on an Indian campus is handled under rules the UGC itself had decided to replace. Students who report discrimination are relying on institutions that were never required to publish what they do with complaints. Students who felt excluded by the 2026 definition have no new text to comment on. Faculty and administrators have no idea which obligations will apply next year.

A government that wanted to settle this would not need a committee. It would need a drafting team, a public consultation of thirty days, and the willingness to put its name on a definition. The absence of all three is itself the answer to the question of priority.

${Q_EN}
- Who is the officer in the Ministry of Education responsible for the revised regulations, and what deadline have they been given?
- Has the UGC asked a single university how the 2012 framework is working since the stay?
- Why is a committee being considered at all, when the defect the court identified is one clause?
- Will the Centre tell the Supreme Court a date, or will the next hearing bring another intention?

${C_EN}
- Read the reasoning of the stay and the Centre’s statements at the August and November hearings.
- Ask your institution to publish, in writing, how it handles caste-discrimination complaints today.
- Raise the question with your Member of Parliament: written questions in Parliament get written answers that stay on the record.`,
    hi: `## रोके गए नियम की क़ीमत अमूर्त नहीं है

जब तक केंद्र पुनर्विचार कर रहा है, भारतीय कैंपसों पर जातिगत भेदभाव की हर शिकायत उन नियमों के तहत निपटाई जा रही है जिन्हें बदलने का फ़ैसला ख़ुद यूजीसी कर चुका था। भेदभाव की शिकायत करने वाले छात्र उन संस्थानों के भरोसे हैं जिन्हें कभी यह बताने की ज़रूरत नहीं पड़ी कि वे शिकायतों के साथ क्या करते हैं। 2026 की परिभाषा से बाहर महसूस करने वाले छात्रों के पास टिप्पणी के लिए कोई नया पाठ नहीं है। शिक्षकों और प्रशासकों को पता नहीं कि अगले साल कौन-सी ज़िम्मेदारियाँ लागू होंगी।

जो सरकार इसे सुलझाना चाहती, उसे समिति की ज़रूरत नहीं होती। उसे एक मसौदा टीम, तीस दिन का सार्वजनिक परामर्श, और एक परिभाषा पर अपना नाम लगाने की इच्छा चाहिए होती। तीनों का न होना ही प्राथमिकता के सवाल का जवाब है।

${Q_HI}
- शिक्षा मंत्रालय में संशोधित विनियमों का ज़िम्मेदार अधिकारी कौन है, और उसे कौन-सी समय-सीमा दी गई है?
- क्या यूजीसी ने रोक के बाद किसी एक विश्वविद्यालय से भी पूछा है कि 2012 का ढाँचा कैसे काम कर रहा है?
- जब अदालत की बताई कमी एक धारा है, तो समिति पर विचार ही क्यों हो रहा है?
- क्या केंद्र सुप्रीम कोर्ट को एक तारीख़ बताएगा, या अगली सुनवाई में फिर एक इरादा आएगा?

${C_HI}
- रोक के तर्क और अगस्त व नवंबर की सुनवाइयों में केंद्र के बयान पढ़िए।
- अपने संस्थान से लिखित में यह प्रकाशित करने को कहिए कि वह आज जातिगत भेदभाव की शिकायतें कैसे निपटाता है।
- यह सवाल अपने सांसद के सामने उठाइए: संसद में लिखित सवालों के लिखित जवाब मिलते हैं, जो रिकॉर्ड पर रहते हैं।`,
  },
  "start-here-reservation-record": {
    en: `## The three numbers everyone confuses

Most arguments about reservation collapse because three different quantities get used as if they were one. **Population share** is how many people belong to a group. **Reserved share** is the fraction of seats or posts set aside for them by law. **Actual representation** is the share of seats and posts they actually hold, at each level, after recruitment, promotion and attrition. A quota can be fully filled at the entry level and nearly empty at the top; a group can be large in the population and absent from the cadre that matters.

Governments hold the data for the third number, cadre by cadre. They rarely publish it in a form anyone can use. That single gap explains most of what follows in this archive.

${Q_EN}
- Why does no Union ministry publish, every year, the caste-wise composition of its own posts at each pay level?
- How many reserved posts in central government are vacant today, and for how long have they been vacant?
- Why are the Rohini Commission report and the SECC caste tables, both paid for with public money, still not public?
- Which body is responsible for checking that reservation is being implemented, and when did it last publish an audit?
- If governments believe in evidence-based reservation, where is the evidence?

${C_EN}
- Read Articles 15, 16, 46 and 335 in the Constitution at legislative.gov.in.
- Search parliamentary questions on “backlog vacancies” at sansad.in; ministers have answered them in writing for years.
- Read the annual reports of the National Commission for Scheduled Castes, the National Commission for Scheduled Tribes and the National Commission for Backward Classes.
- When a politician quotes a percentage, ask which of the three numbers it is.`,
    hi: `## वे तीन आंकड़े जिन्हें सब गड्डमड्ड करते हैं

आरक्षण पर ज़्यादातर बहसें इसलिए ढह जाती हैं क्योंकि तीन अलग चीज़ों को एक मान लिया जाता है। **आबादी में हिस्सा** यानी किसी समूह में कितने लोग हैं। **आरक्षित हिस्सा** यानी क़ानून ने उनके लिए कितनी सीटें या पद अलग रखे हैं। **वास्तविक प्रतिनिधित्व** यानी भर्ती, पदोन्नति और सेवानिवृत्ति के बाद हर स्तर पर उनके पास असल में कितनी सीटें और पद हैं। कोई कोटा प्रवेश स्तर पर पूरा भरा हो सकता है और ऊपर लगभग ख़ाली; कोई समूह आबादी में बड़ा हो सकता है और उस कैडर से ग़ायब जो मायने रखता है।

तीसरे आंकड़े के आंकड़े, कैडर-दर-कैडर, सरकारों के पास हैं। वे उन्हें शायद ही कभी इस्तेमाल लायक रूप में छापती हैं। यही एक कमी इस अभिलेखागार की आगे की ज़्यादातर बातों को समझा देती है।

${Q_HI}
- कोई केंद्रीय मंत्रालय हर साल अपने पदों की हर वेतन-स्तर पर जाति-वार संरचना क्यों प्रकाशित नहीं करता?
- आज केंद्र सरकार में कितने आरक्षित पद ख़ाली हैं, और कब से ख़ाली हैं?
- रोहिणी आयोग की रिपोर्ट और SECC की जाति तालिकाएँ, दोनों जनता के पैसे से बनीं, अब तक सार्वजनिक क्यों नहीं हैं?
- आरक्षण लागू हो रहा है या नहीं, यह जाँचने की ज़िम्मेदारी किस संस्था की है, और उसने आख़िरी ऑडिट कब प्रकाशित किया?
- अगर सरकारें सबूत-आधारित आरक्षण में विश्वास करती हैं, तो सबूत कहाँ है?

${C_HI}
- legislative.gov.in पर संविधान के अनुच्छेद 15, 16, 46 और 335 पढ़िए।
- sansad.in पर “बैकलॉग रिक्तियों” पर संसद के सवाल खोजिए; मंत्री बरसों से इनके लिखित जवाब देते आए हैं।
- राष्ट्रीय अनुसूचित जाति आयोग, राष्ट्रीय अनुसूचित जनजाति आयोग और राष्ट्रीय पिछड़ा वर्ग आयोग की वार्षिक रिपोर्टें पढ़िए।
- जब कोई नेता कोई प्रतिशत बताए, तो पूछिए कि यह तीनों में से कौन-सा आंकड़ा है।`,
  },
  "constitution-article-by-article": {
    en: `## The articles that decide representation, not just seats

Beyond Articles 15 and 16, a handful of provisions do most of the work. Articles 330 and 332 reserve seats for Scheduled Castes and Scheduled Tribes in the Lok Sabha and state assemblies, and Article 334 sets a time limit that Parliament has extended repeatedly, most recently to 2030 by the 104th Amendment in 2019. Articles 341 and 342 let the President notify the lists of Scheduled Castes and Tribes, which only Parliament can change. Article 340 empowers the President to appoint a commission on backward classes; both the Mandal and Rohini commissions were appointed under it. Articles 338, 338A and 338B create the national commissions for Scheduled Castes, Scheduled Tribes and, since the 102nd Amendment of 2018, Backward Classes.

${Q_EN}
- Article 334’s time limit has been extended every time it approached; when did Parliament last publish an assessment of whether the reserved seats achieved their purpose?
- Why do the reports of the national commissions under Articles 338, 338A and 338B reach Parliament years late, if at all?
- The Constitution requires a commission under Article 340 to report to the President; why does no rule require that report to be published?
- Who audits whether the lists notified under Articles 341 and 342 still reflect the communities they were meant to cover?

${C_EN}
- Read the full text of each article at legislative.gov.in, with the amendment history noted beneath it.
- Read the Constituent Assembly debates on draft Article 10 (now Article 16) in the parliamentary digital library.
- Look up the latest annual report of each national commission on its official website and note the year it covers.`,
    hi: `## वे अनुच्छेद जो सिर्फ़ सीटें नहीं, प्रतिनिधित्व तय करते हैं

अनुच्छेद 15 और 16 के अलावा कुछ प्रावधान ज़्यादातर काम करते हैं। अनुच्छेद 330 और 332 लोकसभा और राज्य विधानसभाओं में अनुसूचित जातियों और जनजातियों के लिए सीटें आरक्षित करते हैं, और अनुच्छेद 334 उसकी समय-सीमा तय करता है, जिसे संसद ने बार-बार बढ़ाया है, सबसे हाल में 2019 के 104वें संशोधन से 2030 तक। अनुच्छेद 341 और 342 राष्ट्रपति को अनुसूचित जातियों और जनजातियों की सूचियाँ अधिसूचित करने देते हैं, जिन्हें केवल संसद बदल सकती है। अनुच्छेद 340 राष्ट्रपति को पिछड़े वर्गों पर आयोग नियुक्त करने का अधिकार देता है; मंडल और रोहिणी दोनों आयोग इसी के तहत बने। अनुच्छेद 338, 338A और 338B अनुसूचित जातियों, अनुसूचित जनजातियों और, 2018 के 102वें संशोधन से, पिछड़े वर्गों के राष्ट्रीय आयोग बनाते हैं।

${Q_HI}
- अनुच्छेद 334 की समय-सीमा हर बार ख़त्म होने के क़रीब बढ़ा दी गई; संसद ने आख़िरी बार कब यह आकलन प्रकाशित किया कि आरक्षित सीटों ने अपना उद्देश्य पूरा किया या नहीं?
- अनुच्छेद 338, 338A और 338B के राष्ट्रीय आयोगों की रिपोर्टें संसद तक बरसों देर से, या पहुँचती ही नहीं, क्यों?
- संविधान अनुच्छेद 340 के आयोग से राष्ट्रपति को रिपोर्ट देने को कहता है; उस रिपोर्ट को प्रकाशित करने का कोई नियम क्यों नहीं है?
- कौन जाँचता है कि अनुच्छेद 341 और 342 के तहत अधिसूचित सूचियाँ अब भी उन समुदायों को दर्शाती हैं जिनके लिए वे बनी थीं?

${C_HI}
- legislative.gov.in पर हर अनुच्छेद का पूरा पाठ, नीचे दिए संशोधन इतिहास के साथ, पढ़िए।
- संसद की डिजिटल लाइब्रेरी में मसौदा अनुच्छेद 10 (अब अनुच्छेद 16) पर संविधान सभा की बहसें पढ़िए।
- हर राष्ट्रीय आयोग की आधिकारिक वेबसाइट पर उसकी ताज़ा वार्षिक रिपोर्ट देखिए और नोट कीजिए कि वह किस साल की है।`,
  },
  "before-1950-history": {
    en: `## Why the history still matters in court

These pre-Republic measures are not just background. Courts and commissions have repeatedly read them as evidence of what “backwardness” and “representation” meant to the people who wrote the Constitution. The Madras orders show that representation in public institutions was a live administrative question decades before 1950. The Poona Pact settled, for the first time, that reserved seats would be filled through joint electorates rather than separate ones, the arrangement Articles 330 and 332 still follow.

The record also shows how quickly policy can move when governments choose. Kolhapur’s order was a single notification. The communal orders in Madras were issued by an elected provincial government within its first year.

${Q_EN}
- If a princely state could publish a reservation order in one notification in 1902, why do commission reports now sit unpublished for years?
- Why are the original Madras communal orders and the 1932 negotiations not digitised in full by any government archive?
- What would a public archive of every reservation-related order since 1902 cost, and why has no government built one?

${C_EN}
- Read the text of the Poona Pact of 24 September 1932 in published collections of Ambedkar’s writings and speeches (Government of Maharashtra edition).
- Search the National Archives of India’s Abhilekh Patal portal for the Communal Award and Poona Pact files.
- Read the Champakam Dorairajan judgment (1951), which discusses the Madras communal order directly.`,
    hi: `## यह इतिहास आज भी अदालत में क्यों मायने रखता है

गणतंत्र से पहले के ये क़दम सिर्फ़ पृष्ठभूमि नहीं हैं। अदालतों और आयोगों ने इन्हें बार-बार इस सबूत के रूप में पढ़ा है कि संविधान लिखने वालों के लिए “पिछड़ापन” और “प्रतिनिधित्व” का क्या अर्थ था। मद्रास के आदेश दिखाते हैं कि सार्वजनिक संस्थानों में प्रतिनिधित्व 1950 से दशकों पहले एक जीवंत प्रशासनिक सवाल था। पूना समझौते ने पहली बार तय किया कि आरक्षित सीटें अलग निर्वाचक मंडलों के बजाय संयुक्त निर्वाचक मंडलों से भरी जाएँगी, वही व्यवस्था जिस पर अनुच्छेद 330 और 332 आज भी चलते हैं।

रिकॉर्ड यह भी दिखाता है कि सरकारें चाहें तो नीति कितनी तेज़ी से चल सकती है। कोल्हापुर का आदेश एक अधिसूचना था। मद्रास के सांप्रदायिक आदेश एक निर्वाचित प्रांतीय सरकार ने अपने पहले ही साल में जारी किए।

${Q_HI}
- अगर 1902 में एक रियासत एक अधिसूचना में आरक्षण आदेश प्रकाशित कर सकती थी, तो अब आयोगों की रिपोर्टें बरसों अप्रकाशित क्यों पड़ी रहती हैं?
- मद्रास के मूल सांप्रदायिक आदेश और 1932 की वार्ताएँ किसी सरकारी अभिलेखागार ने पूरी तरह डिजिटाइज़ क्यों नहीं कीं?
- 1902 से अब तक के हर आरक्षण-संबंधी आदेश के सार्वजनिक अभिलेखागार पर कितना ख़र्च आएगा, और किसी सरकार ने इसे क्यों नहीं बनाया?

${C_HI}
- 24 सितंबर 1932 के पूना समझौते का पाठ आंबेडकर के लेखन और भाषणों के प्रकाशित संग्रह (महाराष्ट्र सरकार संस्करण) में पढ़िए।
- भारत के राष्ट्रीय अभिलेखागार के अभिलेख पटल पोर्टल पर सांप्रदायिक पंचाट और पूना समझौते की फ़ाइलें खोजिए।
- चंपकम दोरैराजन फ़ैसला (1951) पढ़िए, जिसमें मद्रास के सांप्रदायिक आदेश पर सीधे चर्चा है।`,
  },
};
