/**
 * Search titles and descriptions for a few high-demand entries.
 *
 * These override only <title>, meta description, and the Open Graph / Twitter
 * text. The visible page (H1, basic account, lore) still uses the catalogue
 * name and shortDescription. Do not put living-community or never-promoted
 * slugs here.
 */

export type EntrySeo = {
  /** Document title; the root template appends " · Giants of the World". */
  title: string;
  description: string;
  /** Optional FAQPage schema answers; appended to @graph when present. */
  faqs?: { question: string; answer: string }[];
};

export const ENTRY_SEO: Record<string, EntrySeo> = {
  atlas: {
    title: "Atlas: sky and pillars, not the globe",
    description:
      "Atlas is a Titan. Homer has pillars between earth and sky; Hesiod has the sky. The terrestrial globe on the shoulders is post-classical. Free sourced entry.",
    faqs: [
      {
        question: "Did Atlas hold up the Earth?",
        answer:
          "Not in the early sources. Hesiod places him at the world’s western limit, holding up the wide sky with his head and tireless hands. Homer’s Odyssey Book 1 has him hold the pillars that keep earth and sky apart: pillars, not shoulders. The celestial sphere is ancient (Apollodorus; the Farnese Atlas, about 150 CE). What is post-classical is the terrestrial globe.",
      },
      {
        question: "Was Atlas a giant or a Titan?",
        answer:
          "The account names him a Titan of the generation before the Olympians, son of the Titan Iapetus. When Zeus and the Olympians broke the older gods, most of the defeated were thrown into Tartarus; Atlas was given a more specific punishment. Giant is not his class in the early sources.",
      },
      {
        question: "What is the difference between Homer’s Atlas and Hesiod’s?",
        answer:
          "Hesiod’s Theogony (c. 700 BCE) has him holding the sky. Homer has pillars between earth and sky. The image was still moving.",
      },
      {
        question: "How did Atlas become a mountain?",
        answer:
          "In Ovid’s Metamorphoses IV, Perseus arrives with the head of Medusa, receives no hospitality, and uses it; Atlas becomes the mountain range in north-west Africa that still carries his name. That version and the sky-holding version cannot both be true, and the tradition never tried to reconcile them.",
      },
      {
        question: "Why are books of maps called atlases?",
        answer:
          "The use of atlas for a book of maps comes from Mercator’s Atlas of 1595. The Atlas Mountains and the Atlantic Ocean both take their names from him.",
      },
    ],
  },
  fomorians: {
    title: "Fomorians: Irish adversaries of the Tuatha Dé",
    description:
      "Irish mythology's adversary race out of the sea: they took tribute from the Tuatha Dé Danann and forbade the teaching of poetry and law. Free sourced entry.",
    faqs: [
      {
        question: "Who were the Fomorians in Irish mythology?",
        answer:
          "They are the adversary race of Irish tradition. In the oldest layer they come from under the sea or under the earth. Later they are recast as sea raiders and giants, and later still as pirates from somewhere else entirely. For a period they ruled, taking tribute from the Tuatha Dé Danann and from the Nemedians before them. Cath Maige Tuired carries the fullest account; Lebor Gabála Érenn supplies the other frame.",
      },
      {
        question: "Were the Fomorians giants?",
        answer:
          "Giant stature is a later recasting: first under sea or earth, later sea raiders and giants, later still pirates from somewhere else. What the sources remember about their rule, before anything about their size, is that they banned the teaching of poetry and law. Height in the catalogue is unmeasured.",
      },
      {
        question: "What did the Fomorians forbid?",
        answer:
          "They forbade the scholars, the bards and the druids to teach. That is what the sources remember about their rule, before anything about their size. What was in the teaching that made it worth forbidding is not recorded.",
      },
      {
        question: "How did Fomorian rule end?",
        answer:
          "Their fall is a family matter. Balor, their commander, gave his daughter Ethne to Cían of the Tuatha Dé Danann. The child of that marriage was Lugh, who led the overthrow of Fomorian rule and killed Balor himself.",
      },
      {
        question: "Are the medieval Irish texts a pagan record?",
        answer:
          "Lebor Gabála Érenn is a pseudo-history, compiled by Christian scribes in the eleventh century to give Ireland an origin story comparable to the biblical one. It is a real and valuable source and it is not a neutral record of pagan tradition. Where it disagrees with itself about who the Fomorians were and when they arrived, that is the seam showing.",
      },
    ],
  },
  goliath: {
    title: "How tall was Goliath? The manuscripts disagree",
    description:
      "Masoretic Hebrew gives six cubits and a span; Septuagint, Dead Sea Scrolls and Josephus give four. The taller number is not only medieval. Free sourced entry.",
    faqs: [
      {
        question: "How tall was Goliath?",
        answer:
          "The manuscripts disagree. The Masoretic text of 1 Samuel 17 gives six cubits and a span, around 2.9 metres. The Septuagint, the Dead Sea Scrolls fragment 4QSam-a and Josephus all give four cubits and a span, around 2 metres: tall but within human range. The six-cubit figure is also in the Vulgate and Targum Jonathan. Whether the larger figure is the later reading is a live text-critical dispute, not a settled result.",
      },
      {
        question: "Was Goliath a giant?",
        answer:
          "1 Samuel 17 catalogues armour and challenge, not a species label. One manuscript tradition puts him around 2.9 metres; another, equally ancient in its witnesses, puts him around 2 metres. Suggestions of a pituitary disorder producing gigantism are medically coherent but entirely speculative, and rest on treating a literary description as a clinical record.",
      },
      {
        question: "Who killed Goliath?",
        answer:
          "1 Samuel 17 is the main text: David. 2 Samuel 21:19 states that Elhanan son of Jaare-oregim killed Goliath the Gittite. 1 Chronicles 20:5 adjusts this so that Elhanan kills Goliath’s brother Lahmi: visibly a later harmonisation. Who killed him is a real problem in the text, not a modern invention.",
      },
      {
        question: "Does the Gath ostracon prove Goliath existed?",
        answer:
          "An inscription from tenth-to-ninth-century Tell es-Safi, the site generally identified as Gath, carries names close in form to Goliath. What the sherd shows is that names like Goliath were in use at Gath in the right period. It does not by itself prove the champion of the story, nor a securely Philistine etymology.",
      },
      {
        question: "Why did David win?",
        answer:
          "The story is not about strength. A sling in trained hands was a genuine military weapon with real range: the mismatch is the reverse of how it looks. David closes the distance while slinging rather than waiting to be reached.",
      },
    ],
  },
  nephilim: {
    title: "Nephilim: what Genesis actually says",
    description:
      "One cluster of verses in Genesis, then the story moves on. The Septuagint chose gigantes; Enoch, Jubilees and the internet do the rest. Free sourced entry.",
    faqs: [
      {
        question: "What does Genesis actually say about the Nephilim?",
        answer:
          "Genesis 6:1–4 is the core: the sons of God see that the daughters of men are fair and take wives from among them; the Nephilim are on the earth in those days, and also afterward; the text calls them the mighty men of old, men of renown. The verses sit immediately before the flood decision; the connection is implied but never stated. They reappear once, in Numbers 13:33, in a spies’ report the text frames as a bad report given by frightened men.",
      },
      {
        question: "Were the Nephilim giants?",
        answer:
          "The Hebrew word is not translated. It is usually connected to the root n-p-l, to fall, giving “the fallen ones.” The Septuagint translators rendered it gigantes, giants, and that decision shaped two thousand years of reading. The giant reading is genuinely ancient, but it travels on translation and on expansion literature rather than on the wording of the Hebrew verse.",
      },
      {
        question: "Who were the sons of God in Genesis 6?",
        answer:
          "That is the central unresolved question. The three main readings are divine or angelic beings, the righteous line of Seth intermarrying with the line of Cain, or dynastic rulers claiming divine descent; each has been the majority view at different periods, and the Hebrew supports all three. Whether the Nephilim are the offspring of that union or simply present at the same time is grammatically ambiguous.",
      },
      {
        question: "How tall were the Nephilim?",
        answer:
          "Genesis never measures them. Later Jewish tradition, particularly the Book of Enoch, filled the silence with named angels, forbidden knowledge, and devouring giant offspring. Modern claims that giant skeletons confirm the Nephilim rest on misidentified fossils, hoaxes and doctored photographs; no verified remains exist.",
      },
      {
        question: "Did the Nephilim survive the flood?",
        answer:
          "“And also afterward” in Genesis 6:4 is a genuine problem, since it appears to place them after a flood that killed everything. Explanations range from a second incursion to an editorial insertion harmonising with Numbers 13. The page does not choose among them.",
      },
    ],
  },
  polyphemus: {
    title: "Polyphemus: the Cyclops of the Odyssey",
    description:
      "Homer's Odyssey Book 9 is the cave, the eye, and the name Nobody. Theocritus later made him a lovesick herdsman. Both were current at once. Free sourced entry.",
    faqs: [
      {
        question: "Who was Polyphemus?",
        answer:
          "In Homer’s Odyssey Book 9, Polyphemus is son of Poseidon and the nymph Thoosa, a Cyclops who keeps flocks on a wild island. Odysseus finds the cave; Polyphemus traps the men, eats some of them, and is blinded with a sharpened olive stake. A separate tradition in Theocritus and Ovid makes him a lovesick herdsman singing to the sea-nymph Galatea. Both versions were current at once.",
      },
      {
        question: "Was Polyphemus a giant?",
        answer:
          "The Odyssey presents him as a Cyclops large enough that the stone across his cave-mouth is one no twenty wagons could shift. Hesiod’s Cyclopes, Brontes, Steropes and Arges, smiths who forge Zeus’s thunderbolt, are a different set entirely. The tradition has at least two unrelated groups of one-eyed beings under one name.",
      },
      {
        question: "How did Odysseus escape Polyphemus?",
        answer:
          "Odysseus gives his name as Nobody, gets Polyphemus drunk on unmixed wine, and drives a sharpened olive stake into the single eye. When the other Cyclopes ask who is hurting him, he answers Nobody, and they leave. In the morning the men leave underneath the sheep. Safe offshore, Odysseus shouts his real name; Polyphemus prays to Poseidon.",
      },
      {
        question: "Did Homer invent the blinded Cyclops story?",
        answer:
          "The blinded-ogre story is not exclusive to Homer. Folklorists catalogue versions across Europe, the Caucasus and Central Asia as tale type AaTh 1137. Whether these descend from Homer, feed into him, or represent independent tellings has been argued for over a century without settlement. Comparative study since Nyrop has treated the blinding and the false name as separable.",
      },
      {
        question: "Were Cyclopes inspired by elephant skulls?",
        answer:
          "A long-standing suggestion that the Cyclops was inspired by dwarf elephant skulls found in Sicilian caves, the central nasal opening read as an eye socket, is popular but has no ancient support and is not accepted by most scholars.",
      },
    ],
  },
  ravana: {
    title: "Ravana: ten-headed king of the Ramayana",
    description:
      "Ravana of the Ramayana is a rakshasa king: ten-headed, learned, a devotee of Shiva. Whether he counts as a giant is a fair question. Free sourced entry.",
    faqs: [
      {
        question: "Who was Ravana?",
        answer:
          "Ravana is the ten-headed king of Lanka and the antagonist of the Ramayana: a rakshasa king, a scholar of the Vedas, a master of the veena, and a devotee of Shiva. Valmiki’s Ramayana is the foundational text; the Uttara Kanda supplies most of his backstory, including the boon and the Kailasa episode, and is widely regarded as a later addition.",
      },
      {
        question: "Was Ravana a giant?",
        answer:
          "Whether he counts as a giant is a fair question. The Sanskrit describes a being of great stature and power, but rakshasa is its own category and the “giant” label is largely an artefact of European translation looking for an equivalent.",
      },
      {
        question: "Why does Ravana have ten heads?",
        answer:
          "His ten heads are usually read as mastery of the six shastras and four Vedas: learning, not deformity.",
      },
      {
        question: "Why could the gods not kill Ravana?",
        answer:
          "Through immense austerities he wins a boon from Brahma: he cannot be killed by gods, demons, rakshasas, gandharvas or any other supernatural being. He does not bother to include humans and animals. Vishnu incarnates as Rama, a man, and the boon holds perfectly while being useless.",
      },
      {
        question: "Is Ravana only a villain?",
        answer:
          "Whether Ravana should be read as a villain at all is genuinely contested, and not only by modern commentators. Devotional traditions differ, and some communities in Sri Lanka and southern India regard him positively. Effigy-burning at Dussehra is not universal practice. At his death, Rama sends Lakshmana to sit at his feet and learn statecraft.",
      },
    ],
  },
  "si-te-cah": {
    title: "Si-Te-Cah: Lovelock Cave, what Winnemucca wrote",
    description:
      "A Paiute tradition of a people-eating tribe at Lovelock Cave. Winnemucca did not call them giants; later retellings did. Unverified. Free sourced entry.",
    faqs: [
      {
        question: "Who were the Si-Te-Cah?",
        answer:
          "In Sarah Winnemucca Hopkins’s Life Among the Piutes (1883), the people she describes are a small tribe of barbarians who used to live along the Humboldt River, many hundred years ago: they waylaid her people and ate them. She calls them people-eaters. In her telling there are no giants.",
      },
      {
        question: "Were the Si-Te-Cah giants?",
        answer:
          "In Winnemucca’s telling there are no giants. The word small is hers. The word giant is not. It appears once in the whole book, where she explains that stories of giants are filed under “it is only coyote,” meaning make-believe. What later retellings add is giant stature. The giants still have no foothold in the 1883 text. The claim is circulating oral tradition, not confirmed fact.",
      },
      {
        question: "What was found at Lovelock Cave?",
        answer:
          "Lovelock Cave itself is real. In 1911 two miners dug out bat guano, discarding what was in their way. Llewellyn Loud came in 1912 and recovered around ten thousand objects; he returned in 1924 with Mark Raymond Harrington, and they published in 1929. It is one of the most important sites in the Great Basin, and the reason it is famous has nothing to do with why it is important.",
      },
      {
        question: "Did excavations recover giant skeletons?",
        answer:
          "The circulating claim is that excavations recovered skeletons and mummies of red-haired giants, some of them eight to ten feet tall. Red hair is attested from the beginning; the giant heights enter later, through measurements taken outside the cave and through remains that were dispersed before anyone studied them. No official records corroborate the giant account.",
      },
      {
        question: "What about the red hair?",
        answer:
          "The red hair is in Winnemucca, not imported later. She writes that her people say the tribe they exterminated had reddish hair, and that she has some of that hair. Adrienne Mayor notes that hair pigment can also turn a rusty red after death under the right conditions, which is a separate path for the same detail in excavated remains.",
      },
    ],
  },
  ymir: {
    title: "Ymir: the world made from a body",
    description:
      "In the Norse poems the earth, sea and sky are cut from the first being's corpse. Snorri systematises; the older verse is stranger. Free sourced entry.",
    faqs: [
      {
        question: "Who was Ymir?",
        answer:
          "In the Poetic Edda and in Snorri Sturluson’s Prose Edda, Ymir is the first being who rose from melting rime in Ginnungagap, where Muspellheim’s heat met Niflheim’s ice. He is called Aurgelmir in the older poems. The primeval cow Auðumbla fed him; from his sweat a man and a woman took shape, and from his legs a six-headed son.",
      },
      {
        question: "Was Ymir a giant?",
        answer:
          "The account will not settle it as a simple yes: neither fully god nor fully giant, but the wet, roaring beginning of both. The jötunn line is established from him before the gods had names. He is killed by his own descendants: Odin, Vili and Vé, sons of Borr and the giantess Bestla.",
      },
      {
        question: "How was the world made from Ymir’s body?",
        answer:
          "After Odin, Vili and Vé struck him down they built the world from the corpse. Snorri’s Gylfaginning lays it out piece by piece; Grímnismál gives the correspondences in compressed verse. Flesh became earth; bone became mountain; teeth and jaw-shards became scree and stone; blood was poured as sea and lake; the skull was raised as the sky’s vault; the brains were thrown up as cloud.",
      },
      {
        question: "Is Ymir the same as Aurgelmir?",
        answer:
          "The poems use both names. Vafþrúðnismál is where Ymir’s other name, Aurgelmir, and Bergelmir’s escape appear. What is disputed is unsettled: one being under two names, or two beings that merged before the poems were fixed.",
      },
      {
        question: "What did Bergelmir escape in?",
        answer:
          "Ymir’s blood came out as a flood that drowned very nearly all the frost-giants; only Bergelmir escaped with his household. The Old Norse phrase á lúðr has been read as a chest, a hollowed trunk, a boat, a cradle and a mill-box. Each reading pulls the episode in a different direction, and the sources will not agree.",
      },
    ],
  },
};

export function getEntrySeo(slug: string): EntrySeo | null {
  return ENTRY_SEO[slug] ?? null;
}
