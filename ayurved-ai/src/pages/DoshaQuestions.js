export const QUESTIONS = [
  {
    key: "body_type",
    label: "Body Frame",
    subtitle: "Your natural build, regardless of recent weight change",
    icon: "🧍",
    options: [
      { value: "Thin and Lean", label: "Thin & lean — light bones, hard to bulk up", desc: "Naturally slender frame with small joints", trait: [3, 1, 0] },
      { value: "Medium", label: "Medium — moderate frame and musculature", desc: "Neither noticeably slim nor stocky", trait: [1, 1, 1] },
      { value: "Well Built", label: "Well built — broad, solid, or naturally strong", desc: "Large-boned or sturdy; gains muscle or weight easily", trait: [0, 1, 3] },
    ],
  },
  {
    key: "hair_type",
    label: "Hair texture",
    subtitle: "Natural tendency of your scalp hair",
    icon: "💇",
    options: [
      { value: "Dry", label: "Dry or brittle — prone to frizz or split ends", desc: "Lacks natural moisture; tangles easily", trait: [3, 0, 0] },
      { value: "Normal", label: "Normal — balanced, manageable", desc: "Neither too dry nor oily; holds style well", trait: [1, 1, 1] },
      { value: "Greasy", label: "Oily or greasy — needs frequent washing", desc: "Scalp produces excess oil quickly", trait: [0, 1, 3] },
    ],
  },
  {
    key: "hair_color",
    label: "Hair pigmentation tendency",
    subtitle: "Natural colour depth and how early it changes",
    icon: "🎨",
    options: [
      { value: "Grey", label: "Went grey or silver early — pigmentation fades fast", desc: "Noticeable greying before mid-30s, or fully grey/white now", trait: [3, 0, 0] },
      { value: "Brown", label: "Warm mid-tones — brown, auburn, or chestnut", desc: "Natural colour sits in the brown family; neither very light nor very dark", trait: [1, 2, 1] },
      { value: "Black", label: "Very dark and dense — deep black or near-black brown", desc: "Rich, deeply pigmented hair; pigmentation tends to hold longer", trait: [0, 1, 3] },
    ],
  },
  {
    key: "skin",
    label: "Skin",
    subtitle: "Your skin's usual tendency without effort",
    icon: "🌿",
    options: [
      { value: "Dry,Rough", label: "Dry and rough — flaky or tight without moisturiser", desc: "Cracks, rough patches, or dullness when neglected", trait: [3, 0, 0] },
      { value: "Soft,Sweating", label: "Warm and sensitive — flushes, sweats easily", desc: "Soft to touch; prone to redness or breakouts", trait: [1, 2, 1] },
      { value: "Moist,Greasy", label: "Moist or oily — naturally dewy or shiny", desc: "Pores visible; cool to touch; stays hydrated", trait: [0, 1, 3] },
    ],
  },
  {
    key: "complexion",
    label: "Skin undertone & clarity",
    subtitle: "How your skin naturally looks and feels in good health",
    icon: "✨",
    options: [
      { value: "Dark", label: "Warm or earthy — golden, olive, or yellow undertone", desc: "Skin has a warm, muted tone; may look dull when stressed", trait: [2, 0, 1] },
      { value: "Pinkish", label: "Rosy or reddish — pink or red undertone, flushes easily", desc: "Visible capillaries or redness; skin reacts quickly to heat or emotion", trait: [1, 2, 1] },
      { value: "Glowing", label: "Cool or luminous — pale, neutral, or pearlescent undertone", desc: "Naturally bright or clear; stays hydrated-looking", trait: [0, 1, 3] },
    ],
  },
  {
    key: "body_weight",
    label: "Body weight tendency",
    subtitle: "Compared to your frame, as a long-term pattern",
    icon: "⚖️",
    options: [
      { value: "Underweight", label: "Underweight — hard to gain or hold weight", desc: "Stays thin even when eating well", trait: [3, 1, 0] },
      { value: "Normal", label: "Normal — stable weight without much effort", desc: "Neither gains nor loses easily; moderate build", trait: [1, 1, 1] },
      { value: "Overweight", label: "Overweight — gains easily, hard to lose", desc: "Retains weight even with diet and exercise", trait: [0, 0, 3] },
    ],
  },
  {
    key: "nails",
    label: "Nails",
    subtitle: "Natural nail strength and colour tendency",
    icon: "💅",
    options: [
      { value: "Pinkish", label: "Pale or translucent — thin, breaks or peels easily", desc: "Delicate nails with a light, washed-out nail bed", trait: [3, 0, 0] },
      { value: "Redish", label: "Pink-red and firm — strong growth, well-coloured", desc: "Healthy flush in the nail bed; nails grow fast and strong", trait: [1, 2, 1] },
      { value: "Blackish", label: "Deep or dull — thick but slow-growing or prone to ridges", desc: "Dense nails with a darker, sometimes bluish nail bed", trait: [0, 0, 3] },
    ],
  },
  {
    key: "teeth",
    label: "Teeth",
    subtitle: "Natural size, spacing, and overall appearance",
    icon: "🦷",
    options: [
      {
        value: "Irregular,Blackish",
        label: "Irregular, crowded, or uneven teeth (may appear darker or dull)",
        desc: "Crooked, gapped, or uneven teeth; enamel may look dull or darker",
        trait: [3, 0, 0]
      },
      {
        value: "Medium,Yellowish",
        label: "Average-sized teeth with a slightly yellow or warm tone",
        desc: "Moderate size and spacing; enamel may have a natural yellow tint",
        trait: [1, 2, 1]
      },
      {
        value: "Large,White",
        label: "Large, strong, or prominent teeth (color may vary)",
        desc: "Big, well-formed teeth; can be white or slightly yellow depending on natural shade",
        trait: [0, 0, 3]
      },
    ],
  },
  {
    key: "pace",
    label: "Pace of work",
    subtitle: "How you naturally move through tasks",
    icon: "🏃",
    options: [
      { value: "Fast", label: "Fast — start quickly, switch often, rarely finish first", desc: "Enthusiastic bursts; many projects at once", trait: [3, 1, 0] },
      { value: "Medium", label: "Medium — steady and consistent pace", desc: "Balanced speed; focuses well without rushing", trait: [1, 1, 1] },
      { value: "Slow", label: "Slow — deliberate, thorough, finishes what's started", desc: "Unhurried; prefers depth over speed", trait: [0, 0, 3] },
    ],
  },
  {
    key: "mind",
    label: "Mental activity",
    subtitle: "Typical mental tone throughout the day",
    icon: "🧠",
    options: [
      { value: "Restless", label: "Restless — many thoughts, hard to settle", desc: "Mind jumps quickly; hard to stay on one topic", trait: [3, 0, 0] },
      { value: "Aggressive", label: "Sharp and intense — focused, driven, competitive", desc: "Analytical; cuts through problems decisively", trait: [1, 2, 0] },
      { value: "Stable", label: "Calm and stable — even mood, steady attention", desc: "Unhurried thinker; consistent, grounded", trait: [0, 0, 3] },
    ],
  },
  {
    key: "memory",
    label: "Memory",
    subtitle: "How you tend to retain information",
    icon: "📚",
    options: [
      { value: "Short term", label: "Quick to learn but forgets details fast", desc: "Grasps concepts easily; specifics slip quickly", trait: [3, 0, 0] },
      { value: "Good Memory", label: "Sharp recall — strong medium-term memory", desc: "Retains what matters; good with facts and names", trait: [1, 2, 1] },
      { value: "Long Term", label: "Slow to learn but remembers for life", desc: "Takes time to absorb; once in, rarely forgotten", trait: [0, 0, 3] },
    ],
  },
  {
    key: "sleep",
    label: "Sleep pattern",
    subtitle: "Natural sleep duration and depth",
    icon: "🌙",
    options: [
      { value: "Less", label: "Light sleeper — 5–6 hrs, wakes easily", desc: "Mind stays active; drops off slowly or wakes often", trait: [3, 1, 0] },
      { value: "Moderate", label: "Average — 7–8 hrs, wakes refreshed", desc: "Falls asleep without difficulty; feels rested", trait: [1, 1, 1] },
      { value: "Sleepy", label: "Heavy sleeper — 9+ hrs, hard to get up", desc: "Needs long sleep; feels groggy if cut short", trait: [0, 0, 3] },
    ],
  },
  {
    key: "weather",
    label: "Weather you dislike most",
    subtitle: "What usually throws off your comfort or energy",
    icon: "🌤️",
    options: [
      { value: "Dislike Cold", label: "Cold and wind — chills and dry air drain me", desc: "Feel stiff, anxious, or depleted in cold drafts", trait: [3, 0, 0] },
      { value: "Dislike Heat", label: "Heat and strong sun — I overheat and irritate easily", desc: "Hot days leave me exhausted, flushed, or edgy", trait: [1, 2, 0] },
      { value: "Dislike Moist", label: "Humid and damp — heavy air slows me down", desc: "Sticky or rainy weather makes me sluggish and foggy", trait: [0, 0, 3] },
    ],
  },
  {
    key: "emotion",
    label: "Under stress you tend toward",
    subtitle: "Your first emotional reflex when pressured",
    icon: "💫",
    options: [
      { value: "Anxiety", label: "Worry and fear — mind spins, hard to stop", desc: "Overthinking, racing thoughts, or sudden panic", trait: [3, 0, 0] },
      { value: "Anger", label: "Anger and irritation — sharp words, blame", desc: "Quick to heat up; becomes critical or confrontational", trait: [1, 2, 0] },
      { value: "Calm", label: "Withdrawal — go quiet, shut down, pull inward", desc: "Becomes passive or avoidant rather than reactive", trait: [0, 0, 3] },
    ],
  },
  {
    key: "mood",
    label: "Mood changes",
    subtitle: "How quickly your emotional state shifts",
    icon: "🎭",
    options: [
      { value: "Changes Quickly", label: "Changes quickly — up and down several times a day", desc: "Cheerful one moment, anxious the next", trait: [3, 0, 0] },
      { value: "Constant", label: "Steady intensity — strong but fairly predictable", desc: "Feelings are deep but don't swing wildly", trait: [1, 2, 1] },
      { value: "Changes Slowly", label: "Changes slowly — moods last days and are hard to shift", desc: "Takes time to lift or re-engage after upset", trait: [0, 0, 3] },
    ],
  },
  {
    key: "eating_habit",
    label: "Eating habit",
    subtitle: "How you typically eat during a meal",
    icon: "🍽️",
    options: [
      { value: "Irregular Chewing", label: "Irregular or rushed — skip meals or eat standing up", desc: "Distracted, grazing, or eating too fast to taste", trait: [3, 0, 0] },
      { value: "Improper Chewing", label: "Strong appetite — eats fast when hungry", desc: "Passionate about food; bites off more than chewed", trait: [1, 2, 1] },
      { value: "Proper Chewing", label: "Slow and thorough — chews well, steady meals", desc: "Deliberate eater; savours and rarely rushes", trait: [0, 0, 3] },
    ],
  },
  {
    key: "hunger",
    label: "Hunger pattern",
    subtitle: "Appetite rhythm across a typical day",
    icon: "🔥",
    options: [
      { value: "Skips Meal", label: "Forgets meals — irregular hunger, easy to skip", desc: "Doesn't notice hunger until reminded", trait: [3, 0, 0] },
      { value: "Sudden and Sharp", label: "Sudden and sharp — must eat when hunger hits", desc: "Hunger arrives intensely and demands immediate food", trait: [1, 2, 0] },
      { value: "Irregular", label: "Slow or dull — can go long without strong hunger", desc: "Appetite is mild; rarely craves urgently", trait: [1, 0, 2] },
    ],
  },
  {
    key: "body_temp",
    label: "Body temperature feel",
    subtitle: "Your baseline sense of warmth day-to-day",
    icon: "🌡️",
    options: [
      { value: "Less than Normal", label: "Runs cold — hands and feet often chilly", desc: "Needs layers; dislikes air conditioning or cold rooms", trait: [3, 0, 0] },
      { value: "Normal", label: "Balanced — comfortable across most temperatures", desc: "Neither consistently warm nor cold", trait: [1, 1, 1] },
      { value: "More than Normal", label: "Runs warm — overheats, flushes, sweats easily", desc: "Prefers cool environments; dislikes hot weather", trait: [1, 2, 0] },
    ],
  },
  {
    key: "joints",
    label: "Joints",
    subtitle: "Mobility, stability, and sound when moving",
    icon: "🦴",
    options: [
      { value: "Healthy", label: "Flexible and healthy — no issues", desc: "Good range of motion; rarely stiff or sore", trait: [1, 1, 1] },
      { value: "Weak", label: "Crackly, weak, or stiff — pops or gives way", desc: "Joints crack often; prone to instability", trait: [3, 0, 0] },
      { value: "Heavy", label: "Heavy and thick — solid but slow to warm up", desc: "Dense joints with limited early-morning mobility", trait: [0, 0, 3] },
    ],
  },
  {
    key: "nature",
    label: "Core temperament",
    subtitle: "Baseline personality leaning most of the time",
    icon: "🌻",
    options: [
      { value: "Egoistic,Fearless", label: "Bold, driven, and proud — natural leader energy", desc: "Confident, goal-oriented, sometimes assertive", trait: [1, 2, 0] },
      { value: "Jealous,Fearful", label: "Sensitive, worrying, with an anxious edge", desc: "Thoughtful and caring; can overthink or compare", trait: [3, 0, 0] },
      { value: "Forgiving,Grateful", label: "Gentle, forgiving, and easy-going", desc: "Warm and patient; rarely holds grudges", trait: [0, 0, 3] },
    ],
  },
  {
    key: "energy",
    label: "Daytime energy",
    subtitle: "Overall vitality on a typical day",
    icon: "⚡",
    options: [
      { value: "Low", label: "Low or variable — easily depleted, needs recovery", desc: "Energy comes in spurts; crashes after activity", trait: [3, 0, 0] },
      { value: "Medium", label: "Medium and steady — consistent throughout the day", desc: "Reliable endurance without big peaks or drops", trait: [1, 1, 1] },
      { value: "High", label: "High and intense — drives hard, then drops suddenly", desc: "Strong output when motivated; burns bright then out", trait: [1, 2, 0] },
    ],
  },
  {
    key: "voice",
    label: "Voice quality",
    subtitle: "Your natural speaking tone",
    icon: "🗣️",
    options: [
      { value: "Fast", label: "Fast and light — quick-paced, higher pitch", desc: "Words come quickly; voice carries clearly", trait: [3, 0, 0] },
      { value: "Deep", label: "Deep and penetrating — confident, commanding", desc: "Resonant voice with strong projection", trait: [1, 2, 0] },
      { value: "Rough", label: "Soft or muffled — gentle, deep-chest rumble", desc: "Low-key delivery; sometimes hard to hear across a room", trait: [0, 0, 3] },
    ],
  },
  {
    key: "dreams",
    label: "Dreams tend to involve",
    subtitle: "Themes that repeat when you remember dreams",
    icon: "💭",
    options: [
      { value: "Fire", label: "Fire, conflict, or chase — vivid, intense dreams", desc: "Arguments, battles, heat, or pursuit", trait: [1, 2, 0] },
      { value: "Sky", label: "Flying, sky, or movement — light, airy dreams", desc: "Floating, running, travel, or changing scenes", trait: [3, 0, 0] },
      { value: "Water", label: "Water, pools, or slow scenes — calm, deep dreams", desc: "Oceans, rivers, or unhurried slow-moving imagery", trait: [0, 0, 3] },
    ],
  },
  {
    key: "social",
    label: "Social style",
    subtitle: "Where you naturally recharge",
    icon: "👥",
    options: [
      { value: "Introvert", label: "Introvert — drained by crowds, recharged by solitude", desc: "Prefers one-on-one or alone time to decompress", trait: [3, 0, 0] },
      { value: "Ambivert", label: "Ambivert — comfortable either way, context-dependent", desc: "Enjoys people and solitude in roughly equal measure", trait: [1, 1, 1] },
      { value: "Extrovert", label: "Extrovert — energised by people and social activity", desc: "Feels flat when alone for too long", trait: [0, 1, 3] },
    ],
  },
  {
    key: "body_odor",
    label: "Body odour tendency",
    subtitle: "Natural scent intensity when not using products",
    icon: "🌸",
    options: [
      { value: "Strong", label: "Strong or sour — noticeable after light activity", desc: "Sweats with distinct odour; needs frequent freshening", trait: [1, 2, 0] },
      { value: "Mild", label: "Mild and neutral — barely noticeable", desc: "Moderate perspiration with little to no strong scent", trait: [1, 1, 1] },
      { value: "Negligible", label: "Very faint — almost no odour even after exertion", desc: "Dry skin, light sweating, minimal scent", trait: [3, 0, 0] },
    ],
  },
];