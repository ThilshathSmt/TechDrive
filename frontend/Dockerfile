
FROM node:22-alpine AS build
WORKDIR /app


COPY package*.json ./
RUN npm install


COPY . .


ARG REACT_APP_BACKEND_URL
ARG REACT_APP_CHATBOT_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_CHATBOT_URL=$REACT_APP_CHATBOT_URL


RUN npm run build


FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
