import requests
import pandas as pd
import urllib3

urllib3.disable_warnings(
    urllib3.exceptions.InsecureRequestWarning
)


def fetch_region_weather(
    center_lat,
    center_lon,
    buffer=0.9,
    start_date="2020-05-15",
    end_date="2020-06-17"
):
    """
    Fetch historical weather data for the selected location.

    The selected coordinate is used as the representative
    location for the assessment.
    """

    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": center_lat,
        "longitude": center_lon,
        "start_date": start_date,
        "end_date": end_date,
        "hourly": (
            "shortwave_radiation,"
            "temperature_2m,"
            "wind_speed_10m"
        ),
        "timezone": "Asia/Kolkata"
    }

    response = requests.get(
        url,
        params=params,
        verify=False
    )

    response.raise_for_status()

    data = response.json()["hourly"]

    df = pd.DataFrame(data)

    df = df.rename(
        columns={
            "time": "timestamp",
            "shortwave_radiation": "ghi",
            "temperature_2m": "temp_c",
            "wind_speed_10m": "wind_speed_ms"
        }
    )

    return df


def assess_suitability(
    center_lat,
    center_lon,
    buffer=0.9
):
    """
    Assess solar and wind resource quality.

    The assessment evaluates both resources independently.
    Installation type is intentionally not required.
    """

    df = fetch_region_weather(
        center_lat,
        center_lon,
        buffer
    )

    # =========================================
    # SOLAR METRICS
    # =========================================

    daytime = df[df["ghi"] > 0]

    ghi_avg = daytime["ghi"].mean()
    ghi_max = df["ghi"].max()

    # =========================================
    # WIND METRICS
    # =========================================

    wind_avg = df["wind_speed_ms"].mean()
    wind_max = df["wind_speed_ms"].max()

    # =========================================
    # TEMPERATURE
    # =========================================

    temp_avg = df["temp_c"].mean()

    # =========================================
    # SOLAR CLASSIFICATION
    # =========================================

    if ghi_avg >= 550:
        solar_class = "EXCELLENT"

    elif ghi_avg >= 450:
        solar_class = "GOOD"

    elif ghi_avg >= 350:
        solar_class = "MODERATE"

    else:
        solar_class = "POOR"

    # =========================================
    # WIND CLASSIFICATION
    # =========================================

    if wind_avg >= 8:
        wind_class = "EXCELLENT"

    elif wind_avg >= 6:
        wind_class = "GOOD"

    elif wind_avg >= 4:
        wind_class = "MODERATE"

    else:
        wind_class = "POOR"

    # =========================================
    # RETURN RESULTS
    # =========================================

    return {
        "solar": {
            "ghi_avg": round(float(ghi_avg), 2),
            "ghi_max": round(float(ghi_max), 2),
            "class": solar_class
        },

        "wind": {
            "wind_avg": round(float(wind_avg), 2),
            "wind_max": round(float(wind_max), 2),
            "class": wind_class
        },

        "temperature": {
            "avg": round(float(temp_avg), 2)
        }
    }


# =============================================
# TEST THE MODULE DIRECTLY
# =============================================

if __name__ == "__main__":

    center_lat = float(
        input("Enter latitude: ")
    )

    center_lon = float(
        input("Enter longitude: ")
    )

    result = assess_suitability(
        center_lat,
        center_lon
    )

    print("\n=== ENERGY ANALYSIS ===")

    print("\nSolar:")
    print(
        "Average GHI:",
        result["solar"]["ghi_avg"],
        "W/m²"
    )

    print(
        "Peak GHI:",
        result["solar"]["ghi_max"],
        "W/m²"
    )

    print(
        "Classification:",
        result["solar"]["class"]
    )

    print("\nWind:")
    print(
        "Average Wind:",
        result["wind"]["wind_avg"],
        "m/s"
    )

    print(
        "Maximum Wind:",
        result["wind"]["wind_max"],
        "m/s"
    )

    print(
        "Classification:",
        result["wind"]["class"]
    )

    print(
        "\nAverage Temperature:",
        result["temperature"]["avg"],
        "°C"
    )