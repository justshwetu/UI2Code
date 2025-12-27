# UI2Code 🚀

**Turn screenshots into clean, production-ready UI code instantly.**

UI2Code is an AI-powered developer tool that converts UI screenshots into working HTML/Tailwind CSS or React components using Google's Gemini 2.5 Flash model. Designed for hackathon velocity and rapid prototyping, it removes the friction of boilerplate coding.

![UI2Code Banner](https://placehold.co/1200x400/1e293b/ffffff?text=UI2Code+Demo)

## ✨ Features

- **🎨 Instant AI Generation**: Upload any screenshot and get pixel-perfect code in seconds.
- **⚡ Dual Modes**:
  - **HTML/Tailwind**: Great for static sites and quick mockups.
  - **React Components**: Ready-to-use JSX components.
- **👀 Live Preview**: See the generated code rendered instantly in a secure sandbox.
- **🔐 Secure Authentication**: Built-in signup/login system with OTP verification.
- **💾 Export Ready**: One-click copy to clipboard or download as `.html`/`.tsx` files.
- **🛠️ Robust Error Handling**: Smart retry logic and fallback models ensure you always get a result.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Model**: Google Gemini 2.5 Flash (Fallback to 1.5 Flash)
- **Database**: MongoDB
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed.
- MongoDB running locally (port 27017) or a cloud URI.
- A Google Gemini API Key.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/justshwetu/UI2Code.git
    cd UI2Code
    ```

2.  **Install Dependencies**
    The project uses a root proxy setup. You can install everything from the root:
    ```bash
    npm install
    # OR explicitly in the app folder
    cd replicode && npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the `replicode` directory:
    ```bash
    cp replicode/.env.local.example replicode/.env.local
    # Or create it manually
    ```

    Add the following keys:
    ```env
    # AI Configuration
    GEMINI_API_KEY=your_google_gemini_api_key

    # Database
    MONGO_URI=mongodb://localhost:27017
    MONGO_DB=ui2code

    # Authentication
    PENDING_SECRET=your_secret_string
    # SMTP Settings (Optional - falls back to Ethereal for dev)
    # SMTP_HOST=smtp.example.com
    # SMTP_USER=user
    # SMTP_PASS=pass
    ```

4.  **Run the Development Server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📂 Project Structure

```
UI2Code/
├── package.json        # Root script proxy
├── replicode/          # Main Application Source
│   ├── src/
│   │   ├── app/        # Next.js App Router (Pages & API)
│   │   ├── components/ # React UI Components
│   │   ├── lib/        # Shared Utilities (DB, Email, Store)
│   │   └── types/      # TypeScript Definitions
│   ├── public/         # Static Assets
│   └── next.config.ts  # Next.js Config
└── archive/            # Backup of older iterations
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
