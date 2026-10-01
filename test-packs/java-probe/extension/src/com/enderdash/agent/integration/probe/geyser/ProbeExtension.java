package com.enderdash.agent.integration.probe.geyser;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.bukkit.Bukkit;
import org.bukkit.NamespacedKey;
import org.bukkit.entity.Entity;
import org.bukkit.entity.Husk;
import org.bukkit.persistence.PersistentDataType;
import org.geysermc.event.subscribe.Subscribe;
import org.geysermc.geyser.api.entity.custom.CustomEntityDefinition;
import org.geysermc.geyser.api.entity.data.GeyserEntityDataTypes;
import org.geysermc.geyser.api.entity.property.type.GeyserFloatEntityProperty;
import org.geysermc.geyser.api.entity.property.type.GeyserIntEntityProperty;
import org.geysermc.geyser.api.entity.type.GeyserEntity;
import org.geysermc.geyser.api.event.java.ServerSpawnEntityEvent;
import org.geysermc.geyser.api.event.lifecycle.GeyserDefineEntitiesEvent;
import org.geysermc.geyser.api.event.lifecycle.GeyserDefineEntityPropertiesEvent;
import org.geysermc.geyser.api.event.lifecycle.GeyserPostInitializeEvent;
import org.geysermc.geyser.api.extension.Extension;
import org.geysermc.geyser.api.util.Identifier;

/** Paper-specific extension for the disposable probe server, where all husks are fixtures. */
public final class ProbeExtension implements Extension {
  private final CustomEntityDefinition definition =
      CustomEntityDefinition.of(Identifier.of("stackanvil:probe_entity"));
  private GeyserIntEntityProperty phase;
  private GeyserFloatEntityProperty health;

  private record Key(UUID connection, UUID entity) {}

  private record State(int phase, float health) {}

  private final Map<Key, State> sent = new HashMap<>();

  @Subscribe
  public void define(GeyserDefineEntitiesEvent event) {
    event.register(definition);
  }

  @Subscribe
  public void properties(GeyserDefineEntityPropertiesEvent event) {
    phase =
        event.registerIntegerProperty(
            definition.identifier(), Identifier.of("stackanvil:phase"), 0, 3, 0);
    health =
        event.registerFloatProperty(
            definition.identifier(), Identifier.of("stackanvil:health"), 0, 1, 1f);
  }

  @Subscribe
  public void spawn(ServerSpawnEntityEvent event) {
    if (!event.entityType().is(Identifier.of("minecraft:husk"))) return;
    event.definition(definition);
    event.preSpawnConsumer(
        entity -> {
          entity.override(GeyserEntityDataTypes.SCALE, 1.0f);
          entity.updateProperty(phase, 0);
          entity.updateProperty(health, 1f);
        });
  }

  @Subscribe
  public void initialize(GeyserPostInitializeEvent event) {
    var plugin = Bukkit.getPluginManager().getPlugin("Geyser-Spigot");
    if (plugin == null)
      throw new IllegalStateException("The probe extension requires Geyser-Spigot on Paper.");
    // Read Bukkit state on the server thread. Geyser's API schedules property/data writes on its
    // session loop.
    Bukkit.getScheduler().runTaskTimer(plugin, this::update, 1, 2);
    logger().info("[StackAnvil Geyser Probe] ready");
  }

  private void update() {
    Set<Key> live = new HashSet<>();
    for (var world : Bukkit.getWorlds())
      for (Entity entity : world.getEntities()) {
        if (!(entity instanceof Husk husk)
            || !entity.getScoreboardTags().contains("stackanvil_custom")) continue;
        int value =
            husk.getPersistentDataContainer()
                .getOrDefault(
                    new NamespacedKey("stackanvil", "phase"), PersistentDataType.INTEGER, 0);
        State state = new State(value, (float) Math.clamp(husk.getHealth() / 20.0, 0, 1));
        for (var connection : geyserApi().onlineConnections()) {
          GeyserEntity translated = connection.entities().byUuid(entity.getUniqueId());
          if (translated == null
              || !translated.definition().identifier().equals(definition.identifier())) continue;
          Key key = new Key(connection.javaUuid(), entity.getUniqueId());
          live.add(key);
          if (state.equals(sent.get(key))) continue;
          translated.updatePropertiesBatched(
              batch -> {
                batch.update(phase, state.phase());
                batch.update(health, state.health());
              });
          translated.override(GeyserEntityDataTypes.SCALE, 1.0f + state.phase() * 0.15f);
          translated.override(GeyserEntityDataTypes.VARIANT, state.phase());
          sent.put(key, state);
          logger()
              .info(
                  "[StackAnvil Geyser Probe] entity="
                      + entity.getUniqueId()
                      + " phase="
                      + state.phase()
                      + " health="
                      + state.health());
        }
      }
    sent.keySet().retainAll(live);
  }
}
