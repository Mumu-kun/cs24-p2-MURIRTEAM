FROM node:20

WORKDIR /app

# Copy package.json and package-lock.json if present
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all other source code to the working directory
COPY . .

# Expose port 5173
EXPOSE 5173

# Set the HOST environment variable to 0.0.0.0 and run the React app
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]