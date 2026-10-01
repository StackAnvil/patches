package com.enderdash.agent.integration.probe;

import com.google.gson.Gson;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import net.kyori.adventure.text.Component;
import org.bukkit.Bukkit;
import org.bukkit.GameMode;
import org.bukkit.GameRules;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.NamespacedKey;
import org.bukkit.World;
import org.bukkit.block.Block;
import org.bukkit.block.Container;
import org.bukkit.block.data.Rail;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.AbstractArrow;
import org.bukkit.entity.ChestBoat;
import org.bukkit.entity.Cow;
import org.bukkit.entity.Entity;
import org.bukkit.entity.EntityType;
import org.bukkit.entity.Husk;
import org.bukkit.entity.LivingEntity;
import org.bukkit.entity.Player;
import org.bukkit.entity.Skeleton;
import org.bukkit.entity.minecart.RideableMinecart;
import org.bukkit.entity.minecart.StorageMinecart;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.ProjectileHitEvent;
import org.bukkit.event.player.PlayerChangedWorldEvent;
import org.bukkit.event.player.PlayerInteractEntityEvent;
import org.bukkit.event.player.PlayerRespawnEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.FireworkMeta;
import org.bukkit.persistence.PersistentDataType;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.util.Vector;

/** Server assertions for the same gameplay contract as the Bedrock behavior pack. */
public final class ProbePlugin extends JavaPlugin implements Listener {
  private static final String PREFIX = "[ViaBedrock Gameplay Probe] ";
  private static final String TAG = "stackanvil_probe";
  private static final Gson JSON = new Gson();
  private static final List<String> CASES =
      List.of(
          "movement-left",
          "movement-right",
          "block-break",
          "creative-block-break",
          "block-place",
          "tnt-explosion",
          "water-flow",
          "drop-item",
          "inventory-script-slot",
          "creative-select",
          "creative-replace",
          "creative-replace-main",
          "creative-replace-twice",
          "equip-helmet",
          "equip-offhand",
          "offhand-remove",
          "eat-golden-apple",
          "entity-attack",
          "entity-name",
          "map-hold",
          "command-time",
          "command-completion",
          "command-denied",
          "respawn",
          "dimension-change",
          "chest-transfer",
          "chest-rapid-transfer",
          "chest-pickup-all",
          "chest-boat-transfer",
          "chest-minecart-transfer",
          "furnace-quick-move-log",
          "furnace-quick-move-coal",
          "enchant-basic",
          "offhand-block-place",
          "offhand-shield-use",
          "offhand-elytra-rocket",
          "mainhand-elytra-rocket",
          "boat-forward",
          "minecart-dismount",
          "shield-projectile-baseline",
          "shield-projectile-block",
          "crafting-manual-sticks",
          "crafting-book-sticks",
          "crafting-bulk-sticks",
          "custom-entity-attack",
          "custom-entity-interact",
          "custom-item-transfer",
          "custom-block-break",
          "custom-block-place",
          "complex-world");

  private static final class Fixture {
    final String id;
    final String run;
    final UUID player;
    final Location arena;
    final List<Entity> entities = new ArrayList<>();
    final Map<String, Object> observation = new LinkedHashMap<>();
    Inventory storage;
    LivingEntity target;
    Entity vehicle;
    Location lastVehicle;
    Location dismount;
    double initialHealth;
    int interactions;
    int hits;
    int damageEvents;
    int respawns;
    int worldChanges;
    int ridingSamples;
    int blockedHits;
    int glidingSamples;
    boolean usingShield;
    boolean consumedInFlight;
    double speedBeforeUse;
    double speedAfterUse;
    double previousSpeed;
    double maxStep;
    double maxDistance;
    int previousRockets = 3;
    int updates;

    Fixture(String id, String run, Player player, Location arena) {
      this.id = id;
      this.run = run;
      this.player = player.getUniqueId();
      this.arena = arena;
    }

    Location position(double x, double y, double z) {
      return arena.clone().add(x, y, z);
    }

    Block block(int x, int y, int z) {
      return position(x, y, z).getBlock();
    }
  }

  private Fixture active;
  private World arenaWorld;
  private int serial;

  @Override
  public void onEnable() {
    arenaWorld = Bukkit.getWorlds().getFirst();
    for (World world : Bukkit.getWorlds()) {
      world.setGameRule(GameRules.SPAWN_MOBS, false);
      world.setGameRule(GameRules.ADVANCE_TIME, false);
      world.setGameRule(GameRules.ADVANCE_WEATHER, false);
      world.setGameRule(GameRules.IMMEDIATE_RESPAWN, true);
      world.setGameRule(GameRules.NATURAL_HEALTH_REGENERATION, false);
    }
    Bukkit.getPluginManager().registerEvents(this, this);
    Bukkit.getScheduler().runTaskTimer(this, this::observe, 1, 1);
    getLogger().info("[StackAnvil Java Probe] ready " + JSON.toJson(CASES));
  }

  @Override
  public void onDisable() {
    clear();
  }

  private void record(
      String id, String run, String phase, String status, Map<String, Object> details) {
    Map<String, Object> value = new LinkedHashMap<>();
    value.put("id", id);
    value.put("run", run);
    value.put("phase", phase);
    value.put("status", status);
    value.put("tick", Bukkit.getCurrentTick());
    value.putAll(details);
    getLogger().info(PREFIX + JSON.toJson(value));
  }

