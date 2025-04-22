"use client";

import { useState, useEffect, type KeyboardEvent } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiConfig } from "@/lib/api";

interface UsernameCheckerProps {
  value: string;
  onChange: (value: string) => void;
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

export function UsernameChecker({
  value,
  onChange,
  onAvailabilityChange,
}: UsernameCheckerProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Update debounced value when input changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Check username availability when debounced value changes
  useEffect(() => {
    if (debouncedValue && debouncedValue.length >= 3) {
      checkUsername(debouncedValue);
    } else {
      setIsAvailable(null);
      if (onAvailabilityChange) onAvailabilityChange(false);
    }
  }, [debouncedValue]);

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) return;

    setIsChecking(true);
    try {
      const response = await apiConfig.get(
        `/auth/check-username?username=${encodeURIComponent(username)}`
      );
      const available = response.data.available;
      setIsAvailable(available);
      if (onAvailabilityChange) onAvailabilityChange(available);
    } catch (error) {
      console.error("Error checking username:", error);
      setIsAvailable(false);
      if (onAvailabilityChange) onAvailabilityChange(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      checkUsername(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <Input
          id="username"
          type="text"
          placeholder="Choose a username"
          className="pl-10 pr-10"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => checkUsername(value)}
        />
        <div className="absolute left-3 top-4 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400">
          @
        </div>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isChecking ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-500 dark:text-gray-400" />
          ) : isAvailable === true ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isAvailable === false ? (
            <X className="h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>
      {isAvailable === true && !isChecking && value && (
        <p className="text-xs text-green-500">Username is available</p>
      )}
      {isAvailable === false && !isChecking && value && (
        <p className="text-xs text-red-500">Username is already taken</p>
      )}
    </div>
  );
}
