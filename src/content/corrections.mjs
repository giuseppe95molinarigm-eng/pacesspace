// Text corrections requested by the client that are not (yet) in the Word manuscript.
// Applied after the manuscript is read, so the .docx stays untouched.
export default {
  arizona: [
    // Round 6: the recipe has no cabbage; the toppings include lettuce.
    { in: 'story', find: 'a tangle of shredded cabbage', replace: 'a tangle of shredded lettuce' },
  ],
  alabama: [
    // Round 6: the white sauce is on the same page, so no cross-reference is needed.
    { in: 'ingredient', find: 'Alabama White Sauce*', replace: 'Alabama White Sauce' },
    { in: 'note', find: /^See Alabama White Sauce, page XX\.?$/, remove: true },
  ],
};
