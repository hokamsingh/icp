<!-- <p align="center">
  <a href="#" target="_blank"><img src="#" width="200" alt="logo" /></a>
</p> -->

<p align="center">
  <a href="#" target="_blank">NestJS App</a> built using Nest framework with Typescript & Postgres database.
</p>

## Description

To be specified.

## Installation

_Note: Skip this section for docker based production deployment_

```bash
# install dependencies
$ npm install
```

## Setup

Copy the contents of example.env to create .env in the root and update env variables to set server configuration to run.

First you need to run and initialize databases.

> For non docker environment

`DATABASE_URL`, `REDIS_URI` in .env will be use to connect with databases, Please make sure you have correct connection uri here.

```bash
# development
$ npm run db:init

# production
$ npm run db:migrate:deploy
$ npm run db:seed
```

> For docker environment

_Note: If you already have running required database containers then you can follow same setup as mentioned above for non docker environment._

`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_PORT`, `REDIS_PORT`, `REDIS_PASSWORD` will be use to create database containers with authentication credential from .env, So make sure `DATABASE_URL` and `REDIS_URI` have exact same user, password and port for connection.

To run production database containers you need to set `POSTGRES_DATA_VOLUME` and `REDIS_DATA_VOLUME` value to be set in .env file to mount the volume into host machine.

```bash
# development
$ npm run dev:db
$ npm run db:init

# production
$ npm run prod:db
$ npm run db:migrate:deploy
$ npm run db:seed
```

For convenience to switch between docker environment to local environment & testing, Please create host entry in your machine with following:-

```
127.0.0.1 postgres
127.0.0.1 redis
```

## Run the server in docker container

```bash
# development
$ npm run dev
$ npm run dev:stop # To shut down containers

# production
$ npm run prod
$ npm run prod:stop # To shut down containers
```

## Run the server in local machine

```bash
# development
$ npm run start:dev

# production
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrate/Sync Database Schema

```bash
# initialize database - push schema, add constraints & seed database
$ npm run db:init

# preview schema
$ npm run db:studio

# seed database
$ npm run db:seed

# seed specific seed file into the database
$ npm run db:seed:only <name> # i.e. `npm run db:seed:only admin` to run prisma/seeds/admin.seed.ts

# add constraints in schema (Note: Not required, If not using `db:schema:push` on staging or production env)
$ npm run db:schema:constraints

# add constraints for the specific table
$ npm run db:schema:constraints:only <table name> # i.e. `npm run db:schema:constraints:only user` to add constraints into the user table

# generate client with schema
$ npm run db:client:generate

# push schema changes to the database without migration
$ npm run db:schema:push

# generate migration for new changes
$ npm run db:migration:create

# generate migration for new changes & deploy
$ npm run db:migrate:dev

# reset database
$ npm run db:migrate:reset

# deploy all migrations
$ npm run db:migrate:deploy
```

## API Documentation

```bash
# development
http://localhost:{PORT}/api-spec

# production
{API_URL}/api-spec
```
