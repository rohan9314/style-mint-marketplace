export type ArtStyle = {
  id: string;
  title: string;
  description: string;
  popularity: "Trending" | "Popular" | "New" | "Top Rated";
  uses: number;
  rating: number;
  gradient: string;
};

export type WritingStyle = {
  id: string;
  title: string;
  description: string;
  popularity: "Trending" | "Popular" | "New" | "Top Rated";
  uses: number;
  rating: number;
  icon: string; // lucide icon name
  accent: string; // tailwind gradient classes
};

export const artStyles: ArtStyle[] = [
  { id: "fantasy", title: "Fantasy Illustration", description: "Mystical realms, ethereal lighting, painterly detail.", popularity: "Trending", uses: 18420, rating: 4.9, gradient: "from-violet-300 via-fuchsia-300 to-rose-300" },
  { id: "anime", title: "Anime", description: "Vibrant cel-shaded characters with expressive eyes.", popularity: "Popular", uses: 24310, rating: 4.8, gradient: "from-pink-300 via-rose-300 to-orange-300" },
  { id: "portrait", title: "Realistic Portrait", description: "Lifelike faces with cinematic light and depth.", popularity: "Top Rated", uses: 15280, rating: 4.95, gradient: "from-amber-200 via-orange-300 to-red-300" },
  { id: "cyberpunk", title: "Cyberpunk", description: "Neon-soaked dystopias, chrome, and rain.", popularity: "Trending", uses: 12450, rating: 4.85, gradient: "from-fuchsia-400 via-purple-500 to-cyan-400" },
  { id: "watercolor", title: "Watercolor", description: "Soft washes and bleeding pigments, hand-painted.", popularity: "Popular", uses: 9870, rating: 4.7, gradient: "from-sky-200 via-teal-200 to-emerald-200" },
  { id: "minimal", title: "Minimalist Design", description: "Clean lines, negative space, modern simplicity.", popularity: "New", uses: 4210, rating: 4.6, gradient: "from-slate-100 via-stone-200 to-zinc-300" },
  { id: "comic", title: "Comic Book", description: "Bold ink, halftones, and dynamic panels.", popularity: "Popular", uses: 11200, rating: 4.75, gradient: "from-yellow-300 via-orange-400 to-red-400" },
  { id: "surreal", title: "Surrealism", description: "Dreamlike compositions that defy reality.", popularity: "Top Rated", uses: 8120, rating: 4.9, gradient: "from-indigo-300 via-purple-400 to-pink-400" },
  { id: "pixel", title: "Pixel Art", description: "Retro 8-bit charm with modern polish.", popularity: "Trending", uses: 7340, rating: 4.7, gradient: "from-emerald-300 via-cyan-400 to-blue-400" },
  { id: "vintage", title: "Vintage Poster", description: "Mid-century print, grain, and rich palettes.", popularity: "New", uses: 3890, rating: 4.65, gradient: "from-amber-300 via-rose-300 to-teal-300" },
];

export const writingStyles: WritingStyle[] = [
  { id: "kids", title: "Children's Story", description: "Warm, whimsical tales perfect for bedtime.", popularity: "Popular", uses: 9120, rating: 4.8, icon: "Baby", accent: "from-pink-200 to-yellow-200" },
  { id: "horror", title: "Horror Story", description: "Atmospheric dread and slow-burn tension.", popularity: "Trending", uses: 7430, rating: 4.85, icon: "Ghost", accent: "from-slate-300 to-purple-400" },
  { id: "scifi", title: "Sci-Fi Novel", description: "Speculative worlds, bold ideas, sharp prose.", popularity: "Top Rated", uses: 11240, rating: 4.9, icon: "Rocket", accent: "from-cyan-300 to-blue-400" },
  { id: "blog", title: "Motivational Blog", description: "Energetic, actionable, and easy to share.", popularity: "Popular", uses: 8210, rating: 4.7, icon: "Flame", accent: "from-orange-300 to-red-400" },
  { id: "email", title: "Professional Email", description: "Concise, polite, and ready to send.", popularity: "Trending", uses: 19320, rating: 4.85, icon: "Mail", accent: "from-mint-200 to-emerald-300" },
  { id: "marketing", title: "Marketing Copy", description: "Punchy hooks that convert browsers to buyers.", popularity: "Top Rated", uses: 14210, rating: 4.9, icon: "Megaphone", accent: "from-fuchsia-300 to-rose-400" },
  { id: "poetry", title: "Poetry", description: "Lyrical verse with rhythm and imagery.", popularity: "New", uses: 4120, rating: 4.75, icon: "Feather", accent: "from-violet-300 to-indigo-400" },
  { id: "fantasy-adv", title: "Fantasy Adventure", description: "Epic quests, magic systems, vivid worlds.", popularity: "Popular", uses: 10120, rating: 4.85, icon: "Swords", accent: "from-amber-300 to-emerald-400" },
  { id: "mystery", title: "Mystery Thriller", description: "Twisty plots and unforgettable reveals.", popularity: "Trending", uses: 6320, rating: 4.8, icon: "Search", accent: "from-slate-400 to-blue-500" },
  { id: "social", title: "Social Media Post", description: "Snappy captions tuned for engagement.", popularity: "Popular", uses: 22310, rating: 4.7, icon: "Hash", accent: "from-pink-300 to-purple-400" },
];
