# Lumière Photos — App mobile (iOS / Android)

App mobile React Native (Expo, TypeScript) pour le CDC "Lumière Photos" :
album photo familial avec backoffice, droits d'accès, arbre généalogique,
réactions et notifications.

Elle consomme directement l'API du backend existant du repo
[`lumiere-photos`](https://github.com/AndyAndrianjatovo/lumiere-photos)
(Express + sql.js) — aucune modification n'a été faite côté backend dans
cette session (accès en lecture seule). Les recommandations backend
nécessaires pour aller plus loin sont listées en bas de ce document.

## Pourquoi React Native + Expo

- Un seul codebase TypeScript pour iOS et Android — adapté à une petite
  équipe / un usage familial.
- Écosystème mature pour ce dont le CDC a besoin : caméra/galerie
  (`expo-image-picker`), rendu image performant avec cache
  (`expo-image`), stockage sécurisé (`expo-secure-store`), notifications
  push (`expo-notifications`, à ajouter — voir Roadmap).
- Déploiement simplifié via EAS Build/Submit vers l'App Store et le Play
  Store sans maintenir deux codebases natifs séparés.

## Démarrer

Prérequis : Node.js 18+, le backend `lumiere-photos` lancé en local
(`npm install && node server.js` dans ce repo, sur le port 3000).

```bash
cd mobile-app
npm install
npx expo install --fix   # aligne les versions natives sur le SDK Expo installé
cp .env.example .env     # ajuster EXPO_PUBLIC_API_BASE_URL si besoin
npx expo start
```

- Simulateur iOS : `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000`
- Émulateur Android : `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:3000`
- Téléphone physique (Expo Go) : IP LAN de la machine qui héberge le backend

Compte admin créé automatiquement par le backend au premier démarrage :
`admin / admin123` (à changer immédiatement en production).

## Architecture

```
mobile-app/
  src/
    api/            client HTTP + un module par ressource backend (auth,
                    albums, photos, notifications, familyTree), typé
                    d'après les routes Express réellement lues dans
                    lumiere-photos/routes/*.js
    context/        AuthContext (session, bootstrap, login/logout) et
                    NotificationsContext (polling + badge non-lus)
    navigation/     Stack racine (Login ↔ Tabs) + Bottom Tabs
    screens/        Un écran par vue du CDC
    components/     AlbumCard, ReactionBar, CommentItem, NotificationBell…
    theme/          Design tokens clair/sombre, inspiration Apple
                    (SF-like spacing/typo, coins arrondis, palette système)
```

### Authentification : cookie de session, pas de JWT

Le backend utilise `express-session` (cookie `connect.sid`), pas de
token bearer. Le client mobile envoie `credentials: 'include'` sur
chaque requête et s'appuie sur `@react-native-cookies/cookies` pour que
le cookie de session **survive au redémarrage de l'app** (un `flush()`
explicite est déclenché après login/logout — nécessaire surtout sur
Android). C'est fonctionnel tel quel, mais un token d'API dédié côté
backend serait plus robuste pour du mobile pur (voir Recommandations).

## Ce qui est fonctionnel (branché sur l'API réelle)

| Fonctionnalité CDC | Écran | Détail |
|---|---|---|
| Connexion | `LoginScreen` | `POST /api/auth/login`, session persistée |
| Gestion des albums (consultation, droits) | `AlbumsScreen` | `GET /api/albums`, vignettes réelles, badge "privé" |
| Photos d'un album | `AlbumDetailScreen` | `GET /api/photos/album/:id`, grille responsive |
| Commentaires (+ `@mention`) | `PhotoDetailScreen` | lecture/écriture, mentions mises en évidence |
| Réactions (6 emojis façon Facebook) | `PhotoDetailScreen` | `POST /api/photos/:id/reactions`, toggle |
| Identification de personnes sur une photo | `PhotoDetailScreen` | tap sur la photo → choix d'une personne de l'arbre → tag posé, affichage nom/prénom uniquement (pas de photo/date, conforme au CDC) |
| **Notifications** (cloche + pastille non-lus, marquage lu à l'ouverture) | `NotificationsScreen` + `NotificationBell` | `GET/POST /api/notifications`, tous les types (comment/reaction/mention/tag/tagged) |
| Arbre généalogique (liste des personnes) | `FamilyTreeScreen` | `GET /api/family-tree` |
| Profil / déconnexion | `ProfileScreen` | `POST /api/auth/logout` |

## Ce qui reste à faire (stub ou hors périmètre de ce scaffold)

- **Rendu graphique de l'arbre généalogique** (couples, liens
  parent-enfant en diagramme interactif) — `FamilyTreeScreen` affiche
  pour l'instant une liste ; le rendu visuel équivalent à
  `public/family-tree.html` reste à construire (composant de layout
  d'arbre dédié).
- **Upload de photos depuis le mobile** (`expo-image-picker` +
  `photosApi.upload`, la fonction API existe déjà dans `src/api/photos.ts`
  mais n'est pas encore câblée à un écran).
- **Gestion des albums/utilisateurs par l'admin** (création d'album,
  droits d'accès, invitations) — actuellement backoffice web uniquement.
- **Partage de lien externe avec mot de passe** — endpoint
  `GET /api/albums/shared/:token` déjà typé mais pas d'écran dédié.
- **Module "gender reveal"** — non repris dans ce scaffold.
- **Notifications push natives** (voir ci-dessous).

## Notifications en "quelques secondes" — limite actuelle et recommandation backend

Le CDC demande une notification perçue en quelques secondes après
l'action déclenchante. Cette app fait du **polling** (toutes les 15 s
tant que l'app est au premier plan, cf. `NotificationsContext`), ce qui
respecte le délai quand l'app est ouverte mais ne réveille pas l'app en
arrière-plan/fermée.

Pour un vrai temps réel, il faut côté backend (non fait ici, accès
lecture seule sur `lumiere-photos`) :
1. Stocker un `expo_push_token` par utilisateur (nouvelle table +
   endpoint `POST /api/notifications/push-token`).
2. À chaque `INSERT INTO notifications` (déjà centralisé dans
   `routes/photos.js`), envoyer un push via l'API Expo Push
   (`https://exp.host/--/api/v2/push/send`) en plus de l'écriture en base.
3. Optionnel : remplacer le polling par un WebSocket/SSE pour la pastille
   en direct quand l'app est ouverte.

## Design

Palette et typographie inspirées d'Apple (SF Pro-like spacing/scale),
support clair/sombre automatique via `useColorScheme` (`src/theme/index.ts`),
composants avec coins arrondis et hiérarchie visuelle simple. Les
vignettes d'albums utilisent le endpoint de thumbnails déjà généré côté
backend (`/uploads/thumbs/*.jpg`) pour éviter le problème de "vignette
vide" identifié sur le site web.
