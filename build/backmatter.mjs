// Client corrections to the back matter, shared by the print build and the ebook.
import { styleText } from './manuscript.mjs';

// Client corrections to the back matter (CookbookFeedbackTrackerv2, #235–#249).
export function fixBackMatter(sections, chapters) {
  const sec = (title) => sections.find((x) => x.title === title);
  const text = (s, find, replace) => {
    const b = s.blocks.find((x) => x.text && x.text.includes(find));
    if (!b) throw new Error(`Back matter: "${find}" not found`);
    b.text = b.text.replace(find, replace);
  };
  const items = (s, group) => {
    const i = s.blocks.findIndex((b) => b.type === 'GroupName' && b.text === group);
    let j = i + 1;
    while (s.blocks[j] && s.blocks[j].type !== 'GroupName' && s.blocks[j].type !== 'SectionLabel') j++;
    return { at: (pos) => i + pos, end: j };
  };
  const menus = sec('Menus for the Occasion');
  text(menus, 'Dial back to one or two for a small meal or all four when family and friends are joining.', 'Choose one or two for a small meal, or serve all four when family and friends are joining.');
  menus.blocks.filter((b) => b.recipe === 'Maryland Steamed Crabs').forEach((b) => { b.recipe = 'Steamed Crabs'; });
  const al = sec('A Guide for Allergens');
  al.title = 'A Guide to Allergens';
  text(al, 'a gluten to avoid, a shellfish to fear, a nut', 'gluten to avoid, shellfish to steer clear of, a nut');
  text(al, 'This guide sorts all fifty-six recipes', 'This guide sorts every dish in the book (sauces and sides are listed with the dish they serve)');
  text(al, 'No gluten, dairy, egg, shellfish, fish, peanut, tree nut, or soy in the recipe as written.', 'No wheat, dairy, egg, shellfish, fish, peanut, tree nut, soy, or sesame in the recipe as written.');
  al.blocks = al.blocks.filter((b, k) => !(b.recipe === 'Funeral Potatoes' && al.blocks.slice(0, k).reverse().find((x) => x.type === 'GroupName')?.text === 'Gluten-Free'));
  const catfish = { type: 'item', recipe: 'Fried Catfish with Arkansas-Style Tartar Sauce', state: 'Arkansas' };
  al.blocks.splice(items(al, 'Gluten-Free').at(3), 0, { ...catfish }); // after Akutaq · Alaska (state order)
  al.blocks.splice(items(al, 'A Note on Peanut Oil').at(3), 0, { ...catfish });
  text(al, 'list “peanut or vegetable oil.”', 'list “vegetable or peanut oil.”'); // v2.1 #327
  const chislic = al.blocks.find((b) => b.recipe === 'Chislic');
  chislic.mark = '*';
  al.blocks.splice(items(al, 'Free of All Major Allergens').end, 0, { type: 'footnote', text: '*Fried in vegetable oil, not peanut oil.' });
  // Tracker v2.2 (#348–#353).
  const stateOrder = (name) => chapters.findIndex((c) => c.name === name);
  const groupOf = (k) => al.blocks.slice(0, k + 1).reverse().find((x) => x.type === 'GroupName')?.text;
  const drop = (group, recipe) => { al.blocks = al.blocks.filter((b, k) => !(b.recipe === recipe && groupOf(k) === group)); };
  const addSorted = (group, item) => {
    const { end } = items(al, group);
    const start = al.blocks.findIndex((b) => b.type === 'GroupName' && b.text === group);
    let at = end;
    for (let k = start + 1; k < end; k++) if (al.blocks[k].type === 'item' && stateOrder(al.blocks[k].state) > stateOrder(item.state)) { at = k; break; }
    al.blocks.splice(at, 0, { type: 'item', ...item });
  };
  drop('Contains Eggs', 'Hoosier Pie'); // #348: the custard has no eggs
  drop('Contains Fish', 'Akutaq'); // #349: the fish is optional
  addSorted('Contains Fish', { recipe: 'Akutaq', state: 'Alaska', label: 'Optional fish: Akutaq (leave out the flaked fish)' });
  addSorted('Gluten-Free', { recipe: 'Kalua Pork', state: 'Hawaii' }); // #350
  addSorted('Gluten-Free', { recipe: 'Chili con Carne', state: 'Texas' });
  text(al, 'Pecans, almonds, or coconut. In Florida coconut is central; in Mississippi and Wisconsin the nuts appear as a topping or flavoring that can often be omitted.', 'Pecans or almonds. Coconut is no longer classed as a tree nut by the FDA, but some people with nut allergies avoid it, so the Florida coconut rice is listed here as well. In Mississippi and Wisconsin the nuts appear as a topping or flavoring that can often be omitted.'); // #351
  for (const [recipe, state, note] of [ // #352
    ['Steamed Crabs', 'Maryland', 'skip the butter'], ['Cincinnati Chili', 'Ohio', 'skip the cheese'],
    ['Gullah Shrimp and Sausage Perloo', 'South Carolina', 'use the oil'], ['Buffet-Style Prime Rib Roast with Pan Jus', 'Nevada', 'use the oil'],
    ['Cowboy Cutthroat Trout', 'Wyoming', 'use the oil'],
  ]) addSorted('Dairy-Free', { recipe, state, note });
  text(al, 'Present through soy sauce, which can be swapped for coconut aminos.', 'Present through tamari (a soy sauce), which can be swapped for coconut aminos.'); // #353
  for (const s of sections) for (const b of s.blocks) if (b.text) b.text = styleText(b.text);
  return sections;
}
