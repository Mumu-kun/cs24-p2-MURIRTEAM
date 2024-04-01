# Code Samurai-2024 Phase-2 #
## Team: MURIRTEAM ##
Members:
  - Mustafa Muhaimin
  - Nafis Nahian
  - Tamzeed Mahfuz
## Installation ##
1. Clone the repository
2. Navigate to the root directory
3. Run
   ```
   docker-compose up
   ```

### (Alternate installation without docker) ###
1. Clone the repository
2. Navigate to server directory
3. Run
   ```
   npm install
   ```
   ```
   node db_init
   ```
4. Navigate to client directory
5. Run
   ```
   npm install
   ```
The web-app is now ready.
To start the backend server, navigate to server directory and run
```
nodemon index
```
To start the frontend server, navigate to client directory and run
```
npm run dev
```
The web-app is now accessible via port 5173 of localhost.
