# Season 1: Build
FROM node:20-alpine as build
WORKDIR /app/frontend-angular
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration production

# Season 2: Nginx
FROM nginx:1.27-alpine
COPY --from=build /app/frontend-angular/dist/frontend-angular /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
