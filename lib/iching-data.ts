export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  judgment: string;
  lines: [string, string, string, string, string, string];
}

// Lookup table: HEXAGRAM_TABLE[lower_trigram][upper_trigram] = hexagram number
// Trigram binary values (lines bottom to top, yang=1 yin=0):
// Kun=0(000), Zhen=1(001), Kan=2(010), Dui=3(011), Gen=4(100), Li=5(101), Xun=6(110), Qian=7(111)
const HEXAGRAM_TABLE: number[][] = [
  [2,  16, 8,  45, 23, 35, 20, 12], // lower = Kun  (0)
  [24, 51, 3,  17, 27, 21, 42, 25], // lower = Zhen (1)
  [7,  40, 29, 47, 4,  64, 59, 6],  // lower = Kan  (2)
  [19, 54, 60, 58, 41, 38, 61, 10], // lower = Dui  (3)
  [15, 62, 39, 31, 52, 56, 53, 33], // lower = Gen  (4)
  [36, 55, 63, 49, 22, 30, 37, 13], // lower = Li   (5)
  [46, 32, 48, 28, 18, 50, 57, 44], // lower = Xun  (6)
  [11, 34, 5,  43, 26, 14, 9,  1],  // lower = Qian (7)
];

export function getHexagramNumber(lines: number[]): number {
  const isYang = (v: number) => v === 7 || v === 9;
  const lower =
    (isYang(lines[0]) ? 1 : 0) |
    (isYang(lines[1]) ? 2 : 0) |
    (isYang(lines[2]) ? 4 : 0);
  const upper =
    (isYang(lines[3]) ? 1 : 0) |
    (isYang(lines[4]) ? 2 : 0) |
    (isYang(lines[5]) ? 4 : 0);
  return HEXAGRAM_TABLE[lower][upper];
}

export function getTransformedHexagramNumber(lines: number[]): number | null {
  if (!lines.some((l) => l === 6 || l === 9)) return null;
  const transformed = lines.map((l) =>
    l === 6 ? 7 : l === 9 ? 8 : l
  );
  return getHexagramNumber(transformed);
}

