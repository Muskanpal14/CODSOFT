# 📖 Contact Book Application

A feature-rich, modern Contact Book solution supporting full contact management (Store Name, Phone Number, Email, Address, and Categories) with instant real-time search, update, delete capabilities, and persistent storage.

---

## 🌟 Key Features

| Requirement | Implementation Details |
| :--- | :--- |
| **Contact Information** | Stores **Name**, **Phone Number**, **Email**, **Address**, and **Category** (Personal, Work, Family, Other). |
| **Add Contact** | User-friendly form with field validation & auto avatar creation. |
| **View Contact List** | Interactive Grid View & List View displaying name, phone, email, address, and quick actions. |
| **Search Contact** | Real-time search by **name** or **phone number** (and email). |
| **Update Contact** | Pre-populated edit modal allowing instant inline modifications. |
| **Delete Contact** | Confirmation modal with deletion safety. |
| **User Interface** | Sleek glassmorphism UI, Dark/Light mode toggle, animated transitions, stats counter, JSON Export/Import backup. |

---

## 🚀 How to Run

### Option 1: Web Application (Recommended)

1. Simply open [`index.html`](file:///c:/Users/HP/Desktop/Contact%20Book/index.html) in your browser.
2. Or serve locally with any HTTP server:
   ```bash
   npx serve .
   ```
3. Data is automatically saved in your browser's `LocalStorage`.

---

### Option 2: Python Command Line Application

1. Open your terminal in this directory:
   ```bash
   python main.py
   ```
2. Follow the interactive menu options (1-6) to manage contacts saved in `contacts.json`.

---

## 📁 Project Structure

```
Contact Book/
├── index.html       # Web UI Structure & Modal Dialogs
├── styles.css       # Design System, Glassmorphism, Responsive Styles
├── app.js           # JavaScript Logic, LocalStorage CRUD & Realtime Search
├── main.py          # Standalone Python CLI Contact Book
├── contacts.json    # JSON storage file for Python script
└── README.md        # Documentation
```
