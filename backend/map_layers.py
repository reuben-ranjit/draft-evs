import ee

WORLD_COVER_ASSET = "ESA/WorldCover/v200"

WORLD_COVER_CLASSES = [
    10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100
]

WORLD_COVER_PALETTE = [
    "006400", "FFBB22", "FFFF4C", "F096FF", "FA0000",
    "B4B4B4", "F0F0F0", "0064C8", "0096A0", "00CF75", "FAE6A0"
]

VEGETATION_CLASSES = [10, 20, 30, 40, 90, 95, 100]


def _worldcover_image():
    return ee.ImageCollection(WORLD_COVER_ASSET).first().select("Map")


def get_worldcover_tile(layer="landcover"):
    image = _worldcover_image()

    if layer == "landcover":
        # Remap the categorical ESA class values to 1..11 so the palette
        # matches the discrete WorldCover classes instead of interpolating
        # across the gaps in the original class codes.
        rendered = image.remap(
            WORLD_COVER_CLASSES,
            list(range(1, len(WORLD_COVER_CLASSES) + 1)),
            0,
        ).selfMask()

        vis = {
            "min": 1,
            "max": len(WORLD_COVER_CLASSES),
            "palette": WORLD_COVER_PALETTE,
        }

    elif layer == "vegetation":
        rendered = image.remap(
            VEGETATION_CLASSES,
            [1] * len(VEGETATION_CLASSES),
            0,
        ).selfMask()

        vis = {
            "min": 1,
            "max": 1,
            "palette": ["2F8F4E"],
        }

    elif layer == "water":
        # WorldCover class 80 is permanent water bodies.
        rendered = image.eq(80).selfMask()

        vis = {
            "min": 0,
            "max": 1,
            "palette": ["1877B8"],
        }

    else:
        raise ValueError(
            "layer must be one of: landcover, vegetation, water"
        )

    map_info = rendered.getMapId(vis)
    tile_url = map_info["tile_fetcher"].url_format

    return {
        "layer": layer,
        "tile_url": tile_url,
        "attribution": (
            "© ESA WorldCover project 2021 / "
            "Contains modified Copernicus Sentinel data (2021) "
            "processed by ESA WorldCover consortium"
        ),
    }
