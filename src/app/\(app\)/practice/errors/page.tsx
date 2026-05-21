import { MyErrorsPanel } from '@/components/MyErrorsPanel'

export const metadata = {
  title: 'Meine Fehler',
}

export default function ErrorsPage() {
  return (
    <div style={{ maxWidth: 896, margin: '0 auto' }}>
      <MyErrorsPanel limit={100} showTitle={true} />
    </div>
  )
}
