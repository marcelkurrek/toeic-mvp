import ListeningShell from '@/components/ListeningShell'

export default async function Part1Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <ListeningShell part={1} nextParts={next} />
}
