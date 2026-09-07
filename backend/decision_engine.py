from energy.energy_analyzer import assess_suitability
from soil.soil_analyzer import assess_soil


def evaluate_site(
    latitude,
    longitude,
    site_area
):
    """
    Evaluate a renewable-energy site using:
    - Solar resource
    - Wind resource
    - Soil erosion risk

    The final decision considers all three factors together.
    """

    # =========================================
    # 1. ENERGY ANALYSIS
    # =========================================

    energy = assess_suitability(
        latitude,
        longitude
    )

    solar_class = energy["solar"]["class"]
    wind_class = energy["wind"]["class"]

    # =========================================
    # 2. SOIL ANALYSIS
    # =========================================

    soil = assess_soil(
        latitude,
        longitude,
        site_area
    )

    soil_risk = soil["risk"]

    # =========================================
    # 3. CLASSIFY ENERGY RESOURCES
    # =========================================

    strong_energy = {
        "EXCELLENT",
        "GOOD"
    }

    acceptable_energy = {
        "EXCELLENT",
        "GOOD",
        "MODERATE"
    }

    solar_good = solar_class in strong_energy
    wind_good = wind_class in strong_energy

    solar_acceptable = solar_class in acceptable_energy
    wind_acceptable = wind_class in acceptable_energy

    # =========================================
    # 4. FINAL SITE DECISION
    # =========================================

    # -----------------------------------------
    # BEST OF BOTH WORLDS
    # -----------------------------------------

    if (
        solar_good
        and wind_good
        and soil_risk == "Low"
    ):

        final_decision = "HIGHLY SUITABLE"

        action = "STRONG CANDIDATE FOR DEVELOPMENT"

        message = (
            "The site has strong solar and wind resources "
            "and low estimated soil erosion risk. "
            "It is a strong candidate for renewable-energy "
            "development, subject to detailed technical studies."
        )

    # -----------------------------------------
    # GOOD ENERGY + MODERATE SOIL
    # -----------------------------------------

    elif (
        solar_good
        and wind_good
        and soil_risk == "Moderate"
    ):

        final_decision = "SUITABLE"

        action = "PROCEED WITH FURTHER ASSESSMENT"

        message = (
            "The site has strong solar and wind resources, "
            "but moderate soil erosion risk should be "
            "considered during planning and construction."
        )

    # -----------------------------------------
    # GOOD ENERGY + HIGH SOIL RISK
    # -----------------------------------------

    elif (
        solar_good
        and wind_good
        and soil_risk == "High"
    ):

        final_decision = "CONDITIONALLY SUITABLE"

        action = "MITIGATION REQUIRED"

        message = (
            "The site has strong renewable-energy resources, "
            "but high soil erosion risk presents an environmental "
            "constraint. Erosion-control and site-stabilization "
            "measures should be investigated before development."
        )

    # -----------------------------------------
    # GOOD ENERGY + VERY HIGH SOIL RISK
    # -----------------------------------------

    elif (
        solar_good
        and wind_good
        and soil_risk == "Very High"
    ):

        final_decision = "NOT RECOMMENDED"

        action = "CONSIDER AN ALTERNATIVE SITE"

        message = (
            "The site has strong renewable-energy resources, "
            "but very high soil erosion risk makes it unsuitable "
            "for straightforward development. A lower-risk "
            "alternative site should be considered."
        )

    # =========================================
    # MODERATE ENERGY
    # =========================================

    elif (
        solar_acceptable
        and wind_acceptable
        and soil_risk == "Low"
    ):

        final_decision = "CONDITIONALLY SUITABLE"

        action = "FURTHER TECHNICAL STUDY"

        message = (
            "The site has acceptable but not strong renewable-energy "
            "resources and low soil erosion risk. Further resource "
            "and engineering assessment is recommended before development."
        )

    elif (
        solar_acceptable
        and wind_acceptable
        and soil_risk == "Moderate"
    ):

        final_decision = "CONDITIONALLY SUITABLE"

        action = "FURTHER TECHNICAL STUDY"

        message = (
            "Both renewable-energy resources and soil conditions "
            "present moderate conditions. A detailed technical "
            "assessment is recommended before development."
        )

    elif (
        solar_acceptable
        and wind_acceptable
        and soil_risk in ["High", "Very High"]
    ):

        final_decision = "NOT RECOMMENDED"

        action = "CONSIDER AN ALTERNATIVE SITE"

        message = (
            "The renewable-energy resources are not strong enough "
            "to clearly justify development while soil erosion risk "
            "is elevated. An alternative site with a better balance "
            "of energy resources and environmental conditions should "
            "be considered."
        )

    # =========================================
    # WEAK ENERGY RESOURCE
    # =========================================

    else:

        if soil_risk == "Low":

            final_decision = "NOT SUITABLE"

            action = "SELECT A STRONGER RESOURCE SITE"

            message = (
                "The site has low renewable-energy potential despite "
                "having relatively favorable soil conditions. "
                "A location with stronger solar and wind resources "
                "is recommended."
            )

        else:

            final_decision = "NOT SUITABLE"

            action = "SELECT ANOTHER SITE"

            message = (
                "The site does not provide a sufficiently strong "
                "combination of renewable-energy resources and "
                "environmental conditions. An alternative site "
                "is recommended."
            )

    # =========================================
    # 5. RETURN COMPLETE ASSESSMENT
    # =========================================

    return {
        "location": {
            "latitude": latitude,
            "longitude": longitude,
            "site_area_km2": site_area
        },

        "energy": energy,

        "soil": soil,

        "final_decision": final_decision,

        "recommendation": {
            "action": action,
            "message": message
        }
    }