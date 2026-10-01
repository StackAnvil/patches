package com.enderdash.agent.replay;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Jwks;
import io.jsonwebtoken.security.PublicJwk;
import net.raphimc.viabedrock.api.util.CryptUtil;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/** Trusts the franchise issuer's published keys, never keys supplied by a login token. */
final class NativeCaptureIdentity {
    static final String ISSUER = "https://authorization.franchise.minecraft-services.net/";
    static final String AUDIENCE = "api://auth-minecraft-services/multiplayer";
    static final URI DISCOVERY = URI.create(ISSUER + ".well-known/openid-configuration");
    static final URI KEYS = URI.create(ISSUER + ".well-known/keys");
    private final JwtParser multiplayer;

    NativeCaptureIdentity(JsonObject discovery, String publishedKeys) {
        if (!ISSUER.equals(discovery.get("issuer").getAsString())
                || !KEYS.toString().equals(discovery.get("jwks_uri").getAsString())
                || !discovery.getAsJsonArray("id_token_signing_alg_values_supported").contains(new com.google.gson.JsonPrimitive("RS256"))) {
            throw new IllegalArgumentException("Unexpected multiplayer discovery metadata");
        }
        Map<String, PublicKey> keys = new HashMap<>();
        for (var jwk : Jwks.setParser().build().parse(publishedKeys)) {
            if (!(jwk instanceof PublicJwk<?> publicJwk) || !(publicJwk.toKey() instanceof RSAPublicKey key)
                    || (jwk.getAlgorithm() != null && !jwk.getAlgorithm().equals("RS256"))
                    || (jwk.containsKey("use") && !jwk.get("use").equals("sig"))) continue;
            if (jwk.getId() == null || jwk.getId().isBlank() || keys.putIfAbsent(jwk.getId(), key) != null) {
                throw new IllegalArgumentException("Invalid multiplayer signing key identity");
            }
        }
        if (keys.isEmpty()) throw new IllegalArgumentException("No multiplayer signing keys");
        multiplayer = Jwts.parser().requireIssuer(ISSUER).requireAudience(AUDIENCE)
                .sig().clear().add(Jwts.SIG.RS256).and().keyLocator(header -> {
                    Object id = header.get("kid");
                    PublicKey key = id instanceof String ? keys.get(id) : null;
                    if (key == null) throw new IllegalArgumentException("Unknown multiplayer signing key");
                    return key;
                }).build();
    }

    static NativeCaptureIdentity official() throws IOException, InterruptedException {
        HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10))
                .followRedirects(HttpClient.Redirect.NEVER).build();
        JsonObject discovery = JsonParser.parseString(download(http, DISCOVERY)).getAsJsonObject();
        // Fetch only the fixed official origin, even if discovery metadata is unexpected.
        return new NativeCaptureIdentity(discovery, download(http, KEYS));
    }

    private static String download(HttpClient http, URI uri) throws IOException, InterruptedException {
        var download = http.sendAsync(HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(15))
                .header("Accept", "application/json").GET().build(),
                HttpResponse.BodyHandlers.limiting(HttpResponse.BodyHandlers.ofByteArray(), 1_048_576));
        try {
            var response = download.get(15, java.util.concurrent.TimeUnit.SECONDS);
            if (response.statusCode() != 200) throw new IOException("Multiplayer discovery request failed");
            return new String(response.body(), StandardCharsets.UTF_8);
        } catch (java.util.concurrent.ExecutionException | java.util.concurrent.TimeoutException error) {
            throw new IOException("Multiplayer discovery request failed", error);
        } finally {
            if (!download.isDone()) download.cancel(true);
        }
    }

    PublicKey sameAccount(String nativeToken, String clientJwt, String savedToken, PublicKey relayKey) {
        Claims nativeClaims = verified(nativeToken), savedClaims = verified(savedToken);
        if (!xuid(nativeClaims).equals(xuid(savedClaims))) throw new IllegalArgumentException("Native client and saved account differ");
        PublicKey nativeKey = CryptUtil.ecPublicKeyFromBase64(nativeClaims.get("cpk", String.class));
        PublicKey savedKey = CryptUtil.ecPublicKeyFromBase64(savedClaims.get("cpk", String.class));
        if (!java.security.MessageDigest.isEqual(relayKey.getEncoded(), savedKey.getEncoded())) {
            throw new IllegalArgumentException("Saved account token is not bound to the relay session");
        }
        clientClaims(clientJwt, nativeKey);
        return nativeKey;
    }

    PublicKey nativeClientKey(String nativeToken, String clientJwt) {
        Claims claims = verified(nativeToken);
        xuid(claims);
        PublicKey key = CryptUtil.ecPublicKeyFromBase64(claims.get("cpk", String.class));
        clientClaims(clientJwt, key);
        return key;
    }

    private Claims verified(String token) {
        Claims claims = multiplayer.parseSignedClaims(token).getPayload();
        if (claims.getExpiration() == null) throw new IllegalArgumentException("Missing multiplayer token expiration");
        return claims;
    }

    private static String xuid(Claims claims) {
        String value = claims.get("xid", String.class);
        if (value == null || !value.matches("[0-9]+")) throw new IllegalArgumentException("Invalid account identity");
        return value;
    }

    static Claims clientClaims(String token, PublicKey key) {
        return Jwts.parser().sig().clear().add(Jwts.SIG.ES384).and().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    /** Only used by the relay's explicitly loopback-scoped offline route. */
    static PublicKey offlineClientKey(String clientJwt) {
        var jwt = Jwts.parser().sig().clear().add(Jwts.SIG.ES384).and()
                .keyLocator(CryptUtil.X5U_KEY_LOCATOR).build().parseSignedClaims(clientJwt);
        return (PublicKey) CryptUtil.X5U_KEY_LOCATOR.locate(jwt.getHeader());
    }
}
