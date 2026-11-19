# feat(dressing-room): lay out the Dressing Room around a skin preview

## Purpose

Make the Dressing Room, skin pack, Saved skins, Owned packs, and Character Creator pages usable at small GUI sizes. Chosen options must read as selected, not unavailable, and status text must not cover buttons.

## Design constraints

Keep vanilla Java widgets: buttons, selection lists, the highlighted button sprite, and `PlayerSkinWidget`. Keep each screen's account, purchase, and save logic unchanged. Lay out every page from the window size so it works from a 427 by 240 GUI up to large windows.

## Validation and remaining limits

The full add-on build and its tests pass. Live sessions at GUI scale 2 (427 by 240) and GUI scale 1 (854 by 480) show every page without overlapping text or controls. Opening Saved skins with no saved skins no longer crashes the client.

The skin lists show names and arm models, not thumbnails. Previews of characters other than the active one still depend on Bedrock's account render.