  @Override
  public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
    String verb = args.length > 0 ? args[0] : "vbprobe:help";
    if (verb.equals("vbprobe:help") || verb.equals("vbprobe:cases")) {
      sender.sendMessage(JSON.toJson(CASES));
      return true;
    }
    if (verb.equals("vbprobe:clear") || verb.equals("vbprobe:stop")) {
      clear();
      return true;
    }
    if (verb.equals("vbprobe:status") || verb.equals("vbprobe:metadata")) {
      sender.sendMessage(
          "Use gameplay cases for Java entity state; Bedrock named-event sweeps are not portable.");
      return true;
    }
    String phase = verb.replace("vbprobe:", "");
    String id = args.length > 1 ? args[1] : "";
    String run = args.length > 2 ? args[2] : "";
    try {
      if (!List.of("prepare", "start", "verify", "invalidate").contains(phase))
        throw new IllegalArgumentException("Unknown probe command.");
      if (!run.matches("[a-z0-9-]{1,40}")) throw new IllegalArgumentException("Invalid run ID.");
      if (!CASES.contains(id))
        throw new IllegalArgumentException("Unsupported Java scenario: " + id);
      Player player =
          sender instanceof Player online
              ? online
              : Bukkit.getOnlinePlayers().stream()
                  .findFirst()
                  .orElseThrow(() -> new IllegalStateException("A player must be online."));
      if (phase.equals("prepare")) {
        clear();
        Fixture fixture =
            new Fixture(id, run, player, new Location(arenaWorld, serial++ * 128, 250, 0));
        active = fixture;
        prepare(player, fixture);
        record(id, run, phase, "ready", Map.of());
      } else {
        Fixture fixture = Objects.requireNonNull(active, "No active scenario.");
        if (!fixture.id.equals(id)
            || !fixture.run.equals(run)
            || !fixture.player.equals(player.getUniqueId())) {
          throw new IllegalArgumentException("The scenario is not active for this player and run.");
        }
        switch (phase) {
          case "start" -> {
            if (!id.endsWith("elytra-rocket"))
              throw new IllegalArgumentException("This scenario has no start phase.");
            face(player, fixture.position(0.5, 50, 0.5), fixture.position(0.5, 50, 8.5));
            record(id, run, phase, "ready", Map.of());
          }
          case "invalidate" -> {
            // The runner uses this after real input to prove that the assertion detects corrupted
            // state.
            switch (id) {
              case "chest-transfer" -> fixture.storage.setItem(0, item(Material.EMERALD, 1));
              case "custom-entity-attack" -> fixture.target.setHealth(fixture.initialHealth);
              case "custom-entity-interact" ->
                  fixture
                      .target
                      .getPersistentDataContainer()
                      .set(new NamespacedKey("stackanvil", "phase"), PersistentDataType.INTEGER, 0);
              case "custom-item-transfer" -> {
                for (int slot = 0; slot < player.getInventory().getSize(); slot++) {
                  ItemStack stack = player.getInventory().getItem(slot);
                  if (stack != null
                      && new NamespacedKey("stackanvil", "probe_token")
                          .equals(stack.getItemMeta().getItemModel())) {
                    player.getInventory().setItem(slot, item(Material.PAPER, stack.getAmount()));
                  }
                }
              }
              case "custom-block-break" -> fixture.block(0, 1, 2).setType(Material.NOTE_BLOCK);
              case "custom-block-place" -> {
                for (int[] offset :
                    List.of(
                        new int[] {-1, 1, 2},
                        new int[] {1, 1, 2},
                        new int[] {0, 0, 2},
                        new int[] {0, 2, 2},
                        new int[] {0, 1, 1},
                        new int[] {0, 1, 3})) {
                  if (fixture.block(offset[0], offset[1], offset[2]).getType()
                      == Material.NOTE_BLOCK)
                    fixture.block(offset[0], offset[1], offset[2]).setType(Material.AIR);
                }
              }
              case "complex-world" ->
                  fixture.entities.stream()
                      .filter(entity -> entity instanceof Husk)
                      .findFirst()
                      .orElseThrow()
                      .remove();
              default ->
                  throw new IllegalArgumentException("No negative control for this scenario.");
            }
            record(id, run, phase, "ready", Map.of());
          }
          case "verify" -> inspect(player, fixture);
          default -> throw new IllegalArgumentException("Unknown phase.");
        }
      }
    } catch (Exception error) {
      if (phase.equals("prepare")) clear();
      record(id, run, phase, "error", Map.of("error", error.toString()));
    }
    return true;
  }

  private void clear() {
    if (active != null) {
      Player player = Bukkit.getPlayer(active.player);
      if (player != null) {
        player.leaveVehicle();
        player.setOp(true);
      }
      for (Entity entity : active.entities) entity.remove();
    }
    active = null;
  }

  private static void face(Player player, Location position, Location target) {
    position.setDirection(
        target.toVector().subtract(position.clone().add(0, player.getEyeHeight(), 0).toVector()));
    player.teleport(position);
  }

  private static ItemStack item(Material material, int count) {
    return new ItemStack(material, count);
  }

  private static int count(Inventory inventory, Material material) {
    return Arrays.stream(inventory.getContents())
        .filter(Objects::nonNull)
        .filter(stack -> stack.getType() == material)
        .mapToInt(ItemStack::getAmount)
        .sum();
  }

  private static String type(ItemStack item) {
    return item == null || item.getType().isAir()
        ? "minecraft:air"
        : item.getType().getKey().toString();
  }

  private static Map<String, Double> position(Location location) {
    return Map.of("x", location.getX(), "y", location.getY(), "z", location.getZ());
  }

  private <T extends Entity> T spawn(Fixture f, Class<T> type, Location position) {
    T entity = position.getWorld().spawn(position, type, spawned -> spawned.addScoreboardTag(TAG));
    f.entities.add(entity);
    return entity;
  }

  private Entity spawn(Fixture f, EntityType type, Location position) {
    Entity entity = position.getWorld().spawnEntity(position, type);
    entity.addScoreboardTag(TAG);
    f.entities.add(entity);
    return entity;
  }

  private Inventory chest(Fixture f, int x, int y, int z) {
    f.block(x, y, z).setType(Material.CHEST);
    return ((Container) f.block(x, y, z).getState()).getInventory();
  }

  private static ItemStack customItem(int count) {
    ItemStack stack = item(Material.PAPER, count);
    stack.editMeta(
        meta -> {
          meta.setItemModel(new NamespacedKey("stackanvil", "probe_token"));
          meta.displayName(Component.text("Probe Token"));
        });
    return stack;
  }

  private static int tokens(Inventory inventory) {
    return Arrays.stream(inventory.getContents())
        .filter(Objects::nonNull)
        .filter(
            stack ->
                new NamespacedKey("stackanvil", "probe_token")
                    .equals(stack.getItemMeta().getItemModel()))
        .mapToInt(ItemStack::getAmount)
        .sum();
  }

  private void prepare(Player p, Fixture f) {
    p.closeInventory();
    p.leaveVehicle();
    p.setOp(true);
    p.setGameMode(
        f.id.startsWith("creative-") || f.id.equals("tnt-explosion")
            ? GameMode.CREATIVE
            : GameMode.SURVIVAL);
    p.getInventory().clear();
    p.getInventory().setArmorContents(new ItemStack[4]);
    p.getInventory().setItemInOffHand(null);
    p.getInventory().setHeldItemSlot(0);
    for (PotionEffect effect : p.getActivePotionEffects()) p.removePotionEffect(effect.getType());
    p.setHealth(20);
    p.setFoodLevel(20);
    p.setFireTicks(0);
    p.setFallDistance(0);
    p.setLevel(0);
    p.setExp(0);
    p.setVelocity(new Vector());
    p.setGliding(false);
    for (int x = -4; x <= 4; x++)
      for (int z = -4; z <= 5; z++) {
        f.block(x, -1, z).setType(Material.STONE);
        for (int y = 0; y <= 4; y++) f.block(x, y, z).setType(Material.AIR);
      }
    face(p, f.position(0.5, 0, 0.5), f.position(0.5, 1.5, 2.5));
    f.initialHealth = p.getHealth();
    switch (f.id) {
      case "movement-left", "movement-right", "creative-select" -> {}
      case "block-break", "creative-block-break" -> f.block(0, 1, 2).setType(Material.DIRT);
      case "custom-block-break" -> {
        f.block(0, 1, 2).setType(Material.NOTE_BLOCK);
        p.getInventory().setItem(0, item(Material.DIAMOND_AXE, 1));
      }
      case "block-place", "offhand-block-place", "custom-block-place" -> {
        f.block(0, 1, 2).setType(Material.STONE);
        ItemStack stack =
            item(f.id.equals("custom-block-place") ? Material.NOTE_BLOCK : Material.DIRT, 2);
        if (f.id.equals("offhand-block-place")) p.getInventory().setItemInOffHand(stack);
        else p.getInventory().setItem(0, stack);
        if (f.id.equals("offhand-block-place"))
          face(p, f.position(0.5, 0, 0.5), f.position(0.5, 1.5, 2.5));
      }
      case "tnt-explosion" -> {
        f.block(0, 1, 2).setType(Material.TNT);
        p.getInventory().setItem(0, item(Material.FLINT_AND_STEEL, 1));
      }
      case "water-flow" -> {
        f.block(0, 1, 2).setType(Material.STONE);
        p.getInventory().setItem(0, item(Material.WATER_BUCKET, 1));
      }
      case "drop-item", "inventory-script-slot" ->
          p.getInventory().setItem(0, item(Material.EMERALD, f.id.equals("drop-item") ? 4 : 2));
      case "creative-replace", "creative-replace-twice", "creative-replace-main" ->
          p.getInventory()
              .setItem(f.id.equals("creative-replace-main") ? 9 : 0, item(Material.EMERALD, 1));
      case "equip-helmet" -> p.getInventory().setItem(0, item(Material.IRON_HELMET, 1));
      case "equip-offhand" -> p.getInventory().setItem(0, item(Material.SHIELD, 1));
      case "offhand-remove", "offhand-shield-use" ->
          p.getInventory().setItemInOffHand(item(Material.SHIELD, 1));
      case "eat-golden-apple" -> p.getInventory().setItem(0, item(Material.GOLDEN_APPLE, 1));
      case "entity-attack", "entity-name", "custom-entity-attack", "custom-entity-interact" -> {
        f.target =
            f.id.startsWith("custom-")
                ? spawn(f, Husk.class, f.position(0.5, 0, 2.5))
                : spawn(f, Cow.class, f.position(0.5, 0, 2.5));
        f.target.setAI(false);
        f.initialHealth = f.target.getHealth();
        if (f.id.equals("entity-name")) {
          ItemStack tag = item(Material.NAME_TAG, 1);
          tag.editMeta(meta -> meta.displayName(Component.text("StackAnvilProbe")));
          p.getInventory().setItem(0, tag);
        }
        if (f.id.startsWith("custom-")) {
          f.target.addScoreboardTag("stackanvil_custom");
          f.target
              .getPersistentDataContainer()
              .set(new NamespacedKey("stackanvil", "phase"), PersistentDataType.INTEGER, 0);
        }
        face(p, f.position(0.5, 0, 0.5), f.position(0.5, 1.0, 2.5));
      }
      case "map-hold" -> p.getInventory().setItem(0, item(Material.MAP, 1));
      case "command-time", "command-completion", "command-denied" -> {
        arenaWorld.setTime(18000);
        if (f.id.equals("command-denied")) p.setOp(false);
      }
      case "respawn" -> {
        p.setRespawnLocation(f.position(0.5, 0, 0.5), true);
        Bukkit.getScheduler()
            .runTaskLater(
                this,
                () -> {
                  if (active == f) p.setHealth(0);
                },
                2);
      }
      case "dimension-change" -> {
        p.setGameMode(GameMode.CREATIVE);
        World nether =
            Bukkit.getWorlds().stream()
                .filter(world -> world.getEnvironment() == World.Environment.NETHER)
                .findFirst()
                .orElseThrow();
        Bukkit.getScheduler()
            .runTaskLater(
                this,
                () -> {
                  if (active == f) p.teleport(new Location(nether, 0.5, 120, 0.5));
                },
                2);
      }
      case "chest-transfer", "chest-rapid-transfer", "chest-pickup-all", "custom-item-transfer" -> {
        f.storage = chest(f, 0, 1, 2);
        if (f.id.equals("custom-item-transfer")) f.storage.setItem(0, customItem(4));
        else if (f.id.equals("chest-pickup-all"))
          for (int slot = 0; slot < 3; slot++)
            f.storage.setItem(slot, item(Material.EMERALD, slot + 2));
        else {
          f.storage.setItem(0, item(Material.EMERALD, 4));
          if (f.id.equals("chest-rapid-transfer")) f.storage.setItem(1, item(Material.DIAMOND, 3));
        }
      }
      case "chest-boat-transfer", "chest-minecart-transfer" -> {
        if (f.id.equals("chest-boat-transfer"))
          f.storage =
              ((ChestBoat) spawn(f, EntityType.OAK_CHEST_BOAT, f.position(0.5, 0, 2.5)))
                  .getInventory();
        else {
          f.block(0, 0, 2).setType(Material.RAIL);
          f.storage = spawn(f, StorageMinecart.class, f.position(0.5, 0.2, 2.5)).getInventory();
        }
        f.storage.setItem(0, item(Material.EMERALD, 4));
        face(p, f.position(0.5, 0, 0.5), f.position(0.5, 0.5, 2.5));
      }
      case "furnace-quick-move-log", "furnace-quick-move-coal" -> {
        f.block(0, 1, 2).setType(Material.FURNACE);
        f.storage = ((Container) f.block(0, 1, 2).getState()).getInventory();
        if (f.id.endsWith("log")) f.storage.setItem(0, item(Material.OAK_LOG, 63));
        p.getInventory()
            .setItem(0, item(f.id.endsWith("log") ? Material.OAK_LOG : Material.COAL, 8));
      }
      case "enchant-basic" -> {
        f.block(0, 1, 2).setType(Material.ENCHANTING_TABLE);
        p.getInventory().setItem(0, item(Material.IRON_SWORD, 1));
        p.getInventory().setItem(1, item(Material.LAPIS_LAZULI, 3));
        p.setLevel(30);
      }
      case "crafting-manual-sticks", "crafting-book-sticks", "crafting-bulk-sticks" -> {
        f.block(0, 1, 2).setType(Material.CRAFTING_TABLE);
        p.getInventory()
            .setItem(0, item(Material.OAK_PLANKS, f.id.equals("crafting-bulk-sticks") ? 8 : 2));
        p.discoverRecipe(NamespacedKey.minecraft("stick"));
      }
      case "offhand-elytra-rocket", "mainhand-elytra-rocket" -> {
        p.getInventory().setChestplate(item(Material.ELYTRA, 1));
        ItemStack rockets = item(Material.FIREWORK_ROCKET, 3);
        rockets.editMeta(FireworkMeta.class, meta -> meta.setPower(1));
        if (f.id.startsWith("offhand")) p.getInventory().setItemInOffHand(rockets);
        else p.getInventory().setItem(0, rockets);
        p.addPotionEffect(new PotionEffect(PotionEffectType.RESISTANCE, 400, 255, false, false));
      }
      case "boat-forward" -> {
        for (int x = -30; x <= 30; x++)
          for (int z = -4; z <= 32; z++) {
            f.block(x, -1, z).setType(Material.STONE);
            f.block(x, 0, z).setType(Material.WATER);
          }
        f.vehicle = spawn(f, EntityType.OAK_BOAT, f.position(0.5, 0.4, 0.5));
        f.vehicle.addPassenger(p);
        f.lastVehicle = f.vehicle.getLocation();
      }
      case "minecart-dismount" -> {
        for (int z = 0; z <= 28; z++)
          for (int x = -1; x <= 1; x++) {
            f.block(x, -1, z).setType(x == 0 ? Material.REDSTONE_BLOCK : Material.STONE);
            for (int y = 0; y <= 3; y++) f.block(x, y, z).setType(Material.AIR);
            if (x == 0) {
              f.block(x, 0, z).setType(Material.POWERED_RAIL);
              Rail rail = (Rail) f.block(x, 0, z).getBlockData();
              rail.setShape(Rail.Shape.NORTH_SOUTH);
              f.block(x, 0, z).setBlockData(rail);
            }
          }
        f.vehicle = spawn(f, RideableMinecart.class, f.position(0.5, 0.2, 0.5));
        f.vehicle.addPassenger(p);
        f.vehicle.setVelocity(new Vector(0, 0, 0.25));
        f.lastVehicle = f.vehicle.getLocation();
      }
      case "shield-projectile-baseline", "shield-projectile-block" -> {
        for (int z = 0; z <= 5; z++)
          for (int y = 1; y <= 3; y++) {
            f.block(-1, y, z).setType(Material.STONE);
            f.block(1, y, z).setType(Material.STONE);
            f.block(0, 3, z).setType(Material.STONE);
          }
        if (f.id.endsWith("block")) p.getInventory().setItemInOffHand(item(Material.SHIELD, 1));
        Bukkit.getScheduler()
            .runTaskLater(
                this,
                () -> {
                  if (active != f) return;
                  Skeleton skeleton = spawn(f, Skeleton.class, f.position(0.5, 0, 4.5));
                  skeleton.getEquipment().setItemInMainHand(item(Material.BOW, 1));
                  skeleton.setTarget(p);
                  skeleton.addPotionEffect(new PotionEffect(PotionEffectType.SLOWNESS, 400, 255));
                },
                40);
      }
      case "complex-world" -> complexWorld(p, f);
      default -> throw new IllegalArgumentException("Missing fixture implementation: " + f.id);
    }
  }

  private void complexWorld(Player p, Fixture f) {
    Material[] palette = {
      Material.NOTE_BLOCK,
      Material.OAK_STAIRS,
      Material.OAK_SLAB,
      Material.GLASS,
      Material.SEA_LANTERN,
      Material.COPPER_BLOCK,
      Material.STONE,
      Material.DIRT
    };
    for (int x = -24; x <= 24; x++)
      for (int z = -8; z <= 64; z++) {
        f.block(x, -1, z).setType(Material.STONE);
        for (int y = 0; y < 6; y++) f.block(x, y, z).setType(Material.AIR);
        if (Math.abs(x) > 3 && (z & 3) == 0)
          f.block(x, 0, z).setType(palette[Math.floorMod(x + z, palette.length)]);
      }
    for (int index = 0; index < 24; index++) {
      Husk entity = spawn(f, Husk.class, f.position(index % 2 == 0 ? -5.5 : 5.5, 0, 4 + index * 2));
      entity.setAI(false);
      entity.addScoreboardTag("stackanvil_custom");
      entity
          .getPersistentDataContainer()
          .set(new NamespacedKey("stackanvil", "phase"), PersistentDataType.INTEGER, index % 4);
      entity.getEquipment().setHelmet(item(Material.IRON_HELMET, 1));
      entity.customName(Component.text("Probe " + index));
      entity.setCustomNameVisible(true);
      if (index % 4 == 0) entity.addPassenger(spawn(f, Cow.class, entity.getLocation()));
    }
    for (int z : List.of(8, 24, 40, 56)) {
      Inventory inventory = chest(f, -3, 0, z);
      inventory.setItem(0, customItem(4));
    }
    f.observation.put("crossedChunk", false);
    // The runner walks through several chunk boundaries while the fixture updates entities and
    // blocks.
    face(p, f.position(0.5, 0, 0.5), f.position(0.5, 1.5, 60.5));
  }

  private void observe() {
    Fixture f = active;
    if (f == null) return;
    Player p = Bukkit.getPlayer(f.player);
    if (p == null) return;
    f.usingShield |= p.isBlocking();
    if (p.isGliding()) f.glidingSamples++;
    int rockets = count(p.getInventory(), Material.FIREWORK_ROCKET);
    double speed = p.getVelocity().clone().setY(0).length();
    if (p.isGliding() && rockets < f.previousRockets && !f.consumedInFlight) {
      f.consumedInFlight = true;
      f.speedBeforeUse = f.previousSpeed;
    }
    if (f.consumedInFlight) f.speedAfterUse = Math.max(f.speedAfterUse, speed);
    f.previousRockets = rockets;
    f.previousSpeed = speed;
    if (f.vehicle != null && f.vehicle.isValid()) {
      Location current = f.vehicle.getLocation();
      boolean riding = f.vehicle.getPassengers().contains(p);
      if (riding) f.ridingSamples++;
      else if (f.ridingSamples > 0 && f.dismount == null) f.dismount = f.lastVehicle.clone();
      f.maxStep = Math.max(f.maxStep, current.distance(f.lastVehicle));
      f.maxDistance = Math.max(f.maxDistance, current.distance(f.position(0.5, 0.2, 0.5)));
      f.lastVehicle = current;
    }
    if (f.id.equals("complex-world") && p.getWorld() == arenaWorld) {
      if ((p.getLocation().getBlockZ() >> 4) != (f.arena.getBlockZ() >> 4))
        f.observation.put("crossedChunk", true);
      if (Bukkit.getCurrentTick() % 10 == 0) {
        f.updates++;
        for (Entity entity : f.entities)
          if (entity instanceof Husk) {
            entity
                .getPersistentDataContainer()
                .set(
                    new NamespacedKey("stackanvil", "phase"),
                    PersistentDataType.INTEGER,
                    f.updates % 4);
          }
        f.block(-5, 0, 16).setType(f.updates % 2 == 0 ? Material.NOTE_BLOCK : Material.SEA_LANTERN);
      }
    }
  }

  private void inspect(Player p, Fixture f) {
    Map<String, Object> observed = new LinkedHashMap<>();
    boolean passed;
    String expected;
    Inventory inv = p.getInventory();
    switch (f.id) {
      case "movement-left", "movement-right" -> {
        double lateral = -(p.getLocation().getX() - f.arena.getX() - 0.5);
        passed = lateral * (f.id.endsWith("left") ? -1 : 1) > 0.6;
        observed.put("lateral", lateral);
        expected = "At least 0.6 blocks in the requested local direction.";
      }
      case "block-break", "creative-block-break", "custom-block-break" -> {
        String type = f.block(0, 1, 2).getType().getKey().toString();
        passed = f.block(0, 1, 2).getType().isAir();
        observed.put("typeId", type);
        expected = "minecraft:air";
      }
      case "block-place", "offhand-block-place", "custom-block-place" -> {
        Material material = f.id.equals("custom-block-place") ? Material.NOTE_BLOCK : Material.DIRT;
        int placed = 0;
        for (int[] offset :
            List.of(
                new int[] {-1, 1, 2},
                new int[] {1, 1, 2},
                new int[] {0, 0, 2},
                new int[] {0, 2, 2},
                new int[] {0, 1, 1},
                new int[] {0, 1, 3}))
          if (f.block(offset[0], offset[1], offset[2]).getType() == material) placed++;
        int remaining = count(inv, material);
        passed = placed == 1 && remaining == 1;
        observed.putAll(Map.of("placed", placed, "remaining", remaining));
        expected = "One placed block and one remaining item.";
      }
      case "tnt-explosion" -> {
        int crater = 0;
        for (int x = -1; x <= 1; x++)
          for (int z = 1; z <= 3; z++) if (f.block(x, -1, z).getType().isAir()) crater++;
        passed = f.block(0, 1, 2).getType().isAir() && crater > 0;
        observed.put("crater", crater);
        expected = "The TNT explodes and removes nearby floor blocks.";
      }
      case "water-flow" -> {
        int water = 0;
        for (int x = -2; x <= 2; x++)
          for (int z = 0; z <= 4; z++)
            for (int y = 0; y <= 2; y++) if (f.block(x, y, z).getType() == Material.WATER) water++;
        passed = water > 1;
        observed.put("water", water);
        expected = "Water flows into multiple blocks.";
      }
      case "drop-item", "inventory-script-slot" -> {
        int remaining = count(inv, Material.EMERALD);
        int wanted = f.id.equals("drop-item") ? 3 : 1;
        passed = remaining == wanted;
        observed.put("remaining", remaining);
        expected = "Remaining emeralds: " + wanted;
      }
      case "creative-select",
          "creative-replace",
          "creative-replace-main",
          "creative-replace-twice" -> {
        int slot = f.id.equals("creative-replace-main") ? 9 : 0;
        Material wanted =
            f.id.equals("creative-replace-twice") ? Material.ENDER_PEARL : Material.NETHER_STAR;
        passed =
            f.id.equals("creative-select")
                ? count(inv, wanted) > 0
                : p.getInventory().getItem(slot) != null
                    && p.getInventory().getItem(slot).getType() == wanted;
        if (f.id.equals("creative-replace-twice"))
          passed &= count(inv, Material.EMERALD) == 0 && count(inv, Material.NETHER_STAR) == 0;
        observed.put("selected", type(inv.getItem(slot)));
        expected = wanted.getKey().toString();
      }
      case "equip-helmet", "equip-offhand", "offhand-remove" -> {
        String selected =
            type(
                f.id.equals("equip-helmet")
                    ? p.getInventory().getHelmet()
                    : p.getInventory().getItemInOffHand());
        passed =
            selected.equals(
                f.id.equals("equip-helmet")
                    ? "minecraft:iron_helmet"
                    : f.id.equals("offhand-remove") ? "minecraft:air" : "minecraft:shield");
        if (f.id.equals("offhand-remove")) passed &= count(inv, Material.SHIELD) == 1;
        observed.put("typeId", selected);
        expected = "The equipment and inventory slots match the requested action.";
      }
      case "eat-golden-apple" -> {
        passed =
            count(inv, Material.GOLDEN_APPLE) == 0
                && p.hasPotionEffect(PotionEffectType.ABSORPTION);
        observed.putAll(
            Map.of(
                "remaining",
                count(inv, Material.GOLDEN_APPLE),
                "absorption",
                p.hasPotionEffect(PotionEffectType.ABSORPTION)));
        expected = "The apple is consumed and absorption is active.";
      }
      case "entity-attack", "custom-entity-attack" -> {
        double health = f.target.getHealth();
        passed = health < f.initialHealth;
        observed.putAll(Map.of("health", health, "uuid", f.target.getUniqueId().toString()));
        expected = "Health less than " + f.initialHealth;
      }
      case "entity-name" -> {
        passed = Component.text("StackAnvilProbe").equals(f.target.customName());
        observed.put("name", String.valueOf(f.target.customName()));
        expected = "StackAnvilProbe";
      }
      case "custom-entity-interact" -> {
        int phase =
            f.target
                .getPersistentDataContainer()
                .getOrDefault(
                    new NamespacedKey("stackanvil", "phase"), PersistentDataType.INTEGER, 0);
        passed = f.interactions > 0 && phase == 1;
        observed.putAll(
            Map.of(
                "interactions",
                f.interactions,
                "phase",
                phase,
                "uuid",
                f.target.getUniqueId().toString()));
        expected = "The custom entity interaction changes its phase.";
      }
      case "map-hold" -> {
        String selected = type(inv.getItem(0));
        passed = selected.equals("minecraft:filled_map");
        observed.put("selected", selected);
        expected = "minecraft:filled_map";
      }
      case "command-time", "command-completion", "command-denied" -> {
        long time = arenaWorld.getTime();
        passed = f.id.equals("command-denied") ? time >= 15000 : time < 6000;
        observed.put("time", time);
        expected = f.id.equals("command-denied") ? "Night remains." : "Daytime.";
      }
      case "respawn" -> {
        passed = f.respawns > 0 && !p.isDead();
        observed.put("respawns", f.respawns);
        expected = "A respawn while connected.";
      }
      case "dimension-change" -> {
        passed = f.worldChanges > 0 && p.getWorld().getEnvironment() == World.Environment.NETHER;
        observed.putAll(
            Map.of("changes", f.worldChanges, "dimension", p.getWorld().getKey().toString()));
        expected = "minecraft:the_nether";
      }
      case "chest-transfer",
          "chest-pickup-all",
          "chest-rapid-transfer",
          "chest-boat-transfer",
          "chest-minecart-transfer" -> {
        int wanted = f.id.equals("chest-pickup-all") ? 9 : 4;
        int stored = count(f.storage, Material.EMERALD), held = count(inv, Material.EMERALD);
        passed = stored == 0 && held == wanted;
        observed.putAll(Map.of("chest", stored, "player", held));
        if (f.id.equals("chest-rapid-transfer")) {
          passed &= count(f.storage, Material.DIAMOND) == 0 && count(inv, Material.DIAMOND) == 3;
          observed.put("diamonds", count(inv, Material.DIAMOND));
        }
        expected = "The storage is empty and the player owns all fixture items.";
      }
      case "custom-item-transfer" -> {
        int stored = tokens(f.storage), held = tokens(inv);
        passed = stored == 0 && held == 4;
        observed.putAll(Map.of("chest", stored, "player", held));
        expected = "Four tokens retain their custom item model after transfer.";
      }
      case "furnace-quick-move-log", "furnace-quick-move-coal" -> {
        int input = f.storage.getItem(0) == null ? 0 : f.storage.getItem(0).getAmount(),
            fuel = f.storage.getItem(1) == null ? 0 : f.storage.getItem(1).getAmount();
        int held = count(inv, f.id.endsWith("log") ? Material.OAK_LOG : Material.COAL);
        passed =
            f.id.endsWith("log")
                ? input == 64 && fuel == 0 && held == 7
                : input == 0 && fuel == 8 && held == 0;
        observed.putAll(Map.of("input", input, "fuel", fuel, "player", held));
        expected = "Quick move fills the correct furnace slot.";
      }
      case "enchant-basic" -> {
        ItemStack sword = inv.getItem(0);
        passed =
            sword != null
                && sword.getType() == Material.IRON_SWORD
                && !sword.getEnchantments().isEmpty()
                && count(inv, Material.LAPIS_LAZULI) == 2
                && p.getLevel() < 30;
        observed.putAll(
            Map.of(
                "enchanted",
                sword != null && !sword.getEnchantments().isEmpty(),
                "lapis",
                count(inv, Material.LAPIS_LAZULI),
                "level",
                p.getLevel()));
        expected = "An enchanted sword, two lapis, and reduced experience.";
      }
      case "crafting-manual-sticks", "crafting-book-sticks", "crafting-bulk-sticks" -> {
        int wanted = f.id.equals("crafting-bulk-sticks") ? 16 : 4;
        passed = count(inv, Material.OAK_PLANKS) == 0 && count(inv, Material.STICK) == wanted;
        observed.putAll(
            Map.of(
                "planks", count(inv, Material.OAK_PLANKS), "sticks", count(inv, Material.STICK)));
        expected = "All fixture planks become " + wanted + " sticks.";
      }
      case "offhand-shield-use" -> {
        passed = f.usingShield;
        observed.put("usingShield", f.usingShield);
        expected = "The Java backend sees the shield raised.";
      }
      case "shield-projectile-baseline", "shield-projectile-block" -> {
        passed =
            f.id.endsWith("baseline")
                ? f.hits > 0 && p.getHealth() < f.initialHealth
                : f.blockedHits > 0 && f.usingShield && f.damageEvents == 0;
        observed.putAll(
            Map.of(
                "hits",
                f.hits,
                "blockedHits",
                f.blockedHits,
                "health",
                p.getHealth(),
                "usingShield",
                f.usingShield,
                "damageEvents",
                f.damageEvents));
        expected =
            f.id.endsWith("baseline")
                ? "A frontal arrow damages the player."
                : "A frontal arrow reaches the raised shield without damage.";
      }
      case "offhand-elytra-rocket", "mainhand-elytra-rocket" -> {
        passed =
            f.glidingSamples > 0
                && f.consumedInFlight
                && f.speedAfterUse > f.speedBeforeUse + 0.15
                && !p.isDead();
        observed.putAll(
            Map.of(
                "glidingSamples",
                f.glidingSamples,
                "consumedInFlight",
                f.consumedInFlight,
                "speedBeforeUse",
                f.speedBeforeUse,
                "speedAfterUse",
                f.speedAfterUse));
        expected = "A rocket is consumed during glide and increases speed.";
      }
      case "boat-forward" -> {
        passed =
            f.ridingSamples > 0
                && f.maxDistance > 2
                && f.maxStep < 2
                && f.vehicle.getPassengers().contains(p);
        observed.putAll(
            Map.of(
                "riderSamples",
                f.ridingSamples,
                "maxDistance",
                f.maxDistance,
                "maxStep",
                f.maxStep,
                "mounted",
                f.vehicle.getPassengers().contains(p)));
        expected = "The player remains mounted while the boat moves smoothly.";
      }
      case "minecart-dismount" -> {
        double fromStart = p.getLocation().distance(f.position(0.5, 0.2, 0.5));
        passed =
            f.ridingSamples > 0
                && f.maxDistance > 2
                && f.maxStep < 2
                && f.dismount != null
                && !f.vehicle.getPassengers().contains(p)
                && p.getLocation().distance(f.dismount) < 3;
        observed.putAll(
            Map.of(
                "fromStart",
                fromStart,
                "player",
                position(p.getLocation()),
                "maxDistance",
                f.maxDistance));
        if (f.dismount != null) observed.put("dismountPosition", position(f.dismount));
        expected = "The player dismounts near the moved minecart on the track.";
      }
      case "complex-world" -> {
        long entities =
            f.entities.stream()
                .filter(Entity::isValid)
                .filter(entity -> entity instanceof Husk)
                .count();
        passed =
            Boolean.TRUE.equals(f.observation.get("crossedChunk"))
                && entities == 24
                && f.updates > 4
                && !p.isDead();
        observed.putAll(f.observation);
        observed.putAll(
            Map.of(
                "customEntities",
                entities,
                "updates",
                f.updates,
                "player",
                position(p.getLocation())));
        observed.put(
            "entityIds",
            f.entities.stream()
                .filter(Entity::isValid)
                .filter(entity -> entity instanceof Husk)
                .map(entity -> entity.getUniqueId().toString())
                .toList());
        expected =
            "The player crosses chunks while 24 custom entities and blocks receive repeated"
                + " updates.";
      }
      default -> throw new IllegalArgumentException("Missing assertion: " + f.id);
    }
    record(
        f.id,
        f.run,
        "verify",
        passed ? "pass" : "fail",
        Map.of("observed", observed, "expected", expected));
  }

  @EventHandler
  public void interact(PlayerInteractEntityEvent event) {
    Fixture f = active;
    if (f == null
        || !f.player.equals(event.getPlayer().getUniqueId())
        || event.getRightClicked() != f.target
        || !f.id.equals("custom-entity-interact")) return;
    event.setCancelled(true);
    f.interactions++;
    f.target
        .getPersistentDataContainer()
        .set(new NamespacedKey("stackanvil", "phase"), PersistentDataType.INTEGER, 1);
  }

  @EventHandler
  public void respawn(PlayerRespawnEvent event) {
    if (active != null && active.player.equals(event.getPlayer().getUniqueId())) active.respawns++;
  }

  @EventHandler
  public void worldChange(PlayerChangedWorldEvent event) {
    if (active != null && active.player.equals(event.getPlayer().getUniqueId()))
      active.worldChanges++;
  }

  @EventHandler
  public void projectile(ProjectileHitEvent event) {
    if (active == null
        || !(event.getEntity() instanceof AbstractArrow)
        || !(event.getHitEntity() instanceof Player p)
        || !active.player.equals(p.getUniqueId())) return;
    active.hits++;
    if (p.isBlocking()) active.blockedHits++;
  }

  @EventHandler
  public void damage(EntityDamageEvent event) {
    if (active != null
        && event.getEntity().getUniqueId().equals(active.player)
        && !event.isCancelled()
        && event.getFinalDamage() > 0) active.damageEvents++;
  }
}
