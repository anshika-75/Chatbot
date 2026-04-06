# Smartflo Chatbot Deployment Guide 🚀

This application is split into two parts: a **FastAPI Python Backend** and a **React (Vite) Frontend**. The most efficient and cost-effective way to deploy this full-stack application is to use **Render** for the backend and **Vercel** for the frontend.

---

## 🌩️ Part 1: Deploying the Backend (Render)

Render is perfect for Python servers and will run your FastAPI system.

### 1. Prerequisites
- Create a free account at [Render](https://render.com/).
- Make sure your GitHub repository (`anshika-75/Chatbot`) is up-to-date.

### 2. Create a New Web Service
1. On your Render Dashboard, click **New +** and select **Web Service**.
2. Connect your GitHub account and select the `Chatbot` repository.
3. Configure the general settings as follows:
   - **Name**: `smartflo-ai-backend` (or any name you choose)
   - **Branch**: `main`
   - **Root Directory**: `backend` (This focuses Render specifically on the Python source).
   - **Environment**: **Python**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Add Environment Variables
Scroll down to the **Environment Variables** section and inject your API key so that Render has access to Groq:
- **Key**: `GROQ_API_KEY`
- **Value**: *(Paste your actual Groq Key here)*

### 4. Deploy!
Click **Create Web Service**. Render will now automatically install your dependencies, boot up the FastAPI server, and construct the RAG vector engine. It will give you a live URL like `https://smartflo-ai-backend.onrender.com`. Keep this URL handy; we need it for the frontend!

---

## 🎨 Part 2: Deploying the Frontend (Vercel)

Vercel is the premier platform for hosting lightning-fast React and Vite applications. 

### 1. Update the API Endpoint
Before deploying the frontend, we must tell it where the newly deployed backend lives. 

Currently, `App.jsx` points to local connections. 
1. In `frontend/src/App.jsx`, locate the axios request:
   ```javascript
   const response = await axios.post("http://localhost:8000/chat", {
   ```
2. **Replace `http://localhost:8000`** with the deployed Render URL (e.g., `https://smartflo-ai-backend.onrender.com`).
3. Commit and Push this change to GitHub so Vercel can see it!

### 2. Deploy on Vercel
1. Log into [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Import the `Chatbot` GitHub repository.
3. Vercel will ask you to configure the project. Make the following changes:
   - **Framework Preset**: Vite
   - **Root Directory**: Click "Edit" and choose `frontend`. 
4. Click **Deploy**. Vercel will automatically build the `dist` folder and deploy your React app globally.

---

## 🛠️ Post-Deployment Checklist (CORS)

Since your frontend and backend now live on different domains, the backend needs to permit requests from the frontend domain.

1. Once Vercel gives you your live URL (e.g., `https://chatbot-frontend.vercel.app`), go back to your code.
2. In `backend/main.py`, find the `CORSMiddleware` configuration.
3. We currently set `allow_origins=["*"]` locally. This works fine initially, but if you want to lock it down, replace `["*"]` with `["https://your-vercel-frontend-url.vercel.app"]`.

Once these steps are completed, your AI chatbot will be successfully hosted live on the web, completely independent of your local machine!
