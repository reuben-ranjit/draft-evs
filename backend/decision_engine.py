from datetime import datetime, timezone

from energy.energy_analyzer import assess_suitability
from soil.soil_analyzer import assess_soil


def _resource_strength(resource_class):
    if resource_class == "EXCELLENT":
        return "strong"
    if resource_class == "GOOD":
        return "good"
    if resource_class == "MODERATE":
        return "moderate"
    return "weak"


def _solar_interpretation(ghi_avg, ghi_max, solar_class):
    if solar_class == "EXCELLENT":
        outlook = "Solar conditions are a major positive factor for the site."
    elif solar_class == "GOOD":
        outlook = "Solar conditions are favorable and support further photovoltaic evaluation."
    elif solar_class == "MODERATE":
        outlook = "Solar conditions are usable, but they are not strong enough to carry the site decision by themselves."
    else:
        outlook = "Solar conditions are relatively weak and may limit the site's renewable-energy value."

    return (
        f"Average GHI is {ghi_avg} W/m² with a peak of {ghi_max} W/m². "
        f"The screening class is {solar_class.lower()}. {outlook}"
    )


def _wind_interpretation(wind_avg, wind_max, wind_class):
    if wind_class == "EXCELLENT":
        outlook = "Wind conditions are a major positive factor and warrant dedicated wind-resource and turbine-layout studies."
    elif wind_class == "GOOD":
        outlook = "Wind conditions are favorable and justify further wind-resource evaluation."
    elif wind_class == "MODERATE":
        outlook = "Wind conditions are usable, but additional resource assessment is needed before treating wind as a strong development driver."
    else:
        outlook = "Wind conditions are relatively weak and are unlikely to provide a strong development case on their own."

    return (
        f"Average wind speed is {wind_avg} m/s with a peak of {wind_max} m/s. "
        f"The screening class is {wind_class.lower()}. {outlook}"
    )


def _soil_interpretation(soil_loss, soil_risk):
    if soil_risk == "Low":
        outlook = "Environmental constraint from erosion is relatively limited at the screening level."
    elif soil_risk == "Moderate":
        outlook = "The site has a meaningful erosion consideration that should influence drainage, grading and construction planning."
    elif soil_risk == "High":
        outlook = "Erosion is a significant environmental and engineering constraint and mitigation should be treated as a project requirement."
    else:
        outlook = "Very high erosion risk is a major constraint and can outweigh otherwise favorable resource conditions."

    return (
        f"Estimated mean soil loss is {soil_loss} t/ha/yr and the screening risk is {soil_risk.lower()}. "
        f"{outlook}"
    )


def _build_integrated_reasoning(solar_class, wind_class, soil_risk, final_decision):
    energy_classes = [solar_class, wind_class]
    strong_count = sum(value in {"EXCELLENT", "GOOD"} for value in energy_classes)
    moderate_count = sum(value == "MODERATE" for value in energy_classes)

    if strong_count == 2:
        energy_summary = "Both solar and wind resources are strong."
    elif strong_count == 1 and moderate_count == 1:
        energy_summary = "One renewable resource is strong while the other is moderate."
    elif strong_count == 1:
        energy_summary = "One renewable resource is strong, while the other is comparatively weaker."
    elif moderate_count == 2:
        energy_summary = "Both renewable resources are in the moderate range."
    else:
        energy_summary = "Neither renewable resource is in the strong screening range."

    if soil_risk == "Low":
        soil_summary = "Soil erosion does not create a major screening constraint."
    elif soil_risk == "Moderate":
        soil_summary = "Soil erosion introduces a manageable but important development constraint."
    elif soil_risk == "High":
        soil_summary = "High soil erosion risk materially reduces the attractiveness of the site."
    else:
        soil_summary = "Very high soil erosion risk is a dominant site constraint."

    return (
        f"The final classification is {final_decision.lower()} because the assessment balances renewable-resource strength against environmental constraint. "
        f"{energy_summary} {soil_summary}"
    )


