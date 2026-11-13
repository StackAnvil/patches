Honor an authoritative local-player MobEquipment hotbar selection in both the core inventory state and the Java held slot. The native protocol-2225 control switches back to wooden-pickaxe slot 0 after each server selection; the old translation discards it and mines with the previously selected diamond pickaxe.

Only matching inventory hotbar indices are accepted. Item contents continue through inventory updates, and remote equipment keeps its existing translation.

Validation: registered-handler tests cover valid local selection, offhand and invalid indices, and remote actors. The valid-selection regression fails against the previous handler; all three tests and Checkstyle pass with the change. A rebuilt-client live check accepts server slot 0, mines with the wooden pickaxe, honors the manual slot-1 tool change, and accepts the later return to slot 0. Standalone upstream applicability depends on the recorded protocol prerequisite.
