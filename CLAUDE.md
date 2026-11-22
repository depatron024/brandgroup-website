# CLAUDE.md

Merkwebsite in gewone HTML, CSS en een beetje JavaScript, zonder framework. Taal van de site: **Engels** (alle teksten op de site). Interne documenten zoals deze mogen Nederlands blijven. Gehost op Netlify.

## Merk

Bijgewerkt op 22-11-2026 na de visie-vragenlijst (`vragenlijst-visie.md`).

- **Naam:** 100x Group. 100x wordt het huis; later komen er ook 100x Marketing, 100x Investments enz.
- **Wat we doen:** e-commerce-merken bouwen (Build), merken van anderen kopen en groter maken (Buy), en onze systemen achter een merk zetten voor mede-eigendom (Invest). Geen advies.
- **Doelgroep:** jonge e-commerce-ondernemers van 20 tot 28 die al groot zijn (high scalers), geen beginners.
- **Sfeer:** donker, dik en zelfverzekerd: grote cijfers, 100x als echt object (auto-wrap, ketting), founder anoniem. Niets wat AI-achtig oogt.
- **Kleuren:** bijna zwart (#050507), donkergrijs (#15161b), gebroken wit (#ecebe7), grijze bijtekst (#9b978f). Geen fel accent.
- **Lettertypes:** Anton voor koppen, Work Sans voor tekst (Google Fonts).
- **Toon van de teksten:** kort, direct en zelfverzekerd, zonder grootspraak. Cijfers alleen met bron en periode.
- **Niet noemen:** merknamen en andere bedrijven van de oprichters komen niet op de site, tenzij dat expliciet is afgesproken. Wel afgesproken (21-11-2026): de niches (pet-supplementen, sieraden) en de cijfers uit `vragenlijst-visie.md`.

## Referenties

Kijk altijd eerst in de map `/referenties` voordat je iets ontwerpt of de stijl aanpast, en volg die stijl.

- `ooakbrands-com.md` = **concept**: het soort bedrijf dat we zijn (brandgroup). Niet het design of de teksten overnemen.
- `slash-com.md` en `187n-ai.md` = **stijl**: hier komt het design vandaan.
- `bouwblokken.md` = **bouwblokken**: bibliotheken en galerijen (Tremor, ReUI, Rare UI, Morphin, Mobbin) om losse onderdelen uit te halen. Alleen de vorm lenen, nabouwen in gewone HTML/CSS.
- Nooit een referentie 1-op-1 overnemen: geen opbouw, teksten of beelden kopiëren.
 Staat er iets in wat botst met deze CLAUDE.md, vraag het dan na. Is de map nog leeg, zeg dat dan en ga uit van de velden onder "Merk".

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
