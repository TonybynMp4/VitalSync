# VitalSync - CI/CD conteneurisee

## Description du projet
VitalSync est une application web composee de 3 services conteneurises :
- Un front-end Nginx qui sert l'interface web et reverse-proxy les appels API.
- Un back-end Node.js/Express qui expose des routes REST.
- Une base de donnees PostgreSQL pour le stockage persistant.

Le projet est pense pour illustrer une chaine CI/CD complete : lint, tests, build d'images Docker, push vers la registry GHCR, puis deploiement de validation en environnement de staging simule.

## Architecture technique
### Composants
- Front-end : Nginx 1.29 (image alpine), exposition HTTP sur le port 80 du conteneur.
- Back-end : Node.js 25 + Express 4, API disponible sur le port 3000 du conteneur.
- Base de donnees : PostgreSQL 16 (alpine), volume persistant Docker.

### Reseau
Tous les services communiquent sur le reseau bridge Docker `vitalsync-net`.
Le front-end est le seul service publie vers l'exterieur (port hote defini par `FRONTEND_PORT`, 8080 par defaut).

## Prerequis (local)
- Docker (allumé tant qu'a faire).
- Docker Compose (commande `docker compose` pas `docker-compose`)
- Git
- Optionnel pour developpement hors conteneur :
  - Node.js 25 (même 20 je pense en vrai)
  - npm

## Configuration locale
1. Cloner le depot:
```bash
git clone https://github.com/tonybynmp4/vitalsync.git
cd vitalsync
```

2. Copier le fichier d'environnement :
   - `cp .env.example .env`

3. Optionnel, les variables d'environnement peuvent etre changé.

## Lancer l'application avec Docker Compose
Depuis la racine du projet :

```bash
docker compose up -d --build
```

Verifier l'etat des conteneurs :

```bash
docker compose ps
```

Verifier la sante applicative via le front (proxy API) :

```bash
curl http://localhost:8080/api/health
```

Arreter et nettoyer :

```bash
docker compose down -v
```

## Pipeline CI/CD - fonctionnement
Workflow GitHub Actions : `.github/workflows/ci-cd.yml`

### Declencheurs
- `push` sur la branche `develop`
- `pull_request` vers la branche `main`

### Job 1 - Lint & Tests
- Checkout du code.
- Setup Node.js 25.
- Installation des dependances backend via `npm ci`.
- Execution ESLint (`npm run lint`).
- Execution des tests Jest (`npm test`).

Objectif : bloquer les regressions qualite avant build.

### Job 2 - Build Docker + Push GHCR
- Lance uniquement sur evenement `push`.
- Build des images backend et frontend.
- Push dans GitHub Container Registry (GHCR) avec tag base sur `${{ github.sha }}`.

Objectif : produire des images traceables, reproductibles et versionnees par commit.

### Job 3 - Deploy Staging (simulation)
- Lance uniquement sur `push` apres succes des jobs precedents.
- Genere un fichier `.env` runtime depuis les secrets GitHub.
- Lance `docker compose up -d --build`.
- Effectue un health check sur `http://localhost:8080/api/health`.
- En cas d'echec : dump des logs.
- Nettoyage systematique via `docker compose down -v`.

Objectif : valider le comportement en execution reelle apres build, avec une verification de disponibilite.

## Choix techniques et justifications
1. Docker Compose pour l'orchestration locale
- Choix : simple, lisible et suffisant pour un environnement de dev/staging simule.
- Justification : demarrage rapide des 3 services, reseau et volumes geres nativement.

2. Separation front/back/database en services distincts
- Choix : architecture en composants decouples.
- Justification : meilleure maintenabilite, isolation des responsabilites, evolutivite.

3. Nginx en front-end et reverse proxy API
- Choix : front statique servi par Nginx, proxy `/api` vers backend.
- Justification : perf pour contenu statique, configuration robuste et courante en production.

4. Node.js 25 pour le backend
- Choix : version alignee entre Dockerfile et pipeline CI.
- Justification : coherence des environnements et reduction des ecarts dev/CI.

5. Tests et lint avant build
- Choix : quality gate en premiere etape.
- Justification : evite de publier des images non conformes et reduit le cout des erreurs tardives.

6. Images taguees par SHA Git
- Choix : tags `${{ github.sha }}`.
- Justification : tracabilite forte entre image, commit source et deploiement.

7. Multi-stage Docker pour le backend
- Choix : etape de test puis image runtime alpine.
- Justification : image finale plus legere, moins d'outils de dev embarques, surface d'attaque reduite.

## Coherence avec le projet
- Port API backend : 3000 (compose + code backend).
- Endpoint de sante : `/api/health` expose via le front a `http://localhost:8080/api/health`.
- Version Node en CI : 25, coherente avec les Dockerfiles backend.
- Registry cible CI/CD : GHCR (`ghcr.io/tonybynmp4/...`).
