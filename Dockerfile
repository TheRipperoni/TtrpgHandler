FROM node:20.11-alpine3.18 as build

WORKDIR /usr/src/ozone

COPY . .
RUN rm .env
RUN yarn
RUN #rm -rf node_modules .next/cache

# final stage

FROM node:20.11-alpine3.18

#RUN apk add --update ts-node
#ENV TZ=Etc/UTC

WORKDIR /usr/src/ozone
COPY --from=build /usr/src/ozone /usr/src/ozone
RUN chown -R node:node .

#ENTRYPOINT ["dumb-init", "--"]
ENV NODE_ENV=production
USER node
CMD ["yarn", "start"]