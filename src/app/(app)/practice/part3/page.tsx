import ListeningShell from '@/components/ListeningShell'

export default async function Part3Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <ListeningShell part={3} nextParts={next} />
}
