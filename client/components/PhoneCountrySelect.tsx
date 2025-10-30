"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Country {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
}

const countries: Country[] = [
  { iso: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { iso: "PS", name: "Palestine", dialCode: "+970", flag: "🇵🇸" },
  { iso: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { iso: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { iso: "PR", name: "Puerto Rico", dialCode: "+1", flag: "🇵🇷" },
  { iso: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { iso: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { iso: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { iso: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { iso: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { iso: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { iso: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { iso: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { iso: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { iso: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
];

interface PhoneCountrySelectProps {
  onCountryChange: (dialCode: string) => void;
  defaultDialCode?: string;
}

export function PhoneCountrySelect({ onCountryChange, defaultDialCode = "+62" }: PhoneCountrySelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    countries.find((country) => country.dialCode === defaultDialCode) || countries[0]
  );

  // Initialize the parent with the default dial code
  React.useEffect(() => {
    onCountryChange(selectedCountry.dialCode);
  }, [defaultDialCode]); // Only run once on mount or if defaultDialCode changes

  // Update parent when selectedCountry changes
  React.useEffect(() => {
    onCountryChange(selectedCountry.dialCode);
  }, [selectedCountry]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-fit justify-start rounded-r-none border-r-0 border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          <span className="mr-2">{selectedCountry.flag}</span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.iso}
                  value={`${country.name.toLowerCase()} ${country.dialCode}`}
                  onSelect={(currentValue) => {
                    const foundCountry = countries.find(
                      (c) =>
                        c.name.toLowerCase() === currentValue.toLowerCase() ||
                        c.dialCode === currentValue
                    );
                    if (foundCountry) {
                      setSelectedCountry(foundCountry);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountry.iso === country.iso
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{country.flag}</span>
                  {country.name}
                  <span className="ml-auto">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
