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

// Table of contents. Page numbers are data, not layout: update them here once
// the final pagination is locked and the page re-flows on its own.
// `check: true` marks an entry whose number must be confirmed (it is
// highlighted only in the internal proof build, never in the client PDFs).
export const toc = {
  left: [
    ['Welcome to Our Place', 6], ['Alabama', 13], ['Alaska', 17], ['Arizona', 21],
    ['Arkansas', 25], ['California', 29], ['Colorado', 35], ['Connecticut', 39],
    ['Delaware', 43], ['Florida', 47], ['Georgia', 51], ['Hawaii', 55], ['Idaho', 59],
    ['Illinois', 65], ['Indiana', 69], ['Iowa', 73], ['Kansas', 77], ['Kentucky', 81],
    ['Louisiana', 87], ['Maine', 93], ['Maryland', 97], ['Massachusetts', 101],
    ['Michigan', 105], ['Minnesota', 109], ['Mississippi', 113], ['Missouri', 119],
    ['Montana', 125], ['Nebraska', 129], ['Nevada', 133],
  ],
  right: [
    ['New Hampshire', 139], ['New Jersey', 143], ['New Mexico', 147], ['New York', 151],
    ['North Carolina', 155], ['North Dakota', 159], ['Ohio', 163], ['Oklahoma', 167],
    ['Oregon', 171], ['Pennsylvania', 175], ['Rhode Island', 181], ['South Carolina', 185],
    ['South Dakota', 191], ['Tennessee', 195], ['Texas', 199], ['Utah', 203],
    ['Vermont', 207], ['Virginia', 211], ['Washington', 215], ['West Virginia', 219],
    ['Wisconsin', 225], ['Wyoming', 231],
    ['The Table We Set Together', 235, { check: true }],
    ['Menus for the Occasion', 235, { check: true }],
    ['A Guide for Allergens', 238], ['Recipe Index', 242], ['Ingredient Index', 243],
    ['State Index', 244], ['Acknowledgments', 245],
  ],
};

// First back-matter page in the manuscript's numbering (Wyoming ended on 234 there).
export const BACK_MATTER_FIRST_PAGE = 235;

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
  folio: 5,
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
  folio: 9,
};
