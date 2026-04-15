-- ============================================================
-- Seed Data: Quick Decision Game — Bilingual Question Bank
-- Description: 560+ trivia questions in English and Turkish
-- Categories: Animals, Science, History, Geography, Sports,
--             Pop Culture, Technology, Food
-- ============================================================

-- ============================================================
-- ANIMALS — English (40 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('How many hearts does an octopus have?', '3', '2', 'easy', 'en'),
  ('Which land animal physically cannot jump?', 'Elephant', 'Hippo', 'easy', 'en'),
  ('A group of flamingos is called a what?', 'Flamboyance', 'Colony', 'medium', 'en'),
  ('Which animal produces cube-shaped droppings?', 'Wombat', 'Platypus', 'medium', 'en'),
  ('Where is a shrimp''s heart located?', 'In its head', 'Near its tail', 'easy', 'en'),
  ('How long can a snail sleep continuously?', '3 years', '3 months', 'medium', 'en'),
  ('Which bird is the only one that can fly backwards?', 'Hummingbird', 'Swallow', 'easy', 'en'),
  ('A group of crows is called a what?', 'Murder', 'Flock', 'medium', 'en'),
  ('How many noses does a slug have?', '4', '2', 'hard', 'en'),
  ('Which mammal can truly fly (not just glide)?', 'Bat', 'Flying squirrel', 'easy', 'en'),
  ('What animal has the highest blood pressure?', 'Giraffe', 'Elephant', 'medium', 'en'),
  ('Koala fingerprints can confuse whom?', 'Forensic investigators', 'Veterinarians', 'medium', 'en'),
  ('How many brains does a leech have?', '32', '12', 'hard', 'en'),
  ('Which sea creature has blue blood?', 'Horseshoe crab', 'Blue whale', 'medium', 'en'),
  ('A rhinoceros horn is made of what material?', 'Keratin (like hair)', 'Bone', 'medium', 'en'),
  ('Which animal never sleeps?', 'Bullfrog', 'Dolphin', 'hard', 'en'),
  ('How many eyes does a bee have?', '5', '2', 'medium', 'en'),
  ('What is the only animal born with horns?', 'Giraffe', 'Rhino', 'hard', 'en'),
  ('Which animal has the longest pregnancy?', 'Elephant (22 months)', 'Blue whale (12 months)', 'medium', 'en'),
  ('A starfish can regenerate what?', 'Its entire body from one arm', 'Only its arms', 'hard', 'en'),
  ('What percentage of a cat''s life is spent sleeping?', '70%', '40%', 'easy', 'en'),
  ('Which animal''s milk is naturally pink?', 'Hippo', 'Flamingo', 'hard', 'en'),
  ('How many stomachs does a cow have?', '4', '3', 'easy', 'en'),
  ('Which insect can survive without its head for weeks?', 'Cockroach', 'Ant', 'easy', 'en'),
  ('A group of owls is called a what?', 'Parliament', 'Council', 'medium', 'en'),
  ('Which animal has the most legs?', 'Millipede (750 legs)', 'Centipede (354 legs)', 'medium', 'en'),
  ('The tongue of a blue whale weighs as much as what?', 'An elephant', 'A horse', 'hard', 'en'),
  ('Which bird has the largest wingspan?', 'Wandering albatross', 'Andean condor', 'medium', 'en'),
  ('How far can a flea jump relative to its body size?', '150 times its length', '50 times its length', 'hard', 'en'),
  ('Dolphins sleep with how many eyes open?', 'One', 'Both closed', 'easy', 'en'),
  ('Which animal cannot stick out its tongue?', 'Crocodile', 'Alligator', 'medium', 'en'),
  ('A group of jellyfish is called a what?', 'Smack', 'Swarm', 'hard', 'en'),
  ('Which animal''s stripes are on its skin, not just fur?', 'Tiger', 'Zebra', 'medium', 'en'),
  ('How many teeth does a snail have?', 'About 25,000', 'About 200', 'hard', 'en'),
  ('Which insect can lift 50 times its body weight?', 'Ant', 'Beetle', 'easy', 'en'),
  ('An ostrich''s eye is bigger than its what?', 'Brain', 'Heart', 'easy', 'en'),
  ('Which sea creature has three hearts and blue blood?', 'Octopus', 'Squid', 'medium', 'en'),
  ('Butterflies taste food with which body part?', 'Their feet', 'Their antennae', 'easy', 'en'),
  ('How many compartments does a dolphin''s stomach have?', '3', '1', 'hard', 'en'),
  ('Which animal can rotate its head almost 270 degrees?', 'Owl', 'Chameleon', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Animals'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ANIMALS — Turkish (40 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Bir ahtapotun kaç tane kalbi vardır?', '3', '2', 'easy', 'tr'),
  ('Hangi kara hayvanı fiziksel olarak zıplayamaz?', 'Fil', 'Suaygırı', 'easy', 'tr'),
  ('Salyangoz kesintisiz kaç yıl uyuyabilir?', '3 yıl', '3 ay', 'medium', 'tr'),
  ('Hangi kuş geriye doğru uçabilen tek kuştur?', 'Sinekkuşu', 'Kırlangıç', 'easy', 'tr'),
  ('Bir karidesinin kalbi vücudunun neresindedir?', 'Başında', 'Kuyruğunun yakınında', 'easy', 'tr'),
  ('Küp şeklinde dışkı yapan hayvan hangisidir?', 'Vombat', 'Ornitorenk', 'medium', 'tr'),
  ('Kargaların bir grubuna ne denir?', 'Cinayet (Murder)', 'Sürü', 'medium', 'tr'),
  ('Bir sümüklüböceğin kaç tane burnu vardır?', '4', '2', 'hard', 'tr'),
  ('Gerçekten uçabilen tek memeli hangisidir?', 'Yarasa', 'Uçan sincap', 'easy', 'tr'),
  ('En yüksek kan basıncına sahip hayvan hangisidir?', 'Zürafa', 'Fil', 'medium', 'tr'),
  ('Koala parmak izleri kimin parmak izleriyle karışabilir?', 'İnsan parmak izleriyle', 'Şempanze izleriyle', 'medium', 'tr'),
  ('Bir sülüğün kaç tane beyni vardır?', '32', '12', 'hard', 'tr'),
  ('Mavi kanı olan deniz canlısı hangisidir?', 'Atkestanesi yengeci', 'Mavi balina', 'medium', 'tr'),
  ('Gergedan boynuzu hangi maddeden oluşur?', 'Keratin (saç gibi)', 'Kemik', 'medium', 'tr'),
  ('Hiç uyumayan hayvan hangisidir?', 'Boğa kurbağası', 'Yunus', 'hard', 'tr'),
  ('Bir arının kaç gözü vardır?', '5', '2', 'medium', 'tr'),
  ('En uzun hamilelik süresine sahip hayvan hangisidir?', 'Fil (22 ay)', 'Mavi balina (12 ay)', 'medium', 'tr'),
  ('Kediler ömürlerinin yüzde kaçını uyuyarak geçirir?', '%70', '%40', 'easy', 'tr'),
  ('Doğal olarak pembe süt veren hayvan hangisidir?', 'Suaygırı', 'Flamingo', 'hard', 'tr'),
  ('Bir ineğin kaç midesi vardır?', '4', '3', 'easy', 'tr'),
  ('Başı kesilse haftalarca yaşayabilen böcek hangisidir?', 'Hamam böceği', 'Karınca', 'easy', 'tr'),
  ('Baykuşların bir grubuna ne denir?', 'Parlamento', 'Meclis', 'medium', 'tr'),
  ('Mavi balinanın dili neyin ağırlığındadır?', 'Bir filin', 'Bir atın', 'hard', 'tr'),
  ('En geniş kanat açıklığına sahip kuş hangisidir?', 'Albatros', 'Kondor', 'medium', 'tr'),
  ('Yunuslar uyurken kaç gözleri açık kalır?', 'Bir tanesi', 'İkisi de kapanır', 'easy', 'tr'),
  ('Dilini dışarı çıkaramayan hayvan hangisidir?', 'Timsah', 'Aligator', 'medium', 'tr'),
  ('Denizanasının bir grubuna ne denir?', 'Tokat (Smack)', 'Sürü', 'hard', 'tr'),
  ('Derisi de çizgili olan hayvan hangisidir?', 'Kaplan', 'Zebra', 'medium', 'tr'),
  ('Bir salyangozun yaklaşık kaç dişi vardır?', 'Yaklaşık 25.000', 'Yaklaşık 200', 'hard', 'tr'),
  ('Kendi ağırlığının 50 katını taşıyabilen böcek?', 'Karınca', 'Böcek', 'easy', 'tr'),
  ('Devekuşunun gözü neresinden büyüktür?', 'Beyninden', 'Kalbinden', 'easy', 'tr'),
  ('Kelebekler yiyeceği hangi organlarıyla tadar?', 'Ayaklarıyla', 'Antenleriyle', 'easy', 'tr'),
  ('Baykuş başını yaklaşık kaç derece çevirebilir?', '270 derece', '180 derece', 'easy', 'tr'),
  ('Flamingoların bir grubuna İngilizcede ne denir?', 'Flamboyance', 'Colony', 'medium', 'tr'),
  ('Denizyıldızı bir kolundan ne yapabilir?', 'Tüm vücudunu yenileyebilir', 'Sadece kolunu yenileyebilir', 'hard', 'tr'),
  ('Pirenin kendi boyuna göre kaç katı zıplayabilir?', '150 katı', '50 katı', 'hard', 'tr'),
  ('Hangi hayvanın dişleri ömür boyu uzamaya devam eder?', 'Tavşan', 'Kedi', 'easy', 'tr'),
  ('Hangi hayvan hem karada hem suda yaşayamaz?', 'Yunus', 'Kaplumbağa', 'medium', 'tr'),
  ('Penguenler eşlerine ne hediye eder?', 'Çakıl taşı', 'Balık', 'medium', 'tr'),
  ('Papağanlar hangi özelliğiyle bilinir?', 'İnsan sesini taklit ederler', 'Şarkı söylerler', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Animals'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SCIENCE — English (40 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('What percentage of your DNA do you share with a banana?', '60%', '10%', 'medium', 'en'),
  ('Hot water freezes faster than cold — what is this called?', 'Mpemba effect', 'Bernoulli effect', 'hard', 'en'),
  ('A day on Venus is longer than its year — true or false?', 'True', 'False', 'medium', 'en'),
  ('Which letter does NOT appear on the periodic table?', 'J', 'Q', 'hard', 'en'),
  ('Roughly how many times does your heart beat per day?', '100,000', '50,000', 'easy', 'en'),
  ('The human eye can distinguish roughly how many colors?', '10 million', '1 million', 'medium', 'en'),
  ('What is the hardest natural substance on Earth?', 'Diamond', 'Titanium', 'easy', 'en'),
  ('How many bones does a shark''s skeleton contain?', 'Zero (it''s cartilage)', 'About 200', 'medium', 'en'),
  ('What temperature is the same in both Celsius and Fahrenheit?', '-40 degrees', '-50 degrees', 'hard', 'en'),
  ('Which planet has the most moons?', 'Saturn', 'Jupiter', 'medium', 'en'),
  ('Lightning is hotter than the surface of the Sun — true or false?', 'True', 'False', 'medium', 'en'),
  ('How much of the ocean has been explored?', 'About 5%', 'About 25%', 'easy', 'en'),
  ('Sound travels faster through water or air?', 'Water', 'Air', 'easy', 'en'),
  ('What is the most abundant gas in Earth''s atmosphere?', 'Nitrogen', 'Oxygen', 'easy', 'en'),
  ('Honey never spoils — true or false?', 'True', 'False', 'easy', 'en'),
  ('How old is the oldest known tree on Earth?', 'Over 5,000 years', 'Over 2,000 years', 'hard', 'en'),
  ('Which human organ uses the most energy?', 'Brain', 'Heart', 'medium', 'en'),
  ('What percentage of the human body is water?', 'About 60%', 'About 80%', 'easy', 'en'),
  ('Bananas are technically what type of fruit?', 'Berries', 'Drupes', 'medium', 'en'),
  ('How fast do nerve impulses travel in the body?', 'Up to 120 m/s', 'Up to 10 m/s', 'hard', 'en'),
  ('Glass is a liquid or a solid?', 'An amorphous solid', 'A very slow liquid', 'hard', 'en'),
  ('How many taste buds does the average human have?', 'About 10,000', 'About 2,000', 'medium', 'en'),
  ('Which element makes up most of the human body by mass?', 'Oxygen', 'Carbon', 'medium', 'en'),
  ('Neutron stars are so dense a teaspoon weighs how much?', 'About 6 billion tons', 'About 6 million tons', 'hard', 'en'),
  ('The Great Red Spot on Jupiter is larger than what?', 'Earth', 'Mars', 'easy', 'en'),
  ('What fraction of Earth''s water is fresh water?', 'About 3%', 'About 15%', 'medium', 'en'),
  ('Photons of light have mass — true or false?', 'False', 'True', 'hard', 'en'),
  ('The Sun makes up what percentage of the solar system''s mass?', '99.86%', '90%', 'hard', 'en'),
  ('Which blood type is the universal donor?', 'O negative', 'AB positive', 'easy', 'en'),
  ('Humans share what percentage of DNA with chimpanzees?', 'About 98.7%', 'About 85%', 'medium', 'en'),
  ('What is the longest bone in the human body?', 'Femur', 'Tibia', 'easy', 'en'),
  ('One teaspoon of a neutron star material on Earth would weigh?', 'Billions of tons', 'Millions of kilograms', 'hard', 'en'),
  ('Which planet spins on its side?', 'Uranus', 'Neptune', 'medium', 'en'),
  ('How long does it take sunlight to reach Earth?', 'About 8 minutes', 'About 3 minutes', 'easy', 'en'),
  ('What is the chemical formula for table salt?', 'NaCl', 'KCl', 'easy', 'en'),
  ('The human nose can detect over how many different scents?', '1 trillion', '10,000', 'hard', 'en'),
  ('Your body produces enough heat in 30 min to boil what?', 'Half a gallon of water', 'A cup of water', 'medium', 'en'),
  ('Which organ can regenerate itself?', 'Liver', 'Kidney', 'medium', 'en'),
  ('Mars appears red because of what on its surface?', 'Iron oxide (rust)', 'Red clay', 'easy', 'en'),
  ('How many cells does the human body have (approx)?', '37 trillion', '37 billion', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Science'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SCIENCE — Turkish (40 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Muzla DNA''nızın yüzde kaçını paylaşıyorsunuz?', '%60', '%10', 'medium', 'tr'),
  ('Sıcak su soğuktan daha hızlı donar — bu olaya ne denir?', 'Mpemba etkisi', 'Bernoulli etkisi', 'hard', 'tr'),
  ('Venüs''te bir gün, bir yılından uzun mudur?', 'Evet, uzun', 'Hayır, daha kısa', 'medium', 'tr'),
  ('Periyodik tabloda bulunmayan tek harf hangisidir?', 'J', 'Q', 'hard', 'tr'),
  ('Kalbiniz günde yaklaşık kaç kez atar?', '100.000', '50.000', 'easy', 'tr'),
  ('İnsan gözü yaklaşık kaç rengi ayırt edebilir?', '10 milyon', '1 milyon', 'medium', 'tr'),
  ('Dünyadaki en sert doğal madde nedir?', 'Elmas', 'Titanyum', 'easy', 'tr'),
  ('Köpekbalığı iskeletinde kaç kemik vardır?', 'Sıfır (kıkırdaktır)', 'Yaklaşık 200', 'medium', 'tr'),
  ('Celsius ve Fahrenheit''in eşit olduğu sıcaklık kaçtır?', '-40 derece', '-50 derece', 'hard', 'tr'),
  ('En çok uyduya sahip gezegen hangisidir?', 'Satürn', 'Jüpiter', 'medium', 'tr'),
  ('Yıldırım, Güneş''in yüzeyinden daha sıcak mıdır?', 'Evet', 'Hayır', 'medium', 'tr'),
  ('Okyanusların yüzde kaçı keşfedilmiştir?', 'Yaklaşık %5', 'Yaklaşık %25', 'easy', 'tr'),
  ('Ses suda mı havada mı daha hızlı yol alır?', 'Suda', 'Havada', 'easy', 'tr'),
  ('Dünya atmosferindeki en bol gaz hangisidir?', 'Azot', 'Oksijen', 'easy', 'tr'),
  ('Bal hiç bozulmaz — doğru mu yanlış mı?', 'Doğru', 'Yanlış', 'easy', 'tr'),
  ('Dünyanın bilinen en yaşlı ağacı kaç yaşındadır?', '5.000 yıldan fazla', '2.000 yıldan fazla', 'hard', 'tr'),
  ('En çok enerji harcayan insan organı hangisidir?', 'Beyin', 'Kalp', 'medium', 'tr'),
  ('İnsan vücudunun yüzde kaçı sudur?', 'Yaklaşık %60', 'Yaklaşık %80', 'easy', 'tr'),
  ('Muz teknik olarak hangi meyve türüdür?', 'Üzümsü (berry)', 'Sert çekirdekli', 'medium', 'tr'),
  ('Sinir impulsu vücutta ne hızla ilerler?', 'Saniyede 120 metreye kadar', 'Saniyede 10 metreye kadar', 'hard', 'tr'),
  ('Cam katı mıdır sıvı mıdır?', 'Amorf katı', 'Çok yavaş akan sıvı', 'hard', 'tr'),
  ('Ortalama bir insanın kaç tat tomurcuğu vardır?', 'Yaklaşık 10.000', 'Yaklaşık 2.000', 'medium', 'tr'),
  ('Kütle olarak insan vücudunun çoğunu oluşturan element?', 'Oksijen', 'Karbon', 'medium', 'tr'),
  ('Jüpiter''deki Büyük Kırmızı Leke neden büyüktür?', 'Dünya''dan bile büyük', 'Mars''tan büyük', 'easy', 'tr'),
  ('Dünya''daki suyun yüzde kaçı tatlı sudur?', 'Yaklaşık %3', 'Yaklaşık %15', 'medium', 'tr'),
  ('Fotonların kütlesi var mıdır?', 'Hayır, yoktur', 'Evet, vardır', 'hard', 'tr'),
  ('Güneş, güneş sisteminin kütlesinin yüzde kaçıdır?', '%99,86', '%90', 'hard', 'tr'),
  ('Evrensel kan donörü hangi kan grubudur?', '0 Rh negatif', 'AB Rh pozitif', 'easy', 'tr'),
  ('İnsanlar şempanzelerle DNA''nın yüzde kaçını paylaşır?', 'Yaklaşık %98,7', 'Yaklaşık %85', 'medium', 'tr'),
  ('İnsan vücudundaki en uzun kemik hangisidir?', 'Uyluk kemiği (femur)', 'Kaval kemiği (tibia)', 'easy', 'tr'),
  ('Hangi gezegen yan yatmış şekilde döner?', 'Uranüs', 'Neptün', 'medium', 'tr'),
  ('Güneş ışığı Dünya''ya ulaşması ne kadar sürer?', 'Yaklaşık 8 dakika', 'Yaklaşık 3 dakika', 'easy', 'tr'),
  ('Sofra tuzunun kimyasal formülü nedir?', 'NaCl', 'KCl', 'easy', 'tr'),
  ('İnsan burnu kaç farklı kokuyu algılayabilir?', '1 trilyon', '10.000', 'hard', 'tr'),
  ('Hangi organ kendini yenileyebilir?', 'Karaciğer', 'Böbrek', 'medium', 'tr'),
  ('Mars neden kırmızı görünür?', 'Demir oksit (pas)', 'Kırmızı kil', 'easy', 'tr'),
  ('İnsan vücudunda yaklaşık kaç hücre vardır?', '37 trilyon', '37 milyar', 'medium', 'tr'),
  ('Bir insanın ömrü boyunca ürettiği tükürük neyi doldurur?', '2 yüzme havuzunu', '1 küveti', 'hard', 'tr'),
  ('DNA''mızın yüzde kaçı tüm insanlarda ortaktır?', '%99,9', '%95', 'medium', 'tr'),
  ('İnsan beyni gün içinde kaç düşünce üretir (yaklaşık)?', '70.000', '10.000', 'hard', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Science'
ON CONFLICT DO NOTHING;

-- ============================================================
-- HISTORY — English (35 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Oxford University is older than the Aztec Empire — true or false?', 'True', 'False', 'medium', 'en'),
  ('Cleopatra lived closer to the Moon landing or the Great Pyramid?', 'Moon landing', 'Great Pyramid', 'hard', 'en'),
  ('In what year was Nintendo founded?', '1889', '1969', 'hard', 'en'),
  ('The Great Wall of China is visible from space — true or false?', 'False', 'True', 'easy', 'en'),
  ('Which ancient civilization invented the concept of zero?', 'Babylonians', 'Romans', 'medium', 'en'),
  ('How long did the Hundred Years'' War actually last?', '116 years', '100 years', 'medium', 'en'),
  ('The shortest war in history lasted how long?', '38 minutes', '2 hours', 'hard', 'en'),
  ('Vikings wore horned helmets — true or false?', 'False', 'True', 'easy', 'en'),
  ('Ancient Romans used what as mouthwash?', 'Urine', 'Vinegar', 'hard', 'en'),
  ('Who invented the World Wide Web?', 'Tim Berners-Lee', 'Bill Gates', 'easy', 'en'),
  ('Napoleon was actually short — true or false?', 'False (5''7" — average)', 'True', 'medium', 'en'),
  ('The Titanic had how many swimming pools?', '1', '3', 'medium', 'en'),
  ('In what century was the fork introduced to Europe?', '11th century', '16th century', 'hard', 'en'),
  ('Which US president was once a Hollywood actor?', 'Ronald Reagan', 'John F. Kennedy', 'easy', 'en'),
  ('The Leaning Tower of Pisa took how long to build?', 'About 200 years', 'About 50 years', 'medium', 'en'),
  ('Ancient Egyptians used what for pillows?', 'Stones', 'Feathers', 'medium', 'en'),
  ('Coca-Cola originally contained what substance?', 'Cocaine', 'Caffeine only', 'easy', 'en'),
  ('The Ottoman Empire dissolved in which century?', '20th century (1922)', '19th century', 'medium', 'en'),
  ('Who was the first woman to win a Nobel Prize?', 'Marie Curie', 'Rosalind Franklin', 'easy', 'en'),
  ('The ancient Olympics included what unusual event?', 'Chariot racing', 'Swimming', 'medium', 'en'),
  ('Queen Elizabeth II was also queen of how many countries?', '15', '5', 'hard', 'en'),
  ('The Berlin Wall fell in which year?', '1989', '1991', 'easy', 'en'),
  ('Which empire was the largest in history by land area?', 'British Empire', 'Mongol Empire', 'medium', 'en'),
  ('The first email was sent in what year?', '1971', '1981', 'hard', 'en'),
  ('The first printed book in Europe was?', 'Gutenberg Bible', 'Canterbury Tales', 'medium', 'en'),
  ('Genghis Khan killed so many people it cooled the planet — true?', 'True', 'False', 'hard', 'en'),
  ('Albert Einstein was offered the presidency of which country?', 'Israel', 'Germany', 'medium', 'en'),
  ('The Roman Empire lasted roughly how long?', 'About 1,000 years', 'About 500 years', 'medium', 'en'),
  ('Who painted the ceiling of the Sistine Chapel?', 'Michelangelo', 'Leonardo da Vinci', 'easy', 'en'),
  ('The Rosetta Stone was key to decoding which language?', 'Egyptian hieroglyphs', 'Sumerian cuneiform', 'easy', 'en'),
  ('Harvard University was founded before calculus was invented?', 'True', 'False', 'hard', 'en'),
  ('The first photograph was taken in what decade?', '1820s', '1860s', 'hard', 'en'),
  ('Samurai and cowboys existed at the same time — true or false?', 'True', 'False', 'medium', 'en'),
  ('Which ancient city had indoor plumbing first?', 'Mohenjo-daro', 'Rome', 'hard', 'en'),
  ('The first computer programmer was a woman — true or false?', 'True (Ada Lovelace)', 'False', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'History'
ON CONFLICT DO NOTHING;

-- ============================================================
-- HISTORY — Turkish (35 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Oxford Üniversitesi Aztek İmparatorluğu''ndan eski midir?', 'Evet, daha eski', 'Hayır, Aztekler daha eski', 'medium', 'tr'),
  ('Kleopatra Ay''a inişe mi Piramitlerin inşasına mı daha yakın yaşadı?', 'Ay''a inişe', 'Piramitlerin inşasına', 'hard', 'tr'),
  ('Nintendo hangi yılda kuruldu?', '1889', '1969', 'hard', 'tr'),
  ('Çin Seddi uzaydan çıplak gözle görülebilir mi?', 'Hayır, görülemez', 'Evet, görülebilir', 'easy', 'tr'),
  ('Yüzyıl Savaşları gerçekte kaç yıl sürdü?', '116 yıl', '100 yıl', 'medium', 'tr'),
  ('Tarihteki en kısa savaş ne kadar sürdü?', '38 dakika', '2 saat', 'hard', 'tr'),
  ('Vikingler boynuzlu miğfer takardı — doğru mu?', 'Hayır, yanlış', 'Evet, doğru', 'easy', 'tr'),
  ('Antik Romalılar gargara olarak ne kullanırdı?', 'İdrar', 'Sirke', 'hard', 'tr'),
  ('World Wide Web''i kim icat etti?', 'Tim Berners-Lee', 'Bill Gates', 'easy', 'tr'),
  ('Napolyon gerçekten kısa mıydı?', 'Hayır, ortalama boyda', 'Evet, çok kısaydı', 'medium', 'tr'),
  ('Titanik''te kaç yüzme havuzu vardı?', '1', '3', 'medium', 'tr'),
  ('Antik Mısırlılar yastık olarak ne kullanırdı?', 'Taş', 'Tüy', 'medium', 'tr'),
  ('Coca-Cola başlangıçta hangi maddeyi içeriyordu?', 'Kokain', 'Sadece kafein', 'easy', 'tr'),
  ('Osmanlı İmparatorluğu hangi yüzyılda sona erdi?', '20. yüzyıl (1922)', '19. yüzyıl', 'medium', 'tr'),
  ('İlk Nobel ödüllü kadın kimdir?', 'Marie Curie', 'Rosalind Franklin', 'easy', 'tr'),
  ('Berlin Duvarı hangi yıl yıkıldı?', '1989', '1991', 'easy', 'tr'),
  ('Tarihte toprak olarak en büyük imparatorluk hangisiydi?', 'Britanya İmparatorluğu', 'Moğol İmparatorluğu', 'medium', 'tr'),
  ('İlk e-posta hangi yıl gönderildi?', '1971', '1981', 'hard', 'tr'),
  ('Avrupa''da basılan ilk kitap hangisiydi?', 'Gutenberg İncil''i', 'Canterbury Hikayeleri', 'medium', 'tr'),
  ('Cengiz Han o kadar çok insan öldürdü ki dünyayı soğuttu — doğru mu?', 'Evet, doğru', 'Hayır, yanlış', 'hard', 'tr'),
  ('Einstein hangi ülkenin cumhurbaşkanlığı teklif edildi?', 'İsrail', 'Almanya', 'medium', 'tr'),
  ('Sistine Şapeli''nin tavanını kim boyadı?', 'Michelangelo', 'Leonardo da Vinci', 'easy', 'tr'),
  ('Rosetta Taşı hangi dilin çözülmesini sağladı?', 'Mısır hiyeroglifleri', 'Sümer çivi yazısı', 'easy', 'tr'),
  ('Harvard Üniversitesi kalkülüs icat edilmeden önce mi kuruldu?', 'Evet, önce kuruldu', 'Hayır, sonra kuruldu', 'hard', 'tr'),
  ('İlk fotoğraf hangi on yılda çekildi?', '1820''ler', '1860''lar', 'hard', 'tr'),
  ('Samuraylar ve kovboylar aynı dönemde yaşadı mı?', 'Evet, yaşadı', 'Hayır, yaşamadı', 'medium', 'tr'),
  ('İlk bilgisayar programcısı bir kadın mıydı?', 'Evet (Ada Lovelace)', 'Hayır', 'medium', 'tr'),
  ('İstanbul hangi yıl Konstantinopolis adını bıraktı?', '1930', '1453', 'hard', 'tr'),
  ('Antik Yunan''da olimpiyatlar çıplak mı yapılırdı?', 'Evet, çıplak', 'Hayır, giysili', 'medium', 'tr'),
  ('Pisa Kulesi''nin yapımı ne kadar sürdü?', 'Yaklaşık 200 yıl', 'Yaklaşık 50 yıl', 'medium', 'tr'),
  ('Roma İmparatorluğu yaklaşık kaç yıl sürdü?', 'Yaklaşık 1.000 yıl', 'Yaklaşık 500 yıl', 'medium', 'tr'),
  ('Fatih Sultan Mehmet İstanbul''u fethettiğinde kaç yaşındaydı?', '21', '35', 'medium', 'tr'),
  ('Atatürk Cumhuriyeti hangi yıl ilan etti?', '1923', '1920', 'easy', 'tr'),
  ('Çanakkale Savaşı hangi yıl başladı?', '1915', '1916', 'easy', 'tr'),
  ('Sümerler yazıyı hangi binyılda icat etti?', 'MÖ 4. binyıl', 'MÖ 2. binyıl', 'hard', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'History'
ON CONFLICT DO NOTHING;

-- ============================================================
-- GEOGRAPHY — English (35 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('What is the capital of Australia?', 'Canberra', 'Sydney', 'easy', 'en'),
  ('Which country has the most time zones?', 'France (12)', 'Russia (11)', 'hard', 'en'),
  ('Africa is larger than which group of countries combined?', 'USA, China, India, Europe', 'USA and Canada', 'hard', 'en'),
  ('Istanbul straddles which two continents?', 'Europe and Asia', 'Europe and Africa', 'easy', 'en'),
  ('What is the driest continent on Earth?', 'Antarctica', 'Africa', 'medium', 'en'),
  ('Which country has more pyramids — Egypt or Sudan?', 'Sudan', 'Egypt', 'hard', 'en'),
  ('Russia spans how many time zones?', '11', '8', 'medium', 'en'),
  ('What is the smallest country in the world?', 'Vatican City', 'Monaco', 'easy', 'en'),
  ('The Amazon rainforest produces what % of Earth''s oxygen?', 'About 6%', 'About 20%', 'hard', 'en'),
  ('Which desert is the largest in the world?', 'Sahara', 'Arabian', 'easy', 'en'),
  ('Canada has more lakes than rest of the world combined?', 'True', 'False', 'medium', 'en'),
  ('Mount Everest grows taller each year — true or false?', 'True (about 4mm/year)', 'False', 'medium', 'en'),
  ('What is the longest river in the world?', 'Nile', 'Amazon', 'easy', 'en'),
  ('Which ocean is the deepest?', 'Pacific', 'Atlantic', 'easy', 'en'),
  ('How many countries does Africa have?', '54', '48', 'medium', 'en'),
  ('Which country is both in Europe and Asia?', 'Turkey', 'Greece', 'easy', 'en'),
  ('The Dead Sea is actually a what?', 'Lake', 'Sea', 'medium', 'en'),
  ('Finland has more saunas than what?', 'Cars', 'Restaurants', 'medium', 'en'),
  ('What percentage of Earth''s surface is covered by water?', 'About 71%', 'About 50%', 'easy', 'en'),
  ('Which US state is closest to Africa?', 'Maine', 'Florida', 'hard', 'en'),
  ('The Sahara Desert is as large as which country?', 'USA', 'Australia', 'medium', 'en'),
  ('How many landlocked countries does Africa have?', '16', '10', 'hard', 'en'),
  ('Which city is on two continents?', 'Istanbul', 'Cairo', 'easy', 'en'),
  ('The Pacific Ocean is larger than all land combined — true?', 'True', 'False', 'medium', 'en'),
  ('What is the most visited country in the world?', 'France', 'USA', 'easy', 'en'),
  ('Lake Baikal contains what % of world''s fresh surface water?', 'About 20%', 'About 5%', 'hard', 'en'),
  ('Which waterfall is the tallest in the world?', 'Angel Falls', 'Niagara Falls', 'medium', 'en'),
  ('How many countries are there in South America?', '12', '15', 'medium', 'en'),
  ('Which country has no rivers?', 'Saudi Arabia', 'Egypt', 'hard', 'en'),
  ('The Mariana Trench is deeper than Everest is tall — true?', 'True', 'False', 'medium', 'en'),
  ('What is the most populous city in the world?', 'Tokyo', 'Shanghai', 'medium', 'en'),
  ('Greenland belongs to which country?', 'Denmark', 'Norway', 'medium', 'en'),
  ('Which continent has no permanent population?', 'Antarctica', 'Arctic', 'easy', 'en'),
  ('What is the only country that is also a continent?', 'Australia', 'Greenland', 'easy', 'en'),
  ('The Caspian Sea is actually a what?', 'Lake', 'Sea', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Geography'
ON CONFLICT DO NOTHING;

-- ============================================================
-- GEOGRAPHY — Turkish (35 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Avustralya''nın başkenti neresidir?', 'Canberra', 'Sidney', 'easy', 'tr'),
  ('En fazla saat dilimi olan ülke hangisidir?', 'Fransa (12)', 'Rusya (11)', 'hard', 'tr'),
  ('İstanbul hangi iki kıtayı birleştirir?', 'Avrupa ve Asya', 'Avrupa ve Afrika', 'easy', 'tr'),
  ('Dünyadaki en kurak kıta hangisidir?', 'Antarktika', 'Afrika', 'medium', 'tr'),
  ('Mısır''dan daha fazla piramide sahip ülke hangisidir?', 'Sudan', 'Meksika', 'hard', 'tr'),
  ('Rusya kaç saat dilimini kapsar?', '11', '8', 'medium', 'tr'),
  ('Dünyadaki en küçük ülke hangisidir?', 'Vatikan', 'Monako', 'easy', 'tr'),
  ('Dünyanın en büyük çölü hangisidir?', 'Sahra', 'Arabistan Çölü', 'easy', 'tr'),
  ('Kanada''da dünyanın geri kalanından daha mı fazla göl var?', 'Evet, doğru', 'Hayır, yanlış', 'medium', 'tr'),
  ('Everest Dağı her yıl büyür mü?', 'Evet (yılda 4mm)', 'Hayır, aynı kalır', 'medium', 'tr'),
  ('Dünyadaki en uzun nehir hangisidir?', 'Nil', 'Amazon', 'easy', 'tr'),
  ('En derin okyanus hangisidir?', 'Pasifik', 'Atlantik', 'easy', 'tr'),
  ('Afrika''da kaç ülke vardır?', '54', '48', 'medium', 'tr'),
  ('Ölü Deniz aslında bir nedir?', 'Göl', 'Deniz', 'medium', 'tr'),
  ('Finlandiya''da saunadan daha az ne vardır?', 'Araba', 'Restoran', 'medium', 'tr'),
  ('Dünya yüzeyinin yüzde kaçı suyla kaplıdır?', 'Yaklaşık %71', 'Yaklaşık %50', 'easy', 'tr'),
  ('Afrika''ya en yakın ABD eyaleti hangisidir?', 'Maine', 'Florida', 'hard', 'tr'),
  ('Sahra Çölü hangi ülke kadar büyüktür?', 'ABD', 'Avustralya', 'medium', 'tr'),
  ('İki kıtada bulunan şehir hangisidir?', 'İstanbul', 'Kahire', 'easy', 'tr'),
  ('Pasifik Okyanusu tüm karalardan büyük müdür?', 'Evet, büyük', 'Hayır, küçük', 'medium', 'tr'),
  ('Dünyada en çok ziyaret edilen ülke hangisidir?', 'Fransa', 'ABD', 'easy', 'tr'),
  ('Dünyanın en yüksek şelalesi hangisidir?', 'Angel Şelalesi', 'Niagara Şelalesi', 'medium', 'tr'),
  ('Güney Amerika''da kaç ülke vardır?', '12', '15', 'medium', 'tr'),
  ('Hiç nehri olmayan ülke hangisidir?', 'Suudi Arabistan', 'Mısır', 'hard', 'tr'),
  ('Mariana Çukuru, Everest''ten daha mı derindir?', 'Evet, daha derin', 'Hayır, daha sığ', 'medium', 'tr'),
  ('Dünyanın en kalabalık şehri hangisidir?', 'Tokyo', 'Şangay', 'medium', 'tr'),
  ('Grönland hangi ülkeye aittir?', 'Danimarka', 'Norveç', 'medium', 'tr'),
  ('Kalıcı nüfusu olmayan kıta hangisidir?', 'Antarktika', 'Kuzey Kutbu', 'easy', 'tr'),
  ('Hem ülke hem kıta olan yer hangisidir?', 'Avustralya', 'Grönland', 'easy', 'tr'),
  ('Hazar Denizi aslında bir nedir?', 'Göl', 'Deniz', 'medium', 'tr'),
  ('Türkiye''nin en büyük gölü hangisidir?', 'Van Gölü', 'Tuz Gölü', 'easy', 'tr'),
  ('Dünya''nın en uzun sahil şeridi hangi ülkededir?', 'Kanada', 'Avustralya', 'medium', 'tr'),
  ('Hangi ülke tamamen dağlarla kaplıdır?', 'Butan', 'Nepal', 'hard', 'tr'),
  ('Bayrak değişmeyen en eski ülke hangisidir?', 'Danimarka', 'İngiltere', 'hard', 'tr'),
  ('Kapadokya hangi ildedir?', 'Nevşehir', 'Kayseri', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Geography'
ON CONFLICT DO NOTHING;

-- ============================================================
-- TECHNOLOGY — English (30 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('The first computer bug was an actual insect — true or false?', 'True (a moth)', 'False', 'easy', 'en'),
  ('What did the first iPhone NOT have?', 'Copy and paste', 'A camera', 'medium', 'en'),
  ('How much did the first 1GB hard drive weigh in 1980?', 'About 250 kg', 'About 25 kg', 'hard', 'en'),
  ('The @ symbol was almost replaced on keyboards by what?', 'Nothing — it was nearly removed', 'The # symbol', 'hard', 'en'),
  ('QWERTY keyboards were designed to do what?', 'Slow typists down', 'Speed typing up', 'medium', 'en'),
  ('How many Google searches happen per second (approx)?', 'About 100,000', 'About 10,000', 'medium', 'en'),
  ('The first text message ever sent said what?', 'Merry Christmas', 'Hello World', 'medium', 'en'),
  ('What was Google''s original name?', 'Backrub', 'SearchBot', 'hard', 'en'),
  ('WiFi stands for what?', 'Nothing (it''s a brand name)', 'Wireless Fidelity', 'hard', 'en'),
  ('The first website is still online — true or false?', 'True', 'False', 'medium', 'en'),
  ('Email is older than the World Wide Web — true or false?', 'True', 'False', 'easy', 'en'),
  ('How much storage did the Apollo 11 computer have?', 'About 72 KB', 'About 72 MB', 'hard', 'en'),
  ('More people have mobile phones than what?', 'Toothbrushes', 'TVs', 'easy', 'en'),
  ('What programming language was named after a coffee brand?', 'Java', 'Python', 'easy', 'en'),
  ('The average smartphone is more powerful than what?', 'NASA''s 1969 computers', 'A 1990s supercomputer', 'easy', 'en'),
  ('What does the "__(i)__" in iPhone stand for?', 'Internet', 'Intelligent', 'medium', 'en'),
  ('Amazon originally only sold what product?', 'Books', 'Electronics', 'easy', 'en'),
  ('The first computer mouse was made of what?', 'Wood', 'Metal', 'medium', 'en'),
  ('How many lines of code does a modern car have?', 'About 100 million', 'About 1 million', 'hard', 'en'),
  ('Bitcoin''s creator''s identity is known — true or false?', 'False', 'True', 'easy', 'en'),
  ('YouTube''s first video was uploaded in what year?', '2005', '2003', 'medium', 'en'),
  ('What was the first commercially sold computer?', 'UNIVAC I', 'IBM PC', 'hard', 'en'),
  ('92% of the world''s currency exists only as what?', 'Digital data', 'Paper money', 'medium', 'en'),
  ('The first domain name ever registered was what?', 'symbolics.com', 'google.com', 'hard', 'en'),
  ('How many transistors are in a modern CPU chip?', 'Billions', 'Millions', 'medium', 'en'),
  ('USB stands for what?', 'Universal Serial Bus', 'Universal System Bus', 'easy', 'en'),
  ('The Firefox logo doesn''t actually show a fox — true or false?', 'True (it''s a red panda)', 'False', 'hard', 'en'),
  ('Which company created the first smartphone?', 'IBM (Simon, 1994)', 'Apple (iPhone, 2007)', 'hard', 'en'),
  ('Alexa listens for its wake word using how many mics?', '7 microphones', '2 microphones', 'medium', 'en'),
  ('The first webcam was used to watch what?', 'A coffee pot', 'A parking lot', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Technology'
ON CONFLICT DO NOTHING;

-- ============================================================
-- TECHNOLOGY — Turkish (30 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('İlk bilgisayar hatası gerçek bir böcek miydi?', 'Evet, bir güveydi', 'Hayır, yazılım hatasıydı', 'easy', 'tr'),
  ('İlk iPhone''da olmayan özellik neydi?', 'Kopyala-yapıştır', 'Kamera', 'medium', 'tr'),
  ('1980''deki ilk 1GB sabit disk ne kadar ağırdı?', 'Yaklaşık 250 kg', 'Yaklaşık 25 kg', 'hard', 'tr'),
  ('QWERTY klavye ne amaçla tasarlandı?', 'Yazıcıları yavaşlatmak', 'Yazımı hızlandırmak', 'medium', 'tr'),
  ('Saniyede yaklaşık kaç Google araması yapılır?', 'Yaklaşık 100.000', 'Yaklaşık 10.000', 'medium', 'tr'),
  ('Gönderilen ilk SMS''in içeriği neydi?', 'Merry Christmas', 'Hello World', 'medium', 'tr'),
  ('Google''ın ilk adı neydi?', 'Backrub', 'SearchBot', 'hard', 'tr'),
  ('WiFi neyin kısaltmasıdır?', 'Hiçbir şeyin (marka adı)', 'Wireless Fidelity', 'hard', 'tr'),
  ('İlk web sitesi hala çevrimiçi mi?', 'Evet', 'Hayır', 'medium', 'tr'),
  ('E-posta World Wide Web''den eski midir?', 'Evet, daha eski', 'Hayır, daha yeni', 'easy', 'tr'),
  ('Apollo 11 bilgisayarının belleği ne kadardı?', 'Yaklaşık 72 KB', 'Yaklaşık 72 MB', 'hard', 'tr'),
  ('Cep telefonu sahipliği neyi geçmiştir?', 'Diş fırçası sahipliğini', 'TV sahipliğini', 'easy', 'tr'),
  ('Hangi programlama dili kahve markasından adını aldı?', 'Java', 'Python', 'easy', 'tr'),
  ('Amazon başlangıçta sadece ne satıyordu?', 'Kitap', 'Elektronik', 'easy', 'tr'),
  ('İlk bilgisayar faresi hangi malzemeden yapılmıştı?', 'Ahşap', 'Metal', 'medium', 'tr'),
  ('Modern bir arabada yaklaşık kaç satır kod vardır?', 'Yaklaşık 100 milyon', 'Yaklaşık 1 milyon', 'hard', 'tr'),
  ('Bitcoin''in yaratıcısının kimliği biliniyor mu?', 'Hayır, bilinmiyor', 'Evet, biliniyor', 'easy', 'tr'),
  ('YouTube''a ilk video hangi yıl yüklendi?', '2005', '2003', 'medium', 'tr'),
  ('Dünyadaki paranın %92''si hangi formda var?', 'Dijital veri', 'Kağıt para', 'medium', 'tr'),
  ('Kaydedilen ilk alan adı hangisiydi?', 'symbolics.com', 'google.com', 'hard', 'tr'),
  ('USB neyin kısaltmasıdır?', 'Universal Serial Bus', 'Universal System Bus', 'easy', 'tr'),
  ('Firefox logosu aslında tilki değildir — doğru mu?', 'Evet, kırmızı panda', 'Hayır, tilki', 'hard', 'tr'),
  ('İlk akıllı telefonu hangi şirket üretti?', 'IBM (Simon, 1994)', 'Apple (iPhone, 2007)', 'hard', 'tr'),
  ('İlk web kamerası neyi izlemek için kullanıldı?', 'Bir kahve makinesini', 'Bir otoparkı', 'medium', 'tr'),
  ('Ortalama bir akıllı telefon neden daha güçlüdür?', 'NASA''nın 1969 bilgisayarları', '1990''ların süper bilgisayarı', 'easy', 'tr'),
  ('Ticari olarak satılan ilk bilgisayar hangisiydi?', 'UNIVAC I', 'IBM PC', 'hard', 'tr'),
  ('Modern bir CPU''da yaklaşık kaç transistör vardır?', 'Milyarlarca', 'Milyonlarca', 'medium', 'tr'),
  ('Türkiye''de internet ilk ne zaman kullanıldı?', '1993', '1999', 'medium', 'tr'),
  ('Dünyanın en çok kullanılan şifresi nedir?', '123456', 'password', 'easy', 'tr'),
  ('Spotify her çalınan şarkı için sanatçıya ne öder?', '0.003-0.005 dolar', '0.05-0.10 dolar', 'medium', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Technology'
ON CONFLICT DO NOTHING;

-- ============================================================
-- FOOD — English (30 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Peanuts are not actually nuts — what are they?', 'Legumes', 'Seeds', 'easy', 'en'),
  ('Which fruit floats in water?', 'Apple', 'Grape', 'easy', 'en'),
  ('Honey is the only food that never does what?', 'Spoils', 'Changes color', 'easy', 'en'),
  ('White chocolate contains no what?', 'Cocoa solids', 'Sugar', 'medium', 'en'),
  ('Ketchup was once sold as what?', 'Medicine', 'A dye', 'medium', 'en'),
  ('Which country consumes the most coffee per capita?', 'Finland', 'Brazil', 'hard', 'en'),
  ('A strawberry is not technically a what?', 'Berry', 'Fruit', 'medium', 'en'),
  ('Bananas are slightly what?', 'Radioactive', 'Magnetic', 'medium', 'en'),
  ('Crackers are worse for your teeth than candy — true?', 'True', 'False', 'hard', 'en'),
  ('Which nut is used to make dynamite?', 'Peanut', 'Walnut', 'hard', 'en'),
  ('The most stolen food worldwide is what?', 'Cheese', 'Chocolate', 'medium', 'en'),
  ('Carrots were originally what color?', 'Purple', 'White', 'medium', 'en'),
  ('How much food does the average person eat in a lifetime?', 'About 35 tons', 'About 10 tons', 'hard', 'en'),
  ('Avocado comes from an Aztec word meaning what?', 'Testicle', 'Green gold', 'hard', 'en'),
  ('Which fruit has its seeds on the outside?', 'Strawberry', 'Raspberry', 'easy', 'en'),
  ('Ripe cranberries can do what?', 'Bounce like a ball', 'Glow in the dark', 'medium', 'en'),
  ('The world''s most expensive spice is what?', 'Saffron', 'Vanilla', 'easy', 'en'),
  ('Chocolate was once used as what by the Aztecs?', 'Currency', 'War paint', 'medium', 'en'),
  ('Cucumbers are made up of what percentage of water?', '96%', '75%', 'medium', 'en'),
  ('Which country invented ice cream?', 'China', 'Italy', 'hard', 'en'),
  ('The most popular pizza topping worldwide is what?', 'Pepperoni', 'Mushroom', 'easy', 'en'),
  ('An average ear of corn has how many kernels?', 'About 800', 'About 200', 'medium', 'en'),
  ('Almonds are a member of which fruit family?', 'Peach family', 'Walnut family', 'hard', 'en'),
  ('Apples belong to which flower family?', 'Rose family', 'Daisy family', 'hard', 'en'),
  ('German chocolate cake is actually from where?', 'Texas, USA', 'Germany', 'hard', 'en'),
  ('Popsicles were invented by a kid — true or false?', 'True (11-year-old)', 'False', 'medium', 'en'),
  ('Which food can last 3,000+ years without spoiling?', 'Honey', 'Salt', 'easy', 'en'),
  ('Tomatoes were once believed to be what?', 'Poisonous', 'Magical', 'easy', 'en'),
  ('Watermelons are what percentage water?', '92%', '75%', 'easy', 'en'),
  ('The fear of cooking is called what?', 'Mageirocophobia', 'Culinophobia', 'hard', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Food'
ON CONFLICT DO NOTHING;

-- ============================================================
-- FOOD — Turkish (30 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Yer fıstığı aslında bir fıstık değildir — nedir?', 'Baklagil', 'Tohum', 'easy', 'tr'),
  ('Suda yüzen meyve hangisidir?', 'Elma', 'Üzüm', 'easy', 'tr'),
  ('Bal hiç bozulmayan tek yiyecek midir?', 'Evet, doğru', 'Hayır, tuz da bozulmaz', 'easy', 'tr'),
  ('Beyaz çikolatada bulunmayan şey nedir?', 'Kakao katısı', 'Şeker', 'medium', 'tr'),
  ('Ketçap bir zamanlar ne olarak satılıyordu?', 'İlaç', 'Boya', 'medium', 'tr'),
  ('Kişi başı en fazla kahve tüketen ülke hangisidir?', 'Finlandiya', 'Brezilya', 'hard', 'tr'),
  ('Çilek teknik olarak bir üzümsü meyve midir?', 'Hayır, değildir', 'Evet, üzümsüdür', 'medium', 'tr'),
  ('Muzlar hafif ne özellik taşır?', 'Radyoaktif', 'Manyetik', 'medium', 'tr'),
  ('Dünyada en çok çalınan yiyecek hangisidir?', 'Peynir', 'Çikolata', 'medium', 'tr'),
  ('Havuçlar orijinal olarak hangi renkteydi?', 'Mor', 'Beyaz', 'medium', 'tr'),
  ('Avokado, Azteklerde hangi anlama geliyordu?', 'Testis', 'Yeşil altın', 'hard', 'tr'),
  ('Tohumları dışında olan meyve hangisidir?', 'Çilek', 'Ahududu', 'easy', 'tr'),
  ('Olgun kızılcıklar ne yapabilir?', 'Top gibi zıplar', 'Karanlıkta parlar', 'medium', 'tr'),
  ('Dünyanın en pahalı baharatı hangisidir?', 'Safran', 'Vanilya', 'easy', 'tr'),
  ('Çikolata Azteklerde ne olarak kullanılırdı?', 'Para birimi', 'Savaş boyası', 'medium', 'tr'),
  ('Salatalık yüzde kaç oranında sudan oluşur?', '%96', '%75', 'medium', 'tr'),
  ('Dondurmayı hangi ülke icat etti?', 'Çin', 'İtalya', 'hard', 'tr'),
  ('Dünyada en popüler pizza malzemesi nedir?', 'Pepperoni', 'Mantar', 'easy', 'tr'),
  ('Badem hangi meyve ailesine aittir?', 'Şeftali ailesi', 'Ceviz ailesi', 'hard', 'tr'),
  ('Elma hangi çiçek ailesine aittir?', 'Gül ailesi', 'Papatya ailesi', 'hard', 'tr'),
  ('Dondurma çubuğunu 11 yaşında bir çocuk mu icat etti?', 'Evet, doğru', 'Hayır, yanlış', 'medium', 'tr'),
  ('Domates bir zamanlar ne sanılıyordu?', 'Zehirli', 'Büyülü', 'easy', 'tr'),
  ('Karpuz yüzde kaç oranında sudur?', '%92', '%75', 'easy', 'tr'),
  ('Türk kahvesi UNESCO listesinde midir?', 'Evet, 2013''ten beri', 'Hayır, değildir', 'easy', 'tr'),
  ('Türkiye dünyada en çok ne üreten ülkedir?', 'Fındık', 'Zeytin', 'medium', 'tr'),
  ('Lahmacun aslında hangi mutfaktan gelir?', 'Güneydoğu Anadolu', 'Arap mutfağı', 'medium', 'tr'),
  ('Simit İstanbul''da günde kaç adet satılır (yaklaşık)?', '2,5 milyon', '500 bin', 'hard', 'tr'),
  ('Baklava en çok katman rekorunu hangi ülke kırdı?', 'Türkiye', 'Yunanistan', 'medium', 'tr'),
  ('Antep fıstığı dünyada en çok nerede yetiştirilir?', 'İran', 'Türkiye', 'hard', 'tr'),
  ('Bir insanın ömründe yaklaşık kaç ton yemek yer?', 'Yaklaşık 35 ton', 'Yaklaşık 10 ton', 'hard', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Food'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SPORTS — English (25 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('A golf ball has how many dimples on average?', 'About 336', 'About 150', 'hard', 'en'),
  ('In which sport can you score a ''turkey''?', 'Bowling', 'Cricket', 'easy', 'en'),
  ('The Olympic gold medal is mostly made of what?', 'Silver', 'Gold', 'medium', 'en'),
  ('Which sport was invented by a Canadian in the USA?', 'Basketball', 'Volleyball', 'easy', 'en'),
  ('Tennis was originally played with what instead of rackets?', 'Bare hands', 'Wooden paddles', 'medium', 'en'),
  ('How long is an Olympic swimming pool?', '50 meters', '100 meters', 'easy', 'en'),
  ('Which country has won the most World Cup titles?', 'Brazil', 'Germany', 'easy', 'en'),
  ('A marathon is exactly how long?', '42.195 km', '40 km', 'medium', 'en'),
  ('Usain Bolt''s top speed was approximately what?', '44.72 km/h', '37 km/h', 'hard', 'en'),
  ('The Tour de France is how long in total (approx)?', 'About 3,500 km', 'About 1,500 km', 'hard', 'en'),
  ('Which sport uses the largest playing field?', 'Polo', 'Golf', 'medium', 'en'),
  ('Table tennis balls travel off the paddle at what speed?', 'Up to 112 km/h', 'Up to 50 km/h', 'hard', 'en'),
  ('Tug of war was an Olympic sport — true or false?', 'True', 'False', 'medium', 'en'),
  ('In baseball, how many stitches are on a standard ball?', '108', '88', 'hard', 'en'),
  ('The oldest active sport trophy is in which sport?', 'Sailing (America''s Cup)', 'Horse racing', 'hard', 'en'),
  ('A shuttlecock in badminton has how many feathers?', '16', '12', 'medium', 'en'),
  ('Which boxer''s ear was bitten in a famous fight?', 'Evander Holyfield', 'Lennox Lewis', 'easy', 'en'),
  ('FIFA was founded in what year?', '1904', '1930', 'medium', 'en'),
  ('Michael Phelps has won how many Olympic gold medals?', '23', '19', 'medium', 'en'),
  ('In cricket, what does a hat-trick mean?', '3 wickets in 3 balls', '3 sixes in a row', 'medium', 'en'),
  ('The fastest ball sport in the world is what?', 'Jai alai (badminton shuttle)', 'Tennis', 'hard', 'en'),
  ('How many players are on an ice hockey team on ice?', '6', '5', 'easy', 'en'),
  ('The Super Bowl is the championship of which sport?', 'American football', 'Baseball', 'easy', 'en'),
  ('Golf was banned in Scotland in 1457 — true or false?', 'True', 'False', 'hard', 'en'),
  ('A regulation basketball hoop is how high?', '10 feet (3.05 m)', '12 feet (3.66 m)', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Sports'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SPORTS — Turkish (25 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Bir golf topunda ortalama kaç çukur vardır?', 'Yaklaşık 336', 'Yaklaşık 150', 'hard', 'tr'),
  ('Olimpiyat altın madalyası çoğunlukla hangi metaldendir?', 'Gümüş', 'Altın', 'medium', 'tr'),
  ('Basketbolu kim icat etti?', 'Kanadalı James Naismith', 'Amerikalı bir öğretmen', 'easy', 'tr'),
  ('Tenis başlangıçta raket yerine neyle oynanırdı?', 'Çıplak elle', 'Tahta kürekle', 'medium', 'tr'),
  ('Olimpik yüzme havuzu kaç metredir?', '50 metre', '100 metre', 'easy', 'tr'),
  ('En çok Dünya Kupası kazanan ülke hangisidir?', 'Brezilya', 'Almanya', 'easy', 'tr'),
  ('Bir maraton tam olarak kaç km''dir?', '42,195 km', '40 km', 'medium', 'tr'),
  ('Usain Bolt''un ulaştığı en yüksek hız neydi?', '44,72 km/s', '37 km/s', 'hard', 'tr'),
  ('Hangi spor en büyük oyun alanını kullanır?', 'Polo', 'Golf', 'medium', 'tr'),
  ('Halat çekme bir zamanlar Olimpik spor muydu?', 'Evet, öyleydi', 'Hayır, değildi', 'medium', 'tr'),
  ('Badmintonda raketin vurduğu topa ne denir?', 'Badminton topu (shuttlecock)', 'Tenis topu', 'easy', 'tr'),
  ('FIFA hangi yıl kuruldu?', '1904', '1930', 'medium', 'tr'),
  ('Michael Phelps kaç Olimpiyat altın madalyası kazandı?', '23', '19', 'medium', 'tr'),
  ('Buz hokeyinde sahada kaç oyuncu bulunur?', '6', '5', 'easy', 'tr'),
  ('Golf 1457''de İskoçya''da yasaklandı mı?', 'Evet, yasaklandı', 'Hayır, yasaklanmadı', 'hard', 'tr'),
  ('Basket potası yerden kaç metre yüksekliktedir?', '3,05 metre', '3,66 metre', 'easy', 'tr'),
  ('Bir beyzbol topunda kaç dikiş vardır?', '108', '88', 'hard', 'tr'),
  ('Galatasaray hangi yıl UEFA Kupası''nı kazandı?', '2000', '1998', 'easy', 'tr'),
  ('Türkiye''de en popüler spor hangisidir?', 'Futbol', 'Basketbol', 'easy', 'tr'),
  ('Yağlı güreş hangi şehirde her yıl düzenlenir?', 'Edirne', 'Antalya', 'easy', 'tr'),
  ('Kırkpınar güreşleri kaç yıldır yapılmaktadır?', '660+ yıl', '300 yıl', 'medium', 'tr'),
  ('2024 Olimpiyatları hangi şehirde yapıldı?', 'Paris', 'Los Angeles', 'easy', 'tr'),
  ('Formula 1''de en çok şampiyonluk kazanan pilot kim?', 'Lewis Hamilton', 'Michael Schumacher', 'medium', 'tr'),
  ('Masa tenisinde top kaç km/s hıza ulaşabilir?', '112 km/s''ye kadar', '50 km/s''ye kadar', 'hard', 'tr'),
  ('Dünyanın en hızlı top sporu hangisidir?', 'Jai alai', 'Tenis', 'hard', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Sports'
ON CONFLICT DO NOTHING;

-- ============================================================
-- POP CULTURE — English (25 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('What is the highest-grossing film of all time?', 'Avatar', 'Avengers: Endgame', 'easy', 'en'),
  ('The voice of Mickey Mouse married the voice of who?', 'Minnie Mouse', 'Daisy Duck', 'medium', 'en'),
  ('How many Oscars has the movie "Titanic" won?', '11', '9', 'medium', 'en'),
  ('The ''D'' in D-Day does NOT stand for what?', 'Doom', 'Day', 'hard', 'en'),
  ('Which band has sold the most records in history?', 'The Beatles', 'Led Zeppelin', 'easy', 'en'),
  ('Mario from Nintendo was originally called what?', 'Jumpman', 'Mr. Video', 'medium', 'en'),
  ('Netflix originally started as what service?', 'DVD by mail', 'Cable TV', 'easy', 'en'),
  ('The Simpsons has been running since what year?', '1989', '1995', 'medium', 'en'),
  ('Which actor has been in the most movies?', 'Samuel L. Jackson', 'Morgan Freeman', 'medium', 'en'),
  ('Pac-Man was originally called what?', 'Puck-Man', 'Dot-Man', 'hard', 'en'),
  ('The world''s most followed person on Instagram is who?', 'Cristiano Ronaldo', 'Kylie Jenner', 'easy', 'en'),
  ('Spotify''s most streamed song ever is what?', 'Blinding Lights', 'Shape of You', 'medium', 'en'),
  ('How many Harry Potter books are there?', '7', '8', 'easy', 'en'),
  ('The Mona Lisa has no what?', 'Eyebrows', 'Eyelashes', 'medium', 'en'),
  ('Star Wars was almost titled what?', 'Adventures of Luke Starkiller', 'Space Wars', 'hard', 'en'),
  ('Which Disney movie was the first to have a soundtrack album?', 'Snow White', 'Fantasia', 'hard', 'en'),
  ('The longest-running TV show in history is what?', 'The Simpsons', 'Saturday Night Live', 'medium', 'en'),
  ('BTS stands for what in Korean?', 'Bangtan Sonyeondan', 'Beyond The Scene', 'hard', 'en'),
  ('The first video game ever made is widely considered to be?', 'Pong', 'Tetris', 'easy', 'en'),
  ('How many keys does a standard piano have?', '88', '76', 'easy', 'en'),
  ('James Bond''s code number is what?', '007', '008', 'easy', 'en'),
  ('Which superhero''s real name is Bruce Wayne?', 'Batman', 'Iron Man', 'easy', 'en'),
  ('The ''Like'' button on Facebook was almost called what?', 'Awesome', 'Cool', 'hard', 'en'),
  ('How many films are in the Marvel Cinematic Universe (Phase 1-4)?', '30+', '20', 'medium', 'en'),
  ('Friends ran for how many seasons?', '10', '8', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Pop Culture'
ON CONFLICT DO NOTHING;

-- ============================================================
-- POP CULTURE — Turkish (25 questions)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Tüm zamanların en yüksek hasılatlı filmi hangisidir?', 'Avatar', 'Avengers: Endgame', 'easy', 'tr'),
  ('Mickey Mouse''un sesini yapan kişi kiminle evlendi?', 'Minnie Mouse''un sesiyle', 'Daisy Duck''ın sesiyle', 'medium', 'tr'),
  ('Titanic filmi kaç Oscar kazandı?', '11', '9', 'medium', 'tr'),
  ('Tarihte en çok plak satan grup kimdir?', 'The Beatles', 'Led Zeppelin', 'easy', 'tr'),
  ('Nintendo''nun Mario''su başlangıçta nasıl adlandırılmıştı?', 'Jumpman', 'Mr. Video', 'medium', 'tr'),
  ('Netflix başlangıçta hangi hizmeti veriyordu?', 'Postayla DVD kiralama', 'Kablo TV', 'easy', 'tr'),
  ('The Simpsons kaç yılından beri yayınlanıyor?', '1989', '1995', 'medium', 'tr'),
  ('Pac-Man''ın orijinal adı neydi?', 'Puck-Man', 'Dot-Man', 'hard', 'tr'),
  ('Instagram''da en çok takip edilen kişi kimdir?', 'Cristiano Ronaldo', 'Kylie Jenner', 'easy', 'tr'),
  ('Kaç tane Harry Potter kitabı vardır?', '7', '8', 'easy', 'tr'),
  ('Mona Lisa''da olmayan şey nedir?', 'Kaşlar', 'Kirpikler', 'medium', 'tr'),
  ('Star Wars neredeyse ne adla çıkacaktı?', 'Luke Starkiller Maceraları', 'Uzay Savaşları', 'hard', 'tr'),
  ('Standart bir piyanoda kaç tuş vardır?', '88', '76', 'easy', 'tr'),
  ('James Bond''un kod numarası kaçtır?', '007', '008', 'easy', 'tr'),
  ('Batman''in gerçek adı nedir?', 'Bruce Wayne', 'Tony Stark', 'easy', 'tr'),
  ('Friends dizisi kaç sezon sürdü?', '10', '8', 'easy', 'tr'),
  ('BTS Korece''de ne anlama gelir?', 'Bangtan Sonyeondan', 'Beyond The Scene', 'hard', 'tr'),
  ('İlk yapılan video oyunu hangisidir?', 'Pong', 'Tetris', 'easy', 'tr'),
  ('Facebook''taki Beğen butonu neredeyse ne olacaktı?', 'Awesome (Harika)', 'Cool (Havalı)', 'hard', 'tr'),
  ('Spotify''da en çok dinlenen şarkı hangisidir?', 'Blinding Lights', 'Shape of You', 'medium', 'tr'),
  ('Kurtlar Vadisi dizisi kaç yılında başladı?', '2003', '2005', 'easy', 'tr'),
  ('Müslüm Gürses''in lakabı nedir?', 'Müslüm Baba', 'Arabesk Kralı', 'easy', 'tr'),
  ('Türkiye''nin Oscar''a aday gösterilen ilk filmi hangisidir?', 'Yol (1982)', 'Uzak (2002)', 'hard', 'tr'),
  ('Barış Manço hangi yılda vefat etti?', '1999', '2001', 'medium', 'tr'),
  ('Kemal Sunal''ın en bilinen filmi hangisidir?', 'Hababam Sınıfı', 'Şaban', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Pop Culture'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL ANIMALS — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Sea otters hold hands while sleeping — why?', 'To avoid drifting apart', 'To stay warm', 'easy', 'en'),
  ('A mantis shrimp can see how many types of color?', '16 types', '3 types', 'hard', 'en'),
  ('Which animal has the longest migration route?', 'Arctic tern', 'Monarch butterfly', 'medium', 'en'),
  ('Cows have best friends — true or false?', 'True', 'False', 'easy', 'en'),
  ('Which animal sleeps standing up?', 'Horse', 'Cow', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Animals'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL ANIMALS — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Deniz samurları uyurken neden el ele tutuşur?', 'Birbirinden ayrılmamak için', 'Isınmak için', 'easy', 'tr'),
  ('Mantis karidesi kaç çeşit renk görebilir?', '16 çeşit', '3 çeşit', 'hard', 'tr'),
  ('En uzun göç yolculuğu yapan hayvan hangisidir?', 'Kuzey sumru kuşu', 'Kral kelebeği', 'medium', 'tr'),
  ('İneklerin en iyi arkadaşları olur mu?', 'Evet, olur', 'Hayır, olmaz', 'easy', 'tr'),
  ('Ayakta uyuyan hayvan hangisidir?', 'At', 'İnek', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Animals'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL SCIENCE — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('If you could fold paper 42 times, it would reach where?', 'The Moon', 'The top of Everest', 'hard', 'en'),
  ('Stomach acid is strong enough to dissolve what?', 'Metal', 'Plastic', 'medium', 'en'),
  ('Your bones are stronger than steel by weight — true?', 'True', 'False', 'medium', 'en'),
  ('There are more stars in the universe than grains of what?', 'Sand on Earth', 'Rice in China', 'easy', 'en'),
  ('Which gas makes your voice higher when inhaled?', 'Helium', 'Nitrogen', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Science'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL SCIENCE — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Bir kağıdı 42 kez katlasanız nereye ulaşır?', 'Ay''a', 'Everest''in tepesine', 'hard', 'tr'),
  ('Mide asidi neyi eritecek kadar güçlüdür?', 'Metali', 'Plastiği', 'medium', 'tr'),
  ('Kemiklerimiz ağırlığına göre çelikten sağlam mıdır?', 'Evet, daha sağlam', 'Hayır, daha zayıf', 'medium', 'tr'),
  ('Evrende Dünya''daki kum tanelerinden fazla ne var?', 'Yıldız', 'Gezegen', 'easy', 'tr'),
  ('Hangi gaz solunduğunda sesinizi inceltir?', 'Helyum', 'Azot', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Science'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL HISTORY — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Which president appears on the US $100 bill?', 'Benjamin Franklin (not president)', 'Abraham Lincoln', 'hard', 'en'),
  ('The Great Fire of London destroyed how many homes?', 'About 13,200', 'About 3,000', 'hard', 'en'),
  ('Ancient Romans brushed teeth with what?', 'Crushed mouse brains', 'Charcoal', 'hard', 'en'),
  ('The first Olympics were held in what year?', '776 BC', '500 BC', 'medium', 'en'),
  ('Which war lasted only 38 minutes?', 'Anglo-Zanzibar War', 'Falklands War', 'hard', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'History'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL HISTORY — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('100 dolarlık banknotun üzerinde kim vardır?', 'Benjamin Franklin (başkan değil)', 'Abraham Lincoln', 'hard', 'tr'),
  ('Büyük Londra Yangını kaç evi yok etti?', 'Yaklaşık 13.200', 'Yaklaşık 3.000', 'hard', 'tr'),
  ('Antik Romalılar diş fırçalamak için ne kullanırdı?', 'Ezilmiş fare beyni', 'Kömür', 'hard', 'tr'),
  ('İlk Olimpiyatlar hangi yılda düzenlendi?', 'MÖ 776', 'MÖ 500', 'medium', 'tr'),
  ('Sadece 38 dakika süren savaş hangisidir?', 'İngiliz-Zanzibar Savaşı', 'Falkland Savaşı', 'hard', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'History'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL POP CULTURE — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Which movie has the most sequels?', 'Godzilla (38 films)', 'James Bond (27 films)', 'hard', 'en'),
  ('Ed Sheeran''s "Shape of You" reached how many billion streams?', '3+ billion', '1 billion', 'medium', 'en'),
  ('What was the first toy advertised on TV?', 'Mr. Potato Head', 'Barbie', 'hard', 'en'),
  ('The Lion King''s ''Hakuna Matata'' means what?', 'No worries', 'Be happy', 'easy', 'en'),
  ('Which movie franchise has the highest total box office?', 'Marvel Cinematic Universe', 'Star Wars', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Pop Culture'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL POP CULTURE — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('En çok devam filmi çekilen seri hangisidir?', 'Godzilla (38 film)', 'James Bond (27 film)', 'hard', 'tr'),
  ('TV''de reklam yapılan ilk oyuncak hangisiydi?', 'Mr. Potato Head', 'Barbie', 'hard', 'tr'),
  ('Aslan Kral''daki "Hakuna Matata" ne demektir?', 'Sorun yok / Dert etme', 'Mutlu ol', 'easy', 'tr'),
  ('En yüksek toplam hasılatlı film serisi hangisidir?', 'Marvel Sinematik Evreni', 'Star Wars', 'easy', 'tr'),
  ('Tarkan''ın en ünlü şarkısı hangisidir?', 'Şımarık', 'Dudu', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Pop Culture'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL FOOD — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Potatoes are about what percentage water?', '80%', '50%', 'medium', 'en'),
  ('Which country consumes the most chocolate per capita?', 'Switzerland', 'Belgium', 'medium', 'en'),
  ('Figs can contain dead wasps inside — true or false?', 'True', 'False', 'hard', 'en'),
  ('The most expensive coffee is made from what?', 'Civet cat droppings', 'High-altitude beans', 'medium', 'en'),
  ('Ranch dressing was invented on a what?', 'Ranch (literally)', 'In a lab', 'easy', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Food'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL FOOD — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Patates yüzde kaç oranında sudur?', '%80', '%50', 'medium', 'tr'),
  ('Kişi başı en çok çikolata tüketen ülke hangisidir?', 'İsviçre', 'Belçika', 'medium', 'tr'),
  ('İncirlerin içinde ölü eşek arısı olabilir mi?', 'Evet, olabilir', 'Hayır, olamaz', 'hard', 'tr'),
  ('Dünyanın en pahalı kahvesi neden yapılır?', 'Misk kedisi dışkısından', 'Yüksek rakım çekirdeklerinden', 'medium', 'tr'),
  ('Maraş dondurması neden uzar?', 'Salep kökü sayesinde', 'Nişasta sayesinde', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Food'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL GEOGRAPHY — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Which country has the most islands?', 'Sweden (267,570)', 'Indonesia', 'hard', 'en'),
  ('The Amazon River has no bridges — true or false?', 'True', 'False', 'hard', 'en'),
  ('Which capital city is at the highest altitude?', 'La Paz, Bolivia', 'Quito, Ecuador', 'medium', 'en'),
  ('What is the only US state that starts with the letter P?', 'Pennsylvania', 'No state starts with P', 'easy', 'en'),
  ('Mongolia is the most sparsely populated country — true?', 'True', 'False', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Geography'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL GEOGRAPHY — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('En çok adaya sahip ülke hangisidir?', 'İsveç (267.570)', 'Endonezya', 'hard', 'tr'),
  ('Amazon Nehri üzerinde hiç köprü var mıdır?', 'Hayır, yoktur', 'Evet, vardır', 'hard', 'tr'),
  ('En yüksek rakımdaki başkent hangisidir?', 'La Paz, Bolivya', 'Quito, Ekvador', 'medium', 'tr'),
  ('Moğolistan en seyrek nüfuslu ülke midir?', 'Evet, öyledir', 'Hayır, değildir', 'medium', 'tr'),
  ('Türkiye''de en çok il sınırına komşu il hangisidir?', 'Konya', 'Ankara', 'hard', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Geography'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL TECHNOLOGY — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('The average person unlocks their phone how many times/day?', 'About 150 times', 'About 50 times', 'medium', 'en'),
  ('The word "robot" comes from which language?', 'Czech', 'Japanese', 'hard', 'en'),
  ('Which company made the first digital camera in 1975?', 'Kodak', 'Canon', 'medium', 'en'),
  ('There are how many active websites on the internet?', 'About 200 million', 'About 2 billion', 'hard', 'en'),
  ('The first video uploaded to YouTube was about what?', 'A trip to the zoo', 'A cat video', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Technology'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL TECHNOLOGY — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Ortalama bir insan günde kaç kez telefonunu açar?', 'Yaklaşık 150 kez', 'Yaklaşık 50 kez', 'medium', 'tr'),
  ('"Robot" kelimesi hangi dilden gelir?', 'Çekçe', 'Japonca', 'hard', 'tr'),
  ('İlk dijital kamerayı 1975''te hangi şirket yaptı?', 'Kodak', 'Canon', 'medium', 'tr'),
  ('İnternette yaklaşık kaç aktif web sitesi var?', 'Yaklaşık 200 milyon', 'Yaklaşık 2 milyar', 'hard', 'tr'),
  ('YouTube''a yüklenen ilk video ne hakkındaydı?', 'Hayvanat bahçesi gezisi', 'Bir kedi videosu', 'medium', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Technology'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL SPORTS — English (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Which sport was the first to be played on the Moon?', 'Golf', 'Baseball', 'medium', 'en'),
  ('A tennis ball is pressurized with what gas?', 'Air or nitrogen', 'Helium', 'medium', 'en'),
  ('The first modern Olympics were held where?', 'Athens, 1896', 'Paris, 1900', 'easy', 'en'),
  ('What sport has the largest trophy?', 'Sailing (America''s Cup)', 'Football (World Cup)', 'hard', 'en'),
  ('Which sport burns the most calories per hour?', 'Swimming', 'Running', 'medium', 'en')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Sports'
ON CONFLICT DO NOTHING;

-- ============================================================
-- ADDITIONAL SPORTS — Turkish (5 more)
-- ============================================================
INSERT INTO public.questions (category_id, text, correct_answer, wrong_answer, difficulty, language)
SELECT c.id, q.text, q.correct_answer, q.wrong_answer, q.difficulty, q.language
FROM public.categories c, (VALUES
  ('Ay''da oynanan ilk spor hangisidir?', 'Golf', 'Beyzbol', 'medium', 'tr'),
  ('İlk modern Olimpiyatlar nerede düzenlendi?', 'Atina, 1896', 'Paris, 1900', 'easy', 'tr'),
  ('En büyük spor kupası hangi sporun kupasıdır?', 'Yelken (Amerika Kupası)', 'Futbol (Dünya Kupası)', 'hard', 'tr'),
  ('Saatte en çok kalori yakan spor hangisidir?', 'Yüzme', 'Koşu', 'medium', 'tr'),
  ('Beşiktaş''ın kuruluş yılı nedir?', '1903', '1905', 'easy', 'tr')
) AS q(text, correct_answer, wrong_answer, difficulty, language)
WHERE c.name = 'Sports'
ON CONFLICT DO NOTHING;
