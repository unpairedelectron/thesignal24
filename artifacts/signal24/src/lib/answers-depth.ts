/**
 * The longer half of each answer: what the law actually says (sections, deadlines,
 * the cases that decided it) and where people get caught out. Shown on /answers/:id
 * by the app and the page server. Statements restate the Acts, rules and judgments
 * named; re-check them whenever ANSWERS_CHECKED_ON changes.
 */
import type { Bilingual } from './key-figures';
import { DEPTH_MORE_A } from './answers-more-a';
import { DEPTH_MORE_B } from './answers-more-b';

export type AnswerDepth = {
  law: Bilingual;
  mistakes: { en: string[]; hi: string[] };
};

const DEPTH_BASE: Record<string, AnswerDepth> = {
  'how-to-file-an-rti': {
    law: {
      en: 'The Right to Information Act, 2005 gives every citizen the right to information held by a public authority (Section 3). Under Section 6(1) a request can be made in writing or electronically, in English, Hindi or the official language of the area, and Section 6(2) says you need give no reason and no personal details beyond what is needed to contact you. If you send it to the wrong office, Section 6(3) requires that office to transfer it to the right one within five days and tell you. The Public Information Officer must reply within 30 days (Section 7(1)), or within 48 hours where the information concerns a person’s life or liberty. Applicants below the poverty line pay no fee (Section 7(5)), and if the deadline is missed the information must be supplied free of charge (Section 7(6)).',
      hi: 'सूचना का अधिकार अधिनियम, 2005 हर नागरिक को किसी भी लोक प्राधिकरण के पास मौजूद जानकारी का अधिकार देता है (धारा 3)। धारा 6(1) के तहत आवेदन लिखकर या इलेक्ट्रॉनिक रूप से, अंग्रेज़ी, हिंदी या उस इलाक़े की राजभाषा में दिया जा सकता है, और धारा 6(2) कहती है कि आपको न कोई कारण बताना है, न संपर्क के लिए ज़रूरी जानकारी के अलावा कोई निजी ब्योरा देना है। अगर आवेदन ग़लत दफ़्तर पहुँच जाए, तो धारा 6(3) के तहत उसे पाँच दिन के भीतर सही दफ़्तर को भेजना और आपको बताना ज़रूरी है। जन सूचना अधिकारी को 30 दिन में जवाब देना होता है (धारा 7(1)), और अगर जानकारी किसी के जीवन या स्वतंत्रता से जुड़ी हो तो 48 घंटे में। गरीबी रेखा से नीचे के आवेदकों से शुल्क नहीं लिया जाता (धारा 7(5)), और समय-सीमा चूकने पर जानकारी मुफ़्त देनी होती है (धारा 7(6))।',
    },
    mistakes: {
      en: [
        'Asking “why” a decision was taken. The Act covers information that exists on record (Section 2(f)), so ask for the file notings, minutes and orders behind the decision instead.',
        'Packing unrelated subjects into one application. The central RTI Rules, 2012 expect one subject matter and up to 500 words per application; split it and you remove an easy excuse to refuse.',
        'Sending it without proof. Keep the online registration number or the postal receipt: the 30 days run from the date the office receives it, and any appeal depends on proving that date.',
      ],
      hi: [
        'यह पूछना कि फ़ैसला “क्यों” लिया गया। क़ानून रिकॉर्ड में मौजूद जानकारी पर लागू होता है (धारा 2(च)), इसलिए फ़ैसले के पीछे की फ़ाइल नोटिंग, बैठकों का ब्योरा और आदेश माँगिए।',
        'एक ही आवेदन में कई असंबंधित विषय ठूँसना। केंद्र के आरटीआई नियम, 2012 एक आवेदन में एक विषय और 500 शब्द तक की अपेक्षा रखते हैं; आवेदन बाँटिए, ताकि इनकार का आसान बहाना न मिले।',
        'बिना सबूत के भेजना। ऑनलाइन पंजीकरण संख्या या डाक रसीद सँभालिए: 30 दिन आवेदन मिलने की तारीख़ से गिने जाते हैं, और आगे की हर अपील उसी तारीख़ को साबित करने पर टिकी है।',
      ],
    },
  },
  'rti-no-reply': {
    law: {
      en: 'Section 7(2) of the RTI Act says that if the Public Information Officer does not decide your request within the time limit, it is deemed to have been refused. Section 19(1) lets you appeal within 30 days to an officer senior to the PIO, the First Appellate Authority, who should decide within 30 days, or 45 days with reasons recorded (Section 19(6)). A second appeal lies to the Central or State Information Commission within 90 days of the date the first appeal was decided or should have been (Section 19(3)). Under Section 20(1) the Commission can fine a PIO ₹250 a day, up to ₹25,000, for refusing or delaying without reasonable cause, and under Section 7(6) information supplied late must be given free.',
      hi: 'आरटीआई अधिनियम की धारा 7(2) कहती है कि अगर जन सूचना अधिकारी तय समय में आपके आवेदन पर फ़ैसला न करे, तो इसे इनकार माना जाएगा। धारा 19(1) के तहत आप 30 दिन के भीतर उससे वरिष्ठ अधिकारी, यानी प्रथम अपीलीय अधिकारी, के पास अपील कर सकते हैं, जिसे 30 दिन में, या कारण दर्ज करके 45 दिन में, फ़ैसला करना होता है (धारा 19(6))। दूसरी अपील केंद्रीय या राज्य सूचना आयोग में उस तारीख़ से 90 दिन के भीतर होती है जिस दिन पहली अपील का फ़ैसला हुआ या होना चाहिए था (धारा 19(3))। धारा 20(1) के तहत आयोग बिना उचित कारण इनकार या देरी करने वाले अधिकारी पर ₹250 प्रतिदिन, अधिकतम ₹25,000, का जुर्माना लगा सकता है, और धारा 7(6) के तहत देर से दी गई जानकारी मुफ़्त देनी होती है।',
    },
    mistakes: {
      en: [
        'Skipping the first appeal. Information Commissions usually expect it before they hear a second appeal, so file it even when it feels pointless.',
        'Missing the 30-day window. A late first appeal is admitted only if you show sufficient cause; mark the deadline the day you file the application.',
        'Paying again for late information. If the reply comes after the deadline, cite Section 7(6) and ask for it free of charge.',
      ],
      hi: [
        'पहली अपील छोड़ देना। सूचना आयोग आम तौर पर दूसरी अपील सुनने से पहले पहली अपील की अपेक्षा रखते हैं, इसलिए बेकार लगे तब भी इसे दाख़िल कीजिए।',
        '30 दिन की मियाद चूकना। देर से की गई पहली अपील तभी मानी जाती है जब आप पर्याप्त कारण दिखाएँ; आवेदन वाले दिन ही समय-सीमा लिख लीजिए।',
        'देर से मिली जानकारी के लिए फिर पैसे देना। अगर जवाब समय-सीमा के बाद आए, तो धारा 7(6) का हवाला देकर उसे मुफ़्त माँगिए।',
      ],
    },
  },
  'what-rti-can-refuse': {
    law: {
      en: 'A refusal must rest on the exemptions in Sections 8 and 9 of the RTI Act: information that would prejudice national security or a criminal investigation, Cabinet papers before a decision is taken, commercial confidence, or personal information with no relationship to any public activity or interest (Section 8(1)(j)), among others. Even then, Section 8(2) allows disclosure where the public interest outweighs the harm, and the proviso to Section 8(1) says information that cannot be denied to Parliament or a state legislature cannot be denied to a citizen. Section 10 requires the office to release the non-exempt part of a record, and Section 7(8) requires every refusal to give its reasons, the period for appeal and the appellate authority. Security and intelligence organisations in the Second Schedule are outside the Act, except for information about corruption and human rights violations (Section 24).',
      hi: 'इनकार आरटीआई अधिनियम की धारा 8 और 9 की छूटों पर ही टिक सकता है: ऐसी जानकारी जिससे राष्ट्रीय सुरक्षा या किसी आपराधिक जाँच को नुक़सान हो, फ़ैसला होने से पहले के कैबिनेट काग़ज़, व्यावसायिक गोपनीयता, या ऐसी निजी जानकारी जिसका किसी सार्वजनिक गतिविधि या हित से कोई संबंध नहीं (धारा 8(1)(ञ)), आदि। तब भी धारा 8(2) जनहित नुक़सान से बड़ा होने पर जानकारी देने की अनुमति देती है, और धारा 8(1) का परंतुक कहता है कि जो जानकारी संसद या राज्य विधानमंडल से नहीं रोकी जा सकती, वह नागरिक से भी नहीं रोकी जा सकती। धारा 10 के तहत रिकॉर्ड का छूट से बाहर वाला हिस्सा देना ज़रूरी है, और धारा 7(8) के तहत हर इनकार में कारण, अपील की अवधि और अपीलीय अधिकारी का ब्योरा देना होता है। दूसरी अनुसूची में दर्ज सुरक्षा और ख़ुफ़िया संगठन क़ानून के दायरे से बाहर हैं, सिवाय भ्रष्टाचार और मानवाधिकार उल्लंघन से जुड़ी जानकारी के (धारा 24)।',
    },
    mistakes: {
      en: [
        'Accepting a refusal that only cites “Section 8”. Ask which clause and why it applies; a refusal without reasons is itself a ground for appeal.',
        'Not asking for the rest of the file. If one page is exempt, Section 10 entitles you to the others with that part removed.',
        'Treating “personal information” as the end of it. How an officer performed a public duty is not purely private; argue the public interest under Section 8(2).',
      ],
      hi: [
        'सिर्फ़ “धारा 8” लिखकर किए गए इनकार को मान लेना। पूछिए कि कौन-सा खंड और क्यों लागू होता है; बिना कारण का इनकार ख़ुद अपील का आधार है।',
        'बाक़ी फ़ाइल न माँगना। अगर एक पन्ना छूट में आता है, तो धारा 10 के तहत आपको उस हिस्से को हटाकर बाक़ी पन्ने मिलने चाहिए।',
        '“निजी जानकारी” को आख़िरी शब्द मान लेना। किसी अधिकारी ने सार्वजनिक काम कैसे किया, यह पूरी तरह निजी नहीं है; धारा 8(2) के तहत जनहित का तर्क दीजिए।',
      ],
    },
  },
  'who-decides-reservation': {
    law: {
      en: 'Article 341 lets the President, after consulting the Governor, notify the Scheduled Castes for each state, and Article 342 does the same for Scheduled Tribes; after that, only a law passed by Parliament can add or remove a community. Article 338B, added by the 102nd Amendment in 2018, gave the National Commission for Backward Classes constitutional status. In 2021 the Supreme Court’s Maratha reservation judgment read that amendment as taking away the states’ power to identify backward classes, and the 105th Amendment the same year restored it. Articles 15(4) and 16(4) are the provisions that allow special measures and reserved posts for backward classes, and Articles 15(6) and 16(6), added by the 103rd Amendment in 2019, allow the EWS quota.',
      hi: 'अनुच्छेद 341 राष्ट्रपति को राज्यपाल से परामर्श के बाद हर राज्य की अनुसूचित जातियाँ अधिसूचित करने का अधिकार देता है, और अनुच्छेद 342 यही अनुसूचित जनजातियों के लिए करता है; उसके बाद किसी समुदाय को जोड़ने या हटाने का काम सिर्फ़ संसद का क़ानून कर सकता है। 2018 के 102वें संशोधन से जुड़े अनुच्छेद 338ख ने राष्ट्रीय पिछड़ा वर्ग आयोग को संवैधानिक दर्जा दिया। 2021 में सुप्रीम कोर्ट के मराठा आरक्षण फ़ैसले ने इस संशोधन को पिछड़े वर्गों की पहचान का राज्यों का अधिकार छीनने वाला माना, और उसी साल 105वें संशोधन ने यह अधिकार लौटा दिया। अनुच्छेद 15(4) और 16(4) पिछड़े वर्गों के लिए विशेष प्रावधान और आरक्षित पदों की अनुमति देते हैं, और 2019 के 103वें संशोधन से जुड़े अनुच्छेद 15(6) और 16(6) ईडब्ल्यूएस आरक्षण की अनुमति देते हैं।',
    },
    mistakes: {
      en: [
        'Assuming the central and state lists are the same. A community can be OBC in a state’s list but not in the central list, which decides eligibility for central jobs and institutions.',
        'Assuming SC status travels with you. SC and ST lists are notified state by state, and a certificate generally counts for the state you belong to, not the one you move to.',
        'Treating an announcement as inclusion. A community enters the SC or ST list only when Parliament amends the order; until then, the announcement changes nothing.',
      ],
      hi: [
        'यह मान लेना कि केंद्र और राज्य की सूचियाँ एक जैसी हैं। कोई समुदाय राज्य की ओबीसी सूची में हो सकता है पर केंद्र की सूची में नहीं, और केंद्रीय नौकरियों व संस्थानों में पात्रता केंद्र की सूची से तय होती है।',
        'यह मान लेना कि एससी दर्जा आपके साथ हर जगह जाता है। एससी और एसटी सूचियाँ राज्यवार अधिसूचित होती हैं, और प्रमाणपत्र आम तौर पर उसी राज्य के लिए मान्य होता है जहाँ के आप मूल निवासी हैं, उस राज्य के लिए नहीं जहाँ आप जाकर बसे।',
        'घोषणा को शामिल होना मान लेना। कोई समुदाय एससी या एसटी सूची में तभी आता है जब संसद आदेश में संशोधन करे; तब तक घोषणा से कुछ नहीं बदलता।',
      ],
    },
  },
  'creamy-layer': {
    law: {
      en: 'The creamy layer comes from Indra Sawhney v Union of India, decided on 16 November 1992, which required the better-off among the backward classes to be excluded from the quota. The Department of Personnel and Training set the criteria in office memorandum No. 36012/22/93-Estt.(SCT) of 8 September 1993, and office memorandum No. 36033/1/2013-Estt.(Res) of 13 September 2017 last raised the income limit, to ₹8 lakh a year from 1 September 2017. Children of people in constitutional posts are excluded outright, as are children of Group A (Class I) officers and of parents who are both Group B (Class II) officers; for government employees, the parents’ rank decides, not their salary. The income test looks at income from other sources, leaving out salary and agricultural income, and counts a family in the creamy layer if that income is ₹8 lakh or more in each of three consecutive years.',
      hi: 'क्रीमी लेयर की अवधारणा 16 नवंबर 1992 के इंद्रा साहनी बनाम भारत संघ फ़ैसले से आई, जिसने पिछड़े वर्गों के संपन्न हिस्से को आरक्षण से बाहर रखना ज़रूरी किया। कार्मिक और प्रशिक्षण विभाग ने 8 सितंबर 1993 के कार्यालय ज्ञापन सं. 36012/22/93-Estt.(SCT) में मानदंड तय किए, और 13 सितंबर 2017 के कार्यालय ज्ञापन सं. 36033/1/2013-Estt.(Res) ने आय सीमा आख़िरी बार बढ़ाकर 1 सितंबर 2017 से ₹8 लाख सालाना की। संवैधानिक पदों पर बैठे लोगों के बच्चे सीधे बाहर हैं, उसी तरह ग्रुप ए (क्लास I) अधिकारियों के बच्चे और उन माता-पिता के बच्चे जो दोनों ग्रुप बी (क्लास II) अधिकारी हैं; सरकारी कर्मचारियों के लिए माता-पिता का पद तय करता है, वेतन नहीं। आय की जाँच में वेतन और खेती की आय छोड़कर बाक़ी स्रोतों की आय देखी जाती है, और अगर यह आय लगातार तीन साल हर साल ₹8 लाख या उससे ज़्यादा हो तो परिवार क्रीमी लेयर में माना जाता है।',
    },
    mistakes: {
      en: [
        'Adding salaries into the income test. For children of government employees, salary and farm income are left out; the parents’ post decides instead.',
        'Using a certificate from the wrong year. Many recruiters ask for a non-creamy-layer certificate issued after a set date; check the notification before you apply.',
        'Looking at one year only. The test is income of ₹8 lakh or more in each of three consecutive years.',
      ],
      hi: [
        'आय की जाँच में वेतन जोड़ देना। सरकारी कर्मचारियों के बच्चों के लिए वेतन और खेती की आय नहीं गिनी जाती; उनकी जगह माता-पिता का पद देखा जाता है।',
        'ग़लत साल का प्रमाणपत्र लगाना। कई भर्तियों में किसी तय तारीख़ के बाद जारी नॉन-क्रीमी लेयर प्रमाणपत्र माँगा जाता है; आवेदन से पहले अधिसूचना देख लीजिए।',
        'सिर्फ़ एक साल देखना। कसौटी लगातार तीन साल, हर साल ₹8 लाख या उससे ज़्यादा आय की है।',
      ],
    },
  },
  'ews-eligibility': {
    law: {
      en: 'The EWS quota rests on Articles 15(6) and 16(6), added by the Constitution (One Hundred and Third Amendment) Act, 2019, which allow up to 10% reservation for economically weaker sections not covered by the SC, ST or OBC quotas. For central government posts, the criteria were set by the Department of Personnel and Training in office memorandum No. 36039/1/2019-Estt.(Res) of 31 January 2019, for vacancies notified on or after 1 February 2019: family income below ₹8 lakh in the financial year before the application, and limits on land and residential property. The Supreme Court upheld the amendment by 3:2 in Janhit Abhiyan v Union of India on 7 November 2022. The eligibility document, the Income and Asset Certificate, is issued by a designated revenue officer of the rank of Tehsildar or above.',
      hi: 'ईडब्ल्यूएस आरक्षण संविधान (एक सौ तीसरा संशोधन) अधिनियम, 2019 से जुड़े अनुच्छेद 15(6) और 16(6) पर टिका है, जो एससी, एसटी या ओबीसी आरक्षण से बाहर के आर्थिक रूप से कमज़ोर वर्गों के लिए 10% तक आरक्षण की अनुमति देते हैं। केंद्र सरकार के पदों के लिए मानदंड कार्मिक और प्रशिक्षण विभाग ने 31 जनवरी 2019 के कार्यालय ज्ञापन सं. 36039/1/2019-Estt.(Res) में तय किए, जो 1 फ़रवरी 2019 या उसके बाद अधिसूचित रिक्तियों पर लागू हैं: आवेदन से पहले वाले वित्त वर्ष में परिवार की आय ₹8 लाख से कम, और ज़मीन व आवासीय संपत्ति पर सीमाएँ। सुप्रीम कोर्ट ने 7 नवंबर 2022 को जनहित अभियान बनाम भारत संघ में 3:2 से इस संशोधन को बरक़रार रखा। पात्रता का दस्तावेज़, आय और संपत्ति प्रमाणपत्र, तहसीलदार या उससे ऊपर के नामित राजस्व अधिकारी जारी करते हैं।',
    },
    mistakes: {
      en: [
        'Counting only your own income. “Family” for EWS means you, your parents, siblings below 18, your spouse and your children below 18, and income from all sources, including farming and business.',
        'Counting property in only one place. Land and residential property the family holds in different places are added together for the asset test.',
        'Using the wrong year. Income is for the financial year before the year of application, and the certificate must be valid on the date the recruiter specifies.',
      ],
      hi: [
        'सिर्फ़ अपनी आय गिनना। ईडब्ल्यूएस के लिए “परिवार” का मतलब है आप, आपके माता-पिता, 18 साल से कम उम्र के भाई-बहन, आपका जीवनसाथी और 18 साल से कम उम्र के बच्चे, और आय हर स्रोत से, खेती और कारोबार समेत।',
        'सिर्फ़ एक जगह की संपत्ति गिनना। परिवार की अलग-अलग जगहों पर मौजूद ज़मीन और आवासीय संपत्ति संपत्ति-जाँच में जोड़ी जाती है।',
        'ग़लत साल लेना। आय आवेदन वाले साल से पहले के वित्त वर्ष की होती है, और प्रमाणपत्र भर्ती में बताई गई तारीख़ पर वैध होना चाहिए।',
      ],
    },
  },
  'get-a-caste-certificate': {
    law: {
      en: 'There is no single national caste-certificate law: each state issues certificates under its own rules, through officers it designates. The Supreme Court’s 1994 judgment in Kumari Madhuri Patil v Additional Commissioner set out how claims to SC and ST status should be verified, including by state scrutiny committees, and several states have since written that process into law. For central government posts and admissions, the Department of Personnel and Training prescribes the formats of SC, ST and OBC certificates, and the central OBC certificate also records non-creamy-layer status. A certificate obtained on a false claim can be cancelled, and the benefits taken with it can be withdrawn.',
      hi: 'जाति प्रमाणपत्र का कोई एक राष्ट्रीय क़ानून नहीं है: हर राज्य अपने नियमों के तहत, अपने नामित अधिकारियों के ज़रिए प्रमाणपत्र जारी करता है। सुप्रीम कोर्ट के 1994 के फ़ैसले, कुमारी माधुरी पाटिल बनाम अपर आयुक्त, ने तय किया कि एससी और एसटी दर्जे के दावों की जाँच कैसे हो, जिसमें राज्य की जाँच समितियाँ भी शामिल हैं, और कई राज्यों ने बाद में यह प्रक्रिया क़ानून में लिख दी। केंद्र सरकार के पदों और दाख़िलों के लिए कार्मिक और प्रशिक्षण विभाग एससी, एसटी और ओबीसी प्रमाणपत्रों का प्रारूप तय करता है, और केंद्र का ओबीसी प्रमाणपत्र नॉन-क्रीमी लेयर दर्जा भी दर्ज करता है। झूठे दावे पर लिया गया प्रमाणपत्र रद्द किया जा सकता है, और उसके सहारे लिए गए लाभ वापस लिए जा सकते हैं।',
    },
    mistakes: {
      en: [
        'Using the state OBC certificate for a central job. Central recruiters and institutions want the central format, and the community must be in the central OBC list.',
        'Leaving it to the last week. Field verification and scrutiny-committee checks take time, and a pending application rarely satisfies a recruiter.',
        'Mismatched names and dates. Small differences between school records, Aadhaar and the parent’s certificate are a common cause of delay; fix them first.',
      ],
      hi: [
        'केंद्रीय नौकरी के लिए राज्य का ओबीसी प्रमाणपत्र लगाना। केंद्रीय भर्तियाँ और संस्थान केंद्र का प्रारूप माँगते हैं, और समुदाय का केंद्र की ओबीसी सूची में होना ज़रूरी है।',
        'आख़िरी हफ़्ते तक टालना। मौक़े पर जाँच और जाँच समिति की पड़ताल में समय लगता है, और लंबित आवेदन से भर्ती करने वाले शायद ही संतुष्ट होते हैं।',
        'नाम और तारीख़ों का मेल न खाना। स्कूल के रिकॉर्ड, आधार और माता-पिता के प्रमाणपत्र में छोटे अंतर भी देरी की आम वजह हैं; पहले उन्हें ठीक कराइए।',
      ],
    },
  },
  'fifty-percent-ceiling': {
    law: {
      en: 'The ceiling is judge-made. In M R Balaji v State of Mysore (1962) the Supreme Court said reservation should generally stay below 50%, and in Indra Sawhney v Union of India (1992) a nine-judge bench fixed 50% as the rule, to be crossed only in extraordinary situations, such as far-flung and remote areas, and with extreme caution. In 2021 a five-judge bench struck down Maharashtra’s Maratha quota and declined to revisit that limit. In 2022, in Janhit Abhiyan, the court held that the 10% EWS quota does not breach the ceiling because it is a separate class. Laws placed in the Ninth Schedule, like Tamil Nadu’s 69% Act, are not beyond review: since I R Coelho (2007) they can be tested against the basic structure of the Constitution.',
      hi: 'यह सीमा अदालत की बनाई हुई है। एम. आर. बालाजी बनाम मैसूर राज्य (1962) में सुप्रीम कोर्ट ने कहा कि आरक्षण आम तौर पर 50% से कम रहना चाहिए, और इंद्रा साहनी बनाम भारत संघ (1992) में नौ जजों की पीठ ने 50% को नियम बना दिया, जिसे सिर्फ़ असाधारण हालात में, जैसे दूर-दराज़ के इलाक़ों में, और बेहद सावधानी से पार किया जा सकता है। 2021 में पाँच जजों की पीठ ने महाराष्ट्र का मराठा आरक्षण रद्द किया और इस सीमा पर दोबारा विचार से इनकार किया। 2022 में जनहित अभियान मामले में अदालत ने कहा कि 10% ईडब्ल्यूएस आरक्षण सीमा नहीं तोड़ता, क्योंकि वह अलग वर्ग है। नौवीं अनुसूची में डाले गए क़ानून, जैसे तमिलनाडु का 69% वाला क़ानून, समीक्षा से परे नहीं हैं: आई. आर. कोएल्हो (2007) के बाद से उन्हें संविधान के मूल ढाँचे की कसौटी पर परखा जा सकता है।',
    },
    mistakes: {
      en: [
        'Counting EWS inside the 50%. Since 2022 it sits outside the ceiling, which is why central reservation adds up to 59.5%.',
        'Thinking the Ninth Schedule makes a law untouchable. Since 2007, laws added to it after 24 April 1973 can still be tested against the basic structure.',
        'Confusing a population share with a reason. Courts keep asking for evidence of backwardness and inadequate representation, not population figures alone.',
      ],
      hi: [
        'ईडब्ल्यूएस को 50% के भीतर गिनना। 2022 से यह सीमा के बाहर है, इसीलिए केंद्र में कुल आरक्षण 59.5% होता है।',
        'यह मानना कि नौवीं अनुसूची क़ानून को अछूता बना देती है। 2007 से, 24 अप्रैल 1973 के बाद उसमें जोड़े गए क़ानूनों को भी मूल ढाँचे की कसौटी पर परखा जा सकता है।',
        'आबादी के हिस्से को वजह मान लेना। अदालतें बार-बार पिछड़ेपन और अपर्याप्त प्रतिनिधित्व के सबूत माँगती हैं, सिर्फ़ आबादी के आंकड़े नहीं।',
      ],
    },
  },
  'reservation-in-promotions': {
    law: {
      en: 'Article 16(4A), added by the 77th Amendment in 1995, allows reservation in promotions for Scheduled Castes and Tribes, and the 85th Amendment in 2001 added “consequential seniority”. Article 16(4B), from the 81st Amendment in 2000, lets unfilled reserved vacancies be carried forward without counting towards the 50% limit for that year. In M Nagaraj (2006) the Supreme Court upheld these amendments but required governments to show backwardness, inadequate representation and the effect on administrative efficiency. Jarnail Singh (2018) removed the need to prove backwardness for SCs and STs, and in 2022 the court held that representation must be measured cadre by cadre, with the data reviewed periodically.',
      hi: '1995 के 77वें संशोधन से जुड़ा अनुच्छेद 16(4क) अनुसूचित जातियों और जनजातियों के लिए पदोन्नति में आरक्षण की अनुमति देता है, और 2001 के 85वें संशोधन ने “परिणामी वरिष्ठता” जोड़ी। 2000 के 81वें संशोधन से आया अनुच्छेद 16(4ख) ख़ाली रह गई आरक्षित रिक्तियों को आगे ले जाने देता है, और वे उस साल की 50% सीमा में नहीं गिनी जातीं। एम. नागराज (2006) में सुप्रीम कोर्ट ने इन संशोधनों को बरक़रार रखा, पर सरकारों से पिछड़ापन, अपर्याप्त प्रतिनिधित्व और प्रशासनिक दक्षता पर असर दिखाने को कहा। जरनैल सिंह (2018) ने एससी और एसटी के लिए पिछड़ापन साबित करने की शर्त हटा दी, और 2022 में अदालत ने कहा कि प्रतिनिधित्व कैडर-दर-कैडर मापा जाए और आंकड़ों की समय-समय पर समीक्षा हो।',
    },
    mistakes: {
      en: [
        'Assuming promotion quotas apply everywhere. Article 16(4A) is an enabling power: each government must decide to use it, and back that decision with cadre-wise data.',
        'Expecting OBC quotas in promotion. The Constitution allows reservation in promotion only for SCs and STs.',
        'Treating department-wide figures as proof. Courts want data for the specific cadre and grade, not averages across a ministry.',
      ],
      hi: [
        'यह मान लेना कि पदोन्नति में आरक्षण हर जगह लागू है। अनुच्छेद 16(4क) एक सक्षम करने वाला प्रावधान है: हर सरकार को इसे लागू करने का फ़ैसला करना होता है, और उस फ़ैसले के पीछे कैडर-वार आंकड़े रखने होते हैं।',
        'पदोन्नति में ओबीसी आरक्षण की उम्मीद करना। संविधान पदोन्नति में आरक्षण सिर्फ़ एससी और एसटी के लिए देता है।',
        'पूरे विभाग के आंकड़ों को सबूत मान लेना। अदालतें उस ख़ास कैडर और ग्रेड के आंकड़े माँगती हैं, पूरे मंत्रालय के औसत नहीं।',
      ],
    },
  },
  'stay-vs-struck-down': {
    law: {
      en: 'A court can stay a law or rule as an interim measure while it hears a challenge; that order says nothing final about validity, and the court can lift or modify it. A law is struck down when the court holds it invalid, usually because it violates fundamental rights or goes beyond the legislature’s power. Under Article 141, the law declared by the Supreme Court binds every court in India, and Article 142 lets it pass any order needed to do complete justice. A High Court’s judgment binds the courts below it in that state, and an appeal to the Supreme Court does not suspend it unless the Supreme Court itself grants a stay.',
      hi: 'अदालत किसी चुनौती की सुनवाई के दौरान अंतरिम उपाय के रूप में किसी क़ानून या नियम पर रोक लगा सकती है; वह आदेश वैधता पर कोई अंतिम बात नहीं कहता, और अदालत उसे हटा या बदल सकती है। क़ानून तब रद्द होता है जब अदालत उसे अवैध ठहराए, आम तौर पर इसलिए कि वह मौलिक अधिकारों का उल्लंघन करता है या विधायिका के अधिकार से बाहर है। अनुच्छेद 141 के तहत सुप्रीम कोर्ट का घोषित क़ानून देश की हर अदालत पर बाध्यकारी है, और अनुच्छेद 142 उसे पूर्ण न्याय के लिए ज़रूरी कोई भी आदेश देने देता है। हाई कोर्ट का फ़ैसला उस राज्य की निचली अदालतों पर बाध्यकारी है, और सुप्रीम कोर्ट में अपील से वह तब तक निलंबित नहीं होता, जब तक सुप्रीम कोर्ट ख़ुद रोक न लगाए।',
    },
    mistakes: {
      en: [
        'Reading a stay as a verdict. A stay only pauses things; the case is still to be decided.',
        'Assuming an appeal undoes a High Court ruling. Unless the Supreme Court stays it, the High Court’s judgment applies.',
        'Quoting the hearing, not the order. What a judge says from the bench is not the order; read the written order on the court’s website.',
      ],
      hi: [
        'रोक को फ़ैसला समझना। रोक सिर्फ़ चीज़ों को थामती है; मुक़दमे का फ़ैसला अभी होना है।',
        'यह मानना कि अपील से हाई कोर्ट का फ़ैसला पलट गया। जब तक सुप्रीम कोर्ट रोक न लगाए, हाई कोर्ट का फ़ैसला लागू रहता है।',
        'आदेश की जगह सुनवाई का हवाला देना। जज ने सुनवाई के दौरान जो कहा, वह आदेश नहीं है; अदालत की वेबसाइट पर लिखित आदेश पढ़िए।',
      ],
    },
  },
  'file-a-pil': {
    law: {
      en: 'Article 32 lets anyone go directly to the Supreme Court to enforce fundamental rights, and Article 226 lets the High Courts issue writs for fundamental rights and for “any other purpose”, which makes the High Court the usual first stop. Since the late 1970s and 1980s the courts have relaxed the rule on who may sue, so a public-spirited person can raise a public wrong, and courts have even treated letters as petitions. Section 12 of the Legal Services Authorities Act, 1987 entitles SC and ST members, women, children, people with disabilities, industrial workers, people in custody and those under the income limit to free legal aid. Courts dismiss PILs that are really private disputes, filed for publicity or without research, sometimes with costs.',
      hi: 'अनुच्छेद 32 किसी को भी मौलिक अधिकारों के लिए सीधे सुप्रीम कोर्ट जाने देता है, और अनुच्छेद 226 हाई कोर्ट को मौलिक अधिकारों और “किसी अन्य प्रयोजन” के लिए रिट जारी करने देता है, इसलिए आम तौर पर पहला पड़ाव हाई कोर्ट होता है। 1970 के दशक के आख़िर और 1980 के दशक से अदालतों ने यह नियम ढीला किया कि मुक़दमा कौन कर सकता है, ताकि जनहित की परवाह करने वाला कोई भी व्यक्ति सार्वजनिक अन्याय उठा सके, और अदालतों ने चिट्ठियों को भी याचिका माना है। विधिक सेवा प्राधिकरण अधिनियम, 1987 की धारा 12 एससी और एसटी सदस्यों, महिलाओं, बच्चों, दिव्यांगों, औद्योगिक कामगारों, हिरासत में रखे लोगों और आय सीमा से नीचे के लोगों को मुफ़्त क़ानूनी मदद का हक़ देती है। अदालतें उन जनहित याचिकाओं को ख़ारिज कर देती हैं जो असल में निजी विवाद हों, प्रचार के लिए हों या बिना तैयारी के दाख़िल हों, कई बार जुर्माने के साथ।',
    },
    mistakes: {
      en: [
        'Filing without documents. Attach the RTI replies, notifications and letters that show the wrong; a petition built only on news reports is easy to dismiss.',
        'Skipping the authority first. Courts often ask whether you approached the department before coming to court; write to it and keep the reply.',
        'Going straight to the Supreme Court. Unless the issue is national, a High Court under Article 226 is usually easier to reach and has wider powers.',
      ],
      hi: [
        'बिना दस्तावेज़ों के याचिका दाख़िल करना। आरटीआई के जवाब, अधिसूचनाएँ और चिट्ठियाँ लगाइए जो अन्याय दिखाती हों; सिर्फ़ ख़बरों पर बनी याचिका आसानी से ख़ारिज होती है।',
        'पहले संबंधित दफ़्तर के पास न जाना। अदालतें अक्सर पूछती हैं कि अदालत आने से पहले विभाग से संपर्क किया या नहीं; उन्हें लिखिए और जवाब सँभालिए।',
        'सीधे सुप्रीम कोर्ट जाना। जब तक मामला राष्ट्रीय न हो, अनुच्छेद 226 के तहत हाई कोर्ट तक पहुँचना आसान है और उसके अधिकार भी व्यापक हैं।',
      ],
    },
  },
  'read-a-judgment': {
    law: {
      en: 'Under Article 141 the law declared by the Supreme Court binds every court in India, and Article 144 requires all authorities to act in aid of the Supreme Court. What binds is the ratio decidendi, the principle the decision rests on; remarks made in passing, called obiter dicta, can persuade but do not bind. A decision of a larger bench prevails over a smaller one, so two judges cannot overrule a three-judge ruling. Supreme Court judgments since 2023 carry a neutral citation, such as 2023 INSC 1, alongside the case number; cite those, not a news report.',
      hi: 'अनुच्छेद 141 के तहत सुप्रीम कोर्ट का घोषित क़ानून देश की हर अदालत पर बाध्यकारी है, और अनुच्छेद 144 सभी प्राधिकारियों से सुप्रीम कोर्ट की मदद में काम करने को कहता है। बाध्यकारी वह सिद्धांत है जिस पर फ़ैसला टिका है, जिसे निर्णयाधार (रेशियो डेसिडेंडी) कहते हैं; चलते-चलते कही गई बातें, यानी इतरोक्ति (ओबिटर डिक्टा), असर डाल सकती हैं पर बाध्यकारी नहीं होतीं। बड़ी पीठ का फ़ैसला छोटी पीठ पर भारी पड़ता है, इसलिए दो जज तीन जजों के फ़ैसले को नहीं पलट सकते। 2023 से सुप्रीम कोर्ट के फ़ैसलों पर मामला संख्या के साथ एक तटस्थ उद्धरण भी होता है, जैसे 2023 INSC 1; हवाला उसी का दीजिए, किसी ख़बर का नहीं।',
    },
    mistakes: {
      en: [
        'Quoting the headnote. Headnotes are written by publishers, not judges; check the paragraph they summarise.',
        'Reading one opinion in a split bench. Count the judges: in a 3:2 decision, the two dissenting opinions are not the law.',
        'Missing what came later. A judgment may have been reviewed, overruled or referred to a larger bench; search for later cases that cite it.',
      ],
      hi: [
        'हेडनोट का हवाला देना। हेडनोट प्रकाशक लिखते हैं, जज नहीं; जिस पैराग्राफ़ का वे सार देते हैं, उसे ख़ुद पढ़िए।',
        'बँटी हुई पीठ में एक ही राय पढ़ना। जज गिनिए: 3:2 के फ़ैसले में असहमति वाली दो राय क़ानून नहीं हैं।',
        'बाद की घटनाएँ छोड़ देना। हो सकता है फ़ैसले की समीक्षा हुई हो, उसे पलटा गया हो या बड़ी पीठ को भेजा गया हो; उसके बाद के उन मामलों को खोजिए जो उसका हवाला देते हैं।',
      ],
    },
  },
  'how-a-bill-becomes-law': {
    law: {
      en: 'Articles 107 to 111 set out the process for ordinary bills: either House can start one, both must pass it in the same form, and it becomes an Act on the President’s assent. If the Houses disagree, the President can call a joint sitting under Article 108. Money bills, defined in Article 110, start only in the Lok Sabha; under Article 109 the Rajya Sabha has 14 days to return them with recommendations the Lok Sabha may reject, and the Speaker’s certificate decides what counts as a money bill. Constitutional amendments under Article 368 need a majority of the total membership of each House and two-thirds of those present and voting, and some also need ratification by half the state legislatures.',
      hi: 'अनुच्छेद 107 से 111 सामान्य विधेयकों की प्रक्रिया तय करते हैं: कोई भी सदन विधेयक ला सकता है, दोनों सदनों को उसे एक ही रूप में पास करना होता है, और राष्ट्रपति की स्वीकृति मिलने पर वह अधिनियम बनता है। अगर सदन असहमत हों, तो राष्ट्रपति अनुच्छेद 108 के तहत संयुक्त बैठक बुला सकते हैं। अनुच्छेद 110 में परिभाषित धन विधेयक सिर्फ़ लोकसभा में शुरू होते हैं; अनुच्छेद 109 के तहत राज्यसभा के पास उन्हें सिफ़ारिशों के साथ लौटाने के लिए 14 दिन होते हैं, जिन्हें लोकसभा ठुकरा सकती है, और कौन-सा विधेयक धन विधेयक है, यह अध्यक्ष का प्रमाणपत्र तय करता है। अनुच्छेद 368 के तहत संविधान संशोधन के लिए हर सदन की कुल सदस्य संख्या का बहुमत और उपस्थित व मतदान करने वालों का दो-तिहाई ज़रूरी है, और कुछ संशोधनों के लिए आधे राज्यों की विधानसभाओं का अनुमोदन भी।',
    },
    mistakes: {
      en: [
        'Treating Cabinet approval as the law. A bill the Cabinet approves still has to pass both Houses and receive assent.',
        'Assuming an Act is in force once passed. Many Acts take effect only on a date the government notifies; check the gazette.',
        'Ignoring the rules. The details that decide who qualifies often sit in rules framed later, which Parliament may never debate.',
      ],
      hi: [
        'कैबिनेट की मंज़ूरी को क़ानून मान लेना। कैबिनेट से मंज़ूर विधेयक को भी दोनों सदनों से पास होना और स्वीकृति पाना होता है।',
        'यह मान लेना कि पास होते ही अधिनियम लागू हो गया। कई अधिनियम उसी तारीख़ से लागू होते हैं जो सरकार अधिसूचित करे; गज़ट देखिए।',
        'नियमों को नज़रअंदाज़ करना। पात्रता तय करने वाले ब्योरे अक्सर बाद में बनाए गए नियमों में होते हैं, जिन पर संसद शायद कभी बहस न करे।',
      ],
    },
  },
  ordinance: {
    law: {
      en: 'Article 123 lets the President promulgate an ordinance at any time except when both Houses of Parliament are in session, if immediate action is needed, and Article 213 gives Governors the same power for the states. An ordinance has the force of an Act, but it must be laid before the legislature and ceases six weeks after the legislature reassembles unless approved, and it can be withdrawn earlier. In D C Wadhwa (1986) the Supreme Court condemned Bihar’s practice of re-promulgating the same ordinances for years, and in Krishna Kumar Singh (2017) a seven-judge bench held that re-promulgation without placing ordinances before the legislature is a fraud on the Constitution, and that the satisfaction behind an ordinance can be reviewed by the courts.',
      hi: 'अनुच्छेद 123 राष्ट्रपति को उस समय को छोड़कर, जब संसद के दोनों सदनों का सत्र चल रहा हो, कभी भी अध्यादेश जारी करने देता है, अगर तुरंत कार्रवाई ज़रूरी हो, और अनुच्छेद 213 राज्यों के लिए राज्यपालों को यही अधिकार देता है। अध्यादेश का असर अधिनियम जैसा होता है, पर उसे विधायिका के सामने रखना होता है, और विधायिका के दोबारा जुटने के छह हफ़्ते बाद, मंज़ूरी न मिलने पर, वह ख़त्म हो जाता है; उसे पहले भी वापस लिया जा सकता है। डी. सी. वाधवा (1986) में सुप्रीम कोर्ट ने बिहार में सालों तक वही अध्यादेश बार-बार जारी करने की प्रथा की निंदा की, और कृष्ण कुमार सिंह (2017) में सात जजों की पीठ ने कहा कि विधायिका के सामने रखे बिना अध्यादेश दोबारा जारी करना संविधान के साथ धोखा है, और अध्यादेश के पीछे की संतुष्टि की अदालत समीक्षा कर सकती है।',
    },
    mistakes: {
      en: [
        'Assuming everything done under a lapsed ordinance disappears. Actions taken while it was in force may survive; check what was done in that period.',
        'Reading the ordinance instead of the Act. Most ordinances are replaced by a bill with changes, and the final Act is the law to read.',
        'Not checking the session calendar. If the legislature met without approving it, count six weeks from the day it reassembled.',
      ],
      hi: [
        'यह मान लेना कि अध्यादेश ख़त्म होते ही उसके तहत हुआ सब कुछ मिट जाता है। उसके लागू रहते हुई कार्रवाइयाँ बनी रह सकती हैं; देखिए उस दौरान क्या किया गया।',
        'अधिनियम की जगह अध्यादेश पढ़ना। ज़्यादातर अध्यादेशों की जगह बदलावों के साथ विधेयक आता है, और पढ़ने लायक़ क़ानून अंतिम अधिनियम है।',
        'सत्र का कैलेंडर न देखना। अगर विधायिका जुटी पर अध्यादेश मंज़ूर नहीं हुआ, तो उसके दोबारा जुटने के दिन से छह हफ़्ते गिनिए।',
      ],
    },
  },
  'find-the-gazette': {
    law: {
      en: 'The Gazette of India is the government’s official publication, and many Acts make rules, commencement dates and orders take effect only when they are notified in the Official Gazette, so the gazette text is the legally operative one. Central notifications are published electronically at egazette.gov.in, and the law of evidence, now the Bharatiya Sakshya Adhiniyam, 2023, presumes the official gazette to be genuine. Acts of Parliament, with their amendments and rules, are consolidated on India Code (indiacode.nic.in), maintained by the Legislative Department. States publish their own gazettes and codes.',
      hi: 'भारत का राजपत्र (गज़ट) सरकार का आधिकारिक प्रकाशन है, और कई अधिनियम कहते हैं कि नियम, लागू होने की तारीख़ें और आदेश तभी प्रभावी होंगे जब वे राजपत्र में अधिसूचित हों, इसलिए क़ानूनी रूप से मान्य पाठ गज़ट वाला ही है। केंद्र की अधिसूचनाएँ egazette.gov.in पर इलेक्ट्रॉनिक रूप से छपती हैं, और साक्ष्य का क़ानून, जो अब भारतीय साक्ष्य अधिनियम, 2023 है, आधिकारिक राजपत्र को असली मानकर चलता है। संसद के अधिनियम उनके संशोधनों और नियमों के साथ विधायी विभाग के इंडिया कोड (indiacode.nic.in) पर एक जगह मिलते हैं। राज्य अपने राजपत्र और संहिताएँ अलग छापते हैं।',
    },
    mistakes: {
      en: [
        'Relying on the press release. Press releases summarise; the notification has the exact wording, conditions and dates.',
        'Missing the extraordinary gazette. Urgent notifications appear in the Extraordinary issue, not the weekly one; search both.',
        'Reading an outdated version of an Act. Use India Code’s updated text, and check for amendments notified after it was last updated.',
      ],
      hi: [
        'प्रेस विज्ञप्ति पर भरोसा करना। विज्ञप्ति सार देती है; अधिसूचना में सटीक शब्द, शर्तें और तारीख़ें होती हैं।',
        'असाधारण गज़ट छोड़ देना। ज़रूरी अधिसूचनाएँ साप्ताहिक अंक में नहीं, असाधारण अंक में छपती हैं; दोनों में खोजिए।',
        'अधिनियम का पुराना रूप पढ़ना। इंडिया कोड का अद्यतन पाठ लीजिए, और देखिए कि उसके आख़िरी अपडेट के बाद कोई संशोधन तो अधिसूचित नहीं हुआ।',
      ],
    },
  },
  'ask-your-mp': {
    law: {
      en: 'Questions are governed by the Rules of Procedure of each House. A member gives notice in advance, usually at least 15 clear days, and a question can be starred, answered orally with supplementary questions, or unstarred, answered in writing; a short notice question is for matters of urgent public importance. The rules bar questions that are argumentative, repeat ones already answered, or concern matters pending before the courts, and the Speaker or Chairman decides whether a question is admitted. Ministers’ replies become part of the record, and promises made in reply are tracked by each House’s Committee on Government Assurances.',
      hi: 'सवाल हर सदन के प्रक्रिया नियमों से चलते हैं। सदस्य पहले से सूचना देते हैं, आम तौर पर कम से कम 15 पूरे दिन पहले, और सवाल तारांकित हो सकता है, जिसका जवाब पूरक सवालों के साथ मौखिक मिलता है, या अतारांकित, जिसका जवाब लिखित मिलता है; अल्प सूचना प्रश्न तात्कालिक जनहित के मामलों के लिए होता है। नियम ऐसे सवालों पर रोक लगाते हैं जो तर्क-वितर्क वाले हों, पहले दिए जवाब दोहराएँ या अदालत में लंबित मामलों से जुड़े हों, और सवाल स्वीकार होगा या नहीं, यह अध्यक्ष या सभापति तय करते हैं। मंत्रियों के जवाब रिकॉर्ड का हिस्सा बनते हैं, और जवाब में किए गए वादों पर हर सदन की सरकारी आश्वासन समिति नज़र रखती है।',
    },
    mistakes: {
      en: [
        'Asking a broad question. “What is the government doing about X?” gets a paragraph of schemes; ask for numbers, dates and documents.',
        'Aiming at the wrong ministry. Name the ministry and department that holds the data, or the question may be transferred or disallowed.',
        'Not following up an assurance. If a minister promises to collect information, ask your MP to pursue it with the Committee on Government Assurances.',
      ],
      hi: [
        'बहुत व्यापक सवाल पूछना। “सरकार X के लिए क्या कर रही है?” का जवाब योजनाओं का एक पैराग्राफ़ होता है; संख्या, तारीख़ और दस्तावेज़ माँगिए।',
        'ग़लत मंत्रालय को निशाना बनाना। उस मंत्रालय और विभाग का नाम लीजिए जिसके पास आंकड़े हैं, वरना सवाल स्थानांतरित या अस्वीकार हो सकता है।',
        'आश्वासन का पीछा न करना। अगर मंत्री जानकारी जुटाने का वादा करें, तो अपने सांसद से कहिए कि सरकारी आश्वासन समिति के ज़रिए उसका पीछा करें।',
      ],
    },
  },
  'caste-census-when': {
    law: {
      en: 'The Census Act, 1948 empowers the central government to take a census and makes individual answers confidential: under Section 15, census records are not open to inspection and cannot be used as evidence. The Census Rules, 1990 set out the procedure. The 2011 Socio-Economic and Caste Census was run outside the Census Act, as a separate exercise, and its caste data has never been released in full. Censuses since 1951 have counted only Scheduled Castes and Scheduled Tribes, so enumerating caste for everyone in the 2027 Census is a break with seven decades of practice.',
      hi: 'जनगणना अधिनियम, 1948 केंद्र सरकार को जनगणना कराने का अधिकार देता है और हर व्यक्ति के जवाब गोपनीय रखता है: धारा 15 के तहत जनगणना के रिकॉर्ड न जाँच के लिए खुले हैं, न सबूत के तौर पर इस्तेमाल हो सकते हैं। जनगणना नियम, 1990 प्रक्रिया तय करते हैं। 2011 की सामाजिक-आर्थिक और जाति जनगणना जनगणना अधिनियम से बाहर, एक अलग क़वायद के रूप में हुई थी, और उसके जाति आंकड़े आज तक पूरे जारी नहीं हुए। 1951 के बाद की जनगणनाओं में सिर्फ़ अनुसूचित जातियाँ और जनजातियाँ गिनी गईं, इसलिए 2027 की जनगणना में सबकी जाति गिनना सात दशक की परंपरा से अलग क़दम है।',
    },
    mistakes: {
      en: [
        'Confusing collection with publication. The SECC 2011 caste data was collected and still has not been published; ask when the tables will be released, not only whether caste is counted.',
        'Expecting individual records. Census answers are confidential by law; what is published is aggregate tables.',
        'Ignoring the classification. Thousands of caste names have to be grouped before anything can be counted, and how that is done shapes the result.',
      ],
      hi: [
        'जुटाने और प्रकाशित करने को एक मानना। एसईसीसी 2011 के जाति आंकड़े जुटाए गए और अब तक प्रकाशित नहीं हुए; सिर्फ़ यह न पूछिए कि जाति गिनी जाएगी या नहीं, यह भी पूछिए कि तालिकाएँ कब जारी होंगी।',
        'हर व्यक्ति का रिकॉर्ड मिलने की उम्मीद करना। जनगणना के जवाब क़ानूनन गोपनीय हैं; प्रकाशित होती हैं सिर्फ़ कुल तालिकाएँ।',
        'वर्गीकरण को नज़रअंदाज़ करना। गिनती से पहले हज़ारों जाति-नामों को समूहों में बाँटना पड़ता है, और यह कैसे होता है, उससे नतीजा तय होता है।',
      ],
    },
  },
  'find-government-data': {
    law: {
      en: 'The National Data Sharing and Accessibility Policy, 2012 directs ministries to publish the non-sensitive data they collect with public money, which is what data.gov.in hosts. The Collection of Statistics Act, 2008 governs official surveys and keeps individual responses confidential. When a dataset is not published, the RTI Act still applies: you can ask for records and compilations that already exist, though an office does not have to create new analysis for you.',
      hi: 'राष्ट्रीय डेटा साझाकरण और सुलभता नीति, 2012 मंत्रालयों से कहती है कि जनता के पैसे से जुटाए गए ग़ैर-संवेदनशील आंकड़े प्रकाशित करें, और data.gov.in पर यही मिलता है। सांख्यिकी संग्रह अधिनियम, 2008 आधिकारिक सर्वेक्षणों को नियंत्रित करता है और हर व्यक्ति के जवाब गोपनीय रखता है। जब कोई डेटासेट प्रकाशित न हो, तब भी आरटीआई अधिनियम लागू होता है: आप पहले से मौजूद रिकॉर्ड और संकलन माँग सकते हैं, हालाँकि दफ़्तर को आपके लिए नया विश्लेषण तैयार करना ज़रूरी नहीं।',
    },
    mistakes: {
      en: [
        'Mixing base years. Survey rounds and indices get revised; compare figures only within the same base year and definition.',
        'Comparing different measures. Population share, reserved posts and posts actually filled are different numbers; say which one you mean.',
        'Missing the parliamentary answer. Ministries often release figures first in replies to MPs; search sansad.in before concluding the data does not exist.',
      ],
      hi: [
        'आधार वर्ष मिला देना। सर्वेक्षण के दौर और सूचकांक बदलते रहते हैं; आंकड़ों की तुलना सिर्फ़ एक ही आधार वर्ष और परिभाषा में कीजिए।',
        'अलग-अलग पैमानों की तुलना करना। आबादी में हिस्सा, आरक्षित पद और असल में भरे पद अलग संख्याएँ हैं; साफ़ बताइए कि कौन-सी बात कर रहे हैं।',
        'संसद के जवाब छोड़ देना। मंत्रालय अक्सर आंकड़े सबसे पहले सांसदों के सवालों के जवाब में देते हैं; यह मानने से पहले कि आंकड़े हैं ही नहीं, sansad.in पर खोजिए।',
      ],
    },
  },
  'complain-about-a-government-service': {
    law: {
      en: 'CPGRAMS is run by the Department of Administrative Reforms and Public Grievances, and every ministry has a nodal officer for grievances; the government’s guidelines set time limits for disposal and let you appeal to a designated appellate authority if you are not satisfied. Many states have gone further with Right to Public Services laws, starting with Madhya Pradesh in 2010 and Bihar in 2011, which set legal deadlines for services such as certificates and licences and can penalise officers who miss them. Complaints of corruption go elsewhere: to the Central Vigilance Commission for central officials, or to the Lokpal and the state Lokayuktas.',
      hi: 'सीपीग्राम्स को प्रशासनिक सुधार और लोक शिकायत विभाग चलाता है, और हर मंत्रालय में शिकायतों के लिए एक नोडल अधिकारी होता है; सरकार के दिशानिर्देश निपटारे की समय-सीमा तय करते हैं और असंतुष्ट होने पर नामित अपीलीय अधिकारी के पास अपील की सुविधा देते हैं। कई राज्य लोक सेवा अधिकार क़ानूनों के साथ आगे बढ़े हैं, जिनकी शुरुआत 2010 में मध्य प्रदेश और 2011 में बिहार से हुई, जो प्रमाणपत्र और लाइसेंस जैसी सेवाओं के लिए क़ानूनी समय-सीमा तय करते हैं और उन्हें चूकने वाले अधिकारियों पर जुर्माना लगा सकते हैं। भ्रष्टाचार की शिकायतें कहीं और जाती हैं: केंद्रीय अधिकारियों के लिए केंद्रीय सतर्कता आयोग, या लोकपाल और राज्यों के लोकायुक्त।',
    },
    mistakes: {
      en: [
        'Filing a vague grievance. Name the office, your application number, the date and what you want done.',
        'Letting “disposed” end it. If the reply does not solve the problem, use the appeal within the time allowed.',
        'Not checking your state’s service law. If a certificate is late, a Right to Services Act may give you a deadline the officer is legally bound by.',
      ],
      hi: [
        'अस्पष्ट शिकायत करना। दफ़्तर का नाम, अपनी आवेदन संख्या, तारीख़ और आप क्या चाहते हैं, साफ़ लिखिए।',
        '“निपटाई गई” पर रुक जाना। अगर जवाब से समस्या हल नहीं हुई, तो तय समय के भीतर अपील कीजिए।',
        'अपने राज्य का सेवा क़ानून न देखना। अगर प्रमाणपत्र में देर हो रही है, तो लोक सेवा अधिकार क़ानून में ऐसी समय-सीमा हो सकती है जिससे अधिकारी क़ानूनन बँधा है।',
      ],
    },
  },
  'report-caste-discrimination': {
    law: {
      en: 'The Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act, 1989 lists offences against SC and ST members, including public humiliation, social and economic boycott and denial of access to public places, and provides for Special Courts to try them. Section 18A, added in 2018 after the Supreme Court’s Subhash Kashinath Mahajan judgment, says no preliminary inquiry is needed before an FIR is registered and that anticipatory bail is barred, and the Supreme Court upheld it in 2020. Under Section 4, a public servant who wilfully neglects duties under the Act, including registering a complaint, can be punished. Article 17 of the Constitution abolishes untouchability, and the Protection of Civil Rights Act, 1955 makes practising it an offence.',
      hi: 'अनुसूचित जाति और अनुसूचित जनजाति (अत्याचार निवारण) अधिनियम, 1989 एससी और एसटी सदस्यों के ख़िलाफ़ अपराधों को सूचीबद्ध करता है, जिनमें सार्वजनिक अपमान, सामाजिक और आर्थिक बहिष्कार और सार्वजनिक जगहों पर जाने से रोकना शामिल है, और उनकी सुनवाई के लिए विशेष अदालतों का प्रावधान करता है। सुप्रीम कोर्ट के सुभाष काशीनाथ महाजन फ़ैसले के बाद 2018 में जोड़ी गई धारा 18क कहती है कि एफ़आईआर दर्ज करने से पहले किसी प्रारंभिक जाँच की ज़रूरत नहीं और अग्रिम ज़मानत नहीं मिलेगी, और सुप्रीम कोर्ट ने 2020 में इसे बरक़रार रखा। धारा 4 के तहत जो लोक सेवक इस क़ानून के तहत अपने कर्तव्य, जिसमें शिकायत दर्ज करना शामिल है, जानबूझकर नहीं निभाता, उसे सज़ा हो सकती है। संविधान का अनुच्छेद 17 छुआछूत को ख़त्म करता है, और नागरिक अधिकार संरक्षण अधिनियम, 1955 उसे बरतना अपराध बनाता है।',
    },
    mistakes: {
      en: [
        'Accepting a “complaint” instead of an FIR. Ask for the FIR number and a free copy; if the police refuse, write to the Superintendent of Police and keep proof.',
        'Waiting before writing things down. Note names, dates and witnesses the same day; medical records and messages matter.',
        'Going it alone. District Legal Services Authorities give free legal help, and the National Commission for Scheduled Castes or for Scheduled Tribes can call for reports from the police.',
      ],
      hi: [
        'एफ़आईआर की जगह “शिकायत” स्वीकार कर लेना। एफ़आईआर संख्या और उसकी मुफ़्त प्रति माँगिए; अगर पुलिस मना करे, तो पुलिस अधीक्षक को लिखिए और सबूत रखिए।',
        'बातें लिखने में देर करना। नाम, तारीख़ और गवाह उसी दिन लिख लीजिए; मेडिकल रिकॉर्ड और संदेश अहम हैं।',
        'अकेले लड़ना। ज़िला विधिक सेवा प्राधिकरण मुफ़्त क़ानूनी मदद देते हैं, और राष्ट्रीय अनुसूचित जाति आयोग या राष्ट्रीय अनुसूचित जनजाति आयोग पुलिस से रिपोर्ट माँग सकता है।',
      ],
    },
  },
};

export const ANSWER_DEPTH: Record<string, AnswerDepth> = { ...DEPTH_BASE, ...DEPTH_MORE_A, ...DEPTH_MORE_B };

export function answerDepth(id: string | undefined) {
  return id ? ANSWER_DEPTH[id] : undefined;
}
