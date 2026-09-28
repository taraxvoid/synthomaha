const JACK_COLOR_CLASSES = [
    'jack--pink',
    'jack--green',
    'jack--purple',
] as const

export function jackColorClass(index: number): string {
    return JACK_COLOR_CLASSES[index % JACK_COLOR_CLASSES.length]
}
