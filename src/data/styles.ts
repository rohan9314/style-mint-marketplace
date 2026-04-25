import studioGhibliImg from "@/assets/styles/studio-ghibli.jpg";
import spiderVerseImg from "@/assets/styles/spider-verse.jpg";
import rankingOfKingsImg from "@/assets/styles/ranking-of-kings.jpg";
import arcaneImg from "@/assets/styles/arcane.jpg";
import adventureTimeImg from "@/assets/styles/adventure-time.jpg";
import attackOnTitanImg from "@/assets/styles/attack-on-titan.jpg";
import onePieceImg from "@/assets/styles/one-piece.jpg";
import narutoImg from "@/assets/styles/naruto.jpg";
import harryPotterImg from "@/assets/styles/harry-potter.jpg";
import percyJacksonImg from "@/assets/styles/percy-jackson.jpg";
import hungerGamesImg from "@/assets/styles/hunger-games.jpg";
import sherlockHolmesImg from "@/assets/styles/sherlock-holmes.jpg";
import gameOfThronesImg from "@/assets/styles/game-of-thrones.jpg";
import wimpyKidImg from "@/assets/styles/wimpy-kid.jpg";
import drSeussImg from "@/assets/styles/dr-seuss.jpg";
import tolkienImg from "@/assets/styles/tolkien.jpg";

export type Tone =
  | "Cozy"
  | "Dark"
  | "Funny"
  | "Epic"
  | "Emotional"
  | "Action"
  | "Magical";

export type Tag = "Popular" | "Trending" | "Classic" | "New" | "Top Rated";

export type ArtStyle = {
  id: string;
  title: string;
  type: "Art";
  description: string;
  longDescription: string;
  tag: Tag;
  tones: Tone[];
  uses: number;
  rating: number;
  gradient: string;
  image: string;
};

export type WritingStyle = {
  id: string;
  title: string;
  type: "Writing";
  description: string;
  longDescription: string;
  tag: Tag;
  tones: Tone[];
  uses: number;
  rating: number;
  icon: string;
  accent: string;
  image: string;
};

export const TONES: Tone[] = [
  "Cozy",
  "Dark",
  "Funny",
  "Epic",
  "Emotional",
  "Action",
  "Magical",
];

export const artStyles: ArtStyle[] = [
  {
    id: "ranking-of-kings",
    title: "Ranking of Kings",
    type: "Art",
    description: "Soft storybook anime with rounded characters and painterly backgrounds.",
    longDescription:
      "Soft storybook anime visuals, rounded characters, emotional facial expressions, whimsical medieval fantasy atmosphere, and painterly watercolor backgrounds.",
    tag: "Trending",
    tones: ["Cozy", "Emotional", "Magical"],
    uses: 18420,
    rating: 4.9,
    gradient: "from-amber-200 via-rose-200 to-emerald-200",
    image: rankingOfKingsImg,
  },
  {
    id: "spider-verse",
    title: "Spider-Verse",
    type: "Art",
    description: "Comic-book energy with halftone textures and dynamic motion.",
    longDescription:
      "Comic-book energy, halftone textures, bold saturated colors, dynamic motion lines, and a layered animation feel that breaks the frame.",
    tag: "Popular",
    tones: ["Action", "Epic", "Funny"],
    uses: 24310,
    rating: 4.92,
    gradient: "from-fuchsia-400 via-red-400 to-cyan-400",
    image: spiderVerseImg,
  },
  {
    id: "studio-ghibli",
    title: "Studio Ghibli",
    type: "Art",
    description: "Warm hand-painted scenery with magical realism and nostalgic charm.",
    longDescription:
      "Warm hand-painted scenery, magical realism, cozy environments, expressive nature, soft skies, and that unmistakable nostalgic charm.",
    tag: "Classic",
    tones: ["Cozy", "Magical", "Emotional"],
    uses: 31280,
    rating: 4.97,
    gradient: "from-sky-200 via-emerald-200 to-yellow-200",
    image: studioGhibliImg,
  },
  {
    id: "arcane",
    title: "Arcane",
    type: "Art",
    description: "Painterly realism, dramatic lighting, cinematic fantasy-industrial mood.",
    longDescription:
      "Painterly realism with dramatic lighting, rich textured brushwork, and a cinematic fantasy-industrial mood that feels both gritty and beautiful.",
    tag: "Top Rated",
    tones: ["Dark", "Epic", "Emotional"],
    uses: 15280,
    rating: 4.95,
    gradient: "from-indigo-500 via-purple-500 to-rose-400",
    image: arcaneImg,
  },
  {
    id: "adventure-time",
    title: "Adventure Time",
    type: "Art",
    description: "Simple playful shapes with surreal humor and quirky characters.",
    longDescription:
      "Simple playful shapes, surreal humor, colorful candy-bright fantasy landscapes, and quirky character design with a noodly hand-drawn feel.",
    tag: "Popular",
    tones: ["Funny", "Magical", "Cozy"],
    uses: 12450,
    rating: 4.78,
    gradient: "from-pink-300 via-sky-300 to-violet-300",
    image: adventureTimeImg,
  },
  {
    id: "attack-on-titan",
    title: "Attack on Titan",
    type: "Art",
    description: "Dark militaristic tone with dramatic scale and gritty atmosphere.",
    longDescription:
      "Dark militaristic tone, dramatic scale, gritty atmosphere, sharp linework, and tension-heavy visual storytelling that feels apocalyptic.",
    tag: "Trending",
    tones: ["Dark", "Action", "Epic"],
    uses: 19870,
    rating: 4.88,
    gradient: "from-stone-500 via-zinc-700 to-red-700",
    image: attackOnTitanImg,
  },
  {
    id: "one-piece",
    title: "One Piece",
    type: "Art",
    description: "Exaggerated character design and a vibrant adventure world.",
    longDescription:
      "Exaggerated character design, vibrant adventure world, playful chaos, and big expressive emotion across sun-drenched seas.",
    tag: "Popular",
    tones: ["Funny", "Action", "Epic"],
    uses: 21200,
    rating: 4.82,
    gradient: "from-amber-300 via-orange-400 to-sky-400",
    image: onePieceImg,
  },
  {
    id: "naruto",
    title: "Naruto",
    type: "Art",
    description: "Shonen action framing with energetic combat and ninja fantasy tone.",
    longDescription:
      "Shonen action framing, energetic combat poses, emotional rivalry themes, and a ninja fantasy tone with bold motion and chakra glow.",
    tag: "Classic",
    tones: ["Action", "Emotional", "Epic"],
    uses: 17340,
    rating: 4.84,
    gradient: "from-orange-400 via-amber-300 to-blue-400",
    image: narutoImg,
  },
];

