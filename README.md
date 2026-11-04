# ISTA Nador — Gestion des absences

Application web pour gérer les absences des stagiaires. Ce guide explique comment installer et tester l'application sur un PC Windows.

---

## 1. Installation (une seule fois)

### Installer Laragon

1. Aller sur <https://laragon.org/download/> et telecharger **Laragon Full**.
2. Lancer l'installateur et accepter les options par defaut.
3. Une fois installe, ouvrir Laragon.

Laragon installe automatiquement PHP, Composer, Node.js et Git.

### Verifier la version de PHP

Ouvrir le **Terminal Laragon** (bouton "Terminal" dans la fenetre Laragon) et taper :

```
php -v
```

Le numero de version doit commencer par **8.3** ou plus. Si la version est inferieure, mettre a jour PHP depuis le menu Laragon : clic droit sur la fenetre Laragon > PHP > Version > choisir 8.3 ou plus.

### Recuperer le projet

**Option A — fichier ZIP :** decompresser le ZIP dans `C:\laragon\www\ista-nador`.

**Option B — Git :** dans le Terminal Laragon :

```
cd C:\laragon\www
git clone <URL_DU_DEPOT> ista-nador
```

Remplacer `<URL_DU_DEPOT>` par l'adresse fournie par le developpeur.

---

## 2. Configuration

Toutes les commandes ci-dessous se tapent dans le **Terminal Laragon**, depuis le dossier du projet :

```
cd C:\laragon\www\ista-nador
```

L'application utilise **SQLite** (un fichier de base de donnees local). Aucun serveur de base de donnees n'est necessaire.

### Installation automatique

Lancer cette commande unique qui installe tout :

```
composer setup
```

Cela execute : installation des dependances PHP, creation du fichier `.env`, generation de la cle, migration de la base de donnees, installation des dependances JavaScript, compilation du site.

### Ajouter les donnees de test

La commande precedente cree la base mais sans comptes de test. Pour les ajouter :

```
php artisan db:seed
```

---

## 3. Lancer l'application

Dans le Terminal Laragon :

```
cd C:\laragon\www\ista-nador
php artisan serve
```

Ouvrir un navigateur et aller a : **http://127.0.0.1:8000**

Pour arreter le serveur : revenir dans le Terminal et appuyer sur `Ctrl + C`.

---

## 4. Comptes de test

Tous les mots de passe sont `password`.

| Role           | Identifiant de connexion | Type de connexion |
| -------------- | ------------------------ | ----------------- |
| Administrateur | `admin@ista-nador.ma`    | Email             |
| Formateur      | `F001`                   | Matricule         |
| Surveillant    | `S001`                   | Matricule         |

Le seeder cree aussi deux groupes (DEV101, DEV102) pour l'annee 2026-2027.

---

## 5. Checklist de test rapide

### Se connecter

- Ouvrir http://127.0.0.1:8000, se connecter avec le compte admin (email : `admin@ista-nador.ma`, mot de passe : `password`).
- Se deconnecter, puis se reconnecter avec le matricule `F001` (formateur) pour verifier l'acces formateur.

### Importer des stagiaires depuis Excel

1. Aller dans un **Groupe** (ex: DEV101).
2. Utiliser le bouton d'import. Le fichier Excel doit contenir ces colonnes (noms exacts en en-tete) :
   **MatriculeEtudiant**, **Nom**, **Prenom**, **Nom_Arabe**, **Prenom_Arabe**, **DateNaissance**, **LieuNaissance**, **CIN**, **NTelelephone**.
3. Seuls **Nom** et **Prenom** sont obligatoires.
4. Il existe aussi un import global (tous les groupes a la fois) qui demande une colonne supplementaire **LibelleLong** (nom du groupe).

Il n'y a pas de fichier Excel d'exemple dans le projet. Creer un fichier `.xlsx` avec les colonnes ci-dessus pour tester.

### Ajouter un stagiaire manuellement

- Dans la page d'un groupe, utiliser le formulaire d'ajout de stagiaire.

### Prendre les presences (creer une seance)

- Aller dans **Seances** > **Creer une seance**. Choisir un groupe, un sujet, un formateur, une date et les horaires.
- Dans la seance creee, marquer les stagiaires absents.

### Chercher un stagiaire

- Dans le tableau de bord, utiliser la barre de recherche ou le filtre par groupe.

### Consulter l'historique d'un stagiaire

- Cliquer sur un stagiaire pour voir sa fiche : informations personnelles, liste des absences, statut des billets.

### Emettre un billet d'absence

- Depuis le tableau de bord, selectionner un ou plusieurs stagiaires et utiliser l'action d'emission de billet. Un PDF est genere (format A6, 4 stagiaires par page).

### Voir les statistiques

- Aller dans **Statistiques** pour voir les absences par groupe et le classement des stagiaires les plus absents.

### Exporter en PDF

- Depuis le tableau de bord ou les statistiques, utiliser les boutons d'export pour generer des PDF (fiche stagiaire, liste d'absences).

### Administration (compte admin uniquement)

- Aller dans **Admin > Comptes** pour creer des comptes formateur ou surveillant et assigner des groupes aux formateurs.

---

## 6. Problemes courants

| Probleme                       | Solution                                                                                                                          |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| La page ne s'ouvre pas         | Verifier que `php artisan serve` est bien lance dans le Terminal.                                                                 |
| Erreur "could not find driver" | SQLite est inclus dans Laragon. Verifier que l'extension `pdo_sqlite` est activee (menu Laragon > PHP > Extensions > pdo_sqlite). |
| Commande introuvable           | Utiliser le **Terminal Laragon**, pas l'Invite de commandes Windows classique. Le Terminal Laragon connait PHP, Composer et Node. |
| Page blanche ou sans style     | Lancer `npm run build` dans le Terminal, puis recharger la page dans le navigateur.                                               |
| Le port 8000 est deja utilise  | Lancer avec un autre port : `php artisan serve --port=8001` puis ouvrir `http://127.0.0.1:8001`.                                  |
| Remettre les donnees a zero    | Lancer `php artisan migrate:fresh --seed`. **Attention : cela supprime toutes les donnees.**                                      |

---

## 7. Signaler un probleme

En cas d'erreur, envoyer au developpeur :

- une capture d'ecran de la page du navigateur montrant l'erreur ;
- une capture d'ecran du Terminal s'il affiche un message d'erreur.
