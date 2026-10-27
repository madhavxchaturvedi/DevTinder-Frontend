# OctoPair – Frontend  

OctoPair is a collaborative platform built for developers to **connect, collaborate, and grow together**. The frontend is developed using **React, Redux, TailwindCSS, and shadcn/ui**, providing a smooth and responsive user experience.  

---

## 🚀 Features  
- 🔄 **Swipe Functionality** – Like or skip developers  
- 🤝 **Connection Requests** – Send, accept, or reject requests  
- 💬 **Real-time Messaging** – Integrated with Socket.io  
- 💳 **Razorpay Payment Integration** – Premium features for users  
- 📝 **Editable Profiles** – Update profile details anytime  
- 🔐 **JWT Authentication** – Secure login and session handling  
- 📧 **Email Integration (AWS SES)** – For verification and notifications  
- ☁️ **Deployed on AWS** – Scalable and production-ready  

---

## 🛠️ Tech Stack  
- **Frontend:** React, Redux, Tailwind CSS, DaisyUI  
- **Backend (separate repo):** Node.js, Express.js, MongoDB  
- **Real-time:** Socket.io  
- **Authentication:** JWT  
- **Payments:** Razorpay  
- **Deployment:** AWS  

---

## 📂 Folder Structure  
```bash
octopair-frontend/
│── src/
│   ├── components/   # Reusable UI components  
│   ├── pages/        # Page-level components  
│   ├── redux/        # State management  
│   ├── utils/        # Helper functions  
│   └── App.js        # Main app component  
│
└── public/           # Static assets  
```
##  Getting Started  

Follow these steps to run the project locally:  

### 1. Clone the repo  
```bash
git clone https://github.com/your-username/octopair-frontend.git
cd octopair-frontend
