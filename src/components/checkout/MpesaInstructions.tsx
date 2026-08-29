import { formatKES } from "@/lib/format";
import { MPESA_PAYBILL_NUMBER } from "@/lib/contact";
import { CopyButton } from "@/components/ui/CopyButton";

const steps = [
  "Open M-PESA on your phone (or dial *334#)",
  "Choose Send Money",
  `Enter the number ${MPESA_PAYBILL_NUMBER}`,
  "Enter the exact amount shown below",
  "Enter your M-PESA PIN and confirm",
  "You'll get an SMS with an M-PESA confirmation code",
];

export function MpesaInstructions({ amount }: { amount: number }) {
  const amountDigits = String(Math.round(amount));

  return (
    <div className="rounded-2xl border border-mpesa/30 bg-success-050/60 p-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 items-center rounded-md bg-mpesa px-2 text-xs font-bold text-white">
          M-PESA
        </span>
        <p className="text-sm font-semibold text-ink">Send Money</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-3.5">
          <p className="text-xs text-muted">Send to</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-ink">
            {MPESA_PAYBILL_NUMBER}
          </p>
          <CopyButton
            value={MPESA_PAYBILL_NUMBER.replace(/\s/g, "")}
            label="Copy number"
            toastMessage="M-Pesa number copied"
            className="mt-2"
          />
        </div>
        <div className="rounded-xl border border-border bg-surface p-3.5">
          <p className="text-xs text-muted">Exact amount</p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-ink">
            {formatKES(amount)}
          </p>
          <CopyButton
            value={amountDigits}
            label="Copy amount"
            toastMessage="Amount copied"
            className="mt-2"
          />
        </div>
      </div>

      <ol className="mt-4 space-y-1.5">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-ink/80">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mpesa/10 text-[11px] font-bold text-mpesa">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <p className="mt-4 rounded-lg bg-surface p-3 text-xs text-muted">
        Pay from whichever M-Pesa number you like — we match your order using the
        confirmation code and your phone number. Enter that code below once you
        receive the SMS (you can also send it to us on WhatsApp afterwards).
      </p>
    </div>
  );
}
