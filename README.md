# synthomaha.net

synth night in Omaha

[![Netlify Status](https://api.netlify.com/api/v1/badges/48146f69-e891-405d-83a7-c981680f79e9/deploy-status)](https://app.netlify.com/projects/synthomaha/deploys)

## Pre-reqs

[Bun](https://bun.com/docs/installation) for package handling

[volta](https://volta.sh/) for node ver wrangling

[Netlify CLI](https://www.npmjs.com/package/netlify-cli) to manage the Netlify deployment

## One-time Setup

Get deps

> bun install

Link to your netlify project

> netlify link

## Build and preview locally

- `bun run dev` - Start local dev server
- `netlify deploy` - Generate a preview deploy

PRs against `main` will build a preview server on Netlify (details in the netlify bot's comment which is created on the PR)

## Deploy to Production

Merges to `main` will auto-deploy the site on Netlify. Use `netlify deploy --production` to deploy manually.
