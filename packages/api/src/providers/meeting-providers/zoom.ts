import { Temporal } from "temporal-polyfill";

import type {
  CreateMeetingOptions,
  Meeting,
  MeetingProvider,
  UpdateMeetingOptions,
} from "../interfaces";
import { ProviderError } from "../utils";

interface ZoomProviderOptions {
  accessToken: string;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
}

interface ZoomMeetingResponse {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  agenda: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password: string;
  h323_password: string;
  pstn_password: string;
  encrypted_password: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    cn_meeting: boolean;
    in_meeting: boolean;
    join_before_host: boolean;
    jbh_time: number;
    mute_upon_entry: boolean;
    watermark: boolean;
    use_pmi: boolean;
    approval_type: number;
    auto_recording: string;
    enforce_login: boolean;
    enforce_login_domains: string;
    alternative_hosts: string;
    close_registration: boolean;
    show_share_button: boolean;
    allow_multiple_devices: boolean;
    registrants_confirmation_email: boolean;
    waiting_room: boolean;
    request_permission_to_unmute_participants: boolean;
    registrants_email_notification: boolean;
    meeting_authentication: boolean;
    encryption_type: string;
    approved_or_denied_countries_or_regions: {
      enable: boolean;
    };
    breakout_room: {
      enable: boolean;
    };
    internal_meeting: boolean;
    continuous_meeting_chat: {
      enable: boolean;
      auto_add_invited_external_users: boolean;
    };
    participant_focused_meeting: boolean;
    push_change_to_calendar: boolean;
    auto_start_meeting_summary: boolean;
    auto_start_ai_companion_questions: boolean;
  };
}

interface ZoomMeetingCreateRequest {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number;
    auto_recording?: string;
    enforce_login?: boolean;
    waiting_room?: boolean;
    allow_multiple_devices?: boolean;
  };
}

interface ZoomMeetingUpdateRequest {
  topic?: string;
  type?: number;
  start_time?: string;
  duration?: number;
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number;
    auto_recording?: string;
    enforce_login?: boolean;
    waiting_room?: boolean;
    allow_multiple_devices?: boolean;
  };
}

export class ZoomProvider implements MeetingProvider {
  public readonly providerId = "zoom" as const;
  private accessToken: string;
  private baseUrl: string;

  constructor({
    accessToken,
    baseUrl = "https://api.zoom.us/v2",
  }: ZoomProviderOptions) {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl;
  }

  async createMeeting(options: CreateMeetingOptions): Promise<Meeting> {
    return this.withErrorHandler("createMeeting", async () => {
      const meetingData: ZoomMeetingCreateRequest = {
        topic: options.title,
        type: 2, // Scheduled meeting
        start_time: options.startTime.toInstant().toString().replace("Z", ""),
        duration: options.duration,
        timezone: options.timezone,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: options.settings?.muteOnEntry ?? false,
          watermark: false,
          use_pmi: false,
          approval_type: 2, // Automatically approve
          auto_recording: options.settings?.allowRecording ? "cloud" : "none",
          enforce_login: false,
          waiting_room: options.settings?.waitingRoom ?? false,
          allow_multiple_devices: true,
        },
      };

      if (options.settings?.requirePassword) {
        meetingData.password = this.generatePassword();
      }

      const response = await this.makeRequest<ZoomMeetingResponse>(
        "POST",
        "/users/me/meetings",
        meetingData,
      );

      return {
        id: response.id.toString(),
        joinUrl: response.join_url,
        hostUrl: response.start_url,
        password: response.password || undefined,
        dialInNumbers: [], // Would need to fetch from Zoom's phone numbers API
        providerId: "zoom",
        settings: {
          uuid: response.uuid,
          hostId: response.host_id,
          type: response.type,
          status: response.status,
          createdAt: response.created_at,
          h323Password: response.h323_password,
          pstnPassword: response.pstn_password,
          encryptedPassword: response.encrypted_password,
          zoomSettings: response.settings,
        },
      };
    });
  }

  async updateMeeting(
    meetingId: string,
    options: UpdateMeetingOptions,
  ): Promise<Meeting> {
    return this.withErrorHandler("updateMeeting", async () => {
      const updateData: ZoomMeetingUpdateRequest = {};

      if (options.title) {
        updateData.topic = options.title;
      }

      if (options.startTime) {
        updateData.start_time = options.startTime
          .toInstant()
          .toString()
          .replace("Z", "");
        updateData.timezone = options.timezone || "UTC";
      }

      if (options.duration) {
        updateData.duration = options.duration;
      }

      if (options.settings) {
        updateData.settings = {
          mute_upon_entry: options.settings.muteOnEntry,
          waiting_room: options.settings.waitingRoom,
          auto_recording: options.settings.allowRecording ? "cloud" : "none",
        };

        if (options.settings.requirePassword) {
          updateData.password = this.generatePassword();
        }
      }

      await this.makeRequest("PATCH", `/meetings/${meetingId}`, updateData);

      // After update, fetch the updated meeting details
      return this.getMeeting(meetingId);
    });
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    return this.withErrorHandler("deleteMeeting", async () => {
      await this.makeRequest("DELETE", `/meetings/${meetingId}`);
    });
  }

  async getMeeting(meetingId: string): Promise<Meeting> {
    return this.withErrorHandler("getMeeting", async () => {
      const response = await this.makeRequest<ZoomMeetingResponse>(
        "GET",
        `/meetings/${meetingId}`,
      );

      return {
        id: response.id.toString(),
        joinUrl: response.join_url,
        hostUrl: response.start_url,
        password: response.password || undefined,
        dialInNumbers: [], // Would need to fetch from Zoom's phone numbers API
        providerId: "zoom",
        settings: {
          uuid: response.uuid,
          hostId: response.host_id,
          type: response.type,
          status: response.status,
          createdAt: response.created_at,
          h323Password: response.h323_password,
          pstnPassword: response.pstn_password,
          encryptedPassword: response.encrypted_password,
          zoomSettings: response.settings,
        },
      };
    });
  }

  private async makeRequest<T = any>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    endpoint: string,
    data?: any,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (data && (method === "POST" || method === "PATCH")) {
      requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.text();
      let errorMessage = `Zoom API error: ${response.status} ${response.statusText}`;

      try {
        const parsedError = JSON.parse(errorData);
        errorMessage = parsedError.message || errorMessage;
      } catch {
        // If parsing fails, use the default error message
      }

      throw new Error(errorMessage);
    }

    // DELETE requests typically return no content
    if (method === "DELETE") {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  private generatePassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private async withErrorHandler<T>(
    operation: string,
    fn: () => Promise<T> | T,
    context?: Record<string, unknown>,
  ): Promise<T> {
    try {
      return await Promise.resolve(fn());
    } catch (error: unknown) {
      console.error(`Failed to ${operation}:`, error);

      throw new ProviderError(error as Error, operation, context);
    }
  }
}
