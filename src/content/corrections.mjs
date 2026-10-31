// Text corrections requested by the client that are not (yet) in the Word manuscript.
// Applied after the manuscript is read, so the .docx stays untouched; see applyCorrections in
// build/manuscript.mjs for the kinds of entry. Book-wide style rules (closed dashes, closed
// fractions, sentence-case step titles) are applied after these, in build/manuscript.mjs.
// Round numbers refer to the client's feedback; "#n" to the row of CookbookFeedbackTrackerv2.
const r = (find, replace) => ({ find, replace });

export default {
  alabama: [
    // Round 6: the white sauce is on the same page, so no cross-reference is needed.
    r('Alabama White Sauce*', 'Alabama White Sauce'),
    { remove: /^See Alabama White Sauce, page XX\.?$/ },
  ],
  alaska: [
    r('The world would eventually call it Eskimo ice cream, though that name barely hints at what it truly is.', 'The outside world came to call it “Eskimo ice cream,” a name many Alaska Native people consider outdated; Akutaq is the word that matters.'), // #15
    r('Akutaq was offered at potlatches that bound communities together', 'Akutaq was offered at community feasts and gatherings that bound communities together'), // #16
    r('When Russian traders arrived in the 1700s and outside goods followed, shortening and sugar entered the recipe', 'When outside traders arrived and store-bought goods followed, shortening and sugar entered the recipe'), // #17
    r('turns the hardest season into a reason to gather.', 'turns the hardest season into a reason to come together.'), // #18
  ],
  arizona: [
    // Round 6: the recipe has no cabbage; the toppings include lettuce.
    r('a tangle of shredded cabbage', 'a tangle of shredded lettuce'),
    r('passed to her niece Carlotta Flores', 'passed to her great-niece Carlotta Flores'), // #19
    r('a humble burro carried one delicious step further, and worn ever since', 'a humble burro, worn ever since'), // #20
    r('Sonoran Style Chimichanga', 'Sonoran-Style Chimichanga'), // #21
    r('Born in a Tucson kitchen in 1922, the chimichanga', 'Said to have been born in a Tucson kitchen in 1922, the chimichanga'), // #22
    r('Heat oil in a deep skillet to 350°F (175°C).', 'Heat about 2 inches of oil in a deep skillet to 350°F (175°C).'), // #23
    r(/^Sour cream$/, 'Sour cream or Mexican crema'), // #24
  ],
  arkansas: [
    r('In large shallow dish, combine the cornmeal, cornstarch and all seasonings.', 'In a large shallow dish, combine the cornmeal, cornstarch, and all the seasonings.'), // v2.2 #373
    r('was Arkansas’s own invention', 'was Arkansas’s own spin'), // #25
    r('cementing a tradition that had been informal into one that was agricultural and industrial at once.', 'turning a tradition that had been informal into an agricultural industry as well.'), // #26
    r('Helena waterfront-once', 'Helena waterfront—once'), // #27
    r('Sweet pickle relish-often', 'Sweet pickle relish—often'),
    r('2 Tbsp dill pickle relish', '2 Tbsp sweet pickle relish'), // #28
    r('Pat dry. Soak the fish in the buttermilk', 'Pat the fish dry, then soak it in the buttermilk'), // #30
    { yieldFor: 'Arkansas-Style Tartar Sauce', yield: 'Yield: about ½ cup' }, // #31
    r('By the late nineteenth century', 'By the late 19th century'), // #6
  ],
  california: [
    r(/about 1-inch wide/g, 'about 1 inch wide'), // v2.2 #379
    r('Santa Barbara-each', 'Santa Barbara—each'), // #33
  ],
  colorado: [
    r('By the middle of the twentieth century', 'By the mid-20th century'), // #6
    r('Loaded with ham, peppers, and onions, the Denver omelet is diner-counter Colorado on a plate—hearty, unfussy, and always ready before the coffee cools.', 'Ham, peppers, and onions folded into diner-counter Colorado on a plate—hearty, unfussy, and ready before the coffee cools.'), // #35
    r('beat the eggs with milk,', 'beat the eggs with the milk, if using,'), // #37
  ],
  connecticut: [
    r(/^(Thin|Simple|High|Quality) (Crust|Toppings|Heat|Ingredients):/, (m, a, b) => `${a} ${b.toLowerCase()}:`), // v2.2 #381
    r('An accidental topping at Frank Pepe’s coal-fired oven turned into New Haven’s most fiercely guarded pizza tradition: a sauceless pie piled with fresh littleneck clams.', 'At Frank Pepe’s coal-fired oven, an accident became New Haven’s fiercely guarded tradition: a sauceless pie piled with fresh clams.'), // #38
    r(/^Pecorino Romano cheese, grated$/, '¼ cup grated Pecorino Romano cheese'), // #40
    r('(ideally 500–550°F (260–288°C))', '(ideally 500–550°F, or 260–288°C)'), // #41
    r('Place the dough out onto a lightly floured surface', 'Turn the dough out onto a lightly floured surface'), // #42
    r('After kneading dough, place the dough in', 'When it is smooth, place it in'),
    r('good quality olive oil', 'good-quality olive oil'),
  ],
  delaware: [
    r('It was 1698, and the Swedish and Dutch settlements scattered along the banks of the Christina River had learned, through hard winters and harder lessons, that nothing from the hog could be wasted.', 'It was 1698, and the Swedish and Dutch settlements along the Christina River knew the hard arithmetic of winter: every edible part of a butchered hog had to be put to use.'), // #43
    r('a farmhand’s fuel-sliced thick', 'a farmhand’s fuel—sliced thick'), // #44
  ],
  florida: [
    r('Transfer to plate and garnish with cilantro and squeeze of lime juice.', 'Transfer to plates and garnish with shredded coconut, cilantro, and a squeeze of lime juice.'), // v2.2 #333
    r('Remove from heat, fluff the rice with a fork, and serve with shredded coconut and cilantro as garnish.', 'Remove from heat and fluff the rice with a fork.'), // v2.1 #314, v2.2 #374
    r('the creamy pull of coconut rice, this dish doesn’t just taste like Florida, it is Florida.', 'the creamy pull of coconut rice—this dish doesn’t just taste like Florida. It is Florida.'), // #45, v2.2 #374
    { find: /^Long before Florida became a destination, the Florida Keys were already a kitchen\.\s*/, replace: '' }, // #46
    r(/^1 cup water$/, '½ cup water'), // #47
    r('375°F (190°C) – 400°F (204°C)', '375–400°F (190–204°C)'), // #48
    { after: 'Fresh cilantro', insert: { type: 'ingredient', text: 'Lime wedges, for serving' } }, // #49
    r('Prepare Marinade for Fish', 'Prepare the marinade'), // #50
    r('Grill the Grouper', 'Grill the grouper'),
  ],
  georgia: [
    r('If too juicy, stir in cornstarch to lightly thicken.', 'If too juicy, whisk the cornstarch with 1 Tbsp cold water, then stir it into the peaches.'), // #52
    r('9x13-inch', '9×13-inch'), // #53
  ],
  hawaii: [
    r(/^NOTES & TIPS$/, 'TIME-SAVER TIP'), // v2.1 #315
    r('pa’akai', 'paʻakai'), r('’ohana', 'ʻohana'), r('ali’i', 'aliʻi'), r(/lu’au/g, 'luʻau'), // #54
    r('chickens, and pigs. That pig would become', 'chickens, and pigs. The pig would become'), // #55
    r('arrived sometime between 400 and 800 CE', 'arrived by roughly 1000–1200 CE (estimates vary)'), // #56
    r(/Cooked for hours beneath hot volcanic stones and banana leaves in an underground imu, Kalua pork has been the smoky centerpiece of Hawaiian lu.au celebrations for a thousand years\./, 'Slow-cooked beneath hot stones and banana leaves in an underground imu, kalua pork has anchored Hawaiian luʻau for centuries.'), // #57
    r('Rinse and pat the pork shoulder, or butt if using, dry.', 'Pat the pork dry.'), // #58, v2.2 #346 (USDA: do not rinse raw meat)
    { remove: /^Traditional-Style \(Oven Method\)$/ }, // #59
  ],
  idaho: [
    r('the supper club. Milo’s Cellar is widely credited', 'the supper club. The Torch Lounge is widely credited'), // v2.1 #61
    r(', and serve hot with Idaho finger steaks and fry sauce.', ', and serve hot.'), // v2.1 #294
    r('Idaho’s Russet Burbank—planted first near Lapwai in 1836 and grown into the state’s agricultural signature—fried', 'Idaho’s potatoes—an industry that traces to a mission garden near Lapwai in 1836, though the Russet Burbank did not become the state’s signature until the 20th century—fried'), // #60
    r(/^A 1950s Boise supper club battered beef tenderloin.*$/, 'Born in a 1950s Boise supper club: battered beef strips, Idaho Russet fries, and a fry sauce that settled the debate.'), // #62
    r('Heat the canola oil to 370°F', 'Heat the oil to 370°F'), // #63
    r('the remaining 2½ cups of flour, garlic powder, salt, and pepper', 'the remaining 2½ cups of flour, garlic powder, onion salt, salt, and pepper'), // #64
    r('1 ½ lb. boneless beef sirloin steak', '1 ½ lb. beef tenderloin or boneless sirloin steak'), // #65
    r('¼ tsp of garlic powder', '¼ tsp garlic powder'), // #68
    r('Heat 2–3-inch of oil', 'Heat 2–3 inches of oil'), // #69
    r('finger steaks and french fries', 'finger steaks and French fries'), // #70
    // #262–263: one recipe title, Fry Sauce and French Fries together on the second recipe page.
    r('Finger Steaks with French Fries and Fry Sauce', 'Finger Steaks with Fry Sauce and French Fries'),
    { breakBefore: 'Fry Sauce' },
    { yieldFor: 'Fry Sauce', yield: 'Yield: about 1 cup' }, // #66
  ],
  illinois: [
    r('then add toppings – gotta make sure they are in this order:', 'then add the toppings in this order:'), // v2.2 #378
    r('In a neighborhood where kosher dietary traditions shaped what went on the table, ketchup-sweet, vinegary, and containing sugar—had no place', 'Local lore says ketchup—sweet, vinegary, and containing sugar—had no place'), // #72, #74
    r('celery salt-all of it', 'celery salt—all of it'), // #73
    r(/^This isn’t just a hot dog\..*$/, 'Not just a hot dog but a Depression-era act of defiance—and one of the most satisfying things you will ever eat standing up.'), // #75
    r('poppy-seed hot dog bun', 'poppy seed hot dog bun'), // #76
  ],
  indiana: [
    r('farm wives reached for what they always had on hand—eggs from the hens, butter churned that morning, sugar from the crock on the shelf, a splash of vinegar to cut the sweetness, a handful of cornmeal or flour to hold it together.', 'farm wives reached for what they always had on hand: butter churned that morning, sugar from the crock on the shelf, a handful of cornmeal or flour to hold it together.'), // #77
    r('Rich, golden, and unmistakably Hoosier, this is the pie Indiana built itself on, and once you taste it, you’ll understand exactly why.', 'Rich, golden, and unmistakably Hoosier, this is the pie Indiana built itself on.'), // #80
    r('Transfer into a saucepan and cook', 'Transfer to a clean saucepan and cook'), // #81
  ],
  iowa: [
    r('farm life-raised on corn', 'farm life—raised on corn'), // #82
    r('Frontier German and Czech settlers stretched every scrap of the hog into ham balls, braised in a sweet-tangy sauce that became a fixture of Iowa church suppers.', 'Frontier German and Czech settlers stretched every scrap of the hog into ham balls—a sweet-tangy fixture of Iowa church suppers.'), // #83
    r('1 cup graham cracker, crushed (about 8 full crackers)', '1 cup graham cracker crumbs (about 8 full crackers)'), // #84
    r('crushed graham cracker,', 'graham cracker crumbs,'),
    { before: '1 cup brown sugar', insert: { type: 'ingredient', text: '1–2 Tbsp apple cider vinegar' } }, // #85
    r('whisk together the brown sugar, ketchup, and mustard', 'whisk together the vinegar, brown sugar, ketchup, and mustard'),
    r('Ham balls, braised low and slow', 'Ham balls, baked low and slow'), // #86
    r('until the sauce is bubbling and slightly caramelized.', 'until the sauce is bubbling and slightly caramelized and the center of the ham balls reaches 160°F (71°C).'), // #87
  ],
  kansas: [
    { after: '¼ cup unsalted butter, melted', insert: { type: 'ingredient', text: '¼ cup melted butter or 1 egg beaten with 1 Tbsp water, for brushing' } }, // v2.2 #347
    r('They had left the colonies along Russia’s Volga River, lured to Kansas by the Atchison, Topeka and Santa Fe Railway, which was selling land at three dollars an acre.', 'They had left German-speaking settlements across the Russian Empire—including Mennonite communities in present-day Ukraine and Volga German communities farther east—drawn to Kansas by railroad land offers.'), // #88
    r('Tucked into their trunks beside hand-stitched linens and German-language Bibles were packets of Turkey Red wheat seed, a hard winter variety they had cultivated on the Russian steppe for generations. That wheat would transform Kansas agriculture entirely.', 'Family tradition holds that they carried Turkey Red wheat seed in their trunks beside hand-stitched linens and German-language Bibles, bringing with them a legacy of farming that would help transform Kansas agriculture.'), // #290
    r(/^Mennonite settlers carried this recipe across an ocean and half a continent, folding.*$/, 'Mennonite settlers carried this recipe across an ocean and half a continent: seasoned beef and cabbage in a golden hand-held loaf.'), // #89
    { remove: /Runza/ }, // #90
    r('(about 110°F (43°C))', '(110°F / 43°C)'), // #91
  ],
  kentucky: [
    r('who allegedly fed a large crowd of Confederate and Union soldiers near Lexington', 'who allegedly cooked for John Hunt Morgan’s Confederate cavalry near Lexington'), // v2.2 #365
    r(/^2 lb\. bone-in chicken thighs$/, '2 lb. bone-in, skin-on chicken thighs'), // v2.2 #367
    r('what it reveals: Burgoo has', 'what it reveals: burgoo has'), // v2.1 #92
    r(/(?<=[a-z,] )Burgoo/g, 'burgoo'), // #92: lowercase mid-sentence (title and sentence starts keep the capital)
    r('This allows the flavors to meld and the tough cuts to become fork-tender and the chicken to fall from the bone.', 'This lets the flavors meld, the tough cuts turn fork-tender, and the chicken fall from the bone.'), // #94
    r('good quality stock', 'good-quality stock'), // #105
    r(' Burgoo is even better the next day after the flavors have had a chance to meld further.', ''), // #95
    { remove: /^NOTES & TIPS$/ }, { remove: /^Burgoo is often served with cornbread/ },
  ],
  louisiana: [
    r('Ladle the hot gumbo over a generous serving', 'Remove the bay leaves. Ladle the hot gumbo over a generous serving'), // v2.1 #103
    r('a fever-hot, mosquito—loud settlement', 'a fever-hot, mosquito-loud settlement'), // #96
    { retype: 'Seafood', type: 'ingredient-sub' }, // #98
    r(/^Stock & Seasonings$/, 'Protein & Seasonings'), // #98, v2.1 #316: one group, one heading
    r('¼—½ tsp cayenne pepper', '¼–½ tsp cayenne pepper'), // #99
    r('Cook until the shrimp are pink and opaque and the crabmeat is heated through, 5–10 minutes.', 'Stir in the shrimp and crabmeat and cook until the shrimp are pink and opaque and the crabmeat is heated through, 5–10 minutes.'), // #100
    r('whisk a Tbsp or two of file powder', 'whisk 1–2 Tbsp filé powder'), // #101
    r('at least 1.5–2 hours', 'at least 1½–2 hours'), // #102
    r('good quality stock', 'good-quality stock'), // #105
  ],
  maine: [
    r('roughly chopped into ½ to ¾ inch pieces', 'roughly chopped into ½–¾-inch pieces'), // v2.2 #380
    r('4 New England-style top-split hot dog buns', '4 New England-style split-top hot dog buns'), // #104
    r('good quality mayonnaise', 'good-quality mayonnaise'), // #105
    r(/^Wait it Out$/, 'Chill the lobster salad'), // #106
    r('Pair with potato chips, fries or creamy coleslaw.', 'Pair with potato chips, fries, or creamy coleslaw.'), // #107
  ],
  maryland: [
    r(/^There is no finer afternoon in Maryland.*$/, 'Elbow-to-elbow at a newspaper-covered table, cracking Old Bay-dusted crabs with the people you love—Maryland’s finest afternoon.'), // #108
    r('(2-inch deep). Insert the steaming rack and ensure water is below steaming rack. If excess water, pour out the excess.', '(about 2 inches deep). Set the rack in the pot and make sure the liquid stays below it; pour off any extra.'), // #109
    r('until the crabs turn bright red.', 'until the crabs turn bright orange-red. (For a full bushel, steam in batches.)'), // #110
  ],
  massachusetts: [
    r('Ladle chowder into bowls, garnish with parsley,', 'Ladle chowder into bowls, top with the crisp salt pork and parsley,'), // v2.2 #366
    r('on a grey day', 'on a gray day'), // #111
    r(/^One spoonful of New England Clam Chowder.*$/, 'Rich, creamy, and briny-sweet, New England clam chowder is a warm embrace from the sea in a bowl.'), // #112
    r('In a separate saucepan, warm the milk and cream, if not using flour to thicken. If you prefer a thicker chowder, sprinkle in the flour and cook 2 minutes before adding liquid. Gradually add the milk and cream to the large pot, stirring gently. Stir in butter.', 'Warm the milk and cream in a saucepan. If you want a thicker chowder, stir the flour into the potatoes and broth and cook 2 minutes before adding the milk and cream. Gradually add the milk and cream to the large pot and stir in the butter.'), // #113
    r('Remove and discard the solids, leaving the fat in the pot.', 'Remove the crisp pork with a slotted spoon, leaving the fat in the pot; set it aside for garnish.'), // #114
    r('4 dozen hard-shell clams', '1 dozen hard-shell clams'), // #115
  ],
  michigan: [
    r('a circle about 8-inch across and ⅛-inch thick', 'a circle about 8 inches across and ⅛ inch thick'), // v2.2 #379
    r('sealed beef, potato, turnip, and onion', 'sealed beef, potato, rutabaga, and onion'), // v2.1 #324
    { move: 'To Assemble', before: 'Filling' }, // v2.1 #317: TO ASSEMBLE in the first column
    r('allowing miners—whose hands were often dirty with arsenic-laced dust—to eat the filling and discard the crust entirely.', 'allowing miners, it was said, to hold the crust with dirty hands, eat the filling, and discard the crust.'), // #116
    r(/^Bite into a Cornish Pasty.*$/, 'Golden, crimped, and hearty, the pasty has warmed the hands and hearts of miners, farmers, and wanderers for generations.'), // #117–119, #122
    r('Wrap the dough in plastic wrap and refrigerate for 30 minutes', 'Divide the dough into 6 pieces, flatten into disks, wrap in plastic wrap, and refrigerate for 30 minutes'), // #121
  ],
  minnesota: [
    r('Drain excess liquid if necessary.', 'Save any leftover cooking liquid and add it to the soup in step 3 in place of some broth.'), // #124
  ],
  mississippi: [
    // #125: the client's rewrite (Mississippi_Mud_Pie_Story_Rewrite.docx).
    { story: [
      'The Mississippi River has always had a personality: wide, dark, and unhurried, carrying the silt and soil of half a continent southward toward the Gulf. It was that river mud, rich and deep chocolate brown, that gave this dessert its name. Like the river, it carries the story of the people who have lived along its banks.',
      'The Delta’s table was shaped long before this pie existed. Black cooks, enslaved and later free, built much of the region’s culinary tradition in plantation kitchens, church halls, and home kitchens, and their skill with pecans, molasses, eggs, and chocolate set the standard for dense, deeply flavored sweets across the Mississippi Valley. Mississippi Mud Pie is a much younger dish, but it grew up in the food culture they helped create.',
      'Its story begins with the river itself. Steamboats and rail lines made river towns like Vicksburg and Natchez, and ports like New Orleans, gateways for goods, and by the late 19th century chocolate was no longer a luxury. Over the 20th century, the pantry changed. Chocolate cookies became a favorite way to make a crust. By the 1950s, electric refrigerators and freezers were standard in American kitchens, and cooks could set a dessert rather than bake it. Instant puddings and whipped toppings soon followed.',
      'The name “Mississippi Mud” appears in American newspaper recipe columns by the 1960s, first on a rich chocolate cake and, by the early 1970s, on the chilled pie. Where it began is still debated, and several towns have claimed it, but the inspiration is clear: the dark, silky look of the riverbank mud that lines the Mississippi on a drying August afternoon in Greenville or Clarksdale. The comparison stuck because anyone who has stood on that bank and looked down at the dark, smooth earth understands what they are about to taste.',
      'This is a dessert that rewards you generously. A crisp chocolate cookie crust holds a cool, fudgy chocolate filling, topped with cream and chocolate shavings or toasted pecans. Slice it straight from the refrigerator or freezer, with a dollop of whipped cream or a spoonful of vanilla ice cream melting alongside, and you won’t just be making dessert. You’ll be sitting down at a table with generations of Southern cooks and one of its most beloved sweets.',
    ] },
    r(/^Few things in this world speak to the soul.*$/, 'A gloriously fudgy, crumbling-edged, pecan-studded slab of Southern joy that turns any ordinary table into a celebration.'), // #126
    // #127, #268: whipped cream ingredients under their own heading
    { remove: /^Whipped Cream Topping$/ },
    { before: '1 ½ cups heavy cream, cold', insert: { type: 'ingredient-sub', text: 'Whipped Cream Topping' } },
    r('Chocolate curls or shavings, chopped toasted pecans, or mini marshmallows or a drizzle of chocolate sauce, for garnish (optional)', 'Garnish (optional): chocolate curls, chopped toasted pecans, mini marshmallows, or chocolate sauce'), // #128
    r(/^Mud Pie$/, 'Mississippi Mud Pie'), // #129
  ],
  missouri: [
    { find: '8 Tbsp (1 stick) unsalted butter, browned and slightly cooled', replace: '8 Tbsp (1 stick) unsalted butter, melted', nth: 2 }, // #133
    r('The story most often told is a simple one: a St. Louis baker, believed by many food historians to be from the Heimburger Bakery, accidentally reversed the ratio of butter and flour in a coffee cake recipe.', 'Legend has it that a St. Louis baker accidentally reversed the proportions of butter and flour while making coffee cake.'), // #130
    r(/^One bite of St\. Louis’s legendary Gooey Butter Cake.*$/, 'Crisp at the edges, molten in the middle—St. Louis’s gooey butter cake never needs to be anything more.'), // #131
  ],
  montana: [
    r('the Salish people—known also as the Flathead—for centuries', 'the Salish (Séliš) people for centuries'), // #134
    r('Meriwether Lewis recorded the encounter in his journals, noting the generosity of the people and the unfamiliar but welcome food placed before his party.', 'Lewis and Clark both recorded the encounter in their journals, noting the generosity of the people and the unfamiliar but welcome food placed before the party.'), // #135
    r('they were met by the Salish near present-day Lolo, Montana—hungry, exhausted, and deeply relieved.', 'they were met by the Salish at Ross’s Hole, near present-day Sula—hungry, exhausted, and deeply relieved—and later rested at Travelers’ Rest near Lolo.'), // v2.2 #360
    r(/^In Montana, where bull elk roam.*$/, 'Bull elk in the high meadows, huckleberries on the mountainsides—pressed together into a burger that tastes like the Rockies.'), // #136
    r(' (we prefer ours medium—160°F / 71°C)', '; we cook ours to 160°F (71°C)'), // #137, v2.2 #376
    r('Place the burgers on buns, generously top with huckleberry BBQ sauce, and enjoy the sweet taste of Montana’s wild essence in each delicious bite.', 'Place the burgers on buns and top generously with the huckleberry BBQ sauce. Serve with plenty of napkins.'), // #139, v2.2 #376
    r('For those that cannot tolerate spicy foods, simply omit', 'For anyone who prefers it mild, omit'), // #140
    r(/^¼ cup butter$/, '¼ cup cold butter, diced'), // #141
  ],
  nebraska: [
    r('mid-twentieth century', 'mid-20th century'), // #6
    r('at Maid Rite and the network of family-owned lunch counters', 'at the network of family-owned lunch counters'), // #142
    r(/^There is no loneliness.*$/, 'A warm, golden Cheese Frenchee—buttery crust, ribbon of molten cheese—can cure any loneliness, at least for a moment.'), // #143
    r('Place crushed cornflakes in another shallow dish.', 'Place the crushed crackers or cornflakes in another shallow dish.'), // #144
    r('for dipping-classic Nebraskan style', 'for dipping—classic Nebraskan style'), // #145
  ],
  nevada: [
    r('pushing the transcontinental line westward toward Promontory Summit', 'pushing the transcontinental line eastward toward Promontory Summit'), // v2.2 #354
    r('the valleys of Elko and Lovelock counties', 'the valleys of Elko and Humboldt counties'), // v2.2 #355
    r('—ranchers like Henry Blasdel, Nevada’s first state governor, understood early that the land', '—Nevada’s early ranchers understood that the land'), // v2.2 #356
    r('with horseradish and au jus', 'with horseradish and pan jus'), // #146
    r('silver veins running through the Sierra Nevada', 'silver veins running through the Virginia Range'), // #147
    r(/^Few things in life command a room.*$/, 'A prime rib roast commands the room—herb-crusted, rose-blushed, and met with a reverent hush the moment it hits the table.'), // #148
    r('Buffet Style Prime Rib Roast', 'Buffet-Style Prime Rib Roast'), // #149
    r('Cook the Roast (Day Of)', 'Cook the roast (day of)'), // #150
    r(/^1 cup beef broth$/, '2 cups beef broth, plus any drippings from the roasting pan'), // #153
    r('for up to 1.5–2 hours', 'for up to 1½–2 hours'),
    { yieldFor: 'Pan Jus', yield: 'Yield: about 2 cups' }, // #151
  ],
  'new-hampshire': [
    r('pot-au—feu', 'pot-au-feu'), // #154
    r('Manchester’s Acre neighborhood', 'Manchester’s Irish neighborhood'), // #155
    r(/^There is a quiet, ancient pleasure.*$/, 'Salt-cured beef and humble vegetables surrender slowly to the simmer, filling the kitchen with a warmth that feels like coming home.'), // #156, #159
    r('3 Beets, peeled and cut into chunks (cooked separately optional, to avoid coloring the broth red)', '3 beets, peeled and cut into chunks (cook separately, if you like, to keep the broth from turning red)'), // #157, #275
    r('Add beets or cook beets in separate pot.', 'Add the beets, or cook them in a separate pot.'), // #158
  ],
  'new-jersey': [
    r('In the winter of 1856, a Newark-born businessman named John Taylor', 'In 1856, a Hamilton Square–born businessman named John Taylor'), // v2.2 #359
    r(/^Pork roll—that salty.*$/, 'Salty, griddle-crisped pork roll turns an ordinary New Jersey breakfast into a small, perfect moment you didn’t know you needed.'), // #160
    r('cook to your liking-over easy', 'cook to your liking—over easy'), // #161
  ],
  'new-mexico': [
    r('If dough feels dry, add a splash more brandy.', 'If dough feels dry, add a splash more brandy, wine, or orange juice.'), // v2.2 #368
    { retype: 'Topping', type: 'ingredient-sub' }, // v2.1 #163
    r('Local anise seed, gathered from the wild or traded at market,', 'Anise seed, brought north by the Spanish and grown in village gardens or traded at market,'), // #162
  ],
  'new-york': [
    r('A steaming bowl of tender chicken and rigatoni wrapped in spicy, creamy tomato sauce—is pure Utica comfort in every bite.', 'A steaming bowl of tender chicken and rigatoni, wrapped in spicy, creamy tomato sauce, is pure Utica comfort in every bite.'), // #164
  ],
  'north-carolina': [
    r('½-inch thick rounds', '½-inch-thick rounds'), // v2.2 #379
    r(/^Few things in a Southern kitchen rival.*$/, 'A perfect crunch gives way to a tart, tender center—the simple joy of a fried green tomato, tasting like summer itself.'), // #165
  ],
  'north-dakota': [
    r('Catherine the Great had invited German farmers to settle the Volga River region of Russia in the 1760s,', 'Catherine the Great and her successors invited German farmers to settle the Russian Empire, first along the Volga and later on the Black Sea steppe in what is now Ukraine,'), // v2.2 #357
    r('They arrived in the Red River Valley and the James River lowlands in significant numbers through the 1880s and 1890s, settling towns like Emmons County, Logan County, and the rolling farmland surrounding Wishek and Linton.', 'They arrived in south-central North Dakota in significant numbers through the 1880s and 1890s, settling counties like Emmons and Logan, in the farmland around Wishek and Linton.'), // #166
    r(/^Pillowy dumplings, tender potatoes, and a rich, creamy broth come together.*$/, 'Pillowy dumplings, tender potatoes, and a rich, creamy broth in a bowl that tastes like being loved by someone’s grandmother.'), // #167
  ],
  ohio: [
    r('To order a five-way with confidence, beans, onions, cheese, and chili over spaghetti, was to announce', 'To order a five-way with confidence—chili, beans, onions, and cheese over spaghetti—was to announce'), // v2.2 #375
    r('Choose your style, a 2-way, 5-way or any way in between!', 'Discard the bay leaf. Choose your style, a 2-way, 5-way or any way in between!'), // v2.1 #171
    r(/^NOTES & TIPS$/, 'SERVING STYLES'), // v2.1 #306
    r(/^A whisper of cinnamon and chocolate transforms.*$/, 'A whisper of cinnamon and chocolate turns humble meat sauce into a layered obsession—one that makes grown Ohioans weep with homesickness.'), // #169
    r('1 lb. ground beef (80% fat)', '1 lb. ground beef (80% lean)'), // #170
    r('Add all spices, cocoa,', 'Add the bay leaf, all spices, cocoa,'), // #171
    r('for 30 mins.', 'for 30 minutes.'), // #172
  ],
  oklahoma: [
    r('When the Five Civilized Tribes—the Cherokee, Choctaw, Chickasaw, Creek, and Seminole—were', 'When the Five Tribes—the Cherokee, Choctaw, Chickasaw, Muscogee (Creek), and Seminole Nations—were'), // #173
    r(/^There is no sound quite like the sizzle.*$/, 'The sizzle of batter hitting a blazing skillet, the smell of golden cornbread—crisp-edged, tender-hearted, and worth every forearm burn.'), // #174
  ],
  oregon: [
    r('Pull out your largest baking sheet, don’t be shy', 'Heat your oil, don’t be shy'), // v2.2 #371
    r('Russian fur traders had introduced cultivated potatoes to the Oregon Territory as early as the 1820s, planting them', 'The Hudson’s Bay Company brought cultivated potatoes to Fort Vancouver in the 1820s, planting them'), // #176
    r(/The Hudson’s Bay Company brought cultivated potatoes to Fort Vancouver in the 1820s, planting them at trading posts.*?The Hudson’s Bay Company expanded on this, encouraging potato cultivation at Fort Vancouver along the Columbia River, where/, 'The Hudson’s Bay Company brought cultivated potatoes to Fort Vancouver on the Columbia River in the 1820s, where'), // v2.2 #372
    r(/^These thick-cut potato wedges—crispy outside.*$/, 'Crispy outside, tender inside, these thick-cut potato wedges bridge the gap between French fries and home fries.'), // #177
    r('paper towel–lined tray', 'paper towel-lined tray'), // #178
  ],
  pennsylvania: [
    r('on that South Philly corner ninety years ago', 'on that South Philly corner nearly a century ago'), // #179
    r(/^Pat Olivieri’s 1930s street-cart invention.*$/, 'Pat Olivieri’s 1930s street-cart invention—shaved ribeye, sweet onions, soft-roll magic—is a love letter to Philadelphia.'), // #180
    r('2 long Amoroso-style hoagie roll', '2 long Amoroso-style hoagie rolls'), // #181
  ],
  'rhode-island': [
    r('their deep understanding of corn, which they called nasaump.', 'their deep understanding of corn, which they cooked into a porridge they called nasaump.'), // v2.2 #362, v2.3 #386
    r('has been operating continuously since 1675—making it the oldest grist mill in America and still producing', 'has been operating since 1675, among the oldest working grist mills in the country, still producing'), // #183
    r(/johnny cakes/g, 'johnnycakes'), r(/johnny cake/g, 'johnnycake'), // #184
    r('1 cup boiling water (approx., see note)', '1 cup boiling water (add a little more if the batter is stiff)'), // #185
    r('Cook 6–8 minutes per side', 'Cook 3–4 minutes per side'), // #186
  ],
  'south-carolina': [
    r(/^A soulful, one-pot rice dish.*$/, 'A one-pot Lowcountry rice dish rooted in Gullah Geechee tradition, where West African heritage simmers with smoky sausage and sweet shrimp.'), // #187
    r(/^3 cups chicken stock$/, '2 cups chicken stock'), // #188
  ],
  'south-dakota': [
    r('the collapsed promises of Catherine the Great’s land grants along the Volga River', 'the collapsed promises of the Russian Empire’s land grants on the Black Sea steppe'), // v2.2 #358
    r(/^When you thread seasoned meat onto a stick.*$/, 'Salted cubes of meat, fried quick and eaten hot—a thousand years of fellowship in every bite.'), // #190
    r('350–375°F (175–191°C)', '350–375°F (175–190°C)'), // #191
  ],
  tennessee: [
    r('3 lb. bone-in, skin on chicken', '3 lb. bone-in, skin-on chicken'), // #192
    r('Pour about 2-inch of oil', 'Pour about 2 inches of oil'), // #193
  ],
  texas: [
    r('Lime wedges and chopped onions, for garnish', 'Chopped onions, for garnish'), // v2.2 #338
    r('Ladle into bowls and top with chopped onion, a squeeze of lime, and maybe a sprinkle of shredded cheese—though a true Texan might say that’s optional.', 'Ladle into bowls and top with chopped onion.'), // #194, v2.2 #338
    r('1 Tbsp masa harina (corn flour)', '1 Tbsp masa harina'), // #195
  ],
  utah: [
    r('By the time Utah became a state in 1896, the dish had already outgrown its somber occasion.', 'By the mid-20th century, the dish had outgrown its somber occasion.'), // v2.2 #361
    r('9x13-inch', '9×13-inch'), // v2.1 #53
  ],
  vermont: [
    r('exactly what the Key lime does for fish', 'exactly what a squeeze of lemon does for fish'), // #196
    r('the dining cars of the Central Vermont Railway', 'the dining cars of New England railroads'), // #197
    r('until golden brown and bubbling.', 'until golden brown and bubbling. Cool the pie for at least 1 hour before slicing so the filling sets.'), // #199
    r('1 ½ cups sharp Vermont cheddar cheese, sliced — plus wedges to serve', '8 oz. sharp Vermont cheddar, thinly sliced, plus wedges to serve'), // #200, #201
    r(/^Serve$/, 'Melt the cheese and serve'), // #202
    r('Melt cheese on top by laying thin slices of cheddar over the warm baked pie', 'Lay thin slices of cheddar over the warm pie'),
  ],
  virginia: [
    r('By the time the taverns of the colonial capital at Williamsburg were setting their tables, peanut soup had climbed from field to fine dining.', 'By the time Southern kitchens had embraced it, peanut soup had climbed from field to fine dining.'), // #204
    r('A few spoonfuls of ground peanuts, a good stock', 'A cup of smooth peanut butter, a good stock'), // #205
    r('It tastes of thrift and plenty at once—a Virginia harvest, ground smooth and served with a little ceremony.', 'It tastes of thrift and plenty at once: Virginia, in a warm bowl, ready for your table.'), // #206
    r(/^¼ tsp pepper$/, '¼ tsp black pepper'), // #207
    r('Ladle into warm bowls and finish each with a scatter of chopped peanuts and a pinch of chives or parsley. Serve hot, with the peanuts added at the last moment so they keep their crunch.', 'Ladle into warm bowls, then add the chopped peanuts and chives at the last moment so the peanuts keep their crunch.'), // #208
  ],
  washington: [
    r('Fillets were traditionally lashed', 'Whole sides of salmon were traditionally lashed'), // #209
    r('cooks low and slow, drinking in that smoke', 'cooks gently over the coals, drinking in that smoke'), // #210
    r('Light the grill, soak the plank, and let', 'Soak the plank, light the grill, and let'), // #211
    { storyNote: /^Serve cedar-planked salmon/ }, // #212
    r('Cedar Planked Salmon', 'Cedar-Planked Salmon'), // #213
    { before: 'Fresh thyme, parsley, or lemon wedges', insert: { type: 'ingredient-sub', text: 'To Finish' } }, // #214
    { before: 'Preheat grill', insert: { type: 'step', parts: ['Soak the plank', 'Submerge the cedar plank in water for at least 2 hours (weight it down so it stays under).'] } }, // #215
    r('Brush the salmon generously with the glaze. Reserve a small amount for finishing later.', 'Set a small portion of glaze aside in a clean bowl, then brush the rest generously over the salmon.'), // #216
    r('(375–400°F / 190–205°C)', '(375–400°F, or 190–204°C)'), // #217
    r('1 Tbsp tamari (or soy sauce)', '1 Tbsp tamari (or coconut aminos)'), // #218
  ],
  'west-virginia': [
    r('Stacked tall and flooded with sorghum molasses or the dark, robust buckwheat honey', 'Poured thin onto a well-seasoned griddle and finished with a ribbon of sorghum or maple syrup, or the dark, robust buckwheat honey'), // v2.2 #371
    r('a spoonful of sourdough starter the night before', 'a spoonful of starter saved from the last batch the night before'), // #219
    { find: /^Buckwheat pancakes pair beautifully.*$/, replace: '' }, // #220
    r('4 tsp hot water (or 3 Tbsp warm milk)', '4 tsp hot water (or warm milk)'), // #221
    r('⅓ tsp baking soda', '¼ tsp baking soda'), // #222
  ],
  wisconsin: [
    r('In the winter of 1840, a small group of Danish immigrants stepped off a steamboat onto the western shore of Lake Michigan and found themselves standing in a town called Racine, Wisconsin—a place of raw lumber, frozen mud streets, and remarkable promise.', 'In the 1840s, Danish immigrants began arriving on the western shore of Lake Michigan and settling in a town called Racine, Wisconsin—a place of raw lumber, muddy streets, and remarkable promise.'), // #223
    r('By the early 20th century, Kringle had become', 'By the mid-20th century, Kringle had become'), // #224
    r('Once you pull your own from the oven, warm and glazed,', 'Once you pull your own from the oven and drizzle it with icing,'), // #225
    { storyNote: /^Kringle is perfect for breakfast/ }, // #226
    r('Filling (choose one or mix)', 'Filling'), // #227
    r('Add in more milk, if needed.', 'Add a little more milk if needed.'), // #228
  ],
  wyoming: [
    { noteToCallout: /^Serving Tip:/, title: 'SERVING SUGGESTION' }, // v2.1 #328
    r('Wyoming’s state fish in 1969', 'Wyoming’s state fish in 1987'), // #229
    r('Cowboys pushing vast herds north along the Chisholm and Goodnight-Loving trails into Wyoming’s open ranges', 'Cowboys pushing vast herds north from Texas along trails like the Goodnight-Loving and the Western into Wyoming’s open ranges'), // #230
    r('held along the Green River near present-day Pinedale beginning in 1825', 'held along the Green River and its tributaries beginning in 1825'), // #231
    { before: 'Lemon wedges, to serve', insert: { type: 'ingredient-sub', text: 'To Serve' } }, // #232
    r('2 whole Wyoming cutthroat trout, cleaned and gutted', '2 whole cutthroat or rainbow trout, cleaned and gutted'), // #233
    r('brown sugar, salt, and pepper and cayenne, if using', 'brown sugar, salt, black pepper, and cayenne, if using'), // #234
  ],
};
