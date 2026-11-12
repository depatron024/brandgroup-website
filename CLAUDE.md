# CLAUDE.md

Merkwebsite in gewone HTML, CSS en een beetje JavaScript, zonder framework. Taal van de site: **Engels** (alle teksten op de site). Interne documenten zoals deze mogen Nederlands blijven. Gehost op Netlify.

## Merk

Eerste invulling (voorstel, nog te bevestigen).

- **Naam:** 100x Brands. Gaan we later ook andere dingen doen dan merken, dan wordt het mogelijk "100x Group".
- **Wat we doen:** brandgroup: we bouwen eigen consumentenmerken, nemen passende merken over, adviseren andere founders met onze systemen en investeren in merken van anderen. Nog geen branche op de site noemen.
- **Doelgroep:** founders, investeerders en partners (retailers); klanten van de merken zelf zitten op de merksites.
- **Sfeer:** één beeldstijl op de hele site: elke foto is een halftoon van witte stippen op de merkkleur (zoals de voorbeelden Nelson en Orbit). Onderwerpen passen bij onze visie: diamanten, sieraden, de stad 's nachts, wereldwijd verkopen; geen oude of klassieke beelden. De hero vult het hele scherm met het diamanten 100x erboven. Koppen in de dot-matrixletter Doto; kleine nagebouwde schermen op de beelden. Footer licht met onderaan een strook beeld.
- **Kleuren:** merkkleur nog te kiezen; nu elektrisch blauw (#2b2bd9) met papier (#fbf7f1) en inkt (#1d1714). Op de site staat tijdelijk een kleurkiezer (nachtblauw, zwart, groen, oranje); weghalen zodra er gekozen is.
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
- Beelden: halftoon (witte stippen op transparant, de merkkleur komt uit CSS), gemaakt van open-licentie foto's. Bron en licentie staan op `credits.html`; zet een nieuw beeld daar ook bij.
- Nagebouwde schermen tonen voorbeelddata en dragen altijd het label "Illustrative".
- Lokaal bekijken: zie README.md.

## Werkafspraken

1. Werk nooit direct op `main`; maak voor elke taak een nieuwe branch met een duidelijke naam (bijv. `hero-tekst`, `contactformulier`).
2. Open na elke taak een pull request met een korte uitleg in het Nederlands van wat er veranderd is.
3. Houd stijlen centraal in `css/style.css` via de CSS-variabelen bovenaan dat bestand. Geen losse kleuren, fonts of afstanden in de rest van de CSS of inline in de HTML.
4. Pas niet zomaar dingen aan die buiten de taak vallen. Zie je iets wat beter kan, meld het dan in plaats van het mee te nemen.
