/**
 * Geocoding Service using OpenStreetMap Nominatim API
 */

export const geocodeAddress = async (address: string, neighborhood: string, city: string): Promise<{ lat: number, lng: number } | null> => {
  // Nominatim is open source and doesn't require an API key, 
  // but requires a descriptive User-Agent and has rate limits.
  
  const query = encodeURIComponent(`${address}, ${neighborhood}, ${city}, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FredericoNevesRealEstate/1.0'
      }
    });
    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return { 
        lat: parseFloat(result.lat), 
        lng: parseFloat(result.lon) 
      };
    } else {
      console.warn("Geocoding failed for:", query, "No results found");
      return null;
    }
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
