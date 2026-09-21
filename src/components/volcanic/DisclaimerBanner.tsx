'use client'

import { AlertTriangle } from 'lucide-react'

export function DisclaimerBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10">
      <div className="flex items-start gap-2.5 px-4 py-2 md:px-6 md:py-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <div className="text-[11px] md:text-xs leading-relaxed text-amber-100/90">
          <strong className="font-semibold text-amber-200">PERINGATAN PENGGUNAAN:</strong>{' '}
          Produk ini BUKAN menggantikan PVMBG/Badan Geologi, BMKG, VAAC, BNPB/BPBD, AirNav Indonesia,
          atau otoritas setempat. Keluaran model selalu berlabel{' '}
          <strong className="text-amber-200">INDIKASI MODEL</strong>, bukan fakta kejadian atau
          peringatan resmi. &ldquo;Berpotensi terlintasi&rdquo; ≠ &ldquo;terkonfirmasi terdampak&rdquo;.
          &ldquo;Tidak ada data&rdquo; ≠ &ldquo;tidak terdampak&rdquo;.
        </div>
      </div>
    </div>
  )
}
