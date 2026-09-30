// Alabama artwork. Text comes from the manuscript (manuscript/*.docx); this file
// only holds the finished images. Other states get the same shape once their
// artwork exists; until then their pages show placeholders.

export default {
  // Landscape clipped to the state outline, gold outline baked in (300 dpi).
  silhouette: 'assets/img/alabama/state-silhouette.png',

  // Food-image page: finished dish / ingredients / preparation only — no people.
  // `crop` = [x, y, w, h] in source pixels.
  foodImages: {
    main: { src: 'assets/img/alabama/sliders-white-sauce.jpg', alt: 'Grilled chicken sliders with Alabama white sauce, coleslaw and pickles on a wooden board' },
    details: [
      { src: 'assets/img/alabama/sliders-white-sauce.jpg', crop: [0, 0, 505, 834], sourceSize: [1536, 834], alt: 'Jar of Alabama white sauce with pickle chips', provisional: true },
      { src: 'assets/img/alabama/sliders-white-sauce.jpg', crop: [598, 0, 505, 834], sourceSize: [1536, 834], alt: 'Close-up of a slider with white sauce and slaw', provisional: true },
    ],
  },
};
