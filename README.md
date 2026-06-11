# synthomaha.net

synth night in Omaha

[![Netlify Status](https://api.netlify.com/api/v1/badges/48146f69-e891-405d-83a7-c981680f79e9/deploy-status)](https://app.netlify.com/projects/synthomaha/deploys)

## Dependencies

- A working \*nix shell
- [Bun](https://bun.sh/) as drop-in Node interpreter replacement, package manager and test runner
- (optional) [volta](https://volta.sh/) for node ver wrangling
- (optional) [Netlify CLI](https://docs.netlify.com/cli/get-started/) for managing live deployment


## Stack

- [Astro](https://astro.build/) — static site generator
- [Decap CMS](https://decapcms.org/) — content management
- [Biome](https://biomejs.dev/) - lint

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

Merges to `main` will auto-deploy the site on Netlify.

`netlify deploy --production` to deploy manually.
