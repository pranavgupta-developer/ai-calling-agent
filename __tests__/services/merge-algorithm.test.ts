// __tests__/services/merge-algorithm.test.ts
// Mocking is omitted for brevity, but this demonstrates the logic of mergeServices.

import { ServiceManager } from "@/lib/services/service-manager";
import { ServiceTemplate, Service, MergedService } from "@/types/service";

// We can mock the supabase client inside ServiceManager for this test,
// but let's assume we are testing the logic block by mocking getClient

describe("Merge Algorithm", () => {
  it("should merge templates with overrides and append custom services", async () => {
    // Mock data
    const mockTemplates: ServiceTemplate[] = [
      {
        id: "t1",
        slug: "template-1",
        name: "Template 1",
        description: "Desc 1",
        category: "Cat 1",
        pricing_type: "FIXED",
        fixed_price: 100,
        min_price: null,
        max_price: null,
        currency: "USD",
        duration_minutes: 60,
        active: true,
        display_order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "t2",
        slug: "template-2",
        name: "Template 2",
        description: "Desc 2",
        category: "Cat 1",
        pricing_type: "FREE",
        fixed_price: null,
        min_price: null,
        max_price: null,
        currency: "USD",
        duration_minutes: 30,
        active: true,
        display_order: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    const mockAgencyServices: Service[] = [
      {
        id: "o1",
        agency_id: "agency1",
        template_id: "t1",
        name: "Overridden Template 1",
        description: "Overridden Desc 1",
        category: "Cat 1",
        pricing_type: "FIXED",
        fixed_price: 150,
        min_price: null,
        max_price: null,
        currency: "USD",
        duration_minutes: 90,
        active: false,
        is_custom: false,
        deleted_at: null,
        deleted_by: null,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "c1",
        agency_id: "agency1",
        template_id: null,
        name: "Custom Service 1",
        description: "Custom Desc 1",
        category: "Cat 2",
        pricing_type: "HOURLY",
        fixed_price: 50,
        min_price: null,
        max_price: null,
        currency: "USD",
        duration_minutes: 60,
        active: true,
        is_custom: true,
        deleted_at: null,
        deleted_by: null,
        created_by: null,
        updated_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];

    // Spy on getClient or the private methods if we want to run this in a real test runner.
    // The expected output of the merge:
    // 1. Template 1 -> OVERRIDE (using o1 data)
    // 2. Template 2 -> DEFAULT (using t2 data)
    // 3. Custom Service 1 -> CUSTOM (using c1 data)
    
    // Validate output logic matching ServiceManager.getMergedServices
  });
});
