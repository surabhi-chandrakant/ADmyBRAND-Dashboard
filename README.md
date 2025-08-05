# ADmyBRAND Dashboard

A modern, AI-assisted marketing analytics dashboard built using **React**, **Tailwind CSS**, and **Recharts** — built as part of the AI Vibe Coder challenge at ADmyBRAND.

🔗 Live repo: [https://github.com/surabhi-chandrakant/ADmyBRAND-Dashboard](https://github.com/surabhi-chandrakant/ADmyBRAND-Dashboard)

---

## 🚀 Features

- 📊 Metric cards with real-time data and trend analysis
- 🎨 Dark and Light theme support
- 📅 Custom date range filtering
- 🤖 AI Assistant chatbot (mock Gemini API responses)
- 📈 Dynamic charts (Recharts)
- 📤 Data export: XLSX, CSV, JSON
- ⚙️ Toggleable dashboard metrics

---

## 🧠 AI Usage Report

This project simulates AI-powered insights using mock Gemini API responses. The AI assistant is integrated into the dashboard chat panel.

### Tools & AI Integrations

| Functionality           | Tool / Tech Used           |
|------------------------|----------------------------|
| LLM Integration (Mock) | Gemini API (Simulated)     |
| Chat State             | React State / useEffect    |
| Mock Response Engine   | JS array with random picker|
| Charting               | Recharts, Chart.js         |

### Sample AI Prompts

These mock responses simulate insight generation:

- `"Your campaign performance shows a 12% increase in conversions compared to last week."`
- `"Consider increasing budget for the top performing campaigns."`
- `"The seasonal campaign is performing exceptionally well with a ROAS of 3.2x."`
- `"Your bounce rate has decreased by 5% since last month - great job!"`
- `"I recommend focusing on mobile users as they show higher engagement rates."`

You can connect it to real-time Gemini API by updating the `.env` file (optional).

---

## ⚙️ Project Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/surabhi-chandrakant/ADmyBRAND-Dashboard.git
cd ADmyBRAND-Dashboard
```

### 2. Install dependencies

```bash
npm install
```

> If `axios` is missing, run: `npm install axios`

### 3. Start the development server

```bash
npm start
```

### 4. Build for production

```bash
npm run build
```

---

## 🔐 Optional: Connect Gemini API

To connect to the **real Gemini API** (if credentials are available):

1. Create a `.env` file in the project root:
```bash
touch .env
```

2. Add this line (no quotes around the key!):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 📁 Folder Structure

```
ADmyBRAND-Dashboard/
├── public/
├── src/
│   ├── App.js           # Main dashboard component
│   ├── components/      # UI Components (Sidebar, Cards, etc.)
│   ├── styles/          # Tailwind + custom CSS
├── .env                 # Gemini API key (optional)
├── .gitignore
├── package.json
├── README.md
```

---

## 💡 Scripts

| Command          | Description                     |
|------------------|---------------------------------|
| `npm start`      | Run dev server (localhost:3000) |
| `npm run build`  | Create optimized production build |
| `npm test`       | Run tests (optional)            |

---

## 🧑‍💻 Author

**Surabhi Bhor**  
AI Vibe Coder Finalist  
[GitHub](https://github.com/surabhi-chandrakant)

---

## 📄 License

This project is licensed under the **MIT License**.