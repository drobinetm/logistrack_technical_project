# Stage 1: build Angular
FROM node:20-alpine as build
WORKDIR /app/frontend-angular
RUN npm install -g @angular/cli
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 4200
CMD ["ng", "serve", "--host", "0.0.0.0", "--port", "4200"]
