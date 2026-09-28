import { describe, expect, test } from 'vitest'

const { jackColorClass } = await import('../src/utils/jackColors.ts')

describe('jackColorClass', () => {
    test('returns a jack--* class for index 0', () => {
        expect(jackColorClass(0)).toMatch(/^jack--[a-z]+$/)
    })

    test('cycles back to the first color after exhausting the palette', () => {
        const palette = [0, 1, 2].map(jackColorClass)
        expect(jackColorClass(3)).toBe(palette[0])
        expect(jackColorClass(4)).toBe(palette[1])
    })

    test('uses every color in the palette, each distinct', () => {
        const seen = new Set(
            Array.from({ length: 12 }, (_, i) => jackColorClass(i)),
        )
        expect(seen).toEqual(
            new Set(['jack--pink', 'jack--green', 'jack--purple']),
        )
    })
})
