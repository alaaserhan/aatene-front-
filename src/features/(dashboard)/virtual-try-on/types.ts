export interface TryOnSettings {
  is_try_on_active: boolean;
  try_on_coins_per_generation: number;
}

export interface TryOnSettingsResponse {
  status: boolean;
  message: string;
  settings: TryOnSettings;
}

export interface UpdateDressableResponse {
  status: boolean;
  message: string;
  record: {
    id: number;
    name: string;
    parent_id: number | string;
    is_dressable: boolean;
  };
}
