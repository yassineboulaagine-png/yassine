
# 🧬 Helix Lab — Laboratory Management System

<p align="center">
  A Full Stack Web Application for Managing Medical Laboratory Operations.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Laravel-red?style=for-the-badge&logo=laravel" />
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Database-MySQL-orange?style=for-the-badge&logo=mysql" />
</p>

---

## 📌 About The Project

**Helix Lab** is a full stack web application designed to simplify and optimize the management of medical analysis laboratories.

The platform manages laboratory workflows, from appointment scheduling and patient registration to examination tracking and medical result delivery.

## ✨ Main Features

- Patient management
- Appointment management
- Medical examination management
- Analysis and result tracking
- Role-based user management
- Laboratory dashboard
- Medical results management

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Shadcn/ui

### Backend
- PHP
- Laravel
- REST API

### Database
- MySQL

### Tools
- Git & GitHub
- PlantUML
- Visual Studio Code

## 📂 Project Structure

```text
Helix-Lab/
├── Back-end/
│   └── Laravel Application
├── frontend/
│   └── React Application
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yassineboulaagine-png/yassine.git
cd yassine
```

### 2. Backend Setup

```bash
cd Back-end
composer install
```

Create your environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

Configure your local MySQL database credentials in `.env`.

Run migrations:

```bash
php artisan migrate
```

Start the Laravel server:

```bash
php artisan serve
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Retrieve patients |
| POST | `/api/patients` | Create a patient |


## 📸 Screenshots

### Login Page
![Login Page](.presentation_assets/screenshots/login.png)

### Admin Dashboard
![Admin Dashboard](.presentation_assets/screenshots/admin_dashboard.png)

### Biologist Dashboard
![Biologist Dashboard](.presentation_assets/screenshots/biologiste_dashboard.png)

### Appointment Management
![Appointment Management](.presentation_assets/screenshots/appointment.png)

### Sample Collector Dashboard
![Sample Collector Dashboard](.presentation_assets/screenshots/preleveur_dashboard.png)


## 🔐 Security

- Environment variables are excluded from version control.
- Never commit passwords, API keys, or database credentials.
- Configure your own local environment before running the application.

## 👨‍💻 Author

**Yassine Boulaagine**

Junior Full Stack Developer

- GitHub: [@yassineboulaagine-png](https://github.com/yassineboulaagine-png)

---

<p align="center">
  Built with ❤️ by Yassine Boulaagine
</p>
