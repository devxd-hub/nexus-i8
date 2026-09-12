import { siteSettingsRepository, SiteSettingRecord } from '../../db/repositories/siteSettings.repository.ts';

export class SiteConfigService {
  public async getConfig(): Promise<Record<string, unknown>> {
    const all = siteSettingsRepository.getAll();
    const config: Record<string, unknown> = {};
    for (const row of all) {
      try {
        config[row.key] = JSON.parse(row.value);
      } catch {
        config[row.key] = row.value;
      }
    }
    return config;
  }

  public async getSetting(key: string): Promise<SiteSettingRecord | null> {
    return siteSettingsRepository.get(key);
  }

  public async updateConfig(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    for (const [key, val] of Object.entries(data)) {
      const stringVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
      siteSettingsRepository.set(key, stringVal);
    }
    return this.getConfig();
  }
}

export const siteConfigService = new SiteConfigService();
