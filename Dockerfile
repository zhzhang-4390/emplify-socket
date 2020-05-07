FROM node:latest
WORKDIR /emplify-socket
COPY package*.json ./
RUN npm install --production
COPY ./ .
ENV NODE_ENV="production"
ENV PORT="8080"
ENV DB_CONNECTION="mongodb+srv://zhzhang:F7f7f7f7@emplify-4cnwj.gcp.mongodb.net/emplifydb?retryWrites=true&w=majority"
CMD [ "npm", "start" ]