"""
arabic_words.py
200 Arabic words with English translations for the HLR vocabulary project.
Each entry: (arabic, transliteration, english, category)
"""

ARABIC_VOCABULARY = [
    # Greetings & Basic Expressions (10)
    ("مرحبا",     "marhaban",       "hello",            "greetings"),
    ("السلام عليكم","assalamu alaykum","peace be upon you","greetings"),
    ("شكرا",      "shukran",        "thank you",        "greetings"),
    ("عفوا",      "afwan",          "you're welcome",   "greetings"),
    ("من فضلك",   "min fadlak",     "please",           "greetings"),
    ("نعم",       "na'am",          "yes",              "greetings"),
    ("لا",        "la",             "no",               "greetings"),
    ("مع السلامة","ma'a ssalama",   "goodbye",          "greetings"),
    ("صباح الخير","sabah al-khayr", "good morning",     "greetings"),
    ("مساء الخير","masa' al-khayr", "good evening",     "greetings"),

    # Numbers (15)
    ("واحد",      "wahid",          "one",              "numbers"),
    ("اثنان",     "ithnan",         "two",              "numbers"),
    ("ثلاثة",     "thalatha",       "three",            "numbers"),
    ("أربعة",     "arba'a",         "four",             "numbers"),
    ("خمسة",      "khamsa",         "five",             "numbers"),
    ("ستة",       "sitta",          "six",              "numbers"),
    ("سبعة",      "sab'a",          "seven",            "numbers"),
    ("ثمانية",    "thamaniya",      "eight",            "numbers"),
    ("تسعة",      "tis'a",          "nine",             "numbers"),
    ("عشرة",      "ashara",         "ten",              "numbers"),
    ("عشرون",     "ishrun",         "twenty",           "numbers"),
    ("ثلاثون",    "thalathun",      "thirty",           "numbers"),
    ("مئة",       "mi'a",           "hundred",          "numbers"),
    ("ألف",       "alf",            "thousand",         "numbers"),
    ("صفر",       "sifr",           "zero",             "numbers"),

    # Colors (10)
    ("أحمر",      "ahmar",          "red",              "colors"),
    ("أزرق",      "azraq",          "blue",             "colors"),
    ("أخضر",      "akhdar",         "green",            "colors"),
    ("أصفر",      "asfar",          "yellow",           "colors"),
    ("أبيض",      "abyad",          "white",            "colors"),
    ("أسود",      "aswad",          "black",            "colors"),
    ("بنفسجي",    "banafsaji",      "purple",           "colors"),
    ("برتقالي",   "burtuqali",      "orange",           "colors"),
    ("وردي",      "wardi",          "pink",             "colors"),
    ("بني",       "bunni",          "brown",            "colors"),

    # Family (10)
    ("أب",        "ab",             "father",           "family"),
    ("أم",        "umm",            "mother",           "family"),
    ("أخ",        "akh",            "brother",          "family"),
    ("أخت",       "ukht",           "sister",           "family"),
    ("ابن",       "ibn",            "son",              "family"),
    ("بنت",       "bint",           "daughter",         "family"),
    ("جد",        "jadd",           "grandfather",      "family"),
    ("جدة",       "jadda",          "grandmother",      "family"),
    ("عم",        "amm",            "paternal uncle",   "family"),
    ("خال",       "khal",           "maternal uncle",   "family"),

    # Body Parts (10)
    ("رأس",       "ra's",           "head",             "body"),
    ("عين",       "ayn",            "eye",              "body"),
    ("أذن",       "udhn",           "ear",              "body"),
    ("أنف",       "anf",            "nose",             "body"),
    ("فم",        "famm",           "mouth",            "body"),
    ("يد",        "yad",            "hand",             "body"),
    ("رجل",       "rijl",           "leg/foot",         "body"),
    ("قلب",       "qalb",           "heart",            "body"),
    ("ظهر",       "dahr",           "back",             "body"),
    ("بطن",       "batn",           "stomach",          "body"),

    # Food & Drink (15)
    ("ماء",       "ma'",            "water",            "food"),
    ("خبز",       "khubz",          "bread",            "food"),
    ("أرز",       "aruzz",          "rice",             "food"),
    ("لحم",       "lahm",           "meat",             "food"),
    ("سمك",       "samak",          "fish",             "food"),
    ("دجاج",      "dajaj",          "chicken",          "food"),
    ("تفاح",      "tuffah",         "apple",            "food"),
    ("موز",       "mawz",           "banana",           "food"),
    ("حليب",      "halib",          "milk",             "food"),
    ("قهوة",      "qahwa",          "coffee",           "food"),
    ("شاي",       "shay",           "tea",              "food"),
    ("عصير",      "asir",           "juice",            "food"),
    ("بيضة",      "bayda",          "egg",              "food"),
    ("جبن",       "jubn",           "cheese",           "food"),
    ("سكر",       "sukkar",         "sugar",            "food"),

    # Days & Time (10)
    ("يوم",       "yawm",           "day",              "time"),
    ("أسبوع",     "usbu'",          "week",             "time"),
    ("شهر",       "shahr",          "month",            "time"),
    ("سنة",       "sana",           "year",             "time"),
    ("ساعة",      "sa'a",           "hour",             "time"),
    ("الآن",      "al-an",          "now",              "time"),
    ("اليوم",     "al-yawm",        "today",            "time"),
    ("غدا",       "ghadan",         "tomorrow",         "time"),
    ("أمس",       "ams",            "yesterday",        "time"),
    ("ليل",       "layl",           "night",            "time"),

    # Weather & Nature (10)
    ("شمس",       "shams",          "sun",              "nature"),
    ("قمر",       "qamar",          "moon",             "nature"),
    ("نجم",       "najm",           "star",             "nature"),
    ("مطر",       "matar",          "rain",             "nature"),
    ("ثلج",       "thalj",          "snow",             "nature"),
    ("ريح",       "rih",            "wind",             "nature"),
    ("بحر",       "bahr",           "sea",              "nature"),
    ("جبل",       "jabal",          "mountain",         "nature"),
    ("نهر",       "nahr",           "river",            "nature"),
    ("شجرة",      "shajara",        "tree",             "nature"),

    # Home & Places (15)
    ("بيت",       "bayt",           "house",            "places"),
    ("غرفة",      "ghurfa",         "room",             "places"),
    ("مطبخ",      "matbakh",        "kitchen",          "places"),
    ("حمام",      "hammam",         "bathroom",         "places"),
    ("باب",       "bab",            "door",             "places"),
    ("نافذة",     "nafidha",        "window",           "places"),
    ("مدرسة",     "madrasa",        "school",           "places"),
    ("مستشفى",    "mustashfa",      "hospital",         "places"),
    ("سوق",       "suq",            "market",           "places"),
    ("مسجد",      "masjid",         "mosque",           "places"),
    ("مطار",      "matar",          "airport",          "places"),
    ("شارع",      "shari'",         "street",           "places"),
    ("مدينة",     "madina",         "city",             "places"),
    ("قرية",      "qarya",          "village",          "places"),
    ("فندق",      "funduq",         "hotel",            "places"),

    # Common Verbs (20)
    ("ذهب",       "dhahaba",        "to go",            "verbs"),
    ("جاء",       "ja'a",           "to come",          "verbs"),
    ("أكل",       "akala",          "to eat",           "verbs"),
    ("شرب",       "shariba",        "to drink",         "verbs"),
    ("نام",       "nama",           "to sleep",         "verbs"),
    ("قرأ",       "qara'a",         "to read",          "verbs"),
    ("كتب",       "kataba",         "to write",         "verbs"),
    ("تكلم",      "takallama",      "to speak",         "verbs"),
    ("سمع",       "sami'a",         "to hear",          "verbs"),
    ("رأى",       "ra'a",           "to see",           "verbs"),
    ("عرف",       "arafa",          "to know",          "verbs"),
    ("أحب",       "ahabba",         "to love",          "verbs"),
    ("فهم",       "fahima",         "to understand",    "verbs"),
    ("فعل",       "fa'ala",         "to do",            "verbs"),
    ("أخذ",       "akhadha",        "to take",          "verbs"),
    ("أعطى",      "a'ta",           "to give",          "verbs"),
    ("فتح",       "fataha",         "to open",          "verbs"),
    ("أغلق",      "aghlaqa",        "to close",         "verbs"),
    ("جلس",       "jalasa",         "to sit",           "verbs"),
    ("وقف",       "waqafa",         "to stand",         "verbs"),

    # Adjectives (15)
    ("كبير",      "kabir",          "big",              "adjectives"),
    ("صغير",      "saghir",         "small",            "adjectives"),
    ("جديد",      "jadid",          "new",              "adjectives"),
    ("قديم",      "qadim",          "old",              "adjectives"),
    ("جميل",      "jamil",          "beautiful",        "adjectives"),
    ("سريع",      "sari'",          "fast",             "adjectives"),
    ("بطيء",      "bati'",          "slow",             "adjectives"),
    ("قريب",      "qarib",          "near",             "adjectives"),
    ("بعيد",      "ba'id",          "far",              "adjectives"),
    ("غالي",      "ghali",          "expensive",        "adjectives"),
    ("رخيص",      "rakhis",         "cheap",            "adjectives"),
    ("ذكي",       "dhaki",          "smart",            "adjectives"),
    ("طويل",      "tawil",          "tall/long",        "adjectives"),
    ("قصير",      "qasir",          "short",            "adjectives"),
    ("ثقيل",      "thaqil",         "heavy",            "adjectives"),

    # Questions & Pronouns (10)
    ("من",        "man",            "who",              "questions"),
    ("ما",        "ma",             "what",             "questions"),
    ("أين",       "ayna",           "where",            "questions"),
    ("متى",       "mata",           "when",             "questions"),
    ("كيف",       "kayfa",          "how",              "questions"),
    ("لماذا",     "limadha",        "why",              "questions"),
    ("كم",        "kam",            "how many/much",    "questions"),
    ("أنا",       "ana",            "I/me",             "questions"),
    ("أنت",       "anta",           "you (masc.)",      "questions"),
    ("هو",        "huwa",           "he",               "questions"),

    # Transportation (10)
    ("سيارة",     "sayyara",        "car",              "transport"),
    ("حافلة",     "hafila",         "bus",              "transport"),
    ("قطار",      "qitar",          "train",            "transport"),
    ("طائرة",     "ta'ira",         "airplane",         "transport"),
    ("سفينة",     "safina",         "ship",             "transport"),
    ("دراجة",     "darraja",        "bicycle",          "transport"),
    ("تاكسي",     "taksi",          "taxi",             "transport"),
    ("طريق",      "tariq",          "road",             "transport"),
    ("جسر",       "jisr",           "bridge",           "transport"),
    ("محطة",      "mahatta",        "station",          "transport"),

    # Education & Work (10)
    ("كتاب",      "kitab",          "book",             "education"),
    ("قلم",       "qalam",          "pen",              "education"),
    ("درس",       "dars",           "lesson",           "education"),
    ("امتحان",    "imtihan",        "exam",             "education"),
    ("معلم",      "mu'allim",       "teacher",          "education"),
    ("طالب",      "talib",          "student",          "education"),
    ("مكتب",      "maktab",         "office/desk",      "education"),
    ("عمل",       "amal",           "work",             "education"),
    ("وظيفة",     "wazifa",         "job",              "education"),
    ("مهندس",     "muhandis",       "engineer",         "education"),

    # Health (10)
    ("صحة",       "sihha",          "health",           "health"),
    ("مريض",      "marid",          "sick",             "health"),
    ("دواء",      "dawa'",          "medicine",         "health"),
    ("طبيب",      "tabib",          "doctor",           "health"),
    ("ألم",       "alam",           "pain",             "health"),
    ("حمى",       "humma",          "fever",            "health"),
    ("جرح",       "jurh",           "wound",            "health"),
    ("صداع",      "suda'",          "headache",         "health"),
    ("نوم",       "nawm",           "sleep",            "health"),
    ("راحة",      "raha",           "rest",             "health"),

    # Technology & Modern (10)
    ("هاتف",      "hatif",          "phone",            "technology"),
    ("حاسوب",     "hasub",          "computer",         "technology"),
    ("إنترنت",    "internet",       "internet",         "technology"),
    ("برنامج",    "barnmaj",        "program/software", "technology"),
    ("شاشة",      "shasha",         "screen",           "technology"),
    ("كاميرا",    "kamira",         "camera",           "technology"),
    ("كهرباء",    "kahrabaa",       "electricity",      "technology"),
    ("بطارية",    "battariya",      "battery",          "technology"),
    ("شبكة",      "shabaka",        "network",          "technology"),
    ("رسالة",     "risala",         "message",          "technology"),

    # Clothes & Appearance (10)
    ("قميص",      "qamis",          "shirt",            "clothes"),
    ("بنطال",     "bintal",         "trousers",         "clothes"),
    ("حذاء",      "hidha'",         "shoe",             "clothes"),
    ("ثوب",       "thawb",          "robe/dress",       "clothes"),
    ("حجاب",      "hijab",          "hijab",            "clothes"),
    ("معطف",      "mi'taf",         "coat",             "clothes"),
    ("نظارة",     "nadhdara",       "glasses",          "clothes"),
    ("خاتم",      "khatim",         "ring",             "clothes"),
    ("ساعة يد",   "sa'at yad",      "wristwatch",       "clothes"),
    ("شعر",       "sha'r",          "hair",             "clothes"),

    # Animals (10)
    ("كلب",       "kalb",           "dog",              "animals"),
    ("قطة",       "qitta",          "cat",              "animals"),
    ("حصان",      "hisan",          "horse",            "animals"),
    ("أسد",       "asad",           "lion",             "animals"),
    ("فيل",       "fil",            "elephant",         "animals"),
    ("طير",       "tayr",           "bird",             "animals"),
    ("سمكة",      "samaka",         "fish (single)",    "animals"),
    ("جمل",       "jamal",          "camel",            "animals"),
    ("ثعلب",      "tha'lab",        "fox",              "animals"),
    ("أرنب",      "arnab",          "rabbit",           "animals"),

    # Abstract / Important (10)
    ("حب",        "hubb",           "love",             "abstract"),
    ("سلام",      "salam",          "peace",            "abstract"),
    ("حرية",      "hurriya",        "freedom",          "abstract"),
    ("علم",       "ilm",            "knowledge/science","abstract"),
    ("حق",        "haqq",           "right/truth",      "abstract"),
    ("وقت",       "waqt",           "time",             "abstract"),
    ("مال",       "mal",            "money",            "abstract"),
    ("خير",       "khayr",          "goodness",         "abstract"),
    ("دين",       "din",            "religion",         "abstract"),
    ("عالم",      "alam",           "world",            "abstract"),
]

def get_word_by_arabic(arabic):
    for w in ARABIC_VOCABULARY:
        if w[0] == arabic:
            return w
    return None

def get_words_by_category(category):
    return [w for w in ARABIC_VOCABULARY if w[3] == category]

CATEGORIES = list(set(w[3] for w in ARABIC_VOCABULARY))
