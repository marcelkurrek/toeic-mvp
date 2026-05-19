import ListeningShell from '@/components/ListeningShell'

export default async function Part2Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <ListeningShell part={2} nextParts={next} />
}
