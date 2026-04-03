import React from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { Wallet } from "lucide-react";

export function UPISetupStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  // Basic UPI ID validation
  const isComplete = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(data.upiId);

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Payout Setup</h2>
        <p className="text-[#1B4965]/60">Where should we send your money?</p>
      </div>

      <div className="space-y-6 flex-1">
        <div className="p-8 bg-white rounded-3xl border-2 border-[#1B4965]/5 shadow-sm flex flex-col items-center gap-6">
           <div className="w-20 h-20 rounded-2xl bg-[#62B6CB]/10 flex items-center justify-center">
              <Wallet className="w-10 h-10 text-[#62B6CB]" />
           </div>
           
           <div className="w-full space-y-4">
              <label className="block text-sm font-semibold text-center text-[#1B4965]/80 uppercase tracking-wider">UPI ID</label>
              <Input 
                placeholder="Ex: mobile-number@ybl"
                value={data.upiId}
                onChange={(e) => updateData({ upiId: e.target.value })}
                className="h-14 bg-[#BEE9E8]/10 border-2 border-[#1B4965]/10 rounded-2xl text-center text-lg font-bold tracking-tight shadow-sm focus:border-[#62B6CB]"
              />
           </div>
        </div>

        <div className="bg-[#1B4965]/5 border border-[#1B4965]/10 rounded-2xl p-4 flex gap-3">
           <div className="w-6 h-6 rounded-full bg-[#1B4965] text-white flex items-center justify-center shrink-0">
             <span className="text-[10px] font-black">!</span>
           </div>
           <p className="text-xs text-[#1B4965]/70 leading-relaxed">
             Make sure this UPI ID is linked to your own bank account. We verify names before execution.
           </p>
        </div>
      </div>

      <Button
        onClick={nextStep}
        disabled={!isComplete}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8 shadow-lg shadow-[#62B6CB]/20"
      >
        Verify UPI ID
      </Button>
    </div>
  );
}
