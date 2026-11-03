# Merkwebsite

Website van 100x Brands, in gewone HTML, CSS en JavaScript, zonder framework.

## Lokaal bekijken

Snelst: open `index.html` met een dubbelklik in je browser.

Beter (zodat links en paden werken zoals online), start een lokale server in de map van de repository:

```bash
python3 -m http.server 8000
```

Ga daarna naar http://localhost:8000. Stoppen met `Ctrl+C`.

## Samenwerken

1. **Haal eerst de laatste versie op:** `git switch main` en `git pull`.
2. **Maak een branch per taak**, met een duidelijke naam: `git switch -c hero-tekst`. Werk nooit direct op `main`.
3. **Commit en push** je werk: `git push -u origin hero-tekst`.
4. **Open een pull request** op GitHub met een korte uitleg in het Nederlands: wat is er veranderd en waarom.
5. **Bekijk de preview:** Netlify maakt bij elke pull request automatisch een preview-link (Deploy Preview). Die staat in de pull request. Zo kunnen we allebei het resultaat bekijken voordat het live gaat.
6. **Samenvoegen:** als de ander akkoord is, merge je de pull request. Netlify zet `main` daarna automatisch live.

### Netlify koppelen (eenmalig)

In Netlify: *Add new site* → *Import an existing project* → kies deze GitHub-repository. De instellingen staan al in `netlify.toml` (geen build-stap, publiceren vanuit de root). Deploy Previews voor pull requests staan standaard aan.

## Mapstructuur

```
.
├── index.html        Homepage
├── css/
│   └── style.css     Alle stijlen; ontwerpvariabelen bovenaan
├── js/
│   └── main.js       Kleine scripts (mobiel menu, jaartal)
├── images/           Beelden die op de site komen
├── referenties/      Inspiratiebeelden en designvoorbeelden (niet op de site gelinkt)
├── netlify.toml      Netlify-instellingen
├── CLAUDE.md         Merkinformatie en werkafspraken voor Claude
└── README.md         Dit bestand
```

## Design aanpassen

Alle kleuren, lettertypes en afstanden staan als CSS-variabelen bovenaan `css/style.css` (in `:root`). Pas je daar een waarde aan, dan verandert het overal op de site.

## Referenties toevoegen

1. Zet screenshots, moodboards of designvoorbeelden in de map `referenties/`.
2. Geef bestanden een beschrijvende naam, bijv. `hero-voorbeeld-merkx.png` of `kleuren-moodboard.jpg`.
3. Wil je iets toelichten (wat je er goed aan vindt, welk onderdeel je bedoelt), zet dan een tekstbestand met dezelfde naam ernaast, bijv. `hero-voorbeeld-merkx.txt`.
4. Commit ze via een branch en pull request, net als ander werk.

Claude kijkt altijd eerst in deze map voordat er iets ontworpen wordt (zie `CLAUDE.md`).
