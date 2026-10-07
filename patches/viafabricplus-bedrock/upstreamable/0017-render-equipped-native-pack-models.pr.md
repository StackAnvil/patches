Render supported worn Bedrock attachables in the player equipment layer. Hive sends pink angel wings as chest equipment, separate from the player skin. The converted item selector must resolve before this layer can find the native definition.

The target is Bedrock 1.26.51.1, protocol 2193. A private recorded Hive session identifies chest item 10173 as `hivebackbling:angel_wings_pink` and head item 10209 as `hivehats:axe`. The wings use six zero-thickness planes, authored south-face UVs, and an alpha-test material with inherited `DisableCulling`. Their spawn animation reaches full scale at 0.64 seconds and holds that frame. Keep the authored geometry unchanged.

Retain animation playback per player, slot, and equipment identity. Apply native render-controller visibility, UV and lighting controls. Bind supported same-name bones through the owner's current pose, including native root, waist, and body animation. Run parent setup when an existing owner variable scope becomes available or changes. Suppress duplicate vanilla head items only when a supported native head surface is selected.

Unsupported non-default variants, explicit binding expressions, per-bone material maps, and unverified material families keep the existing fallback. Classic owners without a native graph or server controller have no parent variable scope. Independent equipped animation and visibility still work. Supported same-name bindings retain full deformation matrices, including shear and reflected scale. Explicit native binding expressions remain unverified.

Validation: 19 focused tests pass without skips. They cover equipment replacement and removal, stable spawn playback, identity collisions, owner context, ordered visibility, and animated owner binding with rotated ancestor rest poses. Layer registration uses the renderer superclass method; a failed early startup exposed an invalid inherited shadow before publication. The full rebuilt stack passes 821 tests without failures or skips: converter 16, ViaBedrock 334, and add-on 471. The final client starts successfully and passes the saved local Hive replay with the matched camera and FOV. The comparison visibly restores pink feather geometry. An observation-only agent records 160 chest vertices and 32 head vertices, both with culling disabled. Equipment start age remains constant while elapsed animation time advances. Wing bones stay visible at full scale after spawn. The vanilla head item remains cleared, so the supported axe renders once. The replay reports no runtime errors; all five artifact hashes remain unchanged and its owned services and display are stopped. Sky color, label overlap, and animation phase still differ from the native reference.

The equipment layer currently reads native pack definitions from a direct ViaFabricPlus Bedrock connection. The ViaProxy appearance transport does not yet carry equipped attachable graphs.

The final local Java-to-ViaProxy-to-Bedrock regression also passes: three stable joins, 15 entity script actions, resource-pack loading for first, repeated and changed content, cache reuse, and cache invalidation. This regression verifies converted resources and client stability; it does not establish worn attachable support through ViaProxy. Artifact hashes remain unchanged after the run, and its services and virtual display are stopped.

Rebase onto the account-wallet update preserves its optional animation and scripts handling. The equipped patch adds its loader and context support without repeating that constructor change. The latest merged add-on passes the recorded Hive replay. Rebuild ViaProxy against the final core and verify that its exporter, item rewriter, and converted-pack cache classes match that core. The rebuilt proxy passes the same local entity and resource-pack regression, with unchanged final artifact hashes and complete cleanup.

Player and equipped graphs receive the same render tick fraction through `frame_alpha`. Shared equipment queries exclude body pivots. Attachable geometry queries still need their own selected model context. A rebuilt-client probe checks that body and preview pivots do not enter the shared equipment query map.

Same-name binding now preserves the complete owner deformation matrix through locators, bounds, and drawing. It keeps local animation poses intact and applies bound matrices directly. Unmatched descendants inherit the bound parent matrix. Independently bound children remain valid when their parent has zero scale. Each pose or replacement binding pass clears previous bindings. This removes parent inversion and TRS decomposition from the supported binding path.

Three new numerical tests fail against the previous implementation and pass with the complete matrices. They cover shear, reflections, singular parents, entity-relative descendants, repeated bindings, locators, vertices, and normals. Nine focused tests pass without skips. The rebuilt add-on passes 519 tests, with no failures or errors and 103 optional fixture skips. Dependency builds, the Prism bundle, and the north-star PR check pass. A private Java 26.3 client checks the applied `ModelPart` hooks with four synthetic models. All four bounds visits and 96 rendered vertices retain their expected matrices and finite normals. This establishes the Java drawing path for the supported binding rule. Native visible comparison, explicit binding expressions, and first-person equipment parity remain unverified. The owned test client is stopped.

## Equipped resources and item bindings through ViaProxy

The equipment layer now reads the accepted actor archive on both routes. The earlier direct-only resource limitation is resolved for supported player equipment. Optional actor properties still require direct state; they are not supplied through ViaProxy yet.

Preserved native item identity selects the attachable through its authored item bindings. Evaluate conditions in a per-avatar Molang scope with owner queries, properties, and the current equipment slot. Selected definition identity controls replacement and playback lifetime. Resource reload and disconnect release selectors, textures, and equipment state. Legacy converted selectors remain valid when native item identity is absent.

The target's player iron chestplate definition uses an explicit owner binding. A private native recording shows orange server costume geometry with green chest wings when the player-specific definition is overridden. Overriding only the generic iron definition leaves vanilla armor visible. No player suffix is hardcoded in selection.

The new selection test covers owner and property changes, equipment context, generic fallback, unknown items, repeated evaluation, and query isolation. Explicit bone binding expressions, per-bone materials, additional material families, non-default variants, first-person equipment, missing proxy properties, and competing eligible item bindings remain incomplete or unverified.

A supported native equipment surface now clears the corresponding vanilla armor field after selection. Previously only head-item drawing was cleared, so ordinary chest armor remained visible behind custom wings. Missing or unsupported native surfaces keep vanilla drawing. Inventory and gameplay equipment state remain unchanged.

The final unchanged native capture passes direct and ViaProxy playback. Each accepted library contains 61 layers, one server pack, the owner-bound iron definition, and both authored geometries. Equipment selection changes from zero to one surface after the chest update; both wing bones reach full scale. Final screenshots show the orange costume and green wings without duplicate vanilla chest armor. Java falls below the recorded terrain and its head appearance differs. These checks establish supported visible equipment selection, not complete native scene parity, exact animation timing, or lifecycle behavior.

## Transported owner queries

Equipped model queries now read owner inputs from the shared actor registry on both connection routes.
Named properties and variants retain their core values without a direct Bedrock connection.
This change does not complete binding expressions, material families, or first-person equipment.

## Match costume visibility in the model's name scope

The costume-rule overload now uses the same humanoid scope as actor-rule visibility. Cached patterns match converted legacy skin names without changing custom actor matching. Two actual model-cube regressions cover mixed case, wildcard override order, intentional hides, and exact custom actor controls. Both tests failed before this overload changed.

These tests verify submitted model state. Candidate Vulkan and Iris rendering checks remain separate runtime gates.

All four actor and costume cube regressions pass. The complete add-on stack replays all 30 patches. The full build passes 616 tests with 117 optional skips and no failures or errors. Actual candidate rendering remains pending.