def _development_considerations(solar_class, wind_class, soil_risk):
    items = []

    if solar_class in {"EXCELLENT", "GOOD"}:
        items.append("Carry forward the solar result into a dedicated PV yield, shading and land-layout assessment.")
    elif solar_class == "MODERATE":
        items.append("Validate photovoltaic yield using longer-term irradiance data and a site-specific production model before major investment.")
    else:
        items.append("Treat solar as a secondary resource unless higher-resolution or longer-term data materially improve the resource case.")

    if wind_class in {"EXCELLENT", "GOOD"}:
        items.append("Carry forward the wind result into turbine micro-siting, hub-height resource measurement and wake-loss assessment.")
    elif wind_class == "MODERATE":
        items.append("Use longer-term wind measurements or validated mesoscale data before committing to wind infrastructure.")
    else:
        items.append("Do not rely on the current wind screening result without stronger site-specific evidence.")

    if soil_risk == "Low":
        items.append("Confirm geotechnical conditions, drainage and foundation suitability even though erosion risk is low.")
    elif soil_risk == "Moderate":
        items.append("Include erosion-control, stormwater and construction-surface management measures in the next design stage.")
    elif soil_risk == "High":
        items.append("Treat erosion mitigation, slope stabilization and drainage planning as prerequisites to development.")
    else:
        items.append("Evaluate an alternative site before investing heavily unless a robust mitigation strategy is demonstrated feasible.")

    items.append("Complete grid-connection, land-use, environmental, permitting and geotechnical due diligence before final investment decisions.")
    return items


