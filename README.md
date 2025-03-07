# Secured-WebShop
Ce projet P_APP_183 : Secured WebShop consiste à développer un site e-commerce sécurisé, intégrant une gestion des utilisateurs et une interface d'administration.

## Objectifs principaux
- Authentification sécurisée : Implémentation d’un système d'authentification avec hachage et salage des mots de passe, ainsi que l'utilisation de JWT (JSON Web Token) pour gérer les sessions utilisateurs.
- Séparation des rôles : Deux types d’utilisateurs sont définis :
  - Clients : Ils peuvent s’inscrire, se connecter et accéder à leur profil.
  - Administrateurs : Ils ont des privilèges pour rechercher des utilisateurs et gérer des données sensibles.
- Sécurisation du site : Protection contre les injections SQL et utilisation d’un certificat HTTPS pour garantir la confidentialité des échanges.
- Développement backend et frontend : Utilisation de Node.js pour le backend et MySQL pour la base de données.
- Déploiement avec Docker : Containerisation des services pour un environnement sécurisé et reproductible.
  
## Fonctionnalités principales
- Page de connexion sécurisée.
- Page d’administration avec recherche d’utilisateurs.
- Page de profil utilisateur affichant ses informations.
- Sécurisation des routes avec authentification et autorisations basées sur les rôles.
Le projet met l’accent sur la sécurité web, la gestion des utilisateurs et les bonnes pratiques de développement, offrant ainsi une expérience complète en conception et sécurisation d’applications web.
