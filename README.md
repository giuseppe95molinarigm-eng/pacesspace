# Made in the USA: A Plate for Every State — layout

Sorgente dell'impaginato del cookbook di Christina Reed (formato 8.25 × 11 in, verticale).
**Round 1:** correzioni alle pagine generali + **sezione Alabama completa** (capitolo modello).
Gli altri stati **non** sono stati impaginati: si procede solo dopo l'approvazione di Alabama.

## File da inviare alla cliente (`output/`)

| File | Contenuto |
|---|---|
| `01_General_Pages_Corrected.pdf` | Cover, Copyright, Table of Contents (numeri reali degli stati), Welcome, pag. 9 |
| `states/01_Alabama.pdf` … `states/50_Wyoming.pdf` | Un PDF per stato (la cliente approva uno stato alla volta) |
| `states/INDEX.md` | Pagine di ogni stato, numero di pagine, cose da verificare |
| `00_Internal_Proof_with_markers.pdf` | **Solo uso interno**: tutto il libro con i punti aperti evidenziati |

## Come nasce l'impaginato

Testi dal manoscritto `manuscript/Made_in_the_USA_BASE.docx`, letti tramite gli stili di Word
(HeroStateName, RecipeTagline, IngredientItem…): se il Word cambia, basta rilanciare la build.
`src/paginate.js` distribuisce storia e ricette su quante pagine servono (una ricetta lunga
continua sulla pagina successiva, con interlinea leggermente più stretta se serve per evitare
una pagina quasi vuota), numera le pagine da 12, risolve i rimandi «page XX» e fornisce i numeri
al TOC. Le bandiere dietro le storie vengono da `assets/flags/states/`, le sagome degli stati
dai confini reali (pacchetto us-atlas).

**Illustrazioni:** `illustrations/PROMPTS.md` (da leggere) e `illustrations/prompts.csv` (da incollare o
usare in batch) contengono, per ogni immagine mancante, il nome del file, la dimensione minima a 300 dpi,
il formato e il prompt (in inglese). Si rigenerano con `npm run prompts`; i soggetti dei paesaggi sono
in `src/content/landscapes.mjs`. Salvare ogni immagine in `assets/img/states/<stato>/` con il nome
indicato (`hero.jpg`, `dish-1.jpg`, …) e lanciare `npm run build`: il paesaggio viene ritagliato dentro
la sagoma con il contorno oro, le foto riempiono la pagina food, le doppie pagine vengono divise sulle
due pagine affiancate.

**Immagini:** solo l'Alabama ha le immagini definitive. Negli altri 49 stati la hero page mostra
la sagoma reale dello stato con il contorno oro e la dicitura «ILLUSTRATION PLACEHOLDER»; le
pagine food sono segnaposto con la descrizione presa dal manoscritto (una per illustrazione;
le «full page spread» occupano due pagine). Per aggiungere le immagini di uno stato: file come
`src/content/states/alabama.mjs` e voce in `ART` in `build/build.mjs`.

## Correzioni applicate

