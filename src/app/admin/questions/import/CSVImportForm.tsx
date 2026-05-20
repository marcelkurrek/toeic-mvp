'use client'
import { useRef, useState } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface ImportResult {
  imported: number
  skipped: number
  errors: string[]
}

export function CSVImportForm() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(f: File) {
    setFile(f)
    setResult(null)
    setError(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/questions/import', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Import fehlgeschlagen')
        if (json.errors?.length) setResult({ imported: 0, skipped: 0, errors: json.errors })
      } else {
        setResult(json)
      }
    } catch {
      setError('Netzwerkfehler beim Import')
    } finally {
      setLoading(false)
    }
  }

  function downloadTemplate() {
    const rows = [
      'section,part,type,answer,content,option_a,option_b,option_c,option_d,explanation,difficulty,tags,is_diagnostic',
      'READING,5,INCOMPLETE_SENTENCE,A,"The report ___ yesterday.",was submitted,submits,submit,submitting,"Past passive is correct.",3,grammar;past-tense,false',
      'READING,6,TEXT_COMPLETION,B,"The project ___ on schedule.","is running","will run","has run","ran","Present continuous for ongoing.",2,grammar,false',
    ]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Download template */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p className="font-semibold text-sm" style={{ marginBottom: 2 }}>CSV-Vorlage herunterladen</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Beispieldatei mit korrektem Format und Beispieldaten</p>
        </div>
        <button onClick={downloadTemplate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Download size={14} /> Vorlage
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Drop zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className="card"
          style={{
            padding: '36px 24px',
            marginBottom: 16,
            textAlign: 'center',
            cursor: 'pointer',
            border: dragOver ? '2px dashed var(--accent)' : file ? '2px dashed var(--success)' : '2px dashed var(--card-border)',
            background: dragOver ? 'var(--accent-subtle)' : file ? 'rgba(74,222,128,0.05)' : undefined,
            transition: 'border-color 0.15s, background 0.15s',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
          {file ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <FileText size={24} style={{ color: 'var(--success)' }} />
              <div style={{ textAlign: 'left' }}>
                <p className="font-semibold text-sm">{file.name}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); setFile(null); setResult(null); setError(null) }}
                style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} style={{ color: 'var(--muted)', margin: '0 auto 12px' }} />
              <p className="font-semibold text-sm" style={{ marginBottom: 4 }}>CSV-Datei hierher ziehen</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>oder klicken zum Auswählen · max. 5 MB</p>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', opacity: !file || loading ? 0.6 : 1 }}
        >
          {loading ? 'Importiere…' : 'Import starten'}
        </button>
      </form>

      {/* Error banner */}
      {error && (
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: 10,
          border: '1px solid rgba(248,113,113,0.4)',
          background: 'rgba(248,113,113,0.07)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <AlertCircle size={16} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 1 }} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success / result */}
      {result && result.imported > 0 && (
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: 10,
          border: '1px solid rgba(74,222,128,0.4)',
          background: 'rgba(74,222,128,0.07)',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <CheckCircle size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="font-semibold text-sm" style={{ marginBottom: 2 }}>
              {result.imported} Fragen importiert
            </p>
            {result.skipped > 0 && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>{result.skipped} Zeilen übersprungen</p>
            )}
          </div>
        </div>
      )}

      {/* Row errors */}
      {result && result.errors.length > 0 && (
        <div className="card" style={{ marginTop: 20, padding: '16px 20px' }}>
          <p className="font-semibold text-sm" style={{ marginBottom: 10, color: 'var(--error)' }}>
            Fehler in {result.errors.length} Zeile{result.errors.length !== 1 ? 'n' : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {result.errors.map((err, i) => (
              <p key={i} className="text-xs" style={{ color: 'var(--muted)', fontFamily: 'monospace', lineHeight: 1.5 }}>
                {err}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
