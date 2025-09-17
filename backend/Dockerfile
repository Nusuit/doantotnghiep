# Dockerfile tối ưu cho backend
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install --production
CMD ["npm", "start"]
