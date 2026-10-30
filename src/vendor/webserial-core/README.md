# Distribution @fas/webserial-core

Copie generee de la distribution ESM de
[`webserial_instrument-core`](https://github.com/PE-FAS-IND/webserial_instrument-core)
(branche `feat/typescript-core`, dossier `dist/`).

**Ne pas editer a la main** : tout changement est ecrase a la prochaine synchronisation.
Ces fichiers sont commites parce que GitHub Pages ne publie que le contenu du depot ; un
dossier ignore ne serait jamais deploye et l'application signalerait la librairie absente.

Pour mettre a jour :

```powershell
pwsh ./scripts/vendor-core.ps1
```

Puis incrementer `CACHE_VERSION` dans `sw.js`.

Procedure detaillee et alternatives : `docs/ARCHITECTURE.md`.