**Cover** — sottotitolo in navy (#023353, come «THE»). La linea rossa con cinque stelle ora ha le estremità sfumate come nel TOC (stesso componente `starRule`, usato ovunque nel libro). La linea semplice senza stelle è sostituita da una seconda linea a cinque stelle; le due linee sono alla stessa distanza (39 pt) dalle maiuscole del sottotitolo. «50 States · 56 Recipes · One American Table» è raggruppata con la linea inferiore e sale insieme ad essa.

**Copyright** — aggiunta la riga «Library of Congress Control Number: [LCCN to be provided]» subito sotto l'ISBN (blocco registrazione unico, pronto per il numero definitivo).

**Table of Contents** — stile invariato. I numeri di pagina sono dati (`src/content/front-matter.mjs`) e i puntini guida sono ancorati al numero, quindi numeri a 1, 2 o 3 cifre si allineano senza ritocchi. Contenuto **non** modificato: vedi punti aperti.

**Welcome to Our Place** — rimossa la linea con la stella singola; tutto il resto invariato.

**Pag. 9** — la stella singola è ora sotto l'ultima frase.

**Alabama – Hero page** (modello per tutti gli stati) — rimosse la linea a cinque stelle e la linea rossa a stella singola; la linea con la stella dorata è stata spostata nella posizione della linea rossa (tra nome dello stato e nickname). Sagoma dello stato ingrandita di circa il 30% (da ~373 a 486 pt di altezza), ricentrata sul riquadro e con outline nello stesso oro del bordo pagina (#BB9554). Nessuna nuova decorazione.

**Alabama – Story page** — la bandiera (quella dell'Alabama nel file «How the Stars Were Added», `assets/flags/states/`) è un livello di sfondo a colori, molto trasparente (10%), da bordo a bordo e centrato verticalmente dietro il blocco di testo (non un elemento separato sotto il testo). Nessuna informazione aggiuntiva sulla bandiera.

**Alabama – Recipe page** — eliminati i banner illustrati; titolo portato in alto, fuori dall'header. Ordine (round 2): titolo → tagline → yield → decorazione a cinque stelle (stile Our Culinary Map) → ingredienti → istruzioni. Stile Option C. Ingredienti su due colonne quando la lista è lunga (> 5 voci), altrimenti una colonna. Bullet sostituiti da piccole stelle oro semitrasparenti.

**Alabama – Food image page** — solo cibo (piatto finito, salsa, dettagli), nessuna persona; cornici sottili rosse come nel sample.

**Footer** — riprodotto identico al sample (banda rossa + navy, 22 stelle oro, cerchio con numero; offset pari/dispari del master InDesign mantenuto).

**Text styling** — scelta della cliente: Option C (vedi sopra). Le altre opzioni sono state rimosse.

## Punti aperti — servono decisioni/materiali

1. ~~File delle bandiere~~ — ricevuto («How the Stars Were Added»): le 50 bandiere sono in `assets/flags/states/<stato>.png`.
2. **Immagini food page.** L'unica foto del piatto disponibile è quella del sample (1536 × 834 px). La foto principale è ok (~220 dpi); i due riquadri inferiori sono **crop provvisori** della stessa foto (~150 dpi, marcati nel proof interno). Per la stampa servono due scatti dedicati in alta risoluzione (≥ 300 dpi, senza persone né mani), ad es.: (a) flat-lay ingredienti — maionese, aceto di mele, limone, rafano, pepe nero, petti di pollo, panini slider; (b) preparazione — ciotola di white sauce con frusta appoggiata, oppure pollo sulla griglia.
3. **Numerazione TOC.** Oltre al doppio «235» (The Table We Set Together / Menus for the Occasion), i numeri del sample risultano **+1 rispetto alle pagine reali**: Welcome è a pag. 5 ma indicato 6; la hero Alabama è a pag. 12 ma indicata 13. Il blocco da 4 pagine per stato (Alabama 13 → Alaska 17) è coerente; gli stati con salti di 6 pagine hanno probabilmente una ricetta in più. I numeri vanno confermati a impaginazione chiusa; non li ho cambiati.
4. **White Sauce sulla stessa pagina della ricetta.** Per avere Recipe page (14) + Food image page (15) come spread, la sottoricetta Alabama White Sauce è sotto la ricetta principale; il rimando «See Alabama White Sauce, page 15» è diventato «*See Alabama White Sauce, below.». Da confermare con la cliente.
5. **Font.** Nomi degli stati (hero), tagline e lead-in delle istruzioni sono in Libre Caslon (Caslon completo): il sottoinsieme di Adobe Caslon estratto dal sample non contiene molte lettere (es. I, O, N, R in grassetto) e avrebbe mescolato due font nella stessa parola. Con i file Adobe Caslon Pro con licenza si torna al font originale ovunque. Resto della nota: Il sample usa Adobe Caslon Pro (licenza Adobe). I PDF di questo round sono stati generati con il sottoinsieme incorporato nel sample PDF (non versionato, vedi `.gitignore`); senza quei file la build ripiega su Libre Caslon Text. Per la produzione usare il font con licenza (`local('Adobe Caslon Pro')` è già il primo della lista).
6. **Abbondanza (bleed).** Come il sample, i PDF sono al formato rifilato senza abbondanza; per la stampa (KDP/IngramSpark) andrà aggiunto 0.125 in sui lati al vivo (hero page, footer, bandiera TOC).

## Come usare Alabama come modello per gli altri stati

Ogni stato è un file dati in `src/content/states/` con la stessa struttura di `alabama.mjs` (nome, nickname, sagoma, bandiera, story, ricette, immagini). I template in `src/pages.mjs` non contengono testo specifico: stelle, linee, oro/rosso, footer, bandiera trasparente, gerarchia ricetta e stile immagini sono gli stessi per tutti.

## Build

```bash
npm install
npm run build        # genera output/*.pdf e output/previews/*.jpg
```
Serve Chromium (Playwright). Se non viene trovato: `CHROMIUM_PATH=/percorso/chrome npm run build`.

```
src/content/      testi (front matter, stati)
src/pages.mjs     template di pagina
src/components.mjs stelle, linee sfumate, footer
src/styles/book.css stile (token colore/font presi dal sample)
assets/           immagini, font OFL, bandiere
build/build.mjs   HTML → PDF
```