def evaluate_site(latitude, longitude, site_area):
    """Evaluate a site using renewable-resource and soil-erosion screening inputs."""

    energy = assess_suitability(latitude, longitude)
    solar_class = energy["solar"]["class"]
    wind_class = energy["wind"]["class"]

    soil = assess_soil(latitude, longitude, site_area)
    soil_risk = soil["risk"]

    strong_energy = {"EXCELLENT", "GOOD"}
    acceptable_energy = {"EXCELLENT", "GOOD", "MODERATE"}

    solar_good = solar_class in strong_energy
    wind_good = wind_class in strong_energy
    solar_acceptable = solar_class in acceptable_energy
    wind_acceptable = wind_class in acceptable_energy

    if solar_good and wind_good and soil_risk == "Low":
        final_decision = "HIGHLY SUITABLE"
        action = "STRONG CANDIDATE FOR DEVELOPMENT"
        message = (
            "The site has strong solar and wind resources and low estimated soil erosion risk. "
            "It is a strong candidate for renewable-energy development, subject to detailed technical studies."
        )
    elif solar_good and wind_good and soil_risk == "Moderate":
        final_decision = "SUITABLE"
        action = "PROCEED WITH FURTHER ASSESSMENT"
        message = (
            "The site has strong solar and wind resources, but moderate soil erosion risk should be considered during planning and construction."
        )
    elif solar_good and wind_good and soil_risk == "High":
        final_decision = "CONDITIONALLY SUITABLE"
        action = "MITIGATION REQUIRED"
        message = (
            "The site has strong renewable-energy resources, but high soil erosion risk presents an environmental constraint. "
            "Erosion-control and site-stabilization measures should be investigated before development."
        )
    elif solar_good and wind_good and soil_risk == "Very High":
        final_decision = "NOT RECOMMENDED"
        action = "CONSIDER AN ALTERNATIVE SITE"
        message = (
            "The site has strong renewable-energy resources, but very high soil erosion risk makes it unsuitable for straightforward development. "
            "A lower-risk alternative site should be considered."
        )
    elif solar_acceptable and wind_acceptable and soil_risk == "Low":
        final_decision = "CONDITIONALLY SUITABLE"
        action = "FURTHER TECHNICAL STUDY"
        message = (
            "The site has acceptable but not strong renewable-energy resources and low soil erosion risk. "
            "Further resource and engineering assessment is recommended before development."
        )
    elif solar_acceptable and wind_acceptable and soil_risk == "Moderate":
        final_decision = "CONDITIONALLY SUITABLE"
        action = "FURTHER TECHNICAL STUDY"
        message = (
            "Both renewable-energy resources and soil conditions present moderate conditions. "
            "A detailed technical assessment is recommended before development."
        )
    elif solar_acceptable and wind_acceptable and soil_risk in ["High", "Very High"]:
        final_decision = "NOT RECOMMENDED"
        action = "CONSIDER AN ALTERNATIVE SITE"
        message = (
            "The renewable-energy resources are not strong enough to clearly justify development while soil erosion risk is elevated. "
            "An alternative site with a better balance of energy resources and environmental conditions should be considered."
        )
    else:
        final_decision = "NOT SUITABLE"
        if soil_risk == "Low":
            action = "SELECT A STRONGER RESOURCE SITE"
            message = (
                "The site has low renewable-energy potential despite having relatively favorable soil conditions. "
                "A location with stronger solar and wind resources is recommended."
            )
        else:
            action = "SELECT ANOTHER SITE"
            message = (
                "The site does not provide a sufficiently strong combination of renewable-energy resources and environmental conditions. "
                "An alternative site is recommended."
            )

    integrated_reasoning = _build_integrated_reasoning(
        solar_class,
        wind_class,
        soil_risk,
        final_decision,
    )

    solar = energy["solar"]
    wind = energy["wind"]
    temperature = energy["temperature"]

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "title": "Renewable Energy Site Screening Report",
        "executive_summary": (
            f"The screening indicates that this site is {final_decision.lower()}. "
            f"Solar is classified as {solar_class.lower()}, wind as {wind_class.lower()}, "
            f"and soil erosion risk as {soil_risk.lower()}. {message}"
        ),
        "factor_analysis": {
            "solar": {
                "classification": solar_class,
                "strength": _resource_strength(solar_class),
                "average_value": solar["ghi_avg"],
                "peak_value": solar["ghi_max"],
                "unit": "W/m²",
                "interpretation": _solar_interpretation(
                    solar["ghi_avg"],
                    solar["ghi_max"],
                    solar_class,
                ),
            },
            "wind": {
                "classification": wind_class,
                "strength": _resource_strength(wind_class),
                "average_value": wind["wind_avg"],
                "peak_value": wind["wind_max"],
                "unit": "m/s",
                "interpretation": _wind_interpretation(
                    wind["wind_avg"],
                    wind["wind_max"],
                    wind_class,
                ),
            },
            "soil": {
                "classification": soil_risk,
                "average_value": soil["soil_loss"],
                "unit": "t/ha/yr",
                "interpretation": _soil_interpretation(
                    soil["soil_loss"],
                    soil_risk,
                ),
            },
            "temperature": {
                "average_value": temperature["avg"],
                "unit": "°C",
                "interpretation": (
                    f"Average assessed temperature is {temperature['avg']} °C. "
                    "This provides climate context for preliminary screening, but it is not by itself a suitability threshold."
                ),
            },
        },
        "integrated_assessment": {
            "reasoning": integrated_reasoning,
            "dominant_factors": [
                f"Solar: {solar_class}",
                f"Wind: {wind_class}",
                f"Soil erosion: {soil_risk}",
            ],
            "development_considerations": _development_considerations(
                solar_class,
                wind_class,
                soil_risk,
            ),
        },
        "methodology": [
            "Solar, wind and temperature indicators are obtained from the current energy screening workflow.",
            "Soil erosion risk is derived from the current RUSLE-based soil workflow and its sampled environmental inputs.",
            "The final suitability class is a project screening rule that balances renewable-resource strength against soil-erosion constraint.",
        ],
        "limitations": [
            "This is a preliminary screening tool, not a bankable energy-yield or engineering assessment.",
            "Resource classes are screening thresholds and should be validated with longer-term, higher-resolution and site-specific studies before investment decisions.",
            "The erosion estimate is model-based and does not replace a field geotechnical or environmental investigation.",
            "Grid access, land ownership, permitting, biodiversity, flood risk, foundation conditions and project economics are outside the current decision rule.",
        ],
    }

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "site_area_km2": site_area,
        },
        "energy": energy,
        "soil": soil,
        "final_decision": final_decision,
        "recommendation": {
            "action": action,
            "message": message,
        },
        "report": report,
    }
