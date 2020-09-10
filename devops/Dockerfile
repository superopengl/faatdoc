FROM node:12

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

EXPOSE 80
# Install dependencies
WORKDIR /usr/portal
COPY ./aua-web/package.json /usr/portal/web/
COPY ./aua-app/package.json /usr/portal/app/

WORKDIR /usr/portal/web
RUN pnpm install

WORKDIR /usr/portal/app
RUN pnpm install

# Env vars in build time
ARG NODE_ENV
ARG REACT_APP_GIT_HASH
ENV TZ=utc
ENV GIT_HASH=$REACT_APP_GIT_HASH
ENV GENERATE_SOURCEMAP=false
ENV REACT_APP_AUA_API_ENDPOINT=/api/v1
ENV REACT_APP_AUA_S3_URL=https://aua-upload-files-test.s3-ap-southeast-2.amazonaws.com/$NODE_ENV
ENV REACT_APP_AUA_GOOGLE_SSO_CLIENT_ID=1036301846271-e8sto3acfpcd06mgbl7e4tl5cdfanqjm.apps.googleusercontent.com

# Build app
COPY ./aua-app /usr/portal/app
RUN pnpm run build:prod

# Build web
WORKDIR /usr/portal/web
COPY ./aua-web /usr/portal/web
RUN pnpm run compile:prod

# Copy web to app/www
RUN cp -rf /usr/portal/web/build /usr/portal/app/www
RUN rm -rf /usr/portal/web

# Start the portal website
WORKDIR /usr/portal/app
# CMD node index.js
ENTRYPOINT node index.js

