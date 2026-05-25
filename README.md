# Helix Lab - Système de Gestion de Laboratoire

## 📝 Description du projet
Helix Lab est une plateforme digitale conçue pour optimiser la gestion des laboratoires d'analyses médicales. Elle permet de gérer le flux de travail depuis la prise de rendez-vous jusqu'à la délivrance des résultats, en passant par le suivi des examens.

## 🛠️ Technologies utilisées
* **Backend:** Laravel (PHP)
* **Frontend:** React, Tailwind CSS, Shadcn/ui
* **Database:** MySQL
* **Outils:** Git, PlantUML (Conception)


2. Installer les dépendances :
   - Backend : `composer install`
   - Frontend : `npm install`
3. Lancer les migrations de la base de données :
   `php artisan migrate`

## 🔑 Variables .env

'.env'

APP_NAME=Laravel
APP_ENV=local
APP_KEY=base64:osseTAJbY8a7AcgESQf1xmuiYR0V+PklBE/35p8feDM=
APP_DEBUG=true
APP_URL=http://Projet_PFF.test

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
# APP_MAINTENANCE_STORE=database

# PHP_CLI_SERVER_WORKERS=4

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug


DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_pff
DB_USERNAME=yassine_user
DB_PASSWORD=Pfe@2026

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
# CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"



MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=yassineboulaagine@gmail.com
MAIL_PASSWORD=uqveoeabjwxcvblu
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="yassineboulaagine@gmail.com"
MAIL_FROM_NAME="Helix Lab"


HelixLab/
├── Back-end/ (Laravel API & Controllers)
├── frontend/ (React UI components & Styling)
└── README.md


API Endpoints

GET /api/patients : Récupérer la liste des patients.
POST /api/patients : Ajouter un nouveau patient

<img width="1916" height="890" alt="image" src="https://github.com/user-attachments/assets/aedaf3b7-31fb-4fa2-a637-dd7bdaacc7ec" />
<img width="1214" height="806" alt="image" src="https://github.com/user-attachments/assets/2f8bb4fb-d42d-49b3-bda4-22b97cd93e80" />
<img width="1919" height="888" alt="image" src="https://github.com/user-attachments/assets/8e2179ee-248c-4963-88c5-320f402ba2fe" />
<img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/93e398ec-bd81-49ef-8ac5-0ac96249378b" />
<img width="1918" height="885" alt="image" src="https://github.com/user-attachments/assets/d02748f6-9476-4155-aaa3-ae8b3019533e" />
