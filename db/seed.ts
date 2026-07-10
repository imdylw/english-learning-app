import { getDb } from "../api/queries/connection";
import {
  lessons,
  vocabulary,
  grammarLessons,
  achievements,
  learningPaths,
  shadowingSessions,
  mockExams,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed Learning Paths
  await db.insert(learningPaths).values([
    { name: "Everyday English", description: "Master daily conversations, from greetings to complex discussions.", slug: "everyday-english", category: "everyday", cefrLevel: "A1", totalLessons: 50, estimatedHours: 25, icon: "MessageCircle" },
    { name: "Business English", description: "Professional communication for meetings, emails, and presentations.", slug: "business-english", category: "business", cefrLevel: "B1", totalLessons: 40, estimatedHours: 30, icon: "Briefcase" },
    { name: "Travel English", description: "Essential phrases and vocabulary for traveling the world confidently.", slug: "travel-english", category: "travel", cefrLevel: "A2", totalLessons: 30, estimatedHours: 15, icon: "Plane" },
    { name: "Academic English", description: "Writing papers, giving presentations, and academic discussions.", slug: "academic-english", category: "academic", cefrLevel: "B2", totalLessons: 45, estimatedHours: 35, icon: "GraduationCap" },
    { name: "IELTS Preparation", description: "Complete preparation for all IELTS sections with practice tests.", slug: "ielts", category: "ielts", cefrLevel: "B1", totalLessons: 60, estimatedHours: 40, icon: "Award" },
    { name: "TOEFL Preparation", description: "Strategies and practice for the TOEFL iBT exam.", slug: "toefl", category: "toefl", cefrLevel: "B1", totalLessons: 55, estimatedHours: 38, icon: "BookOpen" },
  ]);
  console.log("Learning paths seeded.");

  // Seed Lessons
  await db.insert(lessons).values([
    // A1 Grammar Lessons
    { title: "Introductions & Greetings", description: "Learn to introduce yourself and greet others.", cefrLevel: "A1", category: "grammar", subcategory: "basics", duration: 10, order: 1, xpReward: 15, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "How do you say 'Hello' formally?", options: ["Hi!", "Hey!", "Good morning", "Yo!"], correct: 2 }] }) },
    { title: "The Verb 'To Be'", description: "Master the most important verb in English.", cefrLevel: "A1", category: "grammar", subcategory: "verbs", duration: 12, order: 2, xpReward: 15, content: JSON.stringify({ questions: [{ type: "fill_blank", question: "I ___ a student.", answer: "am" }] }) },
    { title: "Present Simple", description: "Talk about habits, facts, and routines.", cefrLevel: "A1", category: "grammar", subcategory: "tenses", duration: 15, order: 3, xpReward: 20, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "She ___ to school every day.", options: ["go", "goes", "going", "gone"], correct: 1 }] }) },
    { title: "Numbers & Counting", description: "Learn to count and use numbers in everyday situations.", cefrLevel: "A1", category: "vocabulary", subcategory: "numbers", duration: 8, order: 4, xpReward: 10, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "What is 25 in English?", options: ["Twenty-five", "Twelve-five", "Two-five", "Twenty-fifth"], correct: 0 }] }) },
    // A2 Lessons
    { title: "Past Simple", description: "Talk about completed actions in the past.", cefrLevel: "A2", category: "grammar", subcategory: "tenses", duration: 15, order: 5, xpReward: 20, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "I ___ to the cinema yesterday.", options: ["go", "went", "gone", "going"], correct: 1 }] }) },
    { title: "Ordering at a Restaurant", description: "Practice food vocabulary and polite requests.", cefrLevel: "A2", category: "conversation", subcategory: "dining", duration: 12, order: 6, xpReward: 15, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "'I'd like the steak, please.' is:", options: ["Too direct", "Polite", "Rude", "Informal"], correct: 1 }] }) },
    { title: "Asking for Directions", description: "Navigate cities with confidence using location vocabulary.", cefrLevel: "A2", category: "vocabulary", subcategory: "travel", duration: 10, order: 7, xpReward: 15, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "Turn left at the ___.", options: ["library", "apple", "blue", "run"], correct: 0 }] }) },
    // B1 Lessons
    { title: "Present Perfect", description: "Connect past actions to the present moment.", cefrLevel: "B1", category: "grammar", subcategory: "tenses", duration: 18, order: 8, xpReward: 25, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "I have never ___ sushi.", options: ["eat", "ate", "eaten", "eating"], correct: 2 }] }) },
    { title: "Business Email Writing", description: "Write professional emails with proper structure.", cefrLevel: "B1", category: "writing", subcategory: "business", duration: 20, order: 9, xpReward: 25, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "How should you start a formal email?", options: ["Hey!", "Hi there!", "Dear Mr. Smith,", "What's up?"], correct: 2 }] }) },
    { title: "Conditional Type 1", description: "Talk about real possibilities in the future.", cefrLevel: "B1", category: "grammar", subcategory: "conditionals", duration: 15, order: 10, xpReward: 20, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "If it rains, I ___ at home.", options: ["stay", "will stay", "would stay", "stayed"], correct: 1 }] }) },
    { title: "Describing Personality", description: "Use advanced adjectives to describe people.", cefrLevel: "B1", category: "vocabulary", subcategory: "descriptions", duration: 12, order: 11, xpReward: 15, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "Someone who always helps others is ___.", options: ["selfish", "generous", "lazy", "shy"], correct: 1 }] }) },
    // B2 Lessons
    { title: "Conditional Type 2 & 3", description: "Discuss hypothetical and unreal past situations.", cefrLevel: "B2", category: "grammar", subcategory: "conditionals", duration: 20, order: 12, xpReward: 30, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "If I had known, I ___ differently.", options: ["will act", "would act", "would have acted", "act"], correct: 2 }] }) },
    { title: "Reported Speech", description: "Report what others have said accurately.", cefrLevel: "B2", category: "grammar", subcategory: "reported_speech", duration: 18, order: 13, xpReward: 25, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "'I am tired,' she said. → She said she ___ tired.", options: ["is", "was", "were", "be"], correct: 1 }] }) },
    { title: "Academic Writing", description: "Structure essays and use formal academic language.", cefrLevel: "B2", category: "writing", subcategory: "academic", duration: 25, order: 14, xpReward: 30, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "Which is most formal?", options: ["I think that...", "In my opinion...", "It is evident that...", "I believe that..."], correct: 2 }] }) },
    // C1 Lessons
    { title: "Subjunctive Mood", description: "Express wishes, suggestions, and hypothetical scenarios.", cefrLevel: "C1", category: "grammar", subcategory: "advanced_grammar", duration: 20, order: 15, xpReward: 35, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "I suggest that he ___ early.", options: ["arrives", "arrive", "arrived", "arriving"], correct: 1 }] }) },
    { title: "Idioms & Expressions", description: "Master native-level idiomatic expressions.", cefrLevel: "C1", category: "vocabulary", subcategory: "idioms", duration: 15, order: 16, xpReward: 25, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "'It's raining cats and dogs' means:", options: ["Animals are falling", "It's raining heavily", "It's a strange day", "Pets are outside"], correct: 1 }] }) },
    // C2 Lessons
    { title: "Nuanced Communication", description: "Express subtle meanings and diplomatic language.", cefrLevel: "C2", category: "conversation", subcategory: "advanced", duration: 20, order: 17, xpReward: 40, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "'With respect, I must disagree' is:", options: ["Rude", "Polite disagreement", "Confused", "Angry"], correct: 1 }] }) },
    { title: "Literary Analysis", description: "Analyze and discuss literature in depth.", cefrLevel: "C2", category: "reading", subcategory: "literature", duration: 30, order: 18, xpReward: 40, content: JSON.stringify({ questions: [{ type: "multiple_choice", question: "A metaphor is:", options: ["A direct comparison using 'like'", "An implied comparison without 'like'", "A type of simile", "A literal statement"], correct: 1 }] }) },
  ]);
  console.log("Lessons seeded.");

  // Seed Vocabulary
  await db.insert(vocabulary).values([
    { word: "hello", definition: "Used as a greeting or to begin a conversation.", phonetic: "/həˈloʊ/", partOfSpeech: "exclamation", exampleSentence: "Hello, how are you today?", exampleTranslation: "你好，你今天怎么样？", synonyms: "hi, hey, greetings", antonyms: "goodbye, farewell", cefrLevel: "A1", category: "basics" },
    { word: "apple", definition: "A round fruit with red, green, or yellow skin.", phonetic: "/ˈæp.əl/", partOfSpeech: "noun", exampleSentence: "I eat an apple every day.", exampleTranslation: "我每天吃一个苹果。", synonyms: "fruit", cefrLevel: "A1", category: "food" },
    { word: "beautiful", definition: "Pleasing the senses or mind aesthetically.", phonetic: "/ˈbjuː.t̬ə.fəl/", partOfSpeech: "adjective", exampleSentence: "The sunset was beautiful.", exampleTranslation: "日落很美。", synonyms: "pretty, lovely, gorgeous", antonyms: "ugly, unattractive", cefrLevel: "A2", category: "descriptions" },
    { word: "conversation", definition: "A talk between two or more people.", phonetic: "/ˌkɑːn.vɚˈseɪ.ʃən/", partOfSpeech: "noun", exampleSentence: "We had an interesting conversation.", exampleTranslation: "我们进行了一次有趣的对话。", synonyms: "discussion, dialogue, chat", cefrLevel: "A2", category: "communication" },
    { word: "however", definition: "Used to introduce a statement that contrasts with something.", phonetic: "/haʊˈev.ɚ/", partOfSpeech: "adverb", exampleSentence: "It was raining; however, we went out.", exampleTranslation: "天在下雨，然而我们还是出去了。", synonyms: "nevertheless, yet, still", cefrLevel: "B1", category: "connectors" },
    { word: "significant", definition: "Sufficiently great or important to be worthy of attention.", phonetic: "/sɪɡˈnɪf.ə.kənt/", partOfSpeech: "adjective", exampleSentence: "There has been a significant improvement.", exampleTranslation: "已经有了显著的改善。", synonyms: "important, notable, considerable", antonyms: "insignificant, minor", cefrLevel: "B1", category: "academic" },
    { word: "controversial", definition: "Giving rise or likely to give rise to public disagreement.", phonetic: "/ˌkɑːn.trəˈvɝː.ʃəl/", partOfSpeech: "adjective", exampleSentence: "The decision was highly controversial.", exampleTranslation: "这个决定极具争议性。", synonyms: "contentious, debatable, disputed", antonyms: "uncontroversial, accepted", cefrLevel: "B2", category: "academic" },
    { word: "implementation", definition: "The process of putting a decision or plan into effect.", phonetic: "/ˌɪm.plə.menˈteɪ.ʃən/", partOfSpeech: "noun", exampleSentence: "The implementation of the new system was successful.", exampleTranslation: "新系统的实施很成功。", synonyms: "execution, application, enactment", cefrLevel: "B2", category: "business" },
    { word: "ubiquitous", definition: "Present, appearing, or found everywhere.", phonetic: "/juːˈbɪk.wə.t̬əs/", partOfSpeech: "adjective", exampleSentence: "Smartphones have become ubiquitous.", exampleTranslation: "智能手机已经变得无处不在。", synonyms: "omnipresent, pervasive, universal", antonyms: "rare, scarce", cefrLevel: "C1", category: "academic" },
    { word: "ephemeral", definition: "Lasting for a very short time.", phonetic: "/ɪˈfem.ər.əl/", partOfSpeech: "adjective", exampleSentence: "Fame can be ephemeral.", exampleTranslation: "名声可能是短暂的。", synonyms: "transient, fleeting, temporary", antonyms: "permanent, eternal, lasting", cefrLevel: "C2", category: "literature" },
  ]);
  console.log("Vocabulary seeded.");

  // Seed Grammar Lessons
  await db.insert(grammarLessons).values([
    { title: "Articles (a, an, the)", description: "Learn when to use definite and indefinite articles.", cefrLevel: "A1", topic: "articles", explanation: "Use 'a' before consonant sounds, 'an' before vowel sounds. Use 'the' when referring to something specific.", examples: JSON.stringify([{ sentence: "I saw a cat.", explanation: "First mention, any cat" }, { sentence: "The cat was black.", explanation: "Now we know which cat" }]), exercises: JSON.stringify([{ question: "___ apple a day keeps the doctor away.", answer: "An", type: "fill_blank" }]), order: 1, xpReward: 10 },
    { title: "Plural Nouns", description: "Form plurals correctly in English.", cefrLevel: "A1", topic: "nouns", explanation: "Add -s to most nouns. Add -es to nouns ending in -s, -sh, -ch, -x, -z, -o.", examples: JSON.stringify([{ sentence: "one book → two books", explanation: "Regular plural" }, { sentence: "one box → two boxes", explanation: "Add -es" }]), exercises: JSON.stringify([{ question: "one child → two ___", answer: "children", type: "fill_blank" }]), order: 2, xpReward: 10 },
    { title: "Comparative Adjectives", description: "Compare things using adjectives.", cefrLevel: "A2", topic: "adjectives", explanation: "Short adjectives: add -er. Long adjectives: use 'more'. Some are irregular.", examples: JSON.stringify([{ sentence: "tall → taller", explanation: "Short adjective" }, { sentence: "beautiful → more beautiful", explanation: "Long adjective" }]), exercises: JSON.stringify([{ question: "This book is ___ (interesting) than that one.", answer: "more interesting", type: "fill_blank" }]), order: 3, xpReward: 15 },
    { title: "Modal Verbs (can, could, may, might)", description: "Express ability, possibility, and permission.", cefrLevel: "B1", topic: "modals", explanation: "Can/could = ability. May/might = possibility. Could/May = permission (formal).", examples: JSON.stringify([{ sentence: "I can swim.", explanation: "Ability" }, { sentence: "It might rain tomorrow.", explanation: "Possibility" }]), exercises: JSON.stringify([{ question: "___ I borrow your pen? (permission)", answer: "May/Could/Can", type: "fill_blank" }]), order: 4, xpReward: 20 },
    { title: "Passive Voice", description: "Focus on the action rather than the doer.", cefrLevel: "B1", topic: "passive", explanation: "Form: be + past participle. Use when the doer is unknown or unimportant.", examples: JSON.stringify([{ sentence: "The cake was eaten.", explanation: "Unknown doer" }, { sentence: "English is spoken worldwide.", explanation: "General truth" }]), exercises: JSON.stringify([{ question: "Someone stole my bike. → My bike ___ ___.", answer: "was stolen", type: "fill_blank" }]), order: 5, xpReward: 25 },
    { title: "Phrasal Verbs", description: "Understand two-word verbs common in English.", cefrLevel: "B2", topic: "phrasal_verbs", explanation: "Verb + particle(s). Often have idiomatic meanings different from the individual words.", examples: JSON.stringify([{ sentence: "I need to look up the word.", explanation: "search for" }, { sentence: "She gave up smoking.", explanation: "quit" }]), exercises: JSON.stringify([{ question: "Don't ___ ___ without saying goodbye. (leave)", answer: "go off", type: "fill_blank" }]), order: 6, xpReward: 25 },
    { title: "Inversion", description: "Use inverted word order for emphasis and formal writing.", cefrLevel: "C1", topic: "inversion", explanation: "After negative adverbs (never, rarely, seldom, hardly), invert subject and auxiliary verb.", examples: JSON.stringify([{ sentence: "Never have I seen such beauty.", explanation: "Inversion after 'Never'" }, { sentence: "Rarely does he complain.", explanation: "Inversion after 'Rarely'" }]), exercises: JSON.stringify([{ question: "She had never ___ (be) so happy. → Never ___ she ___ so happy.", answer: "been, had, been", type: "fill_blank" }]), order: 7, xpReward: 30 },
  ]);
  console.log("Grammar lessons seeded.");

  // Seed Achievements
  await db.insert(achievements).values([
    { name: "First Steps", description: "Complete your first lesson.", icon: "Footprints", category: "lessons", requirement: 1, xpReward: 10 },
    { name: "Week Warrior", description: "Complete a 7-day streak.", icon: "Flame", category: "streak", requirement: 7, xpReward: 50 },
    { name: "Month Master", description: "Complete a 30-day streak.", icon: "Calendar", category: "streak", requirement: 30, xpReward: 200 },
    { name: "Century Club", description: "Earn 100 XP in a single day.", icon: "Zap", category: "xp", requirement: 100, xpReward: 25 },
    { name: "Vocabulary Builder", description: "Learn 50 new words.", icon: "BookOpen", category: "vocabulary", requirement: 50, xpReward: 100 },
    { name: "Word Collector", description: "Learn 200 new words.", icon: "Library", category: "vocabulary", requirement: 200, xpReward: 300 },
    { name: "Grammar Guru", description: "Complete 20 grammar lessons.", icon: "Pencil", category: "grammar", requirement: 20, xpReward: 150 },
    { name: "Speaking Star", description: "Complete 10 speaking exercises.", icon: "Mic", category: "speaking", requirement: 10, xpReward: 75 },
    { name: "Perfectionist", description: "Get 100% on any lesson.", icon: "Target", category: "lessons", requirement: 1, xpReward: 50 },
    { name: "Early Bird", description: "Complete a lesson before 8 AM.", icon: "Sunrise", category: "special", requirement: 1, xpReward: 20 },
    { name: "Night Owl", description: "Complete a lesson after 10 PM.", icon: "Moon", category: "special", requirement: 1, xpReward: 20 },
    { name: "Pathfinder", description: "Complete your first learning path.", icon: "Route", category: "lessons", requirement: 1, xpReward: 200 },
  ]);
  console.log("Achievements seeded.");

  // Seed Shadowing Sessions
  await db.insert(shadowingSessions).values([
    { title: "Daily Greetings", transcript: "Good morning! How are you doing today? I'm doing well, thank you. The weather is beautiful outside, isn't it? Yes, it's a perfect day for a walk.", cefrLevel: "A1", category: "daily_life", duration: 45 },
    { title: "At the Coffee Shop", transcript: "Hi, welcome to our café! What can I get for you today? I'd like a medium latte, please. Would you like any pastries with that? No, thank you. Just the latte. That'll be four fifty. Here you go. Thank you! Your order will be ready in a few minutes.", cefrLevel: "A2", category: "dining", duration: 60 },
    { title: "Job Interview Introduction", transcript: "Thank you for coming in today. Could you tell me a little about yourself? Of course. I graduated with a degree in Marketing three years ago, and since then I've been working at a digital agency where I've managed several successful campaigns. That sounds impressive. What would you say is your greatest strength? I believe my greatest strength is my ability to analyze data and turn insights into actionable strategies.", cefrLevel: "B1", category: "business", duration: 75 },
    { title: "Academic Presentation", transcript: "Today I'd like to present my research on renewable energy solutions. Over the past decade, solar power has become increasingly cost-effective, making it a viable alternative to fossil fuels. My study examines three key factors: efficiency, scalability, and economic impact. The results show that with proper government incentives, solar adoption could increase by forty percent within five years. I'd be happy to take any questions at the end of this presentation.", cefrLevel: "B2", category: "academic", duration: 90 },
    { title: "Debate on Technology", transcript: "While I acknowledge the conveniences that artificial intelligence brings to our daily lives, I must argue that unregulated development poses significant ethical challenges. Privacy concerns, job displacement, and algorithmic bias are not merely theoretical issues — they affect millions of people today. We need comprehensive frameworks that balance innovation with social responsibility. Technology should serve humanity, not the other way around.", cefrLevel: "C1", category: "debate", duration: 80 },
  ]);
  console.log("Shadowing sessions seeded.");

  // Seed Mock Exams
  await db.insert(mockExams).values([
    { name: "IELTS Listening Practice 1", examType: "ielts", description: "Practice IELTS-style listening comprehension with 4 sections.", duration: 30, totalQuestions: 40, cefrLevel: "B2", questions: JSON.stringify([{ type: "multiple_choice", section: 1, question: "What time does the library open on Saturdays?", options: ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"], correct: 1 }]) },
    { name: "TOEFL Reading Practice 1", examType: "toefl", description: "Academic reading comprehension practice.", duration: 20, totalQuestions: 14, cefrLevel: "B2", questions: JSON.stringify([{ type: "reading_comprehension", passage: "The Industrial Revolution marked a major turning point in history...", question: "What was the main effect of the Industrial Revolution?", options: ["Decreased urbanization", "Increased agricultural output", "Fundamental economic change", "Decline in trade"], correct: 2 }]) },
    { name: "General English Assessment", examType: "general", description: "Mixed-skill assessment for intermediate learners.", duration: 45, totalQuestions: 30, cefrLevel: "B1", questions: JSON.stringify([{ type: "multiple_choice", question: "Choose the correct form: By this time next year, I ___ my degree.", options: ["will finish", "will have finished", "am going to finish", "finish"], correct: 1 }]) },
  ]);
  console.log("Mock exams seeded.");

  console.log("All seed data inserted successfully!");
}

seed().catch(console.error);
