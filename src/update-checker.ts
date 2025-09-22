import { fetch } from "@tauri-apps/plugin-http";
import { debug } from "@tauri-apps/plugin-log";

interface Props {
  appId: string;
  platform: string;
  channel: string;
  version: string;
  architecture: string;
}

export class UpdateChecker {
  private appId: string;
  private platform: string;
  private channel: string;
  private version: string;
  private architecture: string;
  private updateCached: Update | null = null;
  private lastChecked: number = 0;

  constructor(props: Props) {
    this.appId = props.appId;
    this.platform = props.platform;
    this.channel = props.channel;
    this.version = props.version;
    this.architecture = props.architecture;
  }

  async checkNow(): Promise<Api.Error | Api.Success<Update>> {
    const resp = await fetch("https://pomodoro.hentioe.dev/api/update/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        app_id: this.appId,
        platform: this.platform,
        channel: this.channel,
        version: this.version,
        architecture: this.architecture,
      }),
    });

    const result = await resp.json() as Api.Error | Api.Success<Update>;
    if (result.success) {
      this.updateCached = result.payload;
      this.lastChecked = Date.now();
    }

    return result;
  }

  checkCached(): Promise<Api.Error | Api.Success<Update>> {
    if (this.updateCached && (Date.now() - this.lastChecked) < 15 * 60 * 1000) {
      // 如果上次检查更新时间小于 15 分钟，则直接返回缓存的结果
      debug("Using cached update check result");
      return Promise.resolve({
        success: true,
        payload: this.updateCached,
      });
    }

    return this.checkNow();
  }
}
