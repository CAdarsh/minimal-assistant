# Use a Node.js base image
FROM node:14

# Install serve globally
RUN npm install -g serve

# Set the working directory in the container
WORKDIR /app

# Copy your local HTML files into the Docker image
# Assuming your static files are in a directory named "build" in your project's root
COPY ./build /app/build

# Command to serve the static files
CMD ["serve", "-s", "build", "-l", "5000"]

# Expose the port serve is running on
EXPOSE 5000
