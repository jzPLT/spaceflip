export class FeatureFlags {
  private static flags = {
    inAppPayments: false,
    voiceCommands: false
  };

  static isEnabled(flag: keyof typeof FeatureFlags.flags): boolean {
    return this.flags[flag];
  }

  static setFlag(flag: keyof typeof FeatureFlags.flags, enabled: boolean): void {
    this.flags[flag] = enabled;
  }
}
