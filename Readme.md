
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
- Customer Dashboard
- Ticket Management
- Admin Dashboard
- AI Chat
- Analytics

---

## License

MIT License
