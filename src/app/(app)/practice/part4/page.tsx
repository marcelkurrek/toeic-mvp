import ListeningShell from '@/components/ListeningShell'

export default async function Part4Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  return <ListeningShell part={4} nextParts={next} />
}
