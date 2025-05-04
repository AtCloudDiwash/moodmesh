const fetchSuggestions = async (text:string) => {
  if (text.length < 3) return []; 

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${text}&addressdetails=1&limit=5`,
      {
        headers: {
          "User-Agent":
            "com.anonymous.MoodMesh/1.0 (mailto:kuskusmiyaspace321@gmail.com)",
        },
      }
    );

    const data = await response.json();

    return data.map((item) => ({
      label: item.display_name,
    }));
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};

export default fetchSuggestions;
