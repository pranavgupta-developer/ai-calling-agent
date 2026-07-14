import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { seedDefaultServices } from "@/lib/actions/services/seed-services";
import { createClient } from "@/lib/supabase/server";

// Mock the Supabase server client
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("seedDefaultServices", () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup basic mock methods
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    (createClient as any).mockResolvedValue(mockSupabase);
  });

  it("should successfully seed services for a new agency", async () => {
    // 1. Mock agency exists
    mockSupabase.single.mockResolvedValueOnce({ data: { id: "agency-123" }, error: null });

    // 2. Mock no existing services (duplicate check)
    mockSupabase.eq.mockResolvedValueOnce({ count: 0, error: null });

    // 3. Mock fetch templates
    const mockTemplates = [
      { id: "t1", name: "Buyer Consultation", active: true },
      { id: "t2", name: "Property Valuation", active: true },
    ];
    mockSupabase.eq.mockResolvedValueOnce({ data: mockTemplates, error: null });

    // 4. Mock insert success
    mockSupabase.insert.mockResolvedValueOnce({ error: null });

    const result = await seedDefaultServices("agency-123");

    expect(result.success).toBe(true);
    expect(result.insertedCount).toBe(2);
    expect(mockSupabase.insert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Buyer Consultation", agency_id: "agency-123", is_template: true }),
        expect.objectContaining({ name: "Property Valuation", agency_id: "agency-123", is_template: true })
      ])
    );
  });

  it("should prevent duplicate seeding if agency already has templates", async () => {
    // 1. Mock agency exists
    mockSupabase.single.mockResolvedValueOnce({ data: { id: "agency-123" }, error: null });

    // 2. Mock agency already has services
    mockSupabase.eq.mockResolvedValueOnce({ count: 5, error: null });

    const result = await seedDefaultServices("agency-123");

    expect(result.success).toBe(true);
    expect(result.insertedCount).toBe(0);
    
    // Ensure insert was never called
    expect(mockSupabase.insert).not.toHaveBeenCalled();
  });

  it("should handle database failure during insertion gracefully", async () => {
    // 1. Mock agency exists
    mockSupabase.single.mockResolvedValueOnce({ data: { id: "agency-123" }, error: null });

    // 2. Mock no existing services
    mockSupabase.eq.mockResolvedValueOnce({ count: 0, error: null });

    // 3. Mock fetch templates
    mockSupabase.eq.mockResolvedValueOnce({ data: [{ name: "Test" }], error: null });

    // 4. Mock insert failure
    mockSupabase.insert.mockResolvedValueOnce({ error: new Error("DB Connection Error") });

    const result = await seedDefaultServices("agency-123");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Failed to insert services");
  });

  it("should return an error for an invalid or non-existent agency ID", async () => {
    // 1. Mock agency not found
    mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    const result = await seedDefaultServices("invalid-id");

    expect(result.success).toBe(false);
    expect(result.error).toBe("Agency not found or database error");
  });
});
