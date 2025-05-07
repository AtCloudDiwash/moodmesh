import * as Location from "expo-location";

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

const fetchSuggestions = async (input) => {
  if (!GOOGLE_API_KEY) {
    console.error("Google API Key is missing.");
    return [];
  }

  // Default coordinates (Kathmandu, Nepal) as fallback
  let lat = 27.7172;
  let lng = 85.324;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {

      // Get current position
      const location = await Location.getCurrentPositionAsync({});
      lat = location.coords.latitude;
      lng = location.coords.longitude;
      console.log("User location:", { lat, lng });
    } else {
      console.warn("Location permission denied, using default coordinates");
    }
  } catch (error) {
    console.error("Error fetching user location:", error);
    console.warn("Using default coordinates");
  }

  //raidus of 20km

  try {
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
      input
    )}&key=${GOOGLE_API_KEY}&types=geocode&location=${lat},${lng}&radius=20000&components=country:np`;

    console.log("Fetching suggestions with:", { input, lat, lng, url });

    const response = await fetch(url);
    const data = await response.json();

    console.log("API response:", data.predictions);

    if (data.status !== "OK") {
      console.warn("Google API error:", data.status, data.error_message);
      return [];
    }

    return data.predictions.slice(0, 5).map((prediction) => ({
      id: prediction.place_id,
      label: prediction.description,
    }));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export default fetchSuggestions;
