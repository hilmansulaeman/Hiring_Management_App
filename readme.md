# Hiring Management App

## Project Overview
This is a Hiring Management Application designed to streamline the job application and candidate management process. It features a client-facing portal for job seekers to view available positions and apply, and an admin portal for recruiters to manage job openings and review applications. The application includes webcam-based hand pose detection for a unique application experience.

## Technology Stack Used
*   **Frontend**: React, TypeScript, Tailwind CSS, Vite
*   **Backend**: Express.js, TypeScript
*   **Database**: Prisma (ORM) with SQLite (for local development/non-persistent deployment)
*   **Hand Pose Detection**: MediaPipe Hands, TensorFlow.js
*   **Deployment**: Vercel

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_GITHUB_REPO_LINK]
    cd Hiring_management_app
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or if you use pnpm
    # pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root directory with the following content:
    ```
    DATABASE_URL="file:./prisma/dev.db"
    ```
4.  **Run Prisma migrations:**
    ```bash
    npx prisma migrate dev --name init
    ```
5.  **Start the development server:**
    ```bash
    npm run dev
    # or if you use pnpm
    # pnpm run dev
    ```
    The application should be accessible at `http://localhost:8081/` (or another available port).

## Key Features Implemented
*   **Job Listing**: View available job openings in the client portal.
*   **Job Application**: Apply for jobs with personal details and a webcam-based hand pose capture.
*   **Admin Portal**: Manage job openings (create, view, update, delete).
*   **Candidate Management**: View applications for each job, including candidate details and captured photos.
*   **Hand Pose Detection**: A unique feature for capturing hand poses during the application process.
*   **Responsive Design**: User interface adapts to various screen sizes.

## Optional Enhancements You Added
*   **Vercel Deployment Configuration**: Added `vercel.json` and adjusted server-side code for Vercel deployment.
*   **Custom Landing Page**: Implemented a new root landing page to choose between Admin and Client portals.
*   **Custom Button Color**: Changed button colors to `#01959F` for a consistent theme.
*   **Removed Builder.io References**: Cleaned up any remaining Builder.io logos or links.

## Design or Logic Assumptions
*   **Database Persistence**: For local development, SQLite is used. For production deployment on Vercel, a persistent external database (e.g., PostgreSQL) is recommended, although the current setup uses SQLite as per user request, which will result in non-persistent data.
*   **API Endpoints**: Assumed standard RESTful API endpoints for job and application management.
*   **Hand Pose Logic**: The hand pose detection logic assumes specific poses (e.g., Pose 3 for capture) and provides feedback for incorrect poses.

## Known Limitations (if any)
*   **SQLite on Vercel**: As mentioned, the SQLite database (`dev.db`) will not persist data across serverless function invocations or deployments on Vercel. For a production environment, an external, persistent database is required.
*   **Error Handling**: Basic error handling is in place, but more robust error logging and user feedback could be implemented.
*   **Authentication/Authorization**: The application currently lacks authentication and authorization mechanisms for the Admin Portal.
*   **Image Storage**: Captured photos are currently stored as base64 strings, which can lead to large payload sizes and is not optimal for scalability. A cloud storage solution (e.g., AWS S3, Cloudinary) would be more appropriate for production.
