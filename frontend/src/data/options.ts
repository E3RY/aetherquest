export interface Option {
  id: string;
  name: string;
  blurb: string;
}

export const RACES: Option[] = [
  { id: "human", name: "Human", blurb: "Versatile, ambitious, adaptable to any path." },
  { id: "elf", name: "Elf", blurb: "Graceful and long-lived, attuned to old magic." },
  { id: "dwarf", name: "Dwarf", blurb: "Stout, stubborn, masters of stone and steel." },
  { id: "halfling", name: "Halfling", blurb: "Small, lucky, brave when it matters most." },
  { id: "tiefling", name: "Tiefling", blurb: "Infernal heritage, charisma, hidden fire." },
  { id: "dragonborn", name: "Dragonborn", blurb: "Draconic ancestry, breath weapon, proud." },
  { id: "gnome", name: "Gnome", blurb: "Curious tinkerers with arcane bloodlines." },
  { id: "half-orc", name: "Half-Orc", blurb: "Two worlds, fury and resolve in equal measure." },
];

export const CLASSES: Option[] = [
  { id: "fighter", name: "Fighter", blurb: "Master of weapons and battlefield tactics." },
  { id: "wizard", name: "Wizard", blurb: "Scholar of the arcane, spellbook-bound." },
  { id: "rogue", name: "Rogue", blurb: "Shadow-walker, knives in the dark." },
  { id: "cleric", name: "Cleric", blurb: "Divine champion, healer and zealot." },
  { id: "ranger", name: "Ranger", blurb: "Wilderness hunter, bow and beast-friend." },
  { id: "barbarian", name: "Barbarian", blurb: "Rage-fueled berserker, primal strength." },
  { id: "bard", name: "Bard", blurb: "Wandering performer, magic in melody." },
  { id: "sorcerer", name: "Sorcerer", blurb: "Innate magic in the blood, raw and wild." },
];

export const BACKGROUNDS: Option[] = [
  { id: "soldier", name: "Soldier", blurb: "Disciplined, trained for war's grim work." },
  { id: "outlander", name: "Outlander", blurb: "Raised in the wilds, at home off the road." },
  { id: "sage", name: "Sage", blurb: "A life among books and forgotten lore." },
  { id: "criminal", name: "Criminal", blurb: "Underworld ties, hidden contacts." },
  { id: "acolyte", name: "Acolyte", blurb: "Servant of a temple, faith as foundation." },
  { id: "noble", name: "Noble", blurb: "Born to privilege, burdened by duty." },
  { id: "folk-hero", name: "Folk Hero", blurb: "Common-born, beloved by ordinary people." },
  { id: "entertainer", name: "Entertainer", blurb: "Stages, taverns, applause, and runaways." },
];

export const ALIGNMENTS: Option[] = [
  { id: "lawful-good", name: "Lawful Good", blurb: "Honorable and compassionate." },
  { id: "neutral-good", name: "Neutral Good", blurb: "Doing good without devotion to law." },
  { id: "chaotic-good", name: "Chaotic Good", blurb: "Freedom, kindness, suspicion of authority." },
  { id: "lawful-neutral", name: "Lawful Neutral", blurb: "Order above all, personal or societal." },
  { id: "true-neutral", name: "True Neutral", blurb: "Balance, pragmatism, the middle path." },
  { id: "chaotic-neutral", name: "Chaotic Neutral", blurb: "Personal freedom prized above all." },
  { id: "lawful-evil", name: "Lawful Evil", blurb: "Methodical, ruthless, within a code." },
  { id: "neutral-evil", name: "Neutral Evil", blurb: "Selfish ends by whatever means." },
  { id: "chaotic-evil", name: "Chaotic Evil", blurb: "Destruction without restraint." },
];

export const WEAPONS: Option[] = [
  { id: "wooden-club", name: "Wooden Club", blurb: "Simple, brutal, reliable." },
  { id: "dagger", name: "Dagger", blurb: "Quick and concealable." },
  { id: "longsword", name: "Longsword", blurb: "Versatile blade of soldiers." },
  { id: "warhammer", name: "Warhammer", blurb: "Skull-crushing momentum." },
  { id: "rapier", name: "Rapier", blurb: "Finesse and precise thrusts." },
  { id: "shortbow", name: "Shortbow", blurb: "Light, fast, reaches far." },
  { id: "quarterstaff", name: "Quarterstaff", blurb: "Reach and balance, the scholar's choice." },
  { id: "battleaxe", name: "Battleaxe", blurb: "Heavy bite, brutal in two hands." },
];

export const SECONDARIES: Option[] = [
  { id: "shortsword", name: "Short Sword", blurb: "Quick off-hand companion." },
  { id: "buckler", name: "Buckler", blurb: "Small shield, fast parries." },
  { id: "shield-of-faith", name: "Shield of Faith", blurb: "Holy symbol radiates protection." },
  { id: "spellbook", name: "Spellbook", blurb: "Bound knowledge of the arcane." },
  { id: "holy-symbol", name: "Holy Symbol", blurb: "Focus for divine power." },
  { id: "hand-crossbow", name: "Hand Crossbow", blurb: "A quiet bolt in close quarters." },
  { id: "lute", name: "Lute", blurb: "Strings to weave a bard's magic." },
  { id: "throwing-knives", name: "Throwing Knives", blurb: "Five blades, one breath." },
];

export const ARMOR: Option[] = [
  { id: "no-armor", name: "No Armor", blurb: "Unencumbered, swift, vulnerable." },
  { id: "simple-shirt", name: "Simple Shirt", blurb: "Sturdy cloth, room to move." },
  { id: "leather-armor", name: "Leather Armor", blurb: "Treated hide, light protection." },
  { id: "chain-mail", name: "Chain Mail", blurb: "Linked rings, heavy but tested." },
  { id: "plate-armor", name: "Plate Armor", blurb: "A walking fortress of steel." },
  { id: "clerical-robes", name: "Clerical Robes", blurb: "Sacred vestments of office." },
  { id: "cloth-armor", name: "Cloth Armor", blurb: "Padded, modest defense." },
  { id: "divine-vestments", name: "Divine Vestments", blurb: "Blessed garb, woven prayers." },
];

export const TOOLS: Option[] = [
  { id: "dice-set", name: "Dice Set", blurb: "For gambling and divination both." },
  { id: "healing-potion", name: "Healing Potion", blurb: "A single sip of crimson hope." },
  { id: "prayer-beads", name: "Prayer Beads", blurb: "Smooth-worn, an anchor in chaos." },
  { id: "holy-water", name: "Holy Water", blurb: "Burns the unholy on contact." },
  { id: "incense-burner", name: "Incense Burner", blurb: "Smoke that carries pleas to gods." },
  { id: "simple-compass", name: "Simple Compass", blurb: "True north, when the stars hide." },
  { id: "disguise-kit", name: "Disguise Kit", blurb: "Become someone else by candlelight." },
  { id: "thieves-tools", name: "Thieves' Tools", blurb: "Picks and probes for stubborn locks." },
  { id: "rope-50ft", name: "50 ft of Rope", blurb: "Hemp, strong, indispensable." },
  { id: "rations", name: "10 Days of Rations", blurb: "Hardtack and salt — survival." },
];
