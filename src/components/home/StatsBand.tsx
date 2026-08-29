"use client";

import { MapPin, Truck, ShieldCheck, Wallet } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

function CountStat({
  value,
  suffix = "",
  label,
  icon: Icon,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: typeof MapPin;
}) {
  const { ref, value: n } = useCountUp(value);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="flex flex-col items-center gap-1.5 text-center"
    >
      <Icon className="h-5 w-5 text-brand-2" />
      <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {n}
        {suffix}
      </span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}

function StaticStat({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: typeof MapPin;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <Icon className="h-5 w-5 text-brand-2" />
      <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {value}
      </span>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}

export function StatsBand() {
  return (
    <section className="bg-panel-dark">
      <div className="section grid grid-cols-2 gap-8 py-12 sm:grid-cols-4 sm:py-14">
        <CountStat value={47} label="counties we deliver to" icon={MapPin} />
        <StaticStat value="2–5 days" label="countrywide delivery" icon={Truck} />
        <StaticStat
          value="M-Pesa"
          label="cash & bank also accepted"
          icon={Wallet}
        />
        <CountStat
          value={100}
          suffix="%"
          label="genuine, warrantied devices"
          icon={ShieldCheck}
        />
      </div>
    </section>
  );
}
