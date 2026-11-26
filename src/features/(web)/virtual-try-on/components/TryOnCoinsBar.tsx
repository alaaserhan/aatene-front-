import type { TryOnInfo } from "../types";
import { Button } from "@/src/components/ui/button";
import { TryOnIcon } from "./TryOnIcon";
import { isCoinsEnabled } from "@/src/config/features";

export function TryOnCoinsBar({ info, onRecharge }: { info: TryOnInfo; onRecharge: () => void }) {
  const free = info.coins_per_generation === 0;
  if (!free && info.coins_balance < info.coins_per_generation) return (
    <div className="flex min-h-17 flex-wrap items-center gap-3 rounded-xl border border-[#f97316] bg-[#fff7ed] px-3 py-2.5" role="status">
      <TryOnIcon name="depleted" />
      <p className="min-w-0 flex-1 text-sm font-medium leading-6 text-[#ec7423]">{isCoinsEnabled() ? "رصيدك غير كافٍ. اشحن رصيدك لمتابعة التجربة." : "رصيدك غير كافٍ لمتابعة التجربة حاليًا."}</p>
      {isCoinsEnabled() && <Button type="button" onClick={onRecharge} className="h-8.5 rounded-md bg-blue-3 px-4 text-sm font-bold text-white">اشحن الآن</Button>}
    </div>
  );
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-3/20 bg-[#ebf3fd] px-4 py-3.5 text-sm text-blue-3 sm:text-base" role="status">
      <TryOnIcon name="info" />
      <div className="min-w-0 flex-1">
        <p>{free ? "التجربة مجانية حاليًا" : <>التجارب المتبقية: <span className="font-digits" dir="ltr">{info.tries_left ?? "—"}</span></>}</p>
        {!free && <p className="mt-1 text-xs text-c2-slate-550">رصيدك <bdi className="font-digits">{info.coins_balance}</bdi> عملة · تكلفة التجربة <bdi className="font-digits">{info.coins_per_generation}</bdi> عملة</p>}
      </div>
    </div>
  );
}
