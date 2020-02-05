# Usually to select particular version instead of latest
FROM node:12.14.1 as base
RUN mkdir -p /srv/app
COPY package.json /srv/app
WORKDIR /srv/app
# Install production dependencies
RUN npm install --production
# add remaining application code
COPY . /srv/app
# Expose port for access outside of container
ENV PORT 80
EXPOSE $PORT
CMD ["node", "bin/www"]
