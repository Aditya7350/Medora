---
description: How to deploy the Patient Report System to Vercel
---

# Deploying to Vercel

Follow these steps to deploy your Next.js application to Vercel.

1.  **Initialize Git (if not done)**
    Open your terminal in the project directory (`c:\Users\admin\Documents\Dashboard`) and run:
    ```powershell
    git init
    git add .
    git commit -m "Ready for deployment"
    ```

2.  **Push to GitHub**
    - Go to [GitHub.com](https://github.com) and create a **New Repository**.
    - Copy the commands to "push an existing repository from the command line". They will look like this:
    ```powershell
    git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```
    - Run those commands in your terminal.

3.  **Import to Vercel**
    - Log in to [Vercel.com](https://vercel.com).
    - Click **"Add New..."** > **"Project"**.
    - Find your new GitHub repository in the list and click **"Import"**.
    - **Configuration**:
        - **Framework Preset**: Next.js (should be auto-detected).
        - **Root Directory**: `./` (default).
        - **Build Command**: `next build` (default).
        - **Install Command**: `npm install` (default).
    - Click **"Deploy"**.

4.  **Finalize**
    - Vercel will build your site and provide a URL (e.g., `project-name.vercel.app`).
    - **Note on Environment Variables**: If we added any secret keys later, you would add them in the Vercel Project Settings > Environment Variables. For this project, no special env vars are currently needed.