export const HEXAGRAMS: Hexagram[] = [
  {
    number: 1,
    name: "The Creative",
    chineseName: "乾 Qián",
    judgment:
      "Heaven moves with supreme power; the creative force is inexhaustible. Through perseverance and righteous conduct, all undertakings succeed.",
    lines: [
      "The dragon lies hidden in the deep; do not act yet — the moment has not come.",
      "The dragon appears in the field; it is favorable to meet with the great teacher.",
      "The creative man toils all day and remains vigilant at nightfall; danger comes but passes.",
      "The dragon may choose to leap from the abyss or remain — no blame either way.",
      "The flying dragon soars through the heavens; great good fortune comes from seeking the wise.",
      "The arrogant dragon who overshoots will have cause to repent; excess brings downfall.",
    ],
  },
  {
    number: 2,
    name: "The Receptive",
    chineseName: "坤 Kūn",
    judgment:
      "Earth nourishes all things in devoted silence; the receptive yields and thereby succeeds. Follow rather than lead, and through steady perseverance all goals are reached.",
    lines: [
      "Treading on frost: solid ice is near — recognize early signs of change and prepare.",
      "Straight, square, great — virtue acts without striving, yet nothing remains unserved.",
      "Conceal your abilities; work without seeking credit and keep to your proper role.",
      "A tied sack: neither praise nor blame — discretion is the highest wisdom now.",
      "A yellow lower garment brings supreme good fortune; inner worth shines through simple form.",
      "Dragons fight in the open field; both shed dark blood — yin oversteps its bounds and suffers.",
    ],
  },
  {
    number: 3,
    name: "Difficulty at the Beginning",
    chineseName: "屯 Zhūn",
    judgment:
      "Like a blade of grass pushing up through frozen earth, initial chaos and difficulty precede every breakthrough. Do not act rashly — seek allies and let order emerge gradually.",
    lines: [
      "Hesitation at the start; yet perseverance brings order and helpers come in time.",
      "The maiden stays chaste through ten years of hardship; the right betrothal arrives at last.",
      "Pursuing deer without a guide leads deeper into the forest — abandon this hunt.",
      "Horse and cart are held back; seek the one you need and the union brings good fortune.",
      "Obstacles block the bestowing of grace; small perseverance gains, great ambition harms.",
      "Horse and cart break down; blood flows like tears — the situation has reached its limit.",
    ],
  },
  {
    number: 4,
    name: "Youthful Folly",
    chineseName: "蒙 Méng",
    judgment:
      "The spring emerges uncertain at the mountain's foot, seeking its way — this is youthful folly. The teacher responds when sincerely asked, not when pestered; discipline opens the path to clarity.",
    lines: [
      "Dispel youthful folly through firm discipline; chains must be loosened once respect is gained.",
      "Bearing with the foolish with kindness brings good fortune; knowing how to lead children brings success.",
      "Do not pursue the willful woman who clings to wealth; no value comes from this union.",
      "Entanglement in delusion brings humiliation; break free before the pattern deepens.",
      "Childlike innocence and openness bring good fortune; the pure heart invites teaching.",
      "Punishment of youthful folly is right only to maintain discipline, never to do violence.",
    ],
  },
  {
    number: 5,
    name: "Waiting",
    chineseName: "需 Xū",
    judgment:
      "Clouds gather in the sky but rain has not yet fallen; strength waits with confident patience. When the right moment arrives, action succeeds — do not force what is not yet ripe.",
    lines: [
      "Waiting in the meadow; remain constant and no mistakes will come to you.",
      "Waiting on the sand; some small criticism comes, but the end brings good fortune.",
      "Waiting in the mud invites the enemy to draw near; take care to avoid further harm.",
      "Waiting in blood; get out of the pit — hold your position and keep going through danger.",
      "Waiting with food and drink; perseverance brings good fortune — enjoy what the time offers.",
      "Three uninvited guests enter the cave; receive them respectfully and good fortune follows.",
    ],
  },
  {
    number: 6,
    name: "Conflict",
    chineseName: "訟 Sòng",
    judgment:
      "Heaven moves upward while water flows downward — their natures conflict and strife arises. Seek mediation rather than total victory; the middle course protects what matters most.",
    lines: [
      "Do not prolong the dispute; yield now and some criticism comes, but good fortune follows.",
      "The conflict is too great to win; retreat home and avoid the surrounding community.",
      "Nourish yourself on old virtue; danger comes but yields — serve the greater good, not yourself.",
      "Return to your own nature; accept peace rather than pressing on — good fortune comes from yielding.",
      "Conflict decided before a great judge; supreme good fortune follows the just resolution.",
      "Even if a leather belt is awarded, it will be stripped away three times before morning.",
    ],
  },
  {
    number: 7,
    name: "The Army",
    chineseName: "師 Shī",
    judgment:
      "Water hidden beneath the earth flows unseen — the army marshals its power in disciplined order. The general who commands with justice wins loyalty; righteous leadership transforms danger into good fortune.",
    lines: [
      "An army must set out in proper order; otherwise even good intentions lead to misfortune.",
      "The general stands at the center of his army; good fortune — the king confers honors thrice.",
      "The army carries corpses in its wagons; defeat has come through poor leadership.",
      "The army retreats; no blame — a strategic withdrawal preserves strength for the future.",
      "Game is in the field: it benefits to take it; let the elder son lead, not the younger.",
      "The king bestows lands and titles; do not employ petty men, for they will bring ruin.",
    ],
  },
  {
    number: 8,
    name: "Holding Together",
    chineseName: "比 Bǐ",
    judgment:
      "Water rests upon the earth and gathers into unity — union and alliance are essential now. Seek to bond with others sincerely; the late-comer when all bonds are formed meets misfortune.",
    lines: [
      "Holding together in truth; fill the earthen bowl — good fortune flows from inner sincerity.",
      "Holding together from within; perseverance brings good fortune in the long run.",
      "Holding together with the wrong people brings harm; yet avoiding worst mistakes is possible.",
      "Holding together with those outside the inner circle; perseverance here brings good fortune.",
      "The king drives game from three sides only; citizens who flee need not fear — good fortune.",
      "There is no head at the beginning of this union; misfortune follows from poor foundation.",
    ],
  },
  {
    number: 9,
    name: "Small Taming",
    chineseName: "小畜 Xiǎo Chù",
    judgment:
      "Wind blows across the sky and drives the clouds, but rain has not yet fallen — small forces restrain the great. Patience and small accumulations prepare the ground for what is to come.",
    lines: [
      "Return to the proper way; how could there be blame? Good fortune comes from turning back.",
      "Drawn back into the fold by right relationship; good fortune comes from this return.",
      "The spokes fall from the cart wheels; husband and wife quarrel and look away from each other.",
      "If you are sincere, danger departs and fear dissolves; stay in your proper position, no blame.",
      "Sincere and loyal, you will enrich your neighbor; good fortune grows from genuine sharing.",
      "Rain has come and the situation settles; danger lurks in going too far — the moon is nearly full.",
    ],
  },
  {
    number: 10,
    name: "Treading",
    chineseName: "履 Lǚ",
    judgment:
      "Heaven above, the joyous lake below — the strong must tread with care and respect. Treading on the tiger's tail without being bitten comes from maintaining correct and reverent conduct.",
    lines: [
      "Simple conduct without reproach; going forward alone in plain sincerity brings good fortune.",
      "Treading a smooth and level path; the quiet person stays centered — good fortune follows.",
      "A one-eyed man who tries to see, a lame man who tries to tread — treading on the tiger brings a bite.",
      "Treading on the tiger's tail with great care and reverence; good fortune comes in the end.",
      "Resolute treading — persevere even as you remain aware of danger ahead.",
      "Look back over the whole path and examine the signs; if everything is right, supreme good fortune.",
    ],
  },
  {
    number: 11,
    name: "Peace",
    chineseName: "泰 Tài",
    judgment:
      "Heaven and earth commune freely — the small departs and the great approaches in a time of harmony. The wise use this flourishing season to align heaven's course with human affairs.",
    lines: [
      "Ribbon grass pulled up brings others by the roots; good fortune comes from advancing together.",
      "Bearing with the uncultured, crossing rivers without a boat, not forgetting the distant — good fortune.",
      "No plain without slope, no going without return; hold firm in difficulty and no blame follows.",
      "Fluttering down, not rich in worldly goods but rich in virtue; true devotion needs no display.",
      "The sovereign gives his daughter in marriage; blessings flow and supreme good fortune comes.",
      "The wall falls back into the moat; do not use arms — issue only local commands from your town.",
    ],
  },
  {
    number: 12,
    name: "Standstill",
    chineseName: "否 Pǐ",
    judgment:
      "Heaven and earth are estranged — the great departs and the small approaches in stagnation. The noble person withdraws inwardly, cultivating virtue rather than struggling against the prevailing tide.",
    lines: [
      "Ribbon grass pulled up brings others by the roots; even in standstill, perseverance brings good fortune.",
      "Bearing with obstruction; the small man has his good fortune, the great man endures and waits.",
      "Those who bear shame within themselves cannot hide it; the inferior in high places are exposed.",
      "Those acting from higher mandate remain without blame; right position brings shared blessing.",
      "Standstill is giving way; this is good fortune for the great person — but vigilance is needed.",
      "The standstill comes to an end; first darkness, then good fortune arrives at last.",
    ],
  },
  {
    number: 13,
    name: "Fellowship with Others",
    chineseName: "同人 Tóng Rén",
    judgment:
      "Fire rises naturally toward heaven — seek open fellowship with all humanity, not hidden factions. Only through broad and sincere union can great undertakings be accomplished.",
    lines: [
      "Fellowship at the open gate; this honest beginning carries no blame.",
      "Fellowship only within the clan; humiliation comes from such narrowness of spirit.",
      "Weapons hidden in the thicket; armies wait on high ground — three years pass with no advance.",
      "Mounting the walls from outside with force; no attack comes — the situation resolves itself.",
      "Men in fellowship first weep, then laugh; the great effort overcomes and union is finally achieved.",
      "Fellowship in the open meadow; no regret, though distant from those who hold power.",
    ],
  },
  {
    number: 14,
    name: "Great Possession",
    chineseName: "大有 Dà Yǒu",
    judgment:
      "Fire illuminates all of heaven from above — great abundance is held and shared openly. The superior person suppresses evil and promotes good, obeying heaven's will in distributing this fortune.",
    lines: [
      "No connection with harmful things; awareness of difficulty ensures no mistake is made.",
      "The great wagon is fully loaded and can be driven forward; undertake something — no mistake.",
      "A prince offers his treasure to the Son of Heaven; a petty person could not do this.",
      "Contrast your simplicity with your neighbor's display; no blame in this humble position.",
      "Sincere trust combined with dignity; good fortune follows one who maintains the proper bearing.",
      "Heaven itself blesses and supports; good fortune — nothing is without its use and furthering.",
    ],
  },
  {
    number: 15,
    name: "Modesty",
    chineseName: "謙 Qiān",
    judgment:
      "The mountain lies hidden beneath the earth — the high is made low and the low is raised. Modesty is the one virtue that always succeeds; the noble person carries great accomplishment with humility.",
    lines: [
      "Modest as a modest person; great works can be accomplished by crossing even great rivers.",
      "Modesty that finds expression in daily conduct; perseverance brings good fortune here.",
      "The person of merit who remains modest; brings things to completion and has lasting good fortune.",
      "Nothing that does not further when modesty guides one's actions and movements.",
      "Not wealthy by position, yet able to use neighbors' strength; moving with an army is favorable.",
      "Modesty that reveals itself through action; set armies marching to bring your own house into order.",
    ],
  },
  {
    number: 16,
    name: "Enthusiasm",
    chineseName: "豫 Yù",
    judgment:
      "Thunder rolls joyfully from the earth — the time calls for enthusiastic movement and preparation. Appoint helpers, set armies in motion, and respond to the moment's energy with wholehearted commitment.",
    lines: [
      "Enthusiasm that boasts of itself brings misfortune; crowing before the day brings only regret.",
      "Firm as a rock — the person who does not wait a whole day sees clearly and finds good fortune.",
      "Looking upward for approval creates hesitation; hesitation brings regret — do not wait.",
      "The source of enthusiasm draws friends; great things are accomplished — do not doubt those who gather.",
      "Persistently ill but not dying; the test of endurance shapes one who will survive.",
      "Deluded enthusiasm in the dark; change course when completion comes and no lasting blame remains.",
    ],
  },
  {
    number: 17,
    name: "Following",
    chineseName: "隨 Suí",
    judgment:
      "Thunder rests within the lake at the end of the season, returning to stillness — adapt and follow the time. Success comes from following what is truly worth following, not from blind compliance.",
    lines: [
      "The standard is changing; perseverance brings good fortune — go out and make new friends.",
      "Clinging to the small boy, one loses the strong man; choose who you follow with care.",
      "Clinging to the strong man, one loses the small boy; following gets what it seeks — dwell in perseverance.",
      "Following gains results, but perseverance in the wrong direction brings misfortune — sincerity clarifies.",
      "Sincere devotion to the good; good fortune comes naturally to the one with a true heart.",
      "Bound and deeply committed in following; the king offers this rare devotion to the western mountain.",
    ],
  },
  {
    number: 18,
    name: "Work on Decay",
    chineseName: "蠱 Gǔ",
    judgment:
      "Wind blows at the foot of the mountain, corrupting what has gone unchecked — the time demands repair. What was spoiled by previous generations can be restored; prepare well before and after the turning point.",
    lines: [
      "Setting right what the father spoiled; if a capable son acts, the father bears no blame — danger, then good fortune.",
      "Setting right what the mother spoiled; do not be too relentless in pursuing this correction.",
      "Setting right what the father spoiled; some small remorse comes, but no great blame follows.",
      "Tolerating what the father spoiled rather than correcting it; going on will bring humiliation.",
      "Setting right what the father spoiled; one meets with genuine praise from others.",
      "Not serving kings and princes; setting higher goals for oneself — no blame in this elevation.",
    ],
  },
  {
    number: 19,
    name: "Approach",
    chineseName: "臨 Lín",
    judgment:
      "The lake brims and rises toward the earth — the great one draws near with inspiring force. The approach brings success, but be aware: after eight months the situation will change and decline.",
    lines: [
      "Joint approach with another; perseverance brings good fortune to this shared endeavor.",
      "Joint approach with another; good fortune — nothing fails to be furthered in this union.",
      "Comfortable approach without real commitment; this furthers nothing — anxiety about it is wise.",
      "Complete and wholehearted approach; no blame comes from this full engagement.",
      "Wise approach, as befits a great ruler; good fortune comes from this understanding way.",
      "Magnanimous approach from a position of wisdom and goodwill; good fortune and no blame.",
    ],
  },
  {
    number: 20,
    name: "Contemplation",
    chineseName: "觀 Guān",
    judgment:
      "Wind moves over the earth, penetrating and observing all things — contemplation reveals what is hidden. The wise person advances by observing deeply, understanding the patterns of heaven and earth.",
    lines: [
      "Boylike contemplation without depth; for the inferior person no blame, for the superior — humiliation.",
      "Peeping through a crack; the limited view of a woman can be endured, though it is narrow.",
      "Contemplating one's own life decides whether to advance or retreat — honest self-examination.",
      "Contemplating the light of the whole kingdom; it furthers one to be received as a guest of the king.",
      "Contemplation of one's own life from a position of power; the superior person is without blame.",
      "Contemplation of his life in full retrospect; the superior person who knows himself is without blame.",
    ],
  },
  {
    number: 21,
    name: "Biting Through",
    chineseName: "噬嗑 Shì Kè",
    judgment:
      "Thunder and lightning combine — swift decisive action cuts through obstacles. The use of firm law and appropriate penalties is necessary when something blocks the way to justice.",
    lines: [
      "Feet put in the stocks so the toes disappear; no blame — the lesson is mild and timely.",
      "Biting through tender meat so the nose disappears; no blame — punishment fits the offense.",
      "Biting on old dried meat and hitting something poisoned; slight humiliation comes but no great blame.",
      "Biting on dried gristly meat and finding metal arrows within; awareness of danger brings advantage.",
      "Biting on dried lean meat and finding yellow gold; danger remains, but no blame if persevering.",
      "Wearing a cangue so the ears disappear; misfortune comes from refusing to hear the warning.",
    ],
  },
  {
    number: 22,
    name: "Grace",
    chineseName: "賁 Bì",
    judgment:
      "Fire illuminates the mountain from within — inner light adorned with beautiful outer form. Grace pleases and is valuable, yet it is secondary; small matters advance easily but great undertakings need substance.",
    lines: [
      "He lends grace to his toes; he leaves the carriage and walks — simplicity is chosen over ease.",
      "Lends grace to the beard; ornament must follow the substance beneath it to have meaning.",
      "Graceful and moist; eternal perseverance brings good fortune — beauty sustained by inner truth.",
      "Grace or simplicity? A white horse comes as if on wings; no robber, but a true suitor in time.",
      "Grace in the hills and gardens; the roll of silk is small and meager — humiliation, yet good fortune.",
      "Simple grace without adornment; no blame — when the form returns to its essence, all is well.",
    ],
  },
  {
    number: 23,
    name: "Splitting Apart",
    chineseName: "剝 Bō",
    judgment:
      "The mountain sits upon the earth but is eroded from below — inferior forces undermine the foundation. The noble person yields gracefully to what cannot be stopped and bides the time of return.",
    lines: [
      "The leg of the bed is split; those who persist in this course are destroyed — misfortune.",
      "The bed splits at the edge; those who persist in this direction are destroyed — misfortune.",
      "He splits with them; no blame — separating from what corrupts preserves integrity.",
      "The bed splits up to the skin level; misfortune — the danger has reached the body itself.",
      "A shoal of fish; favor comes through the court ladies; everything acts to further the natural order.",
      "A large fruit still uneaten; the superior man receives a carriage — the seed of return lies here.",
    ],
  },
  {
    number: 24,
    name: "Return",
    chineseName: "復 Fù",
    judgment:
      "Thunder stirs within the earth at the winter solstice — the return of light after the darkest hour. Friends come without mishap; the way reopens, and what was lost begins its journey back.",
    lines: [
      "Return from a short distance; no need for remorse — great good fortune comes from turning back quickly.",
      "Quiet return; good fortune — returning with a good heart requires no fanfare.",
      "Repeated return; danger but no blame — the struggle to return is itself the right path.",
      "Walking among others, one returns alone to one's own path — loyalty to what is right.",
      "Noble-hearted return; no remorse — returning from inner conviction is the highest form.",
      "Missing the return; misfortune; disaster from within and without; armies are defeated for ten years.",
    ],
  },
  {
    number: 25,
    name: "Innocence",
    chineseName: "無妄 Wú Wàng",
    judgment:
      "Thunder rolls under open heaven — natural, spontaneous, and completely without artifice. Act without calculating reward; what springs from genuine sincerity aligns with the order of heaven.",
    lines: [
      "Innocent behavior without hidden motives; going forward in this purity brings good fortune.",
      "Not counting on the harvest while plowing or the use of the land while clearing — pure action furthers.",
      "Undeserved misfortune; the cow tethered by someone becomes the wanderer's gain and the citizen's loss.",
      "If one can remain steadfast in one's own nature, no blame comes — hold to what is true.",
      "Use no medicine if not yet sick; there will be natural joy — do not treat what is not yet ill.",
      "Innocent action that nevertheless goes against the time brings misfortune; nothing furthers now.",
    ],
  },
  {
    number: 26,
    name: "Great Taming",
    chineseName: "大畜 Dà Chù",
    judgment:
      "Heaven is contained within the mountain — great power is held in check and steadily accumulated. The wise person studies history and the words of the ancient sages to build tremendous inner reserve.",
    lines: [
      "Danger is at hand; it is advantageous to stop and desist from moving forward now.",
      "The axletrees are removed from the wagon; no advancement is possible — wait patiently.",
      "A good horse that follows others; practice and persevere through danger; fortify your position.",
      "The headboard of a young bull fitted before the horns grow; great good fortune from early restraint.",
      "The tusk of a gelded boar; good fortune — the dangerous element has been rendered harmless.",
      "One attains the way of heaven; supreme success — all obstacles have been overcome at last.",
    ],
  },
  {
    number: 27,
    name: "Nourishment",
    chineseName: "頤 Yí",
    judgment:
      "Thunder stirs at the foot of the still mountain — nourishment and care are the central concern. Look to how you nourish yourself and others; what you take in shapes who you become.",
    lines: [
      "You let your magic tortoise go and look at me with drooping corners of the mouth; misfortune.",
      "Turning from the proper path to seek nourishment from the heights; going against the natural order brings misfortune.",
      "Turning away from nourishment; perseverance brings misfortune — do not act this way for ten years.",
      "Turning to the heights for nourishment; looking about with sharp eyes like a tiger; no blame here.",
      "Turning from the path while holding a position of responsibility; perseverance brings good fortune — do not cross the great water yet.",
      "The source of nourishment; awareness of danger brings good fortune — it furthers to cross the great water.",
    ],
  },
  {
    number: 28,
    name: "Great Excess",
    chineseName: "大過 Dà Guò",
    judgment:
      "The lake has risen far above the treetops — the weight is extraordinary and the ridgepole sags. The superior person acts independently without fear when facing this exceptional situation.",
    lines: [
      "To spread white rushes underneath as careful preparation; no blame — this caution is wise.",
      "A dry poplar sprouts at the root; an older man takes a young wife; everything naturally furthers.",
      "The ridgepole sags to the breaking point; misfortune — the burden exceeds all capacity.",
      "The ridgepole is braced and strengthened; good fortune; but ulterior motives bring humiliation.",
      "A withered poplar puts forth flowers; an older woman takes a husband; no blame but no praise.",
      "One must go through the water and it goes over one's head; misfortune — but no personal blame.",
    ],
  },
  {
    number: 29,
    name: "The Abysmal",
    chineseName: "坎 Kǎn",
    judgment:
      "Water flows through the abyss again and again, undeterred — danger upon danger is mastered through constancy. Keep the heart sincere, act with steady effort, and in time even the deepest pit yields a way through.",
    lines: [
      "In the abyss one falls further into a pit; misfortune — there is no foothold here.",
      "The abyss has danger; seek to achieve small things only — do not attempt too much at once.",
      "Forward and backward, abyss on abyss; stop and wait — otherwise you fall deeper still.",
      "A jug of wine, a bowl of rice, earthen vessels — pass them through the window simply; no blame.",
      "The abyss is not filled to overflowing; it is filled only to the rim — no blame in partial success.",
      "Bound with cords and ropes, shut in thorn-hedged walls; three years and no way out — misfortune.",
    ],
  },
  {
    number: 30,
    name: "The Clinging",
    chineseName: "離 Lí",
    judgment:
      "Fire flames upward, clinging to what it burns for nourishment — clarity through attachment and dependence. The cow's yielding nature brings good fortune; acceptance and illumination create lasting success.",
    lines: [
      "Footprints that run crisscross at the start; if one is serious in intent, no blame comes.",
      "Yellow light — the color of balance and the center; supreme good fortune in this midway station.",
      "In the light of the setting sun, men beat the pot and sing or audibly lament old age; misfortune.",
      "Its coming is sudden; it flames up, dies down, is thrown away — nothing endures without roots.",
      "Tears in floods, sighing and lamenting; good fortune — genuine grief gives way to clarity.",
      "The king uses him to march forth and chastise; killing the leaders and capturing followers; no blame.",
    ],
  },
  {
    number: 31,
    name: "Influence",
    chineseName: "咸 Xián",
    judgment:
      "The lake rests above the mountain — attraction and mutual influence between unlike things. Genuine feeling without calculation draws what belongs together; sincerity in courtship and relationship brings success.",
    lines: [
      "Influence shows in the big toe; no blame — just the first stirring of movement, not yet significant.",
      "Influence shows in the calves; misfortune in rushing ahead — tarrying and waiting brings good fortune.",
      "Influence shows in the thighs; holding to what follows mechanically; to continue this brings humiliation.",
      "Perseverance brings good fortune; remorse disappears — fix your thoughts on whom you truly trust.",
      "Influence shows in the back of the neck; no remorse — this is steadiness, not deep feeling.",
      "Influence shows in jaws, cheeks, and tongue; mere words without inner substance behind them.",
    ],
  },
  {
    number: 32,
    name: "Duration",
    chineseName: "恆 Héng",
    judgment:
      "Thunder and wind reinforce each other endlessly — true duration adapts while maintaining its essential nature. Perseverance in the right direction is the foundation of all lasting achievement.",
    lines: [
      "Seeking duration too hastily; persistent bad fortune — roots must grow before the tree stands.",
      "Remorse disappears; inner steadiness allows one to hold fast without wavering — a center holds.",
      "He who gives no duration to his character meets with disgrace; persistent humiliation results.",
      "No game in the field; seeking where it cannot be found leads nowhere — know where to look.",
      "Giving duration to character through perseverance; good fortune for a woman, misfortune for a man.",
      "Restlessness as an enduring condition brings misfortune — duration requires a settled center.",
    ],
  },
  {
    number: 33,
    name: "Retreat",
    chineseName: "遯 Dùn",
    judgment:
      "The mountain rises toward heaven but heaven withdraws — dignified retreat before inferior forces. The superior person maintains integrity not through struggle but through timely and graceful withdrawal.",
    lines: [
      "At the tail end of retreat; danger — one must not undertake anything new in this position.",
      "He holds him fast with yellow oxhide; no one can tear him loose — a bond that holds.",
      "A halted retreat is nerve-wracking and dangerous; retaining helpers as servants brings good fortune.",
      "Voluntary retreat brings good fortune to the superior person and downfall to the inferior.",
      "Friendly retreat with goodwill maintained; perseverance in this course brings good fortune.",
      "Cheerful retreat; everything serves to further — freedom from entanglement is complete.",
    ],
  },
  {
    number: 34,
    name: "Great Power",
    chineseName: "大壯 Dà Zhuàng",
    judgment:
      "Thunder rumbles across the entire sky — great power surges through. Channel this force toward what is right and correct; power that oversteps its proper bounds entangles itself.",
    lines: [
      "Power in the toes alone; continuing forward brings misfortune — strength without direction.",
      "Perseverance brings good fortune; power held at the center is balanced and steady.",
      "The inferior man works through power; the superior does not — a billy goat butts and gets stuck.",
      "Perseverance brings good fortune; remorse disappears — the hedge opens, no entanglement remains.",
      "Loses the goat with ease; no remorse — letting go without a struggle preserves one's energy.",
      "The billy goat cannot go back, cannot go forward; if one notes the difficulty, good fortune comes.",
    ],
  },
  {
    number: 35,
    name: "Progress",
    chineseName: "晉 Jìn",
    judgment:
      "The sun rises above the earth, ascending with steady brilliance — progress and recognition come. The ruler who brings blessings to many and offers gifts with confidence receives acknowledgment.",
    lines: [
      "Progress that meets with uncertainty; perseverance brings good fortune — stay calm if unrecognized.",
      "Progress that comes with sorrow; perseverance brings good fortune — a blessing comes from the ancestor.",
      "All are in accord with this progress; remorse disappears — unity of purpose furthers greatly.",
      "Progress like a hamster hoarding grain; perseverance in this greedy course brings danger.",
      "Remorse disappears; take not gain and loss too much to heart — undertakings bring good fortune.",
      "Progress with the horns is only for punishing one's own city; being aware of danger brings good fortune.",
    ],
  },
  {
    number: 36,
    name: "Darkening of the Light",
    chineseName: "明夷 Míng Yí",
    judgment:
      "The sun sinks below the horizon and light is hidden within the earth — the time of obscured brilliance. The wise person conceals their light and endures adversity with steady inner resolve.",
    lines: [
      "Darkening during flight; he lowers his wings — the superior person does not eat for three days.",
      "Darkening injures the left thigh; rescued with the strength of a horse — good fortune comes.",
      "Darkening during the hunt in the south; their great leader is captured — do not expect too much yet.",
      "He penetrates the left side of the belly, reaching the very heart of the darkness; departs through the gate.",
      "Darkening as with Prince Chi who hid his wisdom; perseverance furthers even through great trial.",
      "Not light but darkness; first he climbed up to heaven, then plunged into the depths of the earth.",
    ],
  },
  {
    number: 37,
    name: "The Family",
    chineseName: "家人 Jiā Rén",
    judgment:
      "Wind rises from fire — the warmth of the family radiates outward from a stable center. Each member fulfilling their proper role creates the order from which all outer success flows.",
    lines: [
      "Firm seclusion within the family from the beginning; remorse disappears — early order holds.",
      "She attends to the food within; she does not follow her whims; perseverance brings good fortune.",
      "When tempers flare and discipline is too strict, regret comes; yet good fortune nonetheless.",
      "She is the treasure and wealth of the house; supreme good fortune flows from this inner abundance.",
      "As a king approaches his family with love and authority; fear not — good fortune follows.",
      "His work commands sincere respect; in the end, good fortune — leadership by example prevails.",
    ],
  },
  {
    number: 38,
    name: "Opposition",
    chineseName: "睽 Kuí",
    judgment:
      "Fire moves upward, the lake moves downward — opposition between two forces of equal power. In opposition, small matters succeed; seek what unites rather than dwelling on what divides.",
    lines: [
      "Remorse disappears; if you lose your horse do not chase it — it will return; guard against mistakes.",
      "One meets his lord in a narrow street by chance; no blame — unexpected meetings hold meaning.",
      "The wagon is dragged back; the man's hair and nose cut off; not a good beginning but a good end.",
      "Isolated in opposition, one meets a like-minded man; trusting each other despite danger — no blame.",
      "Remorse disappears; the companion bites through the wrappings — go to him and find no mistake.",
      "One first draws a bow against a companion, then lays it aside; not a robber but a suitor — good fortune.",
    ],
  },
  {
    number: 39,
    name: "Obstruction",
    chineseName: "蹇 Jiǎn",
    judgment:
      "Water stands before a mountain blocking the path — obstruction on every side. Look inward, reflect deeply, seek the help of the great; the southwest is favorable, the northeast is not.",
    lines: [
      "Going leads to obstruction; coming leads to praise — return is the wiser path now.",
      "The king's servant is beset by obstruction upon obstruction; it is not his own fault.",
      "Going leads to obstruction; hence he comes back — return to regroup and strengthen.",
      "Going leads to obstruction; coming leads to union — joining with others overcomes what alone fails.",
      "In the midst of the greatest obstruction, friends arrive; the solidarity of true bonds prevails.",
      "Going leads to obstruction; coming leads to great good fortune — seek the great man now.",
    ],
  },
  {
    number: 40,
    name: "Deliverance",
    chineseName: "解 Jiě",
    judgment:
      "Thunder and rain dissolve the heaviness of tension — the obstruction breaks and deliverance arrives. Return quickly to what is normal; pardon small errors and sweep the slate clean for what comes next.",
    lines: [
      "Without blame — the deliverance is clean and no complications follow.",
      "One kills three foxes and receives a yellow arrow; perseverance brings good fortune.",
      "A man carries a burden yet rides in a carriage; this invites robbers — perseverance brings humiliation.",
      "Deliver yourself from your big toe first; then the right companion comes whom you can trust.",
      "The superior man delivers himself; this is good fortune and proves to others he is in earnest.",
      "The prince shoots a hawk on a high wall and kills it; everything serves to further from here.",
    ],
  },
  {
    number: 41,
    name: "Decrease",
    chineseName: "損 Sǔn",
    judgment:
      "The lake at the foot of the mountain is diminished but the mountain is increased — decrease below nourishes above. Sincere decrease with inner truth brings supreme good fortune; even a small offering is sufficient.",
    lines: [
      "Finish your tasks quickly and depart; consider how much you are taking from others.",
      "Perseverance furthers; to undertake something brings misfortune — by not decreasing yourself you benefit others.",
      "Three traveling together decreases by one; traveling alone finds a companion.",
      "Decreasing one's faults makes another hasten to come and rejoice; no blame follows.",
      "Someone increases him; ten pairs of tortoises cannot oppose it — supreme good fortune.",
      "Increased without depriving others; no blame — perseverance brings good fortune and accomplishment.",
    ],
  },
  {
    number: 42,
    name: "Increase",
    chineseName: "益 Yì",
    judgment:
      "Wind and thunder reinforce each other — increase flows to all without preference. The great work of increasing both above and below creates a flourishing that benefits the whole.",
    lines: [
      "It furthers to accomplish great deeds; supreme good fortune — this strong beginning carries no blame.",
      "Someone does indeed increase him; ten pairs of tortoises cannot oppose it; the king offers him to God.",
      "One is enriched through unfortunate events; no blame if sincere — walk the middle and report truly.",
      "Walk in the middle and report to the prince; following the right path furthers great undertakings.",
      "If in truth you have a kind heart, ask not — supreme good fortune; kindness will be recognized.",
      "He brings increase to no one; someone even strikes him — unstable heart; misfortune results.",
    ],
  },
  {
    number: 43,
    name: "Breakthrough",
    chineseName: "夬 Guài",
    judgment:
      "The lake rises to the level of heaven — decisive breakthrough against the one remaining inferior element. Present the matter openly and resolutely; avoid direct attack; danger remains even at the moment of victory.",
    lines: [
      "Mighty in the forward-striding toes; going when not yet equal to the task brings mistake.",
      "A cry of alarm; arms at evening and at night — fear nothing; vigilance without panic.",
      "Being powerful in the cheekbones brings misfortune; the superior man walks alone and presses on.",
      "No skin on the thighs and walking comes hard; if led like a sheep, remorse disappears.",
      "In dealing with persistent weeds, firm resolution is necessary; walking the middle is without blame.",
      "No cry of warning; in the end misfortune comes — the last inferior element was not addressed.",
    ],
  },
  {
    number: 44,
    name: "Coming to Meet",
    chineseName: "姤 Gòu",
    judgment:
      "The wind blows freely beneath all of heaven — an unexpected encounter arrives. A single inferior element rises boldly from below; do not allow it to gain hold or it will undermine the whole.",
    lines: [
      "It must be checked with a brake of bronze; perseverance brings good fortune — do not let it run.",
      "There is a fish in the tank; no blame — but guests should not be entertained by it.",
      "No skin on the thighs and walking comes hard; if mindful of the danger, no great mistake follows.",
      "No fish in the tank; this leads to misfortune — failure to attend to what matters.",
      "A melon covered with willow leaves; hidden lines; then it drops down to one from heaven.",
      "He comes to meet with his horns; humiliation but no blame — the encounter is inevitable.",
    ],
  },
  {
    number: 45,
    name: "Gathering Together",
    chineseName: "萃 Cuì",
    judgment:
      "The lake rises above the earth and gathers all waters — assembly and massing of forces. The ruler approaches the temple; great offerings create good fortune; keep the army prepared for uncertainty.",
    lines: [
      "If sincere but not to the end, confusion and gathering alternate; call out and then laugh — no regret.",
      "Letting oneself be drawn brings good fortune; sincerity furthers even a small offering.",
      "Gathering together amid sighs; going forward is without blame — slight humiliation, but no harm.",
      "Great good fortune; no blame — gathering at this elevated position is entirely appropriate.",
      "Those with position in this gathering bear no blame; sublime perseverance needed to win the last ones.",
      "Lamenting and sighing; floods of tears — no blame — grief at separation is not without honor.",
    ],
  },
  {
    number: 46,
    name: "Pushing Upward",
    chineseName: "升 Shēng",
    judgment:
      "Wood grows from within the earth and pushes upward steadily — rise through effort and devotion. Approach the south with confidence; seeing the great man is favorable; perseverance meets with good fortune.",
    lines: [
      "Pushing upward that meets with confidence; great good fortune — the time of rising has come.",
      "If sincere, it furthers even to bring a small offering; no blame — sincerity opens the way.",
      "One pushes upward into an empty city; no resistance, no obstruction — advance freely.",
      "The king offers him Mount Chi; good fortune and no blame — recognition from the highest level.",
      "Perseverance brings good fortune; one pushes upward by steps — steady progress, not in leaps.",
      "Pushing upward in darkness; it furthers one to be unremittingly persevering even without sight.",
    ],
  },
  {
    number: 47,
    name: "Oppression",
    chineseName: "困 Kùn",
    judgment:
      "The lake is drained and dried out — exhaustion and oppression press from every side. Words have no effect now; the noble person endures in inner cheerfulness and cultivates what cannot be taken away.",
    lines: [
      "One sits oppressed beneath a bare tree in a gloomy valley; for three years one sees nothing.",
      "Oppressed while at meat and drink; the man with scarlet knee bands is coming — offer sacrifice.",
      "A man leans on thorns and thistles; oppressed by stone — his wife is not there; misfortune.",
      "He comes quietly, oppressed in a golden carriage; humiliation, but the end is reached.",
      "His nose and feet are cut off; oppressed by the man with purple knee bands; joy comes softly.",
      "Oppressed by creeping vines; moving uncertainly; if remorse is felt and a start is made, good fortune.",
    ],
  },
  {
    number: 48,
    name: "The Well",
    chineseName: "井 Jǐng",
    judgment:
      "Wood descends into the water and draws it up — the well nourishes all without moving or changing. The town may move but the well remains; do not let the rope fall short or the vessel break.",
    lines: [
      "One does not drink the mud of the well; no animals come to an old and neglected well.",
      "At the well hole one shoots fish; the jug is broken and leaks — the source is wasted.",
      "The well is cleaned but no one drinks; my heart's sorrow — if the king were clear-minded, good fortune.",
      "The well is being lined; no blame — necessary work that prepares the well for future use.",
      "In the well there is a clear cold spring from which one can drink; the source is pure and available.",
      "One draws from the well without hindrance; it is dependable; supreme good fortune.",
    ],
  },
  {
    number: 49,
    name: "Revolution",
    chineseName: "革 Gé",
    judgment:
      "Fire and water oppose each other within the lake — the old order is overturned. Radical change must be made at the right time and by those with sincere hearts; then regret dissolves.",
    lines: [
      "Wrapped in the hide of a yellow cow; wait — do not yet attempt the great change.",
      "When one's own day comes, one may create revolution; starting brings good fortune and no blame.",
      "Starting brings misfortune; when talk of revolution has gone around three times, one may commit.",
      "Remorse disappears; men believe in the change; changing the form of government brings good fortune.",
      "The great man changes like a tiger; even before the oracle he is believed — decisive clarity.",
      "The superior man changes like a panther; the inferior man molts in the face — start brings misfortune.",
    ],
  },
  {
    number: 50,
    name: "The Cauldron",
    chineseName: "鼎 Dǐng",
    judgment:
      "Fire burns beneath the cauldron of wood — nourishment of the worthy through ritual and sacrifice. The superior person uses the cauldron to prepare the finest offerings; correct form brings supreme good fortune.",
    lines: [
      "A cauldron with legs upturned furthers removal of what is stagnant; no blame in this clearing.",
      "Food is in the cauldron; comrades are envious but cannot harm — good fortune holds.",
      "The handle of the cauldron is altered; one is blocked; once rain falls, remorse spent — good fortune.",
      "The legs of the cauldron are broken; the prince's meal is spilled and soiled — misfortune.",
      "The cauldron has yellow handles and golden rings; perseverance furthers — balance and care.",
      "The cauldron has rings of jade; great good fortune — the highest form of the offering vessel.",
    ],
  },
  {
    number: 51,
    name: "The Arousing",
    chineseName: "震 Zhèn",
    judgment:
      "Thunder above and below — shock and arousal that reverberates through everything. The first shock brings fear; then laughing words follow; the one who remains mindful during shock suffers no lasting harm.",
    lines: [
      "Shock comes — oh, oh! Then come laughing words — ha, ha! Good fortune follows the shock.",
      "Shock brings danger; you lose your treasures; climb to the nine hills — after seven days they return.",
      "Shock comes and makes one distraught; if shock spurs to action, one remains free of misfortune.",
      "Shock becomes mired; one cannot move through — the shock has lost its momentum.",
      "Shock goes hither and thither; danger; yet nothing is truly lost — there are still things to be done.",
      "Shock brings ruin and terrified gazing; going brings misfortune; if your neighbor was struck first, no blame.",
    ],
  },
  {
    number: 52,
    name: "Keeping Still",
    chineseName: "艮 Gèn",
    judgment:
      "Mountain above mountain — double stillness that goes to the root of all rest. Keep the back still so the body is no longer felt; walk in the courtyard without seeing anyone; no blame in perfect stillness.",
    lines: [
      "Keeping the toes still; no blame — continued perseverance furthers this early steadiness.",
      "Keeping the calves still; he cannot rescue him whom he follows — his heart is not glad.",
      "Keeping the hips still, making the sacrum rigid; dangerous — the heart suffocates from force.",
      "Keeping the trunk still; no blame — quieting the body without straining the will.",
      "Keeping the jaws still; words are well-ordered; remorse disappears — silence at the right moment.",
      "Noble-hearted keeping still; good fortune — stillness from inner wisdom, not outer constraint.",
    ],
  },
  {
    number: 53,
    name: "Development",
    chineseName: "漸 Jiàn",
    judgment:
      "The tree grows slowly but surely on the mountain — gradual development in the proper order. Like the wild goose progressing step by step along the fixed stations of its migration, correct timing brings good fortune.",
    lines: [
      "The wild goose approaches the shore; the young son is in danger; there is talk but no blame.",
      "The wild goose approaches the cliff; eating and drinking in peace and concord — good fortune.",
      "The wild goose approaches the plateau; the man goes and does not return — misfortune; fight off robbers.",
      "The wild goose approaches the tree; it finds a flat branch to rest on — no blame.",
      "The wild goose approaches the summit; for three years no child — in the end nothing hinders, good fortune.",
      "The wild goose approaches the cloud heights; its feathers used for the sacred dance — good fortune.",
    ],
  },
  {
    number: 54,
    name: "The Marrying Maiden",
    chineseName: "歸妹 Guī Mèi",
    judgment:
      "Thunder stirs the lake — the maiden moves to a subordinate position in the man's home. Undertaking anything in haste brings misfortune; find the proper position and relationship before acting.",
    lines: [
      "The marrying maiden as a concubine; a lame man who manages to tread — undertakings bring good fortune.",
      "A one-eyed man who manages to see; the perseverance of the solitary person furthers.",
      "The marrying maiden as a slave who marries as a concubine — she accepts what comes.",
      "The marrying maiden draws out the allotted time; a late marriage comes in due course.",
      "The sovereign gave his daughter in marriage; her embroidered garments were not as fine as the maid's.",
      "The woman holds the basket but it is empty; the man stabs the sheep but no blood flows — nothing furthers.",
    ],
  },
  {
    number: 55,
    name: "Abundance",
    chineseName: "豐 Fēng",
    judgment:
      "Thunder and lightning combine in brilliant plenitude — abundance at the height of its fullness. Be not sad like the sun at noon; the moment of greatest light is also the beginning of its turning.",
    lines: [
      "Meeting the destined ruler; they can be together ten days without mistake — going meets recognition.",
      "The curtain is so full that the polestar can be seen at noon; going meets mistrust — truth brings good.",
      "The underbrush so abundant that small stars appear at noon; his right arm is broken — no blame.",
      "The curtain so full the polestar appears at noon; he meets his ruler of like kind — good fortune.",
      "Lines are coming; blessing and fame draw near; good fortune from above.",
      "His house is full but he screens off his family; peers through the gate and sees no one — misfortune.",
    ],
  },
  {
    number: 56,
    name: "The Wanderer",
    chineseName: "旅 Lǚ",
    judgment:
      "Fire burns on the mountain and moves on — the wanderer is a stranger in foreign lands. Maintain correct and careful conduct; the small perseverance of the wanderer brings good fortune.",
    lines: [
      "If the wanderer busies himself with trivial things, he draws down misfortune upon himself.",
      "The wanderer comes to an inn; he has his property with him; he wins a faithful servant — good fortune.",
      "The wanderer's inn burns down; he loses his faithful servant — danger.",
      "The wanderer rests in a shelter; he obtains his property and an ax — yet his heart is not glad.",
      "He shoots a pheasant; it drops with the first arrow — in the end praise and an official position.",
      "The bird's nest burns; the wanderer laughs then weeps; through carelessness he loses his cow — misfortune.",
    ],
  },
  {
    number: 57,
    name: "The Gentle",
    chineseName: "巽 Xùn",
    judgment:
      "Wind upon wind — gentle, persistent penetration that reaches everywhere without force. Small efforts, little by little, accomplish what force cannot; it furthers to have a direction and see the great man.",
    lines: [
      "In advancing and retreating, the perseverance of a warrior furthers — do not drift without resolve.",
      "Penetration under the bed; priests and magicians are used in great number; good fortune and no blame.",
      "Repeated penetration that accomplishes nothing; humiliation — penetration requires a proper target.",
      "Remorse vanishes; during the hunt three kinds of game are caught — the approach yields its reward.",
      "Perseverance brings good fortune; remorse vanishes; nothing does not further — before and after, three days.",
      "Penetration under the bed; loses property and ax; perseverance brings misfortune — retreat is needed.",
    ],
  },
  {
    number: 58,
    name: "The Joyous",
    chineseName: "兌 Duì",
    judgment:
      "Lake above lake — doubled joy that refreshes and renews. True joy comes from inner sincerity and firm virtue, not from frivolous pleasure; discuss and practice with friends and good fortune follows.",
    lines: [
      "Contented joyousness that seeks nothing external; good fortune — joy from within.",
      "Sincere joyousness grounded in truth; good fortune; remorse disappears naturally.",
      "Coming joyousness that rushes in from outside; misfortune — joy that is chased flees.",
      "Joyousness that is weighed and considered; after ridding himself of mistakes, one has true joy.",
      "Sincerity toward disintegrating influences is dangerous; discern what corrodes true joy.",
      "Seductive joyousness; the lure of pleasure without substance — be aware of what draws you.",
    ],
  },
  {
    number: 59,
    name: "Dispersion",
    chineseName: "渙 Huàn",
    judgment:
      "Wind blows across water, scattering the ice of winter — dissolution of rigid separateness. The king goes to the temple to gather the people; cross the great water; let inner cohesion dissolve what divides.",
    lines: [
      "He brings help with the strength of a horse; good fortune — swift aid dissolves the danger.",
      "At the dissolution he hurries to that which supports him; remorse disappears — find your foundation.",
      "He dissolves his self; no remorse — surrendering personal concerns opens a larger way.",
      "He dissolves his bond with his group for a higher purpose; supreme good fortune comes from this.",
      "His loud cries dissolve like sweat; a king who stays without blame amid the dissolution.",
      "He dissolves his blood; departing and keeping distance; going out; no blame.",
    ],
  },
  {
    number: 60,
    name: "Limitation",
    chineseName: "節 Jié",
    judgment:
      "Water stands within the lake at its proper level — limitation and natural regulation. Galling limitation must not be persevered in; pleasant limitation that arises from within brings success.",
    lines: [
      "Not going out of the door and the courtyard; no blame — this restraint is appropriate now.",
      "Not going out of the gate and courtyard; misfortune — this restraint has become paralysis.",
      "He who knows no limitation will have cause to lament; no blame — sorrow teaches its own lesson.",
      "Contented limitation; success — limits accepted freely become the source of their own overcoming.",
      "Sweet limitation; good fortune; going brings esteem — limits that arise from inner conviction.",
      "Galling limitation; perseverance brings misfortune; remorse disappears — know when limits suffocate.",
    ],
  },
  {
    number: 61,
    name: "Inner Truth",
    chineseName: "中孚 Zhōng Fú",
    judgment:
      "Wind moves above the lake, penetrating all hidden depths — inner truth that cannot be feigned. Even pigs and fish are moved by it; it furthers to cross the great water; perseverance brings good fortune.",
    lines: [
      "Being prepared brings good fortune; if there are secret designs, it is disquieting.",
      "A crane calling in the shade; its young answer — I have good things and I will share with you.",
      "He finds a comrade; now he beats the drum, now he stops; now he sobs, now he sings.",
      "The moon nearly full; the team horse goes astray; no blame — the connection is not yet complete.",
      "He possesses truth which links together; no blame — sincerity that unites is without fault.",
      "Cockcrow penetrating to heaven; perseverance brings misfortune — empty display of inner truth.",
    ],
  },
  {
    number: 62,
    name: "Small Excess",
    chineseName: "小過 Xiǎo Guò",
    judgment:
      "Thunder on the mountain — the sound passes but the mountain stays. Success comes through small matters; do not attempt great things; like the flying bird, it is better to descend than to strive upward.",
    lines: [
      "The bird meets with misfortune through flying too high; no blame — the excess is in the ambition.",
      "She passes her ancestor and meets the ancestress; he does not approach the prince but meets the official — no blame.",
      "If not extremely careful, someone may come up from behind and strike; misfortune — heed this.",
      "No blame; he meets without passing by; going brings danger — be on guard, hold steady.",
      "Dense clouds but no rain from our western territory; the prince shoots and hits the one in the cave.",
      "He passes by and does not meet; the flying bird leaves him behind; misfortune — bad luck and injury.",
    ],
  },
  {
    number: 63,
    name: "After Completion",
    chineseName: "既濟 Jì Jì",
    judgment:
      "Water above fire — all is complete and in perfect order. The fox nearly crosses the stream but wets his tail at the end; attend carefully to small things to preserve what has been achieved.",
    lines: [
      "He brakes his wheels; he gets his tail in the water — no blame; caution saves the completion.",
      "The woman loses her carriage curtain; do not run after it — on the seventh day you will get it back.",
      "The Illustrious Ancestor disciplines the difficult country; after three years he conquers it.",
      "The finest clothes turn to rags; be careful all day long — even completion requires vigilance.",
      "The eastern neighbor's ox sacrifice does not equal the western neighbor's small spring offering.",
      "He gets his head in the water; danger — carelessness at the moment of completion brings ruin.",
    ],
  },
  {
    number: 64,
    name: "Before Completion",
    chineseName: "未濟 Wèi Jì",
    judgment:
      "Fire above water — the forces have not yet found their proper relationship. The young fox nearly crosses but wets its tail; the crossing is close but not yet complete; careful steadiness brings success.",
    lines: [
      "He gets his tail in the water; humiliating — rushing into what is not yet ready.",
      "He brakes his wheels; perseverance brings good fortune — pause before crossing.",
      "Before completion, attack brings misfortune; it furthers to cross the great water — gather strength.",
      "Perseverance brings good fortune; remorse disappears; shock disciplines the difficult land; great realms follow.",
      "Perseverance brings good fortune; no remorse; the light of the superior man is true — good fortune.",
      "Drinking wine in genuine confidence; no blame — but wetting one's head is truly losing everything.",
    ],
  },
];

export function getHexagram(number: number): Hexagram {
  return HEXAGRAMS[number - 1];
}

// Returns the 6 line values (1=yang, 0=yin) for a hexagram, line 1 (bottom) first.
export function getHexagramLines(hexagramNumber: number): [0|1, 0|1, 0|1, 0|1, 0|1, 0|1] {
  for (let lower = 0; lower < 8; lower++) {
    for (let upper = 0; upper < 8; upper++) {
      if (HEXAGRAM_TABLE[lower][upper] === hexagramNumber) {
        return [
          ((lower >> 0) & 1) as 0|1,
          ((lower >> 1) & 1) as 0|1,
          ((lower >> 2) & 1) as 0|1,
          ((upper >> 0) & 1) as 0|1,
          ((upper >> 1) & 1) as 0|1,
          ((upper >> 2) & 1) as 0|1,
        ];
      }
    }
  }
  return [0, 0, 0, 0, 0, 0];
}
