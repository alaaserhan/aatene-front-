// src/features/notifications/api.ts
import api from "@/src/lib/axios";

// Definitions from previous steps
export type SendToOption =
  | "all"
  | "merchant"
  | "customers"
  | "product_stores"
  | "service_stores"
  | "store_followers";

export type ExceptTypeOption =
  | "contact_store_before"
  | "add_products_to_fav"
  | "manual";

export type SendTypeOption =
  | "apps"
  | "sms"
  | "email";

export type SendTimeOption = "now" | "later" | "template_only";

export interface Template {
  id: number;
  key: string;
  title: string;
  content: string;
}

export interface NotificationTemplate {
  id: number;
  key: string;
  title: string;
  content: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplatesParams {
  page?: number;
  per_page?: number;
  id?: number | string;
}

export interface NotificationTemplatesResponse {
  status: boolean;
  message: string;
  recordsTotal: number;
  recordsFiltered: number;
  templates: NotificationTemplate[];
}

export interface CreateNotificationTemplatePayload {
  key: string;
  title: string;
  content: string;
  is_active: boolean;
}

export interface UpdateNotificationTemplatePayload {
  key?: string;
  title?: string;
  content?: string;
  is_active?: boolean;
}

export interface CreateNotificationTemplateResponse {
  status: boolean;
  message: string;
  template: NotificationTemplate;
}

export interface Store {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface NotificationData {
  discount?: string;
  user_name?: string;
  order_id?: string;
  [key: string]: string | undefined; // Allow additional dynamic keys
}

export interface NotificationModel {
  id: number;
  template_id: string;
  template: Template;
  title: string;
  message: string;
  body: string;
  media: string | null;
  send_types: SendTypeOption[];
  send_time: SendTimeOption;
  scheduled_at: string | null;
  scheduled_at_formatted: string | null;
  data: NotificationData | null;
  send_to: SendToOption[];
  except_types: ExceptTypeOption[];
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  sent_count: string;
  failed_count: string;
  store_ids: number[];
  stores: Store[];
  target_users: User[];
  target_users_count: number;
  except_user_ids: number[];
  except_users: User[];
  except_users_count: number;
  for: string;
  sender_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationPayload {
  title?: string;
  message?: string;
  template_id?: number;
  send_types: SendTypeOption[];
  send_time: SendTimeOption;
  send_to: SendToOption[];
  scheduled_at?: string;
  data?: NotificationData;
  media?: string;
  store_ids?: number[];
  user_ids?: number[];
  except_types?: ExceptTypeOption[];
  except_user_ids?: number[];
}

export interface NotificationsParams {
  page?: number;
  per_page?: number;
  send_types?: SendTypeOption;
  status?: string;
  send_time?: string;
  template_id?: number;
}

export interface NotificationsResponse {
  recordsTotal: number;
  recordsFiltered: number;
  data: NotificationModel[];
}

export interface SingleNotificationResponse {
  status: boolean;
  message: string;
  notification: NotificationModel;
}

export interface CreateNotificationResponse {
  status: boolean;
  message: string;
  data?: NotificationModel;
}

export async function getNotifications(params: NotificationsParams) {
  const { data } = await api.get<NotificationsResponse>(
    "/admin/notifications-management",
    { params }
  );
  return data;
}

export async function getNotification(id: number) {
  const { data } = await api.get<SingleNotificationResponse>(
    `/admin/notifications-management/${id}`
  );
  return data;
}

export async function createNotification(payload: CreateNotificationPayload) {
  const { data } = await api.post<CreateNotificationResponse>(
    "/notifications/send",
    payload
  );
  return data;
}

export async function deleteNotification(id: number) {
  const { data } = await api.delete<{ status: boolean; message: string }>(
    `/admin/notifications-management/${id}`
  );
  return data;
}

export async function cancelNotification(id: number) {
  const { data } = await api.post<SingleNotificationResponse>(
    `/admin/notifications-management/${id}/cancel`
  );
  return data;
}

export async function resendNotification(id: number) {
  const { data } = await api.post<SingleNotificationResponse>(
    `/admin/notifications-management/${id}/resend`
  );
  return data;
}

export async function getNotificationTemplates(params: NotificationTemplatesParams) {
  const { data } = await api.get<NotificationTemplatesResponse>(
    "/admin/notification-templates",
    { params }
  );
  return data;
}

export async function getNotificationTemplate(id: number | string) {
  const { data } = await api.get<NotificationTemplatesResponse>(
    "/admin/notification-templates",
    { params: { id } }
  );
  return data;
}

export async function createNotificationTemplate(payload: CreateNotificationTemplatePayload) {
  const { data } = await api.post<CreateNotificationTemplateResponse>(
    "/admin/notification-templates",
    payload
  );
  return data;
}

export async function updateNotificationTemplate(
  id: number | string,
  payload: UpdateNotificationTemplatePayload
) {
  const { data } = await api.put<{ status: boolean; message: string }>(
    `/admin/notification-templates/${id}`,
    payload
  );
  return data;
}

export async function deleteNotificationTemplate(id: number | string) {
  const { data } = await api.delete<{ status: boolean; message: string }>(
    "/admin/notification-templates",
    { params: { id } }
  );
  return data;
}