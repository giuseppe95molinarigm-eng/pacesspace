// What each food photo shows (client feedback tracker, round 8): the finished dish exactly as
// the recipe makes it, the dish filling most of the frame, a few props that belong to the recipe,
// no stray cutlery and no garnish the recipe does not call for.
// { show: the dish as it must look, props: what may sit around it, shot: optional camera angle }
// Entries are keyed by state slug and then by image number (dish-1, dish-2, …).
export default {
  alabama: { 1: { shot: '45° hero shot, close crop: the sliders fill most of the frame', show: 'three grilled chicken sliders on soft slider buns with sliced grilled chicken breast, a generous spoon of creamy white Alabama white sauce dripping down, coleslaw and pickle chips on the sliders, on a simple plate', props: 'a small bowl of white sauce with black pepper specks' } },
  alaska: { 1: { show: 'a wide bowl of akutaq: fluffy whipped white tallow mixed with plenty of mixed wild berries (salmonberries, blueberries, crowberries, cranberries), heaped and textured', props: 'a small scatter of the same berries on the table', shot: '45° hero shot' } },
  arizona: { 1: { show: 'one large golden deep-fried Sonoran chimichanga on a plate, cut open to show shredded beef, topped with melted shredded cheddar, chopped lettuce and diced tomato, a spoon of sour cream and guacamole, red salsa / enchilada sauce poured over one end', props: 'a small bowl of red salsa and a few pickled jalapeño slices' } },
  arkansas: { 1: { show: 'crisp golden cornmeal-crusted fried catfish fillets piled on a platter with lemon wedges and a small bowl of creamy tartar sauce with pickle relish; no herbs or green flecks anywhere', props: 'a halved lemon' } },
  california: { 1: { show: 'three Baja-style fish tacos on warm flour tortillas with golden beer-battered white fish strips, shredded green and purple cabbage slaw with cilantro, drizzled with lime crema, lime wedges, filling the whole plate edge to edge with nothing else on the plate (no bowls or ramekins on the plate); a separate small bowl of lime crema stands on the bare table a few inches away from the plate', props: 'the small bowl of lime crema on the table, off the plate, and a lime' } },
  colorado: { 1: { show: 'a golden folded Denver omelet on a plate, cut open to show diced ham, green and red bell pepper, onion and melted cheddar spilling out; no herbs or green flecks', props: 'a few diced bell pepper pieces on the board' } },
  connecticut: { 1: { show: 'a whole New Haven white clam apizza: very thin, crisp, charred and blistered irregular crust with flat edges (not thick or puffy), no tomato sauce and no mozzarella, topped with chopped shucked clam meat, minced garlic, olive oil, oregano and a light dusting of grated Pecorino Romano and chopped parsley', props: 'a small clear glass jar of reserved cloudy clam juice beside the pizza (no bowls of white granules, no spoons)', shot: '90° overhead shot (flat lay)' } },
  delaware: { 1: { show: 'a scrapple breakfast sandwich on a split toasted kaiser roll (crusty roll with a pinwheel-scored top, no sesame seeds): two separate thin crisp golden-brown slices of scrapple clearly visible as two stacked layers, a fried egg with runny yolk and melted American cheese, on a plate', props: 'a small dish of ketchup' } },
  florida: { 1: { shot: '45° hero shot, close crop: the plate fills most of the frame, no window', show: 'a large Key lime grilled grouper fillet with grill marks and a generous mound of coconut rice sprinkled with shredded coconut and a little cilantro, together filling most of the plate; one fork resting at the side of the plate; no whole limes on the plate, no pepper flakes', props: 'two small yellow-green Key lime wedges in a little dish beside the plate' } },
  georgia: { 1: { show: 'a Georgia peach cobbler baked in a rectangular 9×13-inch glass baking dish: a continuous golden poured-batter crust risen up around juicy peach slices (no biscuit mounds), one portion already scooped out, exactly one serving spoon in the dish (no other spoons)', props: 'a stick of butter on a dish, a few fresh peaches and a small bowl of ground cinnamon' } },
  hawaii: { 1: { show: 'a big mound of smoky shredded kalua pork, glistening and pulled into strands, served on a green banana leaf; nothing mixed in (no green onion, no cabbage)', props: 'a bowl of steamed white rice beside it and a small dish of coarse Hawaiian sea salt' } },
  idaho: {
    1: { show: 'Idaho finger steaks: thick strips of beef sirloin in a deep golden-brown crunchy batter, one strip broken open to show the brown cooked beef inside, piled next to golden fries cut from peeled russet potatoes and a small bowl of pink fry sauce; no herbs', props: 'nothing else' },
    2: { show: 'a bowl of pink-orange Idaho fry sauce (mayonnaise and ketchup) with one golden fry dipped in it', props: 'a few golden fries beside it' },
    3: { show: 'a generous basket of golden French fries cut from peeled russet potatoes, sprinkled only with salt; no herbs', props: 'a small dish of salt and one peeled russet potato' },
  },
  illinois: { 1: { show: 'a Chicago-style hot dog in a poppy-seed bun, “dragged through the garden”: yellow mustard, neon-green relish, chopped onion, tomato wedges, a dill pickle spear, sport peppers and a dash of celery salt; no utensils', props: 'nothing else', shot: '45° hero shot' } },
  indiana: { 1: { show: 'a Hoosier sugar cream pie with one slice cut out: a pale, creamy, smooth ivory custard filling that is set, with a thin caramelised cinnamon-sugar top and a golden crust; a pie server lifting the slice', props: 'a small dish of ground cinnamon' } },
  iowa: { 1: { show: 'glazed Iowa ham balls in a baking dish, glossy with a brown-sugar and tomato sweet sauce; no herbs and no utensils', props: 'a small bowl of brown sugar' } },
  kansas: { 1: { show: 'golden, glossy egg-washed bierocks (soft yeast buns filled with beef and cabbage), one cut in half to show the savoury beef and cabbage filling', props: 'nothing else' } },
  kentucky: { 1: { show: 'a deep bowl of Kentucky burgoo: thick, shreddy stew with pulled lamb shoulder and chicken, visibly red with crushed tomato, with corn, lima beans and sliced okra; a wedge of golden cornbread on the side', props: 'a cast-iron skillet of cornbread behind' } },
  louisiana: { 1: { show: 'Louisiana gumbo: one wide bowl of very dark mahogany roux gumbo with andouille sausage and chicken ladled over a scoop of white rice (the rice under the gumbo, peeking out, not in a separate mound); no okra, no bay leaf; the bowl sits entirely in the right half of the picture, well clear of the centre line, with a pot of the same gumbo and a ladle at the far left', props: 'a small dish of filé powder and sliced green onions' } },
  maine: { 1: { show: 'a Maine lobster roll overflowing with big chunks of lobster meat in a buttered, toasted split-top roll, close and centred, filling the frame; no chives, no utensils', props: 'a lemon wedge', shot: '45° hero shot, close crop' } },
  maryland: { 1: { show: 'a pile of bright red steamed blue crabs coated in Old Bay–style seasoning on brown paper', props: 'a wooden mallet and a small bowl of melted butter' } },
  massachusetts: { 1: { show: 'a bowl of creamy New England clam chowder with tender clams and diced potato, a little chopped parsley on top; no celery and no bacon or salt pork bits', props: 'a small bowl of oyster crackers and a few clam shells' } },
  michigan: { 1: { show: 'a golden Michigan Cornish pasty on a serving plate, cut open to show diced beef, potato, onion and rutabaga inside', props: 'nothing else' } },
  minnesota: { 1: { show: 'a bowl of creamy Minnesota wild rice soup with shredded chicken and diced carrots, the rice a natural wild rice blend: long slender grains in mixed dark brown, reddish brown, black and pale tan, many split open and curled after cooking (not only black grains), garnished only with chopped fresh parsley', props: 'a small dish of uncooked wild rice blend that is mostly tan and light brown long-grain rice mixed with some reddish-brown and a few black wild rice grains (not mostly black)' } },
  mississippi: { 1: { shot: '45° hero shot', show: 'one single photograph of a whole Mississippi mud pie in its dish with one wedge cut out, and that slice on a small plate right in front of it: the slice shows three clear layers — chocolate cookie crust, dense baked fudge layer, silky chocolate pudding layer — topped with a thick layer of whipped cream, chocolate curls and a few pecans; no forks or other utensils', props: 'nothing else' } },
  missouri: { 1: { show: 'St. Louis gooey butter cake in a square metal pan, cut into neat, even, realistic square pieces in a grid, a thick golden crackled top dusted with powdered sugar, one square lifted out with a small spatula; no thin slices', props: 'nothing else' } },
  montana: { 1: { show: 'one single big thick elk burger on a toasted bun, topped only with glossy dark spicy huckleberry BBQ sauce (no cheese, no bacon, no greens, no onion), alone on the plate, with one small bowl of huckleberry BBQ sauce on the side', props: 'a few fresh huckleberries', shot: 'straight-on shot at table height, close' } },
  nebraska: { 1: { show: 'two golden deep-fried cheese frenchees (breaded, battered grilled-cheese sandwiches cut in triangles) with melted cheese pulling from the cut, on a plate', props: 'a bowl of smooth red tomato soup just behind the plate' } },
  nevada: { 1: { show: 'a whole buffet-style standing prime rib roast with a dark seasoned crust on a carving board, a few thick pink slices carved and fanned in front, a small gravy boat of pan jus beside it', props: 'a small dish of the garlic, onion and dried rosemary seasoning rub', shot: '45° hero shot' } },
  'new-hampshire': { 1: { show: 'a corned beef boiled dinner arranged on a platter: sliced corned beef surrounded by cabbage wedges, carrots and potatoes, sprinkled with chopped parsley; no thyme', props: 'a small dish of mustard' } },
  'new-jersey': { 1: { show: 'a Jersey pork roll, egg and cheese sandwich on a kaiser roll: several thin, round, pink slices of Taylor pork roll with small cuts around the edge so they curl, browned at the edges, a fried egg and melted American cheese (not a burger patty); no knives and no forks', props: 'nothing else' } },
  'new-mexico': { 1: { show: 'a plate of New Mexico biscochitos: crisp anise-and-cinnamon sugar-dusted shortbread cookies, a few stacked; no spoon', props: 'a small dish of cinnamon sugar' } },
  'new-york': { 1: { show: 'a bowl of Utica chicken riggies: rigatoni with chicken and hot cherry peppers in a creamy, spicy tomato sauce, grated cheese on top; no spoons, forks or any utensils at all', props: 'nothing else' } },
  'north-carolina': { 1: { show: 'crisp golden cornmeal-crusted fried green tomato slices on a plate: three slices neatly stacked and a fourth slice leaning against the stack, with a small dish of remoulade', props: 'one whole green tomato' } },
  'north-dakota': { 1: { show: 'a bowl of creamy knoephla soup with soft dumplings, potato and celery; no parsley', props: 'nothing else' } },
  ohio: { 1: { show: 'Cincinnati chili, 5-way: spaghetti topped with thin cinnamon-spiced meat chili, red kidney beans, chopped white onions and a tall mound of finely shredded bright orange cheddar on an oval plate; no oyster crackers, no utensils', props: 'nothing else' } },
  oklahoma: { 1: { show: 'a golden cast-iron skillet cornbread with a crisp crust, one wedge cut and lifted; no utensils', props: 'a pat of butter on a small dish' } },
  oregon: { 1: { show: 'a full, heaped bowl of Oregon jo jo potatoes: thick potato wedges dredged in seasoned flour and deep-fried golden and crunchy; no herbs', props: 'a small dish of ranch dressing' } },
  pennsylvania: { 1: { show: 'two whole Philly cheesesteaks on long hoagie rolls stuffed with chopped, fully browned shaved ribeye (no pink), fried onions and melted cheese, both sandwiches entirely inside the frame', props: 'nothing else' } },
  'rhode-island': { 1: { show: 'a plate of Rhode Island johnnycakes in the centre of the frame: thin, flat, lacy, crisp golden stone-ground cornmeal cakes slightly overlapping (not thick, not fluffy), a pat of melting butter and a drizzle of maple syrup', props: 'a small jug of maple syrup', shot: '45° hero shot' } },
  'south-carolina': { 1: { show: 'Gullah shrimp and sausage perloo: a heavy pot of red tomato rice with pink shrimp and sliced smoked sausage, garnished with sliced green onions and chopped parsley, and one full plated portion beside it, both entirely in the frame', props: 'nothing else' } },
  'south-dakota': { 1: { show: 'a plate of South Dakota chislic: small cubes of seared lamb, salted, on toothpicks, with saltine soda crackers and a bottle of hot sauce beside them; no parsley, no garlic, no oil', props: 'saltine crackers and a plain unlabeled bottle of hot sauce' } },
  tennessee: { 1: { show: 'a generous pile of crimson-red Nashville hot fried chicken pieces on a plate, a small dish of dill pickle chips on the side; no utensils', props: 'a small basket of soft sliced white sandwich bread next to the plate' } },
  texas: { 1: { show: 'a bowl of Texas chili con carne (chunks of beef chuck in a deep red chili gravy, no beans), garnished with chopped onion, a lime wedge on the side, one spoon resting in the bowl; no cheese, no bay leaves', props: 'a lime' } },
  utah: { 1: { show: 'a casserole dish of Utah funeral potatoes with a golden crushed cornflake crust, one creamy scoop served out; no chives, no herbs', props: 'nothing else' } },
  vermont: { 1: { show: 'a lattice-topped apple pie with one slice cut out, the slice on a small plate with a slice of sharp orange-yellow Vermont cheddar melting on top (cheddar, not brie)', props: 'a small plate of thin sharp cheddar cheese slices and a red apple' } },
  virginia: { 1: { show: 'a bowl of creamy Virginia peanut soup garnished with chopped roasted peanuts and a few chopped chives', props: 'the soup pot behind with a ladle resting in it, and a small dish of roasted peanuts' } },
  washington: { 1: { show: 'a whole cedar-planked salmon fillet with a glossy honey-balsamic glaze on the charred cedar plank, garnished with a little fresh thyme and lemon wedges; no dill, no potted plants', props: 'a halved lemon' } },
  'west-virginia': { 1: { show: 'West Virginia buckwheat pancakes: very thin, lacy, flexible brown buckwheat pancakes with crisp lacy edges, a few folded and overlapping on a large plate with softened butter melting and maple syrup, the plate large and filling the right half of the picture, entirely clear of the centre line; on the left half a jug of maple syrup and a cast-iron griddle; no blueberries; one single worn oak table across the whole picture', props: 'a jug of maple syrup and a cast-iron griddle' } },
  wisconsin: { 1: { show: 'a whole oval Wisconsin kringle: flaky pastry ring with pecan and almond-paste filling, drizzled only with white icing (no sliced almonds on top), a few slices cut', props: 'nothing else' } },
  wyoming: { 1: { show: 'two whole grilled cutthroat trout side by side on a long oval serving platter (or a rimmed baking sheet), crisp skin with grill marks, lemon wedges', props: 'a halved lemon', shot: '45° hero shot' } },
};

