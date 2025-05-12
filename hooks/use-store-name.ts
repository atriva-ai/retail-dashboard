// hooks/use-store-name.ts
// Called by Header in server, not do "use client"

/*
export async function fetchStoreName(): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
      throw new Error("Environment variable NEXT_PUBLIC_API_BASE_URL is not defined");
    }

    const res = await fetch(`${baseUrl}/api/store`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch store name: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.name as string;
  } catch (error) {
    console.error('❌ Error fetching store name:', error);
    return 'Unknown Store';
  }
}
*/
