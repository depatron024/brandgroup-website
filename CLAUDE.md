# CLAUDE.md

Merkwebsite in gewone HTML, CSS en een beetje JavaScript, zonder framework. Taal van de site: Nederlands. Gehost op Netlify.

## Merk

Nog in te vullen.

- **Naam:**
- **Wat we doen:**
- **Doelgroep:**
- **Sfeer:**
- **Kleuren:**
- **Lettertypes:**
- **Toon van de teksten:**

## Referenties

Kijk altijd eerst in de map `/referenties` voordat je iets ontwerpt of de stijl aanpast, en volg die stijl. Staat er iets in wat botst met deze CLAUDE.md, vraag het dan na. Is de map nog leeg, zeg dat dan en ga uit van de velden onder "Merk".

## Techniek

- `index.html` in de root, stijlen in `css/style.css`, scripts in `js/`, beelden in `images/`.
- Mobiel eerst: basisstijlen voor mobiel, grotere schermen via `@media (min-width: ...)`.
- Geen frameworks, build-tools of npm-pakketten zonder overleg.
- Lokaal bekijken: zie README.md.

## Werkafspraken

1. Werk nooit direct op `main`; maak voor elke taak een nieuwe branch met een duidelijke naam (bijv. `hero-tekst`, `contactformulier`).
2. Open na elke taak een pull request met een korte uitleg in het Nederlands van wat er veranderd is.
3. Houd stijlen centraal in `css/style.css` via de CSS-variabelen bovenaan dat bestand. Geen losse kleuren, fonts of afstanden in de rest van de CSS of inline in de HTML.
4. Pas niet zomaar dingen aan die buiten de taak vallen. Zie je iets wat beter kan, meld het dan in plaats van het mee te nemen.
