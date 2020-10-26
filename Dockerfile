# stage 1 - build react app first 
# pull official base image
FROM node:12.16.1-alpine3.9 as build
# set working directory
WORKDIR /bin
# add `/app/node_modules/.bin` to $PATH
ENV PATH /bin/node_modules/.bin:$PATH
# install app dependencies
COPY /app/package.json ./
COPY /app/package-lock.json ./
RUN npm install
RUN npm install react-scripts@3.4.1 -g
# add app
COPY /app ./
# start app
RUN npm run build

# stage 2 - build the final image and copy the react build files
FROM nginx:1.17.8-alpine
COPY --from=build /bin/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY app/nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]