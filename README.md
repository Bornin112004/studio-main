# Firebase Studio

This is a NextJS starter project created in Firebase Studio.

## Running Locally

To download and run this project on your local machine, follow these steps.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later is recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Download the Code

First, you'll need to download the project files. You can typically do this from the Firebase Studio interface where you are developing the app.

### 2. Set Up Environment Variables

For the Google Sheets integration to work, you must provide your Google Cloud credentials to the application.

1.  In the root directory of the project, create a new file named `.env.local`.
2.  Add the following lines to this file, replacing the placeholder values with your actual credentials from the Google Cloud Console:

    ```bash
    # Get these from your Google Cloud project's "Credentials" page
    NEXT_PUBLIC_GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
    ```

    **Important**: Your `GOOGLE_CLIENT_SECRET` must be kept private and should never be shared publicly. The `.env.local` file is ignored by Git for this reason.

### 3. Configure Your Google Cloud Project

Your Google Cloud project needs to be configured to allow your local application to connect.

1.  **Enable the Google Sheets API**: Go to the Google Cloud Console and ensure the "Google Sheets API" is enabled for your project.
2.  **Set the Authorized Redirect URI**:
    *   In the Google Cloud Console, navigate to **APIs & Services > Credentials**.
    *   Find your OAuth 2.0 Client ID and click to edit it.
    *   Under **"Authorized redirect URIs"**, add the following URI: `http://localhost:3000/api/auth/callback/google`
    *   Click **"Save"**.

### 4. Install Dependencies and Run the App

Open your terminal in the project's root directory and run the following commands:

1.  **Install project dependencies:**
    ```bash
    npm install
    ```

2.  **Run the local development server:**
    ```bash
    npm run dev
    ```

Your application should now be running at [http://localhost:3000](http://localhost:3000). You can open this URL in your browser to see your app.
