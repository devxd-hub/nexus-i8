export interface IRepository<T extends { id: string }> {
  findAll(filter?: (item: T) => boolean): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Partial<T>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
  seed(items: T[]): void;
}

export class MemoryRepository<T extends { id: string }> implements IRepository<T> {
  private items: Map<string, T> = new Map();

  constructor(initialItems: T[] = []) {
    this.seed(initialItems);
  }

  public seed(initialItems: T[]): void {
    this.items.clear();
    for (const item of initialItems) {
      this.items.set(item.id, { ...item });
    }
  }

  public async findAll(filter?: (item: T) => boolean): Promise<T[]> {
    const all = Array.from(this.items.values());
    return filter ? all.filter(filter) : all;
  }

  public async findById(id: string): Promise<T | null> {
    const item = this.items.get(id);
    return item ? { ...item } : null;
  }

  public async create(item: Partial<T>): Promise<T> {
    const id = item.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const created = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
    } as unknown as T;

    this.items.set(id, created);
    return { ...created };
  }

  public async update(id: string, item: Partial<T>): Promise<T | null> {
    const existing = this.items.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...item,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, updated);
    return { ...updated };
  }

  public async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  public async count(): Promise<number> {
    return this.items.size;
  }
}
