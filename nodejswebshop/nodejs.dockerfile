FROM node:20

# Install nodemon globally
RUN npm install -g nodemon

# Set working directory inside container
WORKDIR /home/node/app

# Copy the package.json file to the working directory
COPY app/package.json .

# Install dependencies
RUN npm install

# Copy all app files into the container
COPY app/ ./ 

# Expose port for the Node.js app
EXPOSE 8080
# EXPOSE 8443

# Start the app using nodemon
CMD ["nodemon", "server.js"]