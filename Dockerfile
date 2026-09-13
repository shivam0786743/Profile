# Use official lightweight nginx image
FROM nginx:alpine

# Copy static files to nginx's default serving directory
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY profile.png /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# nginx starts automatically, no CMD needed
