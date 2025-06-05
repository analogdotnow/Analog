import { rand, randUuid } from '@ngneat/falso'
import { seedDb } from '.'
import { notification, notificationSource, notificationSourceEvent, notificationTypeEnum } from '../schema'
export async function notificationSourceSeed() {
    const data: typeof notificationSource.$inferInsert[] = [
        {
            name: 'Google Calendar',
            slug: 'google-calendar',
            description: 'Google Calendar is a time-management and scheduling calendar service developed by Google.',
            createdAt: new Date(),
        },
        {
            name: 'Microsoft Outlook',
            slug: 'microsoft-outlook',
            description: 'Microsoft Outlook is an email client that also includes calendar functionality.',
            createdAt: new Date(),
        },
        {
            name: 'Local Calendar',
            slug: 'local',
            description: 'A local calendar for managing personal events.',
            createdAt: new Date(),
        },
    ]

    return seedDb.insert(notificationSource).values(data).onConflictDoNothing().returning()
}

export async function notificationSeed(userId: string, sources: string[], amount: number = 20) {
    return seedDb.transaction(
        async (tx) => {
            const randSources = () => rand(sources)
            const sourceEvents: typeof notificationSourceEvent.$inferInsert[] = Array.from({ length: amount }, () => ({
                eventId: randUuid(),
                sourceId: randSources(),
                createdAt: new Date(),
            }))

            const sourceEventsInserted = await tx.insert(notificationSourceEvent).values(sourceEvents).onConflictDoNothing().returning()

            if (sourceEventsInserted.length === 0) {
                console.error("No new notification source events were inserted. This might be due to conflicts with existing events.")
                tx.rollback()
                return
            }

            const randSourceEvent = () => rand(sourceEventsInserted.map((event) => event.id))
            const randNotificationType = () => rand(notificationTypeEnum.enumValues)

            const notifications: typeof notification.$inferInsert[] = Array.from({ length: amount }, () => ({
                userId,
                type: randNotificationType(),
                sourceEvent: randSourceEvent(),
                message: `Notification message for user ${userId}`,
                scheduledAt: new Date(),
                readAt: null,
                createdAt: new Date(),
            }))
            return tx.insert(notification).values(notifications).onConflictDoNothing().returning()
        }
    )
}