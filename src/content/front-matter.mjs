// Front-matter text, copied verbatim from SAMPLE_PAGES.pdf.

export const cover = {
  titleTop: 'MADE IN',
  titleThe: 'THE',
  titleUsa: 'USA',
  subtitle: 'A PLATE FOR EVERY STATE',
  tagline: '50 States  ·  56 Recipes  ·  One American Table',
  author: 'CHRISTINA REED',
};

export const copyright = {
  title: 'Made in the USA: A Plate for Every State',
  lines: [
    'Copyright © 2026 Christina Reed. All rights reserved.',
    'No part of this book may be reproduced, stored in a retrieval system, or transmitted in any form or by any means — electronic, mechanical, photocopying, recording, or otherwise — without prior written permission of the copyright holder, except for brief quotations used in reviews.',
    'Illustrations in this edition were created with the assistance of AI-generated imagery, curated, refined, and adapted for this publication. All artwork is licensed for commercial print and digital publication.',
  ],
  isbn: '[ISBN to be provided]',
  // Requested by the client ("Can I add a Library of Congress registration number?").
  lccn: '[LCCN to be provided]',
  closing: ['First Edition.', 'Printed in the United States of America.'],
};

// Table of contents: the entries are built from the chapters and the back matter at build
// time, and every page number is filled in from the final layout (see build.mjs).

// Page 3 (client: missing page). Text from the manuscript.
export const dedication = {
  stanzas: [
    ['To my friends —', 'whose steady support has carried me through every season of this work. Your kindness and belief have been their own kind of ingredient, folded quietly into every page of this book.'],
    ['To my husband —', 'whose encouragement never wavered. You believed in this long before I did, and you never once stopped even when I thought I had. This book exists because you kept telling me it could.'],
    ['And to those who came before —', 'the native peoples who first knew this land and its harvests, the settlers who carried their recipes across rivers and through mountain gaps, and the countless communities whose kitchens shaped these dishes long before any of us thought to write them down.'],
  ],
  closing: ['This book belongs to all of them.', 'I am only holding the pen for a little while.'],
};

// Pages 6–8, Notes from the Kitchen (client: missing pages). Text from the manuscript.
export const notes = [
  {
    kicker: 'NOTES FROM THE KITCHEN',
    title: ['READY TO PUSH', 'UP YOUR SLEEVES'],
    blocks: [
      ['p', 'A few words before you begin — not rules, exactly, but the small kitchen truths that run quietly beneath every recipe in this book.'],
      ['p', 'Read them once, and the fifty chapters ahead will go a little smoother. Then feel free to forget them, the way you forget the words to a song you already know by heart.'],
      ['h2', 'A Word on Salt'],
      ['deck', 'The one ingredient in nearly every recipe here — and the one most often misunderstood.'],
      ['p', 'When we simply call for salt, we mean kosher salt: the coarse, flaky kind cooks reach for by the pinch. It seasons evenly, it forgives a heavy hand, and it is what these recipes were written and tested with.'],
      ['p', 'The distinction matters more than it sounds. Kosher salt and ordinary table salt do not measure the same. Because table salt is finer and packs together tightly, a teaspoon of it can be nearly twice as salty as a teaspoon of kosher. If table salt is all you have, start with about half of what a recipe calls for, then taste and build from there.'],
      ['p', 'Whenever a recipe asks for salt “to taste,” trust your own tongue over the measurement. Your palate, your pot, your table.'],
    ],
  },
  {
    kicker: 'NOTES FROM THE KITCHEN',
    title: ['THE TWO POTS', 'YOU’LL REACH FOR MOST'],
    blocks: [
      ['deck', 'You do not need a cupboard of specialized equipment to cook your way across this country. Two vessels will carry you through the great majority of these fifty chapters.'],
      ['h3', 'A heavy Dutch oven'],
      ['p', 'Thick-walled and deep, a Dutch oven holds heat steady and even — exactly what a Kentucky burgoo, a Louisiana gumbo, or a New England chowder asks for over a long, slow simmer. Its high sides make it just as at home holding a few inches of frying oil. If you buy one good pot, buy this one.'],
      ['h3', 'A cast-iron skillet'],
      ['p', 'Nothing sears, crisps, or holds a screaming heat quite like cast iron. It gives Oklahoma cornbread its lacquered crust, carries Rhode Island johnnycakes and West Virginia buckwheat cakes from stovetop to table, and takes the final sear on a Nevada prime rib without flinching. Season it, keep it dry, and it will outlast you — and quite possibly your grandchildren.'],
    ],
  },
  {
    kicker: 'NOTES FROM THE KITCHEN',
    title: ['FRYING, SIMPLY'],
    blocks: [
      ['deck', 'More than twenty dishes in this book pass through hot oil — and frying has a fearsome reputation it does not deserve.'],
      ['p', 'Catfish in Arkansas, finger steaks in Idaho, chimichangas in the Sonoran Desert, hot chicken in Nashville. Done with a little attention, frying is one of the most rewarding things you can do in a kitchen.'],
      ['h3', 'Choosing your oil'],
      ['p', 'Reach for a neutral oil with a high smoke point — vegetable, canola, peanut, or a blend, we primarily call for vegetable and peanut oil for frying. These fry clean and let the food, not the fat, do the talking. When a recipe wants a particular oil for flavor or tradition, it will say so; otherwise, any neutral oil will serve you well.'],
      ['h3', 'Minding the temperature'],
      ['p', 'Temperature is everything. Too cool, and food drinks the oil and turns greasy; too hot, and the outside scorches before the inside is done. Most frying in this book happens between 350°F (175°C) and 375°F (190°C) — a clip-on thermometer takes the guesswork out entirely, and is worth the few dollars it costs.'],
      ['p', 'No thermometer? The old tests still work. Drop a small cube of bread into the oil: at the right heat it should turn golden in about a minute. Or dip in the handle of a wooden spoon — a steady ring of tiny bubbles gathering around the wood means the oil is ready.'],
      ['callout', 'STAY SAFE', [
        'Use a deep, heavy pot and never fill it more than halfway — oil rises when food goes in.',
        'Lower food away from you, and keep a lid within arm’s reach.',
        'Never pour water on an oil fire.',
        'Fry in small batches so the oil stays hot, and rest each finished piece on a wire rack rather than paper, so the crust stays crisp instead of steaming soft.',
      ]],
    ],
  },
];

