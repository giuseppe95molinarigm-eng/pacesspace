// Alabama — the template chapter. Every other state gets a file with this same
// shape; the page templates never contain state-specific text.

export default {
  name: 'ALABAMA',
  nickname: 'The Yellowhammer State',
  // First page of the chapter (hero, verso). Story, recipe and food-image pages follow.
  firstPage: 12,

  hero: {
    // Landscape clipped to the state outline, transparent outside the state.
    silhouette: 'assets/img/alabama/state-silhouette.png',
  },

  // Flag shown, highly transparent, behind the story text.
  // PLACEHOLDER until the client's flag file is dropped in (see README).
  flag: 'assets/flags/alabama.svg',

  story: [
    'In the Tennessee Valley of northern Alabama, where the river bends west through Decatur and the land flattens toward the Mississippi border, a railroad man named Bob Gibson spent his weekends tending a fire. It was 1925. Gibson worked the line for the L&N Railroad, but on Saturdays and Sundays he dug a pit in his own backyard, laid hickory coals in the bottom, and smoked chicken and pork for anyone who wandered by. He nailed oak planks to a big sycamore tree to make a serving table, and the smoke that rose off that pit pulled neighbors and fellow railway workers down the road from miles around. Standing six feet four and weighing better than three hundred pounds, he was Big Bob to everyone who knew him, a man his family still describes as never having met a stranger.',
    'What set Gibson apart wasn’t only the smoke. It was what he did with his chickens once they came off the pit. Across the rest of the South, barbecue meant a tomato sauce, or a thin vinegar mop like the ones traded down from the Carolinas. Gibson went another direction entirely. He whisked together mayonnaise, vinegar, and a heavy hand of black pepper into a pale, tangy sauce, and he dunked his whole smoked chickens straight into it before serving. The mayonnaise clung to the hickory-smoked skin where a watery sauce would have run off; the vinegar and pepper cut the richness of the bird and kept the meat from drying out over the long, dry heat of the pit. It was cooling where barbecue was hot, sharp where it was smoky, and unlike anything else on a Southern table. Word traveled the way good food always does in a small city, and before long the crowds in Gibson’s backyard outgrew the sycamore tree. He left the railroad, opened a restaurant, and Big Bob Gibson Bar-B-Q became a Decatur institution that his family still runs today, a full century after that first backyard fire.',
    'For decades the sauce stayed close to home. This was northern Alabama’s own secret, a Tennessee Valley specialty you found at Decatur pits, church suppers, and county cookouts but rarely anywhere past the state’s midline. Cooks up and down the valley made their own versions, arguing over how much vinegar, whether to add a little lemon or horseradish, how much pepper was too much. It wasn’t until the sauce was first bottled and sold commercially in the 1990s that the rest of the country caught on, and Alabama white sauce began turning up on menus far from the river that raised it. Today it’s recognized as Alabama’s signature contribution to American barbecue, but its heart never left the northern part of the state.',
    'The dish that carries the sauce best is the simplest one: smoked or grilled chicken, cooled and brightened by that peppery white dressing, tucked into something soft to catch the drips. Big Bob served whole birds, but the same magic happens on a smaller scale, on a slider bun, at a backyard table where the first one off the tray never quite makes it onto a plate. Cool and tangy against char and smoke, it’s northern Alabama’s gift to the cookout, and it rewards you the moment the chicken hits the heat and the sauce comes together in the bowl.',
  ],

  recipes: [
    {
      title: ['Grilled Chicken Sliders with', 'Alabama White Sauce'],
      tagline: 'Big Bob Gibson’s tangy white sauce turned smoked chicken into a northern Alabama secret worth guarding for decades.',
      yield: 'Yield: 6 sliders',
      ingredients: [
        '2 boneless, skinless chicken breasts',
        '1 tsp garlic powder',
        '1 tsp smoked paprika',
        'Salt and pepper, to taste',
        '1 Tbsp olive oil',
        '6 slider buns',
        '1 cup Alabama White Sauce*',
        '½ cup coleslaw (optional)',
        'Sliced pickles (optional)',
      ],
      // The sauce now sits on the same page (sample said "page 15").
      note: '*See Alabama White Sauce, below.',
      steps: [
        ['Prep the chicken:', 'Pound the chicken breasts to even thickness and cut into smaller pieces if needed. Season with garlic powder, smoked paprika, salt, and pepper.'],
        ['Cook the chicken:', 'Heat olive oil in a skillet or grill pan over medium-high heat and cook the chicken for 4–5 minutes per side, until fully cooked through.'],
        ['Assemble and serve:', 'Toss the cooked chicken in Alabama White Sauce and place on slider buns. Top with coleslaw and pickles if desired, and serve immediately.'],
      ],
    },
    {
      // Companion recipe, set below the main one.
      sub: true,
      title: ['Alabama White Sauce'],
      yield: 'Yield: 1 cup',
      ingredients: [
        '1 cup mayonnaise',
        '¼ cup apple cider vinegar',
        '1 Tbsp lemon juice',
        '2 tsp sugar',
        '1 tsp prepared horseradish',
        '1 tsp salt',
        '1 tsp pepper',
        '¼ tsp cayenne pepper (optional, to taste)',
      ],
      steps: [
        ['Mix:', 'In a bowl, whisk together all ingredients until smooth and well combined.'],
        ['Adjust and chill:', 'Taste and adjust seasoning, adding more horseradish or cayenne if you like extra kick. Cover and refrigerate for at least 30 minutes to let the flavors meld (though it’s delicious right away too).'],
      ],
    },
  ],

  // Food-image page: finished dish / ingredients / preparation only — no people.
  // `crop` = [x, y, w, h] in source pixels (optional).
  foodImages: {
    main: { src: 'assets/img/alabama/sliders-white-sauce.jpg', alt: 'Grilled chicken sliders with Alabama white sauce, coleslaw and pickles on a wooden board' },
    details: [
      { src: 'assets/img/alabama/sliders-white-sauce.jpg', crop: [0, 0, 505, 834], sourceSize: [1536, 834], alt: 'Jar of Alabama white sauce with pickle chips', provisional: true },
      { src: 'assets/img/alabama/sliders-white-sauce.jpg', crop: [598, 0, 505, 834], sourceSize: [1536, 834], alt: 'Close-up of a slider with white sauce and slaw', provisional: true },
    ],
  },
};
