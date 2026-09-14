/**
 * One-off script: import staff from CRCI.csv into Supabase staff table.
 *
 * Run from the project root:
 *   node --env-file=.env.local scripts/import-staff.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * Uses the Supabase REST API directly (no WebSocket / realtime dependency).
 */

import { readFileSync } from 'fs'

// ── Config ───────────────────────────────────────────────────────────────────

const CSV_PATH = 'C:\\Users\\KUMAR\\Downloads\\CRCI.csv'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal',
}

async function supabaseGet(path) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers })
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function supabasePost(path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status} ${await res.text()}`)
}

// ── Parse CSV ────────────────────────────────────────────────────────────────

function parseCSV(filePath) {
  const lines = readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim())
  const [header, ...rows] = lines
  const keys = header.split(',').map(k => k.trim())
  return rows.map(row => {
    const values = row.split(',').map(v => v.trim())
    return Object.fromEntries(keys.map((k, i) => [k, values[i] ?? '']))
  })
}

function toRecord(row) {
  // Zero-pad Acc ID to 6 digits as text (preserves leading zeros)
  const accId = row['Acc ID'].replace(/\D/g, '').padStart(6, '0').slice(-6)
  return {
    staff_id:   row['Employee No'],
    staff_name: row['Full Name'],
    access_id:  accId,
    role:       'User',
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Reading ${CSV_PATH} …`)
  const rows = parseCSV(CSV_PATH)
  const records = rows.map(toRecord)
  console.log(`Parsed ${records.length} rows from CSV.`)

  // Fetch existing staff_ids
  const existing = await supabaseGet('staff?select=staff_id')
  const existingIds = new Set(existing.map(r => r.staff_id))

  const toInsert = records.filter(r => !existingIds.has(r.staff_id))
  const skipped  = records.filter(r =>  existingIds.has(r.staff_id))

  if (skipped.length) {
    console.log(`\nSkipping ${skipped.length} duplicate staff_id(s):`)
    skipped.forEach(r => console.log(`  • ${r.staff_id}  ${r.staff_name}`))
  }

  if (toInsert.length === 0) {
    console.log('\nNo new records to insert.')
    return
  }

  console.log(`\nInserting ${toInsert.length} new record(s) …`)
  await supabasePost('staff', toInsert)

  console.log(`\n✓ Done — ${toInsert.length} staff inserted successfully.`)
}

main().catch(err => {
  console.error('\nFatal error:', err.message)
  process.exit(1)
})
