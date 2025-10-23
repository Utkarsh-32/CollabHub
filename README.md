# 🧑‍💻 CollabHub - A Developer Collaboration Platform
> CollabHub helps developers find collaborators, build projects and manage teams - all in one place

---

## 🚀 **Live Demo**
- **Frontend:** [https://collabhub-two.vercel.app](https://collabhub-two.vercel.app)
- **Backend API:** [https://collabhub-backend-9ox1.onrender.com/api](https://collabhub-backend-9ox1.onrender.com/api)

> ⚠️ **Note:** The backend is hosted on Render's free tier, which may take a few minutes to start after inactivity. If the demo doesn't load, you can still explore the code and setup locally - full instructions are provided below.

---

## ⚙️ **Tech Stack**

**Backend:**
- Django REST Framework
- PostgreSQL
- JWT Authentication
- GitHub OAuth2
- Dockerized (Render Deployment)

**Frontend:**
- React.js
- Material UI
- Axios (JWT Auth Integration)
- Deployed on Vercel

---

## 🧩 **Core Features**
- User Authentication
- Role-Based Permissions
- Invite, Approve or Reject Team Members
- Project Message Board
- Search Users & Projects
- Profile Customization

---

## 🧠 **Lessons Learned**
- Designed a full-stack architecture using Django + React
- Integrated JWT + OAuth2 securely
- Deployed using Docker, Render and Vercel

---

## 🧱 **Setup Locally**

Follow these steps to run the project locally on your system 👇

### **1. Clone the repository**
```bash
git clone https://github.com/Utkarsh-32/CollabHub.git
cd CollabHub
```

### **2. Create your .env file**
- Create a `.env` file in the root directory and add the following:
```bash
SECRET_KEY=your_secret_key
DEBUG=True
DB_HOST=db
DB_NAME=mydb
DB_USER=user
DB_PASSWORD=password
DB_PORT=5432
FRONTEND_URL=http://localhost:3000
```
- 💡 if running without Docker, set DB_HOST=localhost

### **3. Build and run the containers**
```bash
docker-compose up --build
```

### **4. Access the application**
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/api/](http://localhost:8000/api/)
- Backend admin: [http://localhost:8000/admin/](http://localhost:8000/admin/)

---
## 💬 **About**
- Built as a self-learning project to master backend development, authentication and full-stack development.