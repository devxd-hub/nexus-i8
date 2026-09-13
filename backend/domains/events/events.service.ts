import { eventsRepository, EventRecord } from '../../db/repositories/events.repository.ts';

export interface PublicEventDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  eventType: 'Workshop' | 'Showcase' | 'OpenStudio' | 'Meeting';
  date: string;
  time: string;
  venue: string;
  registrationUrl: string | null;
  coverImage: string | null;
  featured: boolean;
  status: 'Upcoming' | 'Completed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export function formatPublicEvent(record: EventRecord): PublicEventDto {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    eventType: record.event_type,
    date: record.event_date,
    time: record.event_time,
    venue: record.venue,
    registrationUrl: record.registration_url,
    coverImage: record.cover_image,
    featured: record.featured === 1,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export class EventsService {
  public async getPaginatedEvents(options: {
    page: number;
    limit: number;
    offset: number;
    status?: string;
    type?: string;
    year?: string;
    featured?: boolean;
  }): Promise<{ items: PublicEventDto[]; total: number }> {
    const { items, total } = eventsRepository.findPaginated({
      status: options.status,
      event_type: options.type,
      year: options.year,
      featured: options.featured,
      offset: options.offset,
      limit: options.limit,
    });

    return {
      items: items.map(formatPublicEvent),
      total,
    };
  }

  public async getUpcomingEvents(): Promise<PublicEventDto[]> {
    const records = eventsRepository.findUpcoming();
    return records.map(formatPublicEvent);
  }

  public async getPastEvents(): Promise<PublicEventDto[]> {
    const records = eventsRepository.findPast();
    return records.map(formatPublicEvent);
  }

  public async getFeaturedEvents(): Promise<PublicEventDto[]> {
    const records = eventsRepository.findFeatured();
    return records.map(formatPublicEvent);
  }

  public async getEventBySlug(slug: string): Promise<PublicEventDto | null> {
    const record = eventsRepository.findBySlug(slug);
    return record ? formatPublicEvent(record) : null;
  }
}

export const eventsService = new EventsService();
