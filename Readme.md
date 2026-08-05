
# SupportOS – Enterprise Multi-Agent AI Customer Support Platform

![Python](https://img.shields.io/badge/Python-3.12-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![License](https://img.shields.io/badge/License-MIT-green)

SupportOS is a full-stack AI-powered customer support platform that combines ticket management, conversational AI, Retrieval-Augmented Generation (RAG), and role-based administration. Customers can create tickets and chat with an AI assistant, while administrators manage users, tickets, analytics, and the knowledge base.

---

## Features

### Customer
- JWT Authentication
- Create and manage support tickets
- AI-powered chat
- Conversation history
- Ticket priorities and categories
- Feedback submission

### Administrator
- Admin Dashboard
- View and manage all users
- View and manage all tickets
- Assign tickets
- Update ticket status
- Analytics dashboard
- Knowledge base management
- Monitor conversations

### AI
- LangGraph multi-agent workflow
- LangChain orchestration
- Configurable OpenAI or Groq provider
- Retrieval-Augmented Generation (RAG)
- ChromaDB vector store
- PDF knowledge base

---

## Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL

### AI
- LangChain
- LangGraph
- OpenAI / Groq
- ChromaDB
- Sentence Transformers

---

## Architecture

```text
React Frontend
      │
      ▼
 FastAPI Backend
      │
 ├── Authentication
 ├── Ticket Service
 ├── Admin Service
 ├── LangGraph AI
 ├── ChromaDB
 └── PostgreSQL
```

---

## Folder Structure

```text
agent-customer-support/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── langgraph/
│   │   ├── models/
│   │   ├── services/
│   │   └── providers/
│   ├── alembic/
│   ├── requirements.txt
│   └── create_admin.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
└── README.md
```

---

## Installation

### Backend

```bash
git clone <repository-url>
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

Run migrations:

```bash
alembic upgrade head
```

Start backend:

```bash
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file in the backend.

```env
DATABASE_URL=postgresql+psycopg://...
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

OPENAI_API_KEY=your_openai_key
# OR
GROQ_API_KEY=your_groq_key

LLM_PROVIDER=openai
LLM_MODEL=gpt-4.1-mini
```

---

## Default Admin Account

After running:

```bash
python create_admin.py
```

Default credentials:

```text
Email: admin@example.com
Password: Admin@123
```

Change the password before production deployment.

---

## API Overview

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Tickets
- GET /api/tickets
- POST /api/tickets
- PUT /api/tickets/{id}

### Conversations
- GET /api/conversations/ticket/{ticket_id}
- GET /api/conversations/{conversation_id}/messages
- POST /api/chat

### Admin
- GET /admin/users
- GET /admin/tickets
- PUT /admin/tickets/{id}
- PUT /admin/tickets/{id}/assign
- GET /admin/analytics

---

## Deployment

Recommended:

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL
- Vector Store: ChromaDB (persistent volume)
- AI Provider: OpenAI or Groq

---

## Roadmap

- Email notifications
- SLA tracking
- AI sentiment analysis
- AI ticket prioritization
- Multi-admin roles
- Audit logs
- Live chat escalation

---

## Screenshots

Add screenshots for:

- Login
  <img width="911" height="670" alt="Screenshot 2026-08-05 182517" src="https://github.com/user-attachments/assets/56762111-48ed-40e9-8a40-bc0743c0db93" />
- Customer Dashboard
  <img width="1332" height="832" alt="Screenshot 2026-08-05 182910" src="https://github.com/user-attachments/assets/22201b21-c58a-46ad-9b11-435e765c3030" />
- Creating a ticket
 <img width="461" height="485" alt="Screenshot 2026-08-05 183021" src="https://github.com/user-attachments/assets/48dc0334-e113-4def-bcbc-b8e4b50de405" />
- Chatting with AI Agent
  <img width="1275" height="795" alt="Screenshot 2026-08-05 184710" src="https://github.com/user-attachments/assets/b0ad9805-4adb-41bf-bb68-8d88eb346038" />
- Uploading an Invoice
  <img width="1373" height="659" alt="Screenshot 2026-08-05 184726" src="https://github.com/user-attachments/assets/ffb3ffc7-e526-462c-b10f-5d8ce3269f81" />
- User Analgytics
  <img width="1362" height="567" alt="Screenshot 2026-08-05 184740" src="https://github.com/user-attachments/assets/e66f02e0-fc15-4585-b020-9f1ace474717" />  
- Admin Dashboard
<img width="1774" height="908" alt="Screenshot 2026-08-05 182603" src="https://github.com/user-attachments/assets/bbef964b-0a5c-4b5f-b195-d6b73ff872ff" />
- User Managemnt & Control
  <img width="1303" height="439" alt="Screenshot 2026-08-05 182615" src="https://github.com/user-attachments/assets/f5b03120-f2d1-47e0-be0f-395ea6201fe6" />
<img width="1280" height="464" alt="Screenshot 2026-08-05 182627" src="https://github.com/user-attachments/assets/4daa9eac-c123-44e3-9c33-b7e3351b3289" />
<img width="1504" height="766" alt="Screenshot 2026-08-05 182654" src="https://github.com/user-attachments/assets/5f3680f9-fd41-45f1-9d0d-24cd6b2154a8" />
<img width="959" height="361" alt="Screenshot 2026-08-05 182826" src="https://github.com/user-attachments/assets/9ee2a5ad-a7c6-40e0-b358-d01adc9b66d1" />
<img width="1260" height="372" alt="Screenshot 2026-08-05 182817" src="https://github.com/user-attachments/assets/3d1c8f1c-ac47-42e5-b1cd-27e64e43dbc0" />
<img width="973" height="597" alt="Screenshot 2026-08-05 182808" src="https://github.com/user-attachments/assets/0eded256-e8ca-40ce-a27a-889d2f432587" />
<img width="955" height="694" alt="Screenshot 2026-08-05 182800" src="https://github.com/user-attachments/assets/0ba34490-a9e6-47d4-842b-87d3dede9747" />
<img width="1452" height="757" alt="Screenshot 2026-08-05 182750" src="https://github.com/user-attachments/assets/93b2aea3-9a06-4440-9fcb-02c8223ae4ba" />

---

## License

MIT License
