# CLAUDE.md

Merkwebsite in gewone HTML, CSS en een beetje JavaScript, zonder framework. Taal van de site: **Engels** (alle teksten op de site). Interne documenten zoals deze mogen Nederlands blijven. Gehost op Netlify.

## Merk

Eerste invulling (voorstel, nog te bevestigen).

- **Naam:** 100x Brands. Gaan we later ook andere dingen doen dan merken, dan wordt het mogelijk "100x Group".
- **Wat we doen:** brandgroup: we bouwen eigen consumentenmerken, nemen passende merken over, adviseren andere founders met onze systemen en investeren in merken van anderen. Nog geen branche op de site noemen.
- **Doelgroep:** founders, investeerders en partners (retailers); klanten van de merken zelf zitten op de merksites.
- **Sfeer:** Imperium. Eén beeldwereld: Rome (centum = honderd; een centurion leidde er honderd). Alle beelden zijn museumfoto's van Romeinse bustes, munten en reliëfs, als halftoon in keizerlijk rood gedrukt. Kleine nagebouwde schermen liggen op die beelden. Koppen in een dot-matrixletter die bij de stippen past. De diamanten touch: Augustus draagt een iced-out ketting met een 100x-hanger (js/chrome.js tekent de stenen). Klassiek en stabiel, met onze flex eroverheen.
- **Kleuren:** keizerlijk rood (#9e1b1f), bot (#f3ece2), papier (#fbf7f1) en inkt (#1d1714).
- **Lettertypes:** Doto (dot-matrix) alleen voor groot werk; Inter voor alles wat je moet lezen (Google Fonts).
- **Toon van de teksten:** kort, direct en zelfverzekerd, zonder grootspraak. Cijfers alleen met bron en periode.
- **Niet noemen:** andere bedrijven of merken van de oprichters komen niet op de site, tenzij dat expliciet is afgesproken.

## Referenties

Kijk altijd eerst in de map `/referenties` voordat je iets ontwerpt of de stijl aanpast, en volg die stijl.

- `ooakbrands-com.md` = **concept**: het soort bedrijf dat we zijn (brandgroup). Niet het design of de teksten overnemen.
- `slash-com.md` en `187n-ai.md` = **stijl**: hier komt het design vandaan.
- `bouwblokken.md` = **bouwblokken**: bibliotheken en galerijen (Tremor, ReUI, Rare UI, Morphin, Mobbin) om losse onderdelen uit te halen. Alleen de vorm lenen, nabouwen in gewone HTML/CSS.
- Nooit een referentie 1-op-1 overnemen: geen opbouw, teksten of beelden kopiëren.
 Staat er iets in wat botst met deze CLAUDE.md, vraag het dan na. Is de map nog leeg, zeg dat dan en ga uit van de velden onder "Merk".

## Techniek

- `index.html` in de root, stijlen in `css/style.css`, scripts in `js/` (`chrome.js` tekent het diamanten 100x), beelden in `images/`.
- Mobiel eerst: basisstijlen voor mobiel, grotere schermen via `@media (min-width: ...)`.
- Geen frameworks, build-tools of npm-pakketten zonder overleg.
- Beelden: halftoon in rood, gemaakt van open-licentie museumbeelden. Bron en licentie staan op `credits.html`; zet een nieuw beeld daar ook bij.
- Nagebouwde schermen tonen voorbeelddata en dragen altijd het label "Illustrative".
- Lokaal bekijken: zie README.md.

## Werkafspraken

1. Werk nooit direct op `main`; maak voor elke taak een nieuwe branch met een duidelijke naam (bijv. `hero-tekst`, `contactformulier`).
2. Open na elke taak een pull request met een korte uitleg in het Nederlands van wat er veranderd is.
3. Houd stijlen centraal in `css/style.css` via de CSS-variabelen bovenaan dat bestand. Geen losse kleuren, fonts of afstanden in de rest van de CSS of inline in de HTML.
4. Pas niet zomaar dingen aan die buiten de taak vallen. Zie je iets wat beter kan, meld het dan in plaats van het mee te nemen.
