# STAGE 1 (tester): Installe TOUTES les dépendances (prod + dev)
#   et exécute les tests. Cette étape valide le build AVANT production.
# STAGE 2 (production): Copie UNIQUEMENT le code validé et les dépendances
#   de PRODUCTION. Utilise node:25-alpine pour minimiser la taille & les failles.
#
# AVANTAGES SÉCURITÉ:
#   - Les outils de test (jest...) ne sont pas dans l'image de production, réduit la surface d'attaque (moins de packages = moins de vulnérabilités)
#   - Alpine est plus sécurisé que les images complètes (moins de composants, moins de failles)
#
# AVANTAGES TAILLE:
#   - Stage 1 (~1.2GB): Linux pas minimal + toutes les dépendances (dev + prod)
#   - Stage 2 (~200MB): Alpine est minimal + pas de dépendances dev

FROM node:25 AS tester

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY . .

RUN npm test

FROM node:25-alpine AS app

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i --omit=dev
# recupère les sources et le node_modules du stage de test vu que les tests passent
COPY --from=tester /app .

EXPOSE 3000

CMD ["npm", "start"]