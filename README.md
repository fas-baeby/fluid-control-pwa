# fluid-control-pwa

PWA single page pour tester et mettre à jour les régulateurs de débit (MFC) via la
**Web Serial API**. Hébergée en statique sur GitHub Pages, sans étape de build : modules ES
natifs et [Bulma](https://bulma.io/) en CDN.

## État

Étape 1 : interface de sélection et de validation d'une image de firmware (`.bin`), avec
affichage de la taille, de la date et de l'empreinte SHA-256. Le transfert série est préparé
mais pas encore activé.

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
(branche `feat/typescript-core`). Sa distribution n'est pas commitée :

```powershell
pwsh ./scripts/vendor-core.ps1
```

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture, intégration de la librairie,
  séquence de mise à jour firmware, feuille de route.
