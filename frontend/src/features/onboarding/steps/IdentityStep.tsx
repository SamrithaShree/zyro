import React from "react";
import { useOnboardingStore } from "../../../store/useOnboardingStore";
import { Button } from "../../../app/components/ui/button";
import { Input } from "../../../app/components/ui/input";
import { UserCircle } from "lucide-react";

export function IdentityStep() {
  const { data, updateData, nextStep } = useOnboardingStore();

  const isComplete = !!data.name;

  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1B4965] mb-2">Who are you?</h2>
        <p className="text-[#1B4965]/60">Enter your details exactly as per Aadhaar.</p>
      </div>

      <div className="space-y-6 flex-1">
        <div>
          <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">Full Name</label>
          <Input 
            placeholder="Ex: Rajesh Kumar"
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            className="h-14 bg-white border-2 border-[#1B4965]/5 rounded-2xl text-lg font-bold shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">DOB</label>
            <Input 
              type="date"
              value={data.dob || ""}
              onChange={(e) => updateData({ dob: e.target.value })}
              className="h-14 bg-white border-2 border-[#1B4965]/5 rounded-2xl shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-[#1B4965]/80 uppercase tracking-wider">Gender</label>
            <select
              value={data.gender || ""}
              onChange={(e) => updateData({ gender: e.target.value })}
              className="w-full h-14 bg-white border-2 border-[#1B4965]/5 rounded-2xl px-4 font-bold shadow-sm focus:border-[#62B6CB] focus:outline-none"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        onClick={nextStep}
        disabled={!isComplete}
        className="w-full h-16 rounded-2xl font-bold text-lg bg-[#62B6CB] text-white mt-8"
      >
        Continue
      </Button>
    </div>
  );
}
