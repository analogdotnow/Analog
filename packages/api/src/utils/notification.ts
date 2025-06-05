import z from "zod";
import { paginationRequest } from "./pagination";
import { notificationTypeEnum } from "@repo/db/schema";

export const notificationPaginationRequest = paginationRequest.extend({
    read: z.boolean().optional(), // Filter by read status
    type: z.enum(notificationTypeEnum.enumValues).optional()
})

export const notificationMarkAsReadRequest = z.object({
    id: z.string().uuid(), // Notification ID to mark as read
});