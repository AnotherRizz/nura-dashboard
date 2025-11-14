# --- Build Stage ---
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