// Pages 10–11 (client: missing spread). Title and line from the manuscript; the map is drawn
// from the US Census outlines in the book's colours.
export const map = {
  title: 'OUR CULINARY MAP',
  intro: 'A look at the fifty stops on this table-spanning journey, from coastline to farmland to mountain pass.',
};

// Back matter not written yet in the manuscript.
export const acknowledgments = {
  title: 'ACKNOWLEDGMENTS',
  placeholder: '[Acknowledgments — to be provided by the author, if desired.]',
};

export const welcome = {
  title: ['WELCOME TO', 'OUR PLACE'],
  paragraphs: [
    'Let us take you on a culinary adventure throughout the United States. Food is how we remember where we’ve been and who we were when we were there.',
    'It’s the sandwich wrapped in wax paper on a long drive, the pie that only shows up at holidays, the recipe that tastes different depending on whose kitchen you’re standing in. Long before we remember street names or mile markers, we remember meals. And in America, those meals change every time you cross a state line.',
    'Made in the USA: A Plate for Every State is a celebration of that idea — that every place has a flavor, and every flavor has a story. From coast to coast, this book travels through all 50 states, sharing the dishes that locals grow up with, argue about, and proudly claim as their own.',
    'Some of these recipes are famous. Others are quiet classics. Some were born out of necessity, others out of celebration. All of them belong to the places they come from. Paired with each recipe is a story rooted in geography, history, memory, or tradition, because food doesn’t exist in a vacuum. It exists at tables, in families, and in moments worth remembering.',
    'This isn’t a rule-heavy cookbook or a quest for perfection. It’s meant to be cooked from, laughed over, and occasionally splattered with sauce. Measurements are familiar, instructions are approachable, and the focus is always on flavor and feeling, not fuss.',
    'Whether you’re recreating something that feels like home, discovering a new regional favorite, or simply curious about how the country eats, this book invites you to slow down and take a seat.',
    'After all, the best way to understand a place has always been the same.',
  ],
  closing: ['Pull up a chair.', 'Pass the plate.', 'Stay awhile.'],
};

export const temperatures = {
  kicker: 'NOTES FROM THE KITCHEN',
  title: ['TEMPERATURES &', 'DONENESS'],
  intro: 'Every oven, grill, and pot of oil in this book carries both Fahrenheit and Celsius — so the recipes travel as easily as the dishes themselves.',
  lead: 'When a cut of meat needs a particular internal temperature, an instant-read thermometer is the surest path; color and time will only take you so far. The marks these recipes lean on most are gathered here.',
  table: {
    head: ['What you’re cooking', 'Aim for'],
    rows: [
      ['Deep- or shallow-frying', '350–375°F (175–190°C)'],
      ['Beef, medium-rare', '130°F (54°C)'],
      ['Beef, medium', '140–145°F (60–63°C)'],
      ['Ground meats & burgers', '160°F (71°C)'],
      ['Poultry, cooked through', '165°F (74°C)'],
      ['Fish, flaky and just done', '145°F (63°C)'],
      ['A low, slow roast (prime rib)', '200°F (93°C) oven, then seared hot'],
      ['Most baking in this book', '350–400°F (175–204°C)'],
    ],
  },
  after: 'Doneness is a matter of taste as much as safety — pull meat a few degrees early and let it rest, and it will climb to just where you want it.',
  closing: 'Now — To the hearth. Let’s begin.',
};
