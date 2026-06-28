#!/usr/bin/env bun

// Extracts the <svg> from Logo.astro and renders it to public/images/logo.png
// Font: scripts/fonts/orbitron-700.ttf (downloaded from Google Fonts, committed to repo)

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const src = readFileSync(
    resolve(__dirname, '../src/components/Logo.astro'),
    'utf8',
)

const match = src.match(/<svg[\s\S]*?<\/svg>/)
if (!match) throw new Error('No <svg> block found in Logo.astro')

const svg = match[0]
const fontPath = resolve(__dirname, 'fonts/orbitron-700.ttf')

const resvg = new Resvg(svg, {
    font: {
        loadSystemFonts: false,
        fontFiles: [fontPath],
        defaultFontFamily: 'Orbitron',
    },
})

const png = resvg.render().asPng()
const out = resolve(__dirname, '../public/images/logo.png')
writeFileSync(out, png)
console.log(`Written ${png.byteLength} bytes → ${out}`)
