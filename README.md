Hey, this is a personal and team productivity web app made with NextJs (Frontend + Serverless backend), DB (MongoDB), ShadCN (UI components library)

Features so far:
1. Serverless infra
2. Login/Register with next-auth
3. Session management
4. Project creation
5. Task creation + assign multiple users same task.
6. Add other members using the platform to collaborate on the project
7. Assign specfic team member a task.
8. Summary on dashboard about various updates and tasks.

Upcoming features I am working on: 
1. Remove user from a team.
2. Edit Project details, update a project with new users/remove users etc.
3. Create document like Notion.
4. Integrate other tools such as drawing board, flow diagram.
5. Chat with team members.



To run the project
1. change directory to codebase-nxt-purva
2. run npm install
3. create .env file in root and add
MONGO_DB_URI=your mongo db connectionid
NEXTAUTH_SECRET=randomauthsecretulike
4. npm run dev
 

