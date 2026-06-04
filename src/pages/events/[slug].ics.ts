import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'
import type { APIRoute, GetStaticPaths } from 'astro'
import { generateEventICS } from '../../utils/ical'

export const prerender = true

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await getCollection('events')
  return events.map((event) => ({
    params: { slug: event.id },
    props: { event },
  }))
}

export const GET: APIRoute<{ event: CollectionEntry<'events'> }> = async ({
  props,
}) => {
  const { event } = props
  const ics = generateEventICS(event.data, event.id)
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${event.id}.ics"`,
    },
  })
}