export const writingStyles: WritingStyle[] = [
  {
    id: "harry-potter",
    title: "Harry Potter",
    type: "Writing",
    description: "Magical boarding-school wonder with friendship-driven adventure.",
    longDescription:
      "Magical boarding-school wonder, friendship-driven adventure, whimsical worldbuilding, and mystery layered through every chapter.",
    tag: "Classic",
    tones: ["Magical", "Cozy", "Emotional"],
    uses: 32120,
    rating: 4.96,
    icon: "Wand2",
    accent: "from-amber-300 to-purple-500",
    image: harryPotterImg,
  },
  {
    id: "percy-jackson",
    title: "Percy Jackson",
    type: "Writing",
    description: "Fast-paced humor with a sarcastic narrator and modern myth.",
    longDescription:
      "Fast-paced humor, modern mythological setting, a sarcastic first-person narrator, and youthful adventure full of gods and monsters.",
    tag: "Popular",
    tones: ["Funny", "Action", "Magical"],
    uses: 14210,
    rating: 4.85,
    icon: "Zap",
    accent: "from-cyan-300 to-blue-500",
    image: percyJacksonImg,
  },
  {
    id: "hunger-games",
    title: "The Hunger Games",
    type: "Writing",
    description: "High-stakes survival tension and dystopian society critique.",
    longDescription:
      "High-stakes survival tension, dystopian society critique, and an emotionally intense first-person perspective that never lets up.",
    tag: "Trending",
    tones: ["Dark", "Action", "Emotional"],
    uses: 11240,
    rating: 4.88,
    icon: "Flame",
    accent: "from-orange-400 to-rose-600",
    image: hungerGamesImg,
  },
  {
    id: "sherlock-holmes",
    title: "Sherlock Holmes",
    type: "Writing",
    description: "Logical deduction and elegant intelligence through clues.",
    longDescription:
      "Logical deduction, mysteries unraveling thread by thread, elegant intelligence, and suspense built from the smallest clues.",
    tag: "Classic",
    tones: ["Dark", "Emotional"],
    uses: 9120,
    rating: 4.9,
    icon: "Search",
    accent: "from-slate-400 to-stone-700",
    image: sherlockHolmesImg,
  },
  {
    id: "game-of-thrones",
    title: "Game of Thrones",
    type: "Writing",
    description: "Political intrigue, morally gray characters, shifting POVs.",
    longDescription:
      "Political intrigue, morally gray characters, large-scale worldbuilding, and shifting perspectives across rival houses.",
    tag: "Top Rated",
    tones: ["Dark", "Epic", "Action"],
    uses: 16320,
    rating: 4.93,
    icon: "Crown",
    accent: "from-red-500 to-zinc-800",
    image: gameOfThronesImg,
  },
  {
    id: "wimpy-kid",
    title: "Diary of a Wimpy Kid",
    type: "Writing",
    description: "Humorous everyday problems told in a casual youth voice.",
    longDescription:
      "Humorous everyday problems, a relatable youth perspective, casual diary voice, and comedic exaggeration of school-life chaos.",
    tag: "Popular",
    tones: ["Funny", "Cozy"],
    uses: 8210,
    rating: 4.7,
    icon: "Notebook",
    accent: "from-yellow-300 to-orange-400",
    image: wimpyKidImg,
  },
  {
    id: "dr-seuss",
    title: "Dr. Seuss",
    type: "Writing",
    description: "Rhythmic playful language with whimsical nonsense.",
    longDescription:
      "Rhythmic, playful language, whimsical nonsense words, and memorable moral simplicity wrapped in singsong rhyme.",
    tag: "Classic",
    tones: ["Funny", "Cozy", "Magical"],
    uses: 6120,
    rating: 4.8,
    icon: "Feather",
    accent: "from-pink-300 to-cyan-400",
    image: drSeussImg,
  },
  {
    id: "tolkien",
    title: "Tolkien",
    type: "Writing",
    description: "Epic mythic tone with deep lore and grand journeys.",
    longDescription:
      "Epic mythic tone, deep invented lore, grand journeys across continents, and poetic ancient-feeling language.",
    tag: "Top Rated",
    tones: ["Epic", "Magical", "Emotional"],
    uses: 20120,
    rating: 4.95,
    icon: "Mountain",
    accent: "from-emerald-500 to-amber-600",
    image: tolkienImg,
  },
];
