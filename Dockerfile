# pull official base image
FROM node:12.16.0-alpine

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
CMD ["npm", "start"]
