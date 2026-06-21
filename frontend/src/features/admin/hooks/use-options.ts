import { useQuery } from "@tanstack/react-query";
import { clientApiRequest } from "@/lib/api/admin-client";

export type OptionItem = {
  value: string;
  labelAr: string;
  labelEn: string;
};

export type CurrencyOption = {
  value: string;
  label: string;
};

export type AdminOptions = {
  projectCategories: OptionItem[];
  serviceCategories: OptionItem[];
  technologyCategories: OptionItem[];
  technologyGroups: OptionItem[];
  linkCategories: OptionItem[];
  linkPlatforms: OptionItem[];
  currencies: CurrencyOption[];
  projectStatuses: OptionItem[];
  proficiencyLevels: OptionItem[];
};

export function useAdminOptions() {
  return useQuery<AdminOptions>({
    queryKey: ["admin-options"],
    queryFn: async () => {
      const response = await clientApiRequest<AdminOptions>("options");
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });
}
