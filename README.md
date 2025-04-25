# 🧠 Deadlock Detection System

Welcome to our **Deadlock Detection System** — a web-based tool designed to help visualize, understand, and simulate deadlock situations in Operating Systems using **HTML, CSS, JavaScript**, and a bit of **Python**.

---

## 📖 Our Story

This is actually our **third attempt** at building this project.

The first version was a good start, but we ran into several issues with the logic and data flow. In the second version, we focused on improving the UI and added some visual elements, but again, the backend and simulation flow didn’t quite work out as planned.

So, we decided to rebuild everything from scratch — fixing bugs, restructuring the logic, and polishing the design. And finally, **this version is fully working and complete**!

---

## 💡 What It Does

The project simulates deadlock detection in an OS using:
- 📋 Matrix-based inputs (Allocation, Max, Available)
- 🧮 Need matrix and Banker's Algorithm
- 🧠 Safe or Unsafe state checking
- 📈 Graph-based visualization (Processes & Resources)
- 🧊 Cool cyberpunk-inspired UI
- 💬 (Optional) AI-based suggestions for unsafe states

---

## ⚙️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python (for deadlock logic and optional AI)
- **Libraries Used:**
  - [D3.js](https://d3js.org/) for resource-process graph visualization
  - [Chart.js](https://www.chartjs.org/) for resource usage charts (optional)
  - Flask + CORS for backend logic

---

## 🔍 How It Works (Short Version)

1. You input the system state (Allocation, Max, Available).
2. The app calculates the Need matrix.
3. It runs the **Banker's Algorithm** to check if the system is safe.
4. It shows whether a **deadlock** can occur and which processes are affected.
5. You get a **graph view** of the process-resource flow.
6. (If enabled) AI gives suggestions to fix unsafe scenarios.

---

## 🖥️ Demo

🔗https://raiyanalig.github.io/Deadlock_Detection_System/

---

## 📁 How to Run It Locally

```bash
git clone https://github.com/your-username/deadlock-detection-system.git
cd deadlock-detection-system
open index.html
