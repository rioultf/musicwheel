- explique React useRef et pourquoi/comment les const sont recalculées et transmises. Découplage

- fondu vers le vert
- tap pour le BPM
- que le recurrence time soit une fraction
- que la période avec/sans ease soit égale.
- mettre la période au carré/cube pour avoir un comportement mécanique réalise
- mettre un ghost


git remote add origin git@github.com:rioultf/musicwheel.git
git branch -M main
git push -u origin main



Voici un résumé clair et synthétique, idéal pour une présentation ou un README :

---

### 🌀 Application de visualisation de **bagues concentriques synchronisées**

Cette application React affiche un ensemble de **bagues concentriques** (couronnes circulaires), chacune **découpée en arcs réguliers** représentant un motif périodique.
Chaque bague tourne à une **vitesse propre**, définie par sa **période de révolution** et par son **nombre d’arcs (motifs)**, qui détermine la fréquence visuelle du motif.

Les bagues évoluent simultanément, à des vitesses rationnelles différentes, et se **resynchronisent périodiquement** lorsque toutes leurs positions relatives se retrouvent identiques — un phénomène gouverné par le **plus petit commun multiple fractionnaire (PPCM)** de leurs périodes visuelles.
Une **jauge temporelle** illustre cette récurrence : elle se remplit progressivement, ralentit à l’approche de la synchronisation, puis un **flash** marque le retour à la configuration initiale.

L’utilisateur peut interagir en temps réel :

* ajouter ou retirer des bagues,
* ajuster leurs vitesses, directions et divisions angulaires,
* décaler leur phase (φ),
* activer ou désactiver le ralentissement (*ease*) en fin de cycle.

Le résultat est une **horloge visuelle rythmique**, combinant géométrie, cycles et synchronisations harmoniques.
