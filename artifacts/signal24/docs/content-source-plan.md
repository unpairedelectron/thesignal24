# Signal Hub content source plan

**Purpose:** an editorial research backlog and source operating plan for the Signal Hub content/evidence pipeline. This is not a set of published articles or verified records.

**Non-negotiable rule:** no item below is evidence that an event occurred, a policy is current, or a source supports a claim. A planned topic becomes a Signal Hub record only after an editor reviews the original source, dates and scope, writes original copy, and explicitly creates any article/event/source relationships. Do not seed the planned titles as public stories.

## 1. Source registry

Store registry entries as data, not code constants. Each entry should support:

`source_name`, `source_type`, `authority_level`, `domain`, `rss_url`, `sitemap_url`, `search_url`, `language`, `state`, `enabled`, `last_checked`, `crawl_frequency`, `created_at`, `updated_at`.

Initially set automated feed fields to `null` unless the feed or sitemap has been verified on the source's own site. The official search/listing page can be used for manual discovery. Do not treat a successful fetch as source verification.

| Registry entry | Type / authority | Domain and verified starting point | Language / geography | Initial operation |
|---|---|---|---|---|
| Department of Personnel & Training (DoPT) | Government / primary | `dopt.gov.in` — [circulars](https://dopt.gov.in/circulars), [orders](https://dopt.gov.in/notifications/orders) | English / central | Manual review; configure a feed only after confirming it exists and is stable. |
| University Grants Commission (UGC) | Regulator / primary | `ugc.gov.in` — [regulations](https://www.ugc.gov.in/regulations), [notices](https://www.ugc.gov.in/notices) | English / central | Manual review; prefer the regulation/notice document over a news summary. |
| Supreme Court of India | Court / primary | [Judgments and Orders search](https://scr.sci.gov.in/), [latest judgments](https://www.sci.gov.in/latest-judgements/) | Multiple languages / national | Manual case search; preserve case title, decision date, neutral citation and judgment URL when available. |
| India Code | Government legislation / primary | [India Code](https://www.indiacode.nic.in/indiacode), including the [Constitution of India record](https://www.indiacode.nic.in/handle/123456789/19632) | English and Hindi / national | Manual research; cite the Act or constitutional text, not only a search result. |
| Gazette of India / e-Gazette | Government publication / primary | [e-Gazette](https://egazette.gov.in/) | English and Hindi / national | Search notifications manually; retain the Gazette part, issue/date, notification number and document URL. |
| Press Information Bureau (PIB) | Government press release / primary for the issuing body's statement | [All releases](https://pib.gov.in/allRel.aspx?lang=1&reg=3) | English and Hindi / national | Discovery and statement source; seek the underlying order, report or judgment for the policy itself. |
| Parliament of India | Parliamentary record / primary | [Sansad portal](https://sansad.in/) | English and Hindi / national | Confirm the specific House, question number, session, answer date and attached answer before adding a record. |
| National Portal of India — State/UT directory | Government directory / primary as a link directory | [State/UT web directory](https://www.india.gov.in/directory/web-directory/state-uts) | English / national | Use to locate the issuing state or UT department; link to that issuer's own document. |
| State/UT government departments, commissions and recruitment bodies | Government / primary for their own notices | Domains discovered through the National Portal directory; each issuer is a separate registry entry | English or source language / one named state or UT | Add only after confirming the official domain and the issuing authority. Keep the state as structured metadata. |
| PRS Legislative Research | Legislative research / secondary-analysis | `prsindia.org` | English / national | Context and discovery only; link legislation, committee reports or parliamentary records directly. |
| Peer-reviewed journals, universities and research institutes | Academic / research | Per-publication domain | Language and geography per source | Record author, publication, date, DOI/stable URL and research limitations. |
| Reputable reporting | Secondary reporting | The Hindu, Indian Express, Hindustan Times, Times of India, NDTV, The Telegraph, Deccan Herald, The Print, Scroll, BBC, Reuters and PTI | Source language / national or regional | Discovery and context. Write original Signal Hub copy; do not republish or paraphrase sentence by sentence. |
| Community and social platforms | Lead / public reaction, not factual evidence | Reddit, X, YouTube, Instagram and Facebook | Per item | Never automatically classify as evidence. Identify claims as attributed claims and seek independent primary or reputable corroboration. |

All registry entries start disabled for automated fetching. An editor may enable an entry after reviewing its domain, terms, fetch method, frequency and content scope. The initial run mode is manual/on-demand; daily polling is a later operational step, not a promise that sources are already monitored.

## 2. Primary-source list and source hierarchy

1. **Tier 1 — primary:** the issuing court, government department, legislature, regulator, Gazette, official university or recruitment body. For a policy claim, seek its operative notification/order; for a court claim, seek the judgment/order; for constitutional text, use India Code or another official text.
2. **Tier 2 — reputable reporting:** the named reporting outlets above. Use for discovery, chronology and attributed context. A report is not a substitute for an available primary document.
3. **Tier 3 — research:** peer-reviewed work, universities, institutes, PRS and government committee/research publications. Preserve methodology and the limits of the underlying data.
4. **Tier 4 — community/social:** leads, attributed public reaction, or claims needing verification only. Never auto-promote to factual evidence.

Authority is a source classification, not a political credibility score. Store the source's role and the exact record that supports each material claim.

## 3. Image source and licensing plan

| Source | Intended use | Publication gate |
|---|---|---|
| [Wikimedia Commons API](https://commons.wikimedia.org/w/api.php) and [machine-readable file metadata](https://commons.wikimedia.org/wiki/Commons:Machine-readable_data) | Search candidates using topic, event, location, institution or person; obtain the file page and machine-readable metadata. | Editor confirms relevance and the specific file's license, creator, credit, attribution requirements and permitted reuse. Commons availability alone is not rights clearance. |
| Government/public-domain images | Official institutional context where the originating agency and reuse terms are clear. | Record the originating page, rights statement, creator/credit and any restrictions. Do not assume all government photography is public domain. |
| Official institutional media | Courts, universities, ministries or public institutions when reuse terms permit. | Verify terms on the original asset/page and store exact credit and rights. |
| Licensed stock provider | Only if a license is actually held for the relevant use. | Store provider, license reference, allowed territories/uses, expiry and attribution conditions. Do not claim a stock integration before one exists. |
| Original Signal Hub visuals | Timelines, maps, process diagrams and explainers. | Editorially review the source data and underlying claims; store authorship and revision/source notes. |
| Editorial charts/maps | Visualize verified data with units, period, geography and source. | Build only from verified structured data; keep the source and method visible. |
| Document preview | A small, legally appropriate preview linked to the official document. | Preserve the original source URL; do not imply that a preview is the complete or authoritative document. |

An image record must retain `image_url`, `source`, `license`, `creator`, `credit`, `copyright`, `usage_rights`, `alt_text`, `caption` and `discovered_at`. The editor-only Wikimedia Commons search stores selected results per lead with rights review set to **PENDING**. Editors must inspect the original file page and confirm the specific file's license, attribution and permitted use; Commons availability or API metadata alone is not clearance. Any change to creator, credit or usage terms resets the rights review to pending. A recorded rights check does not publish the image or attach it to a story. If rights or relevance are unresolved, keep it in editor review as **IMAGE RIGHTS UNCONFIRMED** and do not publish it. Image fallback order: relevant licensed image → relevant official image → document preview → original infographic/chart/map/timeline → honest typographic treatment → no image. Never fill an image slot with an unrelated attractive photo.

## 4. Controlled taxonomies

### Topics

Reservation; Higher Education; Employment; Government Recruitment; UGC; Universities; Supreme Court; High Courts; Constitution; Social Justice; EWS; SC; ST; OBC; PwD; Women; Minorities; Admissions; Examinations; Public Policy; State Policy; Court Judgments; Government Orders; Data; Historical Records.

Editors may add a topic to the controlled vocabulary. They should reuse an existing topic where possible and avoid one-off tags.

### Geography

Store geography as a typed entity: National, State/UT, Multi-state, District, Institution, Court, University or Government department. A state/UT is a first-class canonical entity; preserve the source's wording separately where historically material.

Initial canonical State/UT list:

- **States (28):** Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Chhattisgarh, Goa, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Manipur, Meghalaya, Mizoram, Nagaland, Odisha, Punjab, Rajasthan, Sikkim, Tamil Nadu, Telangana, Tripura, Uttar Pradesh, Uttarakhand and West Bengal.
- **Union territories (8):** Andaman and Nicobar Islands, Chandigarh, Dadra and Nagar Haveli and Daman and Diu, Delhi (National Capital Territory), Jammu and Kashmir, Ladakh, Lakshadweep and Puducherry.

Normalize aliases before matching records to map geometry: `Orissa` → `Odisha`; `Uttaranchal` → `Uttarakhand`; legacy `Dadra and Nagar Haveli` and `Daman and Diu` spellings → the current combined union territory where the record's geography warrants it. Do not rewrite historical source titles or imply that a legacy name is the current jurisdiction.

### Article type

`NEWS`, `EXPLAINER`, `INVESTIGATION`, `TIMELINE`, `DOCUMENT`, `DATA`, `ANALYSIS`.

Keep this separate from the existing presentation-oriented story `kind`. Do not change existing enums in place without an explicit compatibility/migration plan.

### Editorial and discovery status

- **Discovery item:** `NEW`, `REVIEW`, `REJECTED`, `PROMOTED` (an editor explicitly created a draft from it).
- **Editorial workflow:** `DRAFT`, `DISCOVERED`, `SOURCE CHECKED`, `EDITOR REVIEW`, `VERIFIED`, `PARTIALLY VERIFIED`, `UNVERIFIED`, `DISPUTED`, `PUBLISHED`, `ARCHIVED`.
- **Event verification:** `CONFIRMED`, `PARTIALLY CONFIRMED`, `UNVERIFIED`, `DISPUTED`, `ARCHIVED`.
- **Image review:** `PENDING`, `RIGHTS CHECKED`, `REJECTED`; unresolved assets remain unpublished.

The existing app uses separate workflow and verification fields. Treat these labels as the target editorial vocabulary, not permission to silently change or relabel existing public records. Public pages should show only a useful reader-facing status, and should not make every ordinary article appear unreliable.

The first implementation slice supports discovery items in `NEW`, `REVIEW` and `REJECTED`. `PROMOTED` remains a planned state until an explicit editor action creates a draft article and preserves the discovery item's provenance.

## 5. Discovery, deduplication and verification workflow

1. **Discover:** an enabled source or editor supplies a candidate URL. Community/social items are marked lead-only.
2. **Fetch safely:** allow only HTTPS URLs on a configured source's approved host. Set time, response-size and content-type limits; block private, loopback, link-local and redirect-to-private destinations. Store metadata or a short reference excerpt only when legally appropriate, not full third-party articles.
3. **Normalize:** retain original URL and normalized URL, publisher, source domain, source publication date (as provided), retrieval time, headline, language, candidate topic/geography and a short factual-neutral summary.
4. **Deduplicate:** first by canonical URL; suggest, but do not auto-merge, title/source/date matches. Multiple outlets covering one development should normally be attached to one explicitly reviewed event, not copied into several Signal Hub stories.
5. **Classify and suggest:** topic, geography, possible event/source document and image candidates remain suggestions until editor review.
6. **Verify:** open the original primary source where available. Confirm issuer, document type, publication/decision date, scope, operative status and exact link. Add secondary reporting as context, not as a replacement for an available primary source.
7. **Review:** an editor may reject, save for review, or explicitly promote a discovery item into a draft. Promotion never publishes it.
8. **Create the evidence graph:** an editor separately creates/chooses the article, event and source records, then explicitly creates each required relationship. Article→event, event→source and article→source must be stored independently. Text matching or AI suggestions never create joins.
9. **Publish:** publication requires the existing editor/review safeguards plus a source/date/body quality check. Public pages only expose published records and relationships to published records.
10. **Audit:** retain who created/reviewed/promoted records and when; preserve revisions and corrections.

The current first slice is editor-only and manual: it stores source registry entries, accepts editor-entered leads from enabled source domains, canonicalizes URLs for deduplication, and records review/rejection notes. It does not fetch feeds or external article page content. Editors can search Wikimedia Commons and save file metadata as per-lead image candidates for explicit rights review. It does not create articles/events/source documents, create evidence relationships, or publish or attach images.

## 6. Initial 100-record research backlog

These are 100 **planned research slots**, not content records. `P001`–`P100` are plan labels only and must never be inserted as story/event/source IDs. Before any slot becomes a record, an editor must identify and inspect a real source and date, record what it supports, write original content, and assign a verification status. If the source does not exist or cannot be checked, leave the slot open.

| Plan | Candidate research question or page | Type | First source target |
|---|---|---|---|
| P001 | What do Articles 15 and 16 of the Constitution say about equality and reservation? | EXPLAINER | India Code / official constitutional text |
| P002 | How is India's reservation framework structured across law, rules and institutions? | EXPLAINER | Constitution, legislation and applicable rules |
| P003 | How do central and state reservation rules differ, and where must readers check? | EXPLAINER | DoPT plus named state/UT orders |
| P004 | What is the difference between vertical and horizontal reservation? | EXPLAINER | Relevant laws, rules and judgments |
| P005 | What does an open or unreserved seat mean? | EXPLAINER | Primary judgments and recruitment/admission rules |
| P006 | How do central and state SC/ST/OBC lists differ? | EXPLAINER | Relevant official lists and issuing authorities |
| P007 | What did the 103rd Constitutional Amendment change for EWS? | EXPLAINER | India Code / amendment text and judgment |
| P008 | What is the legal history of the 50% ceiling and its limits? | EXPLAINER | Supreme Court judgments |
| P009 | How has the creamy-layer rule been applied to OBC reservation? | EXPLAINER | Judgments and applicable government orders |
| P010 | How are reservation rosters used in central government recruitment? | EXPLAINER | DoPT instructions and recruitment rules |
| P011 | What rules and judgments govern reservation in promotions? | EXPLAINER | DoPT orders and Supreme Court judgments |
| P012 | How should a reader interpret a vacancy roster point? | EXPLAINER | DoPT roster instructions |
| P013 | How does reservation operate in central educational institutions? | EXPLAINER | Central Educational Institutions Act and rules |
| P014 | Why can state university admission rules differ? | EXPLAINER | Named university/state rules and UGC instruments |
| P015 | How are backlog and carry-forward vacancies addressed? | EXPLAINER | Applicable DoPT/state instructions |
| P016 | What is de-reservation, and which approval rules apply? | EXPLAINER | Applicable government instructions |
| P017 | How are category certificates issued and verified? | EXPLAINER | Issuing authority's current rules |
| P018 | How does horizontal reservation for persons with benchmark disabilities work? | EXPLAINER | RPwD Act, rules and relevant orders |
| P019 | How do women’s horizontal-reservation rules vary by jurisdiction? | EXPLAINER | Named state/UT rules and recruitment notices |
| P020 | How do ex-servicemen reservation rules vary across services? | EXPLAINER | Central/state rules and recruitment notices |
| P021 | How does reservation in local bodies differ from jobs and admissions? | EXPLAINER | Constitution, statutes and judgments |
| P022 | What UGC instruments govern reservation-related university procedures? | EXPLAINER | UGC regulations and notices |
| P023 | Which central EWS eligibility instructions apply, and to whom? | EXPLAINER | DoPT/Gazette orders and relevant judgments |
| P024 | What constitutional rules govern reservation in private educational institutions? | EXPLAINER | Constitutional text, legislation and judgments |
| P025 | How should a reader distinguish a state OBC list from the Central List? | EXPLAINER | NCBC and relevant state authority |
| P026 | How can a Gazette notification be checked and cited? | EXPLAINER | e-Gazette and Gazette publication guidance |
| P027 | How can a Supreme Court judgment be checked and cited? | EXPLAINER | Supreme Court judgment search |
| P028 | What can a roster establish, and what can it not establish? | EXPLAINER | DoPT instructions and judgments |
| P029 | How can applicants verify the rules for one recruitment or admission cycle? | EXPLAINER | The issuing body's current notice and rulebook |
| P030 | How does Signal Hub distinguish a verified fact, an attributed claim and an open question? | EXPLAINER | Signal Hub's published editorial/evidence policy |
| P031 | Constitutional provisions and reservation-policy chronology from 1950 onward | TIMELINE | Official constitutional text and Gazette |
| P032 | Champakam Dorairajan case and the First Amendment: source-led chronology | TIMELINE | Supreme Court judgment and India Code |
| P033 | Backward Classes Commission and Mandal report: primary-record chronology | TIMELINE | Commission report and government records |
| P034 | Mandal Commission implementation: orders, litigation and dated records | TIMELINE | DoPT orders, Gazette and judgments |
| P035 | Indra Sawhney litigation and subsequent source-linked developments | TIMELINE | Supreme Court judgment and later orders |
| P036 | Central-services roster instructions: document chronology | TIMELINE | DoPT circulars and orders |
| P037 | The 77th Constitutional Amendment and reservation in promotions | TIMELINE | India Code and Gazette |
| P038 | The 81st Constitutional Amendment and backlog vacancies | TIMELINE | India Code and Gazette |
| P039 | The 82nd Constitutional Amendment and consequential provisions | TIMELINE | India Code and Gazette |
| P040 | The 85th Constitutional Amendment and seniority provisions | TIMELINE | India Code and Gazette |
| P041 | The 93rd Constitutional Amendment and Article 15(5) | TIMELINE | India Code and Gazette |
| P042 | Central Educational Institutions Reservation Act: passage and implementation records | TIMELINE | India Code, Parliament and Gazette |
| P043 | The 102nd Constitutional Amendment and NCBC: dated legal record | TIMELINE | India Code, Parliament and judgments |
| P044 | The 103rd Constitutional Amendment, EWS orders and litigation | TIMELINE | India Code, Gazette and judgments |
| P045 | The 105th Constitutional Amendment and state-list authority | TIMELINE | India Code, Parliament and judgments |
| P046 | Creamy-layer doctrine: source-linked judgment chronology | TIMELINE | Supreme Court judgments |
| P047 | Reservation in local bodies: constitutional and judicial chronology | TIMELINE | Statutes, Gazette and judgments |
| P048 | UGC reservation-related regulations and notices: document chronology | TIMELINE | UGC regulation and notice archive |
| P049 | Major Supreme Court reservation judgments: curated case chronology | TIMELINE | Supreme Court judgment records |
| P050 | 2020–2026 reservation developments: rolling timeline, add only verified records | TIMELINE | Primary sources for each dated item |
| P051 | State of Madras v. Champakam Dorairajan: judgment and legal context | ANALYSIS | Supreme Court judgment |
| P052 | M.R. Balaji v. State of Mysore: what the judgment says | ANALYSIS | Supreme Court judgment |
| P053 | Indra Sawhney v. Union of India: holding, limits and later citations | ANALYSIS | Supreme Court judgment |
| P054 | State of Kerala v. N.M. Thomas: judgment text and subsequent treatment | ANALYSIS | Supreme Court judgment |
| P055 | R.K. Sabharwal v. State of Punjab: judgment and roster implications | ANALYSIS | Supreme Court judgment |
| P056 | Ajit Singh seniority cases: separate holdings and dates | ANALYSIS | Supreme Court judgments |
| P057 | M. Nagaraj v. Union of India: judgment and later review | ANALYSIS | Supreme Court judgment |
| P058 | Ashoka Kumar Thakur v. Union of India: judgment and scope | ANALYSIS | Supreme Court judgment |
| P059 | Jarnail Singh v. Lachhmi Narain Gupta: judgment and subsequent orders | ANALYSIS | Supreme Court judgment |
| P060 | Janhit Abhiyan v. Union of India: EWS amendment judgment | ANALYSIS | Supreme Court judgment |
| P061 | Jaishri Laxmanrao Patil v. Chief Minister: Maratha reservation judgment | ANALYSIS | Supreme Court judgment |
| P062 | State of Punjab v. Davinder Singh: judgment on SC sub-classification | ANALYSIS | Supreme Court judgment |
| P063 | The 77th Amendment: text, date and scope as published | DOCUMENT | India Code / Gazette |
| P064 | The 81st Amendment: text, date and scope as published | DOCUMENT | India Code / Gazette |
| P065 | The 82nd Amendment: text, date and scope as published | DOCUMENT | India Code / Gazette |
| P066 | The 85th Amendment: text, date and scope as published | DOCUMENT | India Code / Gazette |
| P067 | The 93rd Amendment and Central Educational Institutions legislation | DOCUMENT | India Code / Gazette |
| P068 | The 102nd and 105th Amendments: distinct texts and commencement records | DOCUMENT | India Code / Gazette |
| P069 | The 103rd Amendment: constitutional text and commencement record | DOCUMENT | India Code / Gazette |
| P070 | Central Educational Institutions (Reservation in Admission) Act: text and amendments | DOCUMENT | India Code / Gazette |
| P071 | Andhra Pradesh: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P072 | Assam: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P073 | Bihar: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P074 | Chhattisgarh: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P075 | Gujarat: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P076 | Haryana: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P077 | Jharkhand: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P078 | Karnataka: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P079 | Kerala: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P080 | Madhya Pradesh: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P081 | Maharashtra: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P082 | Odisha: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P083 | Punjab: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P084 | Rajasthan: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P085 | Tamil Nadu: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P086 | Telangana: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P087 | Uttar Pradesh: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P088 | Uttarakhand: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P089 | West Bengal: locate and review current official recruitment/admission rules | DOCUMENT | State department, Gazette or issuing institution |
| P090 | Delhi (NCT): locate and review current official recruitment/admission rules | DOCUMENT | NCT department, Gazette or issuing institution |
| P091 | Constitution of India: canonical text record with amendment references | DOCUMENT | India Code |
| P092 | Central List of OBCs: state-wise official source index and update dates | DATA | NCBC official list; verify each entry against the issuer |
| P093 | Official SC/ST lists: state/UT source index and amendment history | DATA | Relevant Union ministry, India Code and Gazette |
| P094 | DoPT reservation roster and services guidance document index | DATA | DoPT orders and circulars |
| P095 | Central Educational Institutions reservation legislation and amendments index | DATA | India Code and Gazette |
| P096 | Official recruitment rule and notice collection: source-indexed, not scraped in full | DATA | Named recruitment bodies and official notices |
| P097 | UGC regulation and notice collection with publication dates | DATA | UGC regulations and notices |
| P098 | All India Survey on Higher Education releases: report/data inventory | DATA | Ministry of Education / official AISHE release |
| P099 | Parliament reservation-related questions and answers: source-linked index | DATA | Sansad portal; retain House, session, question number and answer |
| P100 | Backlog-vacancy statistics: publish only when a comparable official dataset is located | DATA | DoPT, ministry annual reports or parliamentary answers |

The 20 state slots above are a first research queue, not a claim that these jurisdictions have a particular current quota or rule. The remaining states and union territories stay in the source registry and can enter the queue when a substantive, source-backed record is found. State pages should not be created merely to satisfy this list.

## 7. Publication quality and rollout gates

Before publication check: headline, dek, original article body, author, topic, canonical geography, source and source date, Signal Hub publication date, source type/authority, image relevance and license, explicit evidence links, related event/source, SEO metadata, canonical URL and Open Graph image. Do not conflate the date on a source with Signal Hub's publication date.

Rollout order:

1. Source registry and editorial source list.
2. Discovery ingestion and URL-based deduplication.
3. Image candidate search and rights review.
4. Editor discovery queue with explicit promote/reject/review actions.
5. Individually researched records from this 100-slot backlog; do not fabricate a 100-item corpus.
6. Explicit article↔event, event↔source and article↔source relationships.
7. Database-driven homepage selection, only from eligible published records.
8. SEO and publication-quality validation.
9. Performance, security and recovery checks for every external fetch.

No automated publishing is planned. Source classification, claims, event creation, evidence links, controversial interpretations, primary-source designation and image-rights approval require an editor.