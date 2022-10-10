FROM node:12

RUN mkdir -p /horizon-frontend
WORKDIR /horizon-frontend

COPY . /horizon-frontend/

RUN npm install && npm run-script build

EXPOSE 3000

ENTRYPOINT ["npm"]
# defined in package.json
CMD [ "run-script", "nodemon" ]
