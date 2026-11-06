# CLAUDE.md

Merkwebsite in gewone HTML, CSS en een beetje JavaScript, zonder framework. Taal van de site: **Engels** (alle teksten op de site). Interne documenten zoals deze mogen Nederlands blijven. Gehost op Netlify.

## Merk

Eerste invulling (voorstel, nog te bevestigen).

- **Naam:** 100x Brands. Gaan we later ook andere dingen doen dan merken, dan wordt het mogelijk "100x Group".
- **Wat we doen:** een team jonge, hongerige Nederlandse gasten dat eigen consumentenmerken bouwt die elk de nummer één worden in hun niche, passende merken overneemt en andere founders adviseert. 100x (altijd keer 100) is het motto en wordt later een huis: Brands, Agency, Real Estate, Projects, Investments. Nog geen branche op de site noemen.
- **Doelgroep:** founders, investeerders en partners (retailers); klanten van de merken zelf zitten op de merksites.
- **Sfeer:** opvallend en niet corporate. 100x als iced-out object, daarna vlieg je door de nul. Vette hoofdletters, korte harde zinnen, eigen rauw beeld van team en merken. Geen oude foto's en geen rustig-premium. Van vroeger nemen we alleen mee dat bedrijven gebouwd waren om te blijven.
- **Kleuren:** zwart (#050507), donkergrijze kaarten (#121318), wit, felle oranje accent (#ff4d00).
- **Lettertypes:** Anton voor koppen, Inter voor tekst (Google Fonts).
- **Toon van de teksten:** kort, brutaal en zelfverzekerd. Cijfers alleen met bron en periode.
- **Niet noemen:** andere bedrijven of merken van de oprichters komen niet op de site, tenzij dat expliciet is afgesproken.

## Referenties

Kijk altijd eerst in de map `/referenties` voordat je iets ontwerpt of de stijl aanpast, en volg die stijl.

- `ooakbrands-com.md` = **concept**: het soort bedrijf dat we zijn (brandgroup). Niet het design of de teksten overnemen.
- `slash-com.md` en `187n-ai.md` = **stijl**: hier komt het design vandaan.
- `bouwblokken.md` = **bouwblokken**: bibliotheken en galerijen (Tremor, ReUI, Rare UI, Morphin, Mobbin) om losse onderdelen uit te halen. Alleen de vorm lenen, nabouwen in gewone HTML/CSS.
- Nooit een referentie 1-op-1 overnemen: geen opbouw, teksten of beelden kopiëren.
 Staat er iets in wat botst met deze CLAUDE.md, vraag het dan na. Is de map nog leeg, zeg dat dan en ga uit van de velden onder "Merk".

## Techniek

- Elke pagina is een eigen `.html` in de root (`index`, `brands`, `how-we-build`, `founders`, `work-with-us`, `contact`); stijlen in `css/style.css`, scripts in `js/`, beelden in `images/`. Header en footer staan op elke pagina: pas ze overal aan.
- Mobiel eerst: basisstijlen voor mobiel, grotere schermen via `@media (min-width: ...)`.
- Geen frameworks, build-tools of npm-pakketten zonder overleg.
- Lokaal bekijken: zie README.md.

## Werkafspraken

1. Werk nooit direct op `main`; maak voor elke taak een nieuwe branch met een duidelijke naam (bijv. `hero-tekst`, `contactformulier`).
2. Open na elke taak een pull request met een korte uitleg in het Nederlands van wat er veranderd is.
3. Houd stijlen centraal in `css/style.css` via de CSS-variabelen bovenaan dat bestand. Geen losse kleuren, fonts of afstanden in de rest van de CSS of inline in de HTML.
4. Pas niet zomaar dingen aan die buiten de taak vallen. Zie je iets wat beter kan, meld het dan in plaats van het mee te nemen.
