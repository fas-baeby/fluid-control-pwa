# fluid-control-pwa

PWA single page pour tester et mettre à jour les régulateurs de débit (MFC) via la
**Web Serial API**. Hébergée en statique sur GitHub Pages, sans étape de build : modules ES
natifs et [Bulma](https://bulma.io/) en CDN.

## État

Connexion au MFC avec **détection automatique de la vitesse** (115200 → 9600) et lecture de
l'identification, puis sélection/validation d'une image de firmware (`.bin`, SHA-256) et
transfert : déverrouillage du bootloader, envoi YMODEM avec barre de progression et journal
d'étapes.

## Prérequis

- Chrome ou Edge sur ordinateur (Web Serial API — non disponible sur Firefox, Safari, iOS)
- Contexte sécurisé : `https://` ou `http://localhost`

## Développement local

```powershell
npx serve .
```

Puis ouvrir <http://localhost:3000>. `file://` ne fonctionne pas : contexte non sécurisé et
modules ES bloqués par CORS.

## Librairie de communication

Le driver MFC provient de
[`PE-FAS-IND/webserial_instrument-core`](https://github.com/PE-FAS-IND/webserial_instrument-core)
(branche `feat/typescript-core`). Sa distribution est commitée dans
`src/vendor/webserial-core/` — GitHub Pages ne déploie que le contenu du dépôt. Pour la
mettre à jour :

```powershell
pwsh ./scripts/vendor-core.ps1
```

Puis incrémenter `CACHE_VERSION` dans `sw.js`.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture, intégration de la librairie,
  séquence de mise à jour firmware, feuille de route.

## Licence

Propriétaire, tous droits réservés — voir [LICENSE](LICENSE). Le dépôt est public pour la
seule distribution via GitHub Pages ; cela ne confère aucun droit d'usage. Composants tiers :
[NOTICE](NOTICE).