// Photo spreads keep a single page here (client, round 8).
export const SINGLE_PHOTO_PAGE = ['california', 'nevada', 'mississippi', 'pennsylvania', 'wisconsin'];
// The photo moves onto the last recipe page, which saves a page (client, round 9).
export const INLINE_PHOTO = ['michigan', 'pennsylvania', 'wisconsin'];
// Only the first photo is kept (client, round 9: one photo with every item of the meal).
export const ONE_PHOTO = ['idaho'];

// Notes printed on the photo page (client, rounds 9–10).
//   moveRecipeNotes: 'above' | 'below' — the recipe's first boxed note moves onto the photo page
//   below: an extra boxed note under the photo ({ title, intro, items })
export const PHOTO_NOTES = {
  connecticut: {
    moveRecipeNotes: 'above',
    below: {
      title: 'SERVING STYLE', // v2.1 #320
      intro: 'For New Haven-style clam apizza, the clam juice is liquid gold! It adds that briny, ocean-fresh flavor that makes white clam pizza so distinctive.',
      items: [
        'Mix it with olive oil and garlic to create a flavorful base that spreads across the dough.',
        'Toss it with the clams so they stay moist and their flavor carries throughout the pizza.',
        'Drizzle a little over the pizza before baking to help infuse the crust with clam flavor.',
        'Reduce it first if there’s a lot to concentrate the flavor and avoid making the crust soggy.',
      ],
    },
  },
  // v2.1 #306: the serving styles under a smaller photo; the time-saver tip stays with the recipe.
  ohio: { moveRecipeNotes: 'below' },
  // v2.1 #295: the notes under the photo, so the recipe fits its page instead of spilling a box over.
  oklahoma: { moveRecipeNotes: 'below' },
};
