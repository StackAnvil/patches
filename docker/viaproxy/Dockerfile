# StackAnvil ViaProxy image. The release workflow copies the released JAR into the build context.
FROM docker.io/library/eclipse-temurin:25-jre-alpine
# The musl libdatachannel natives for NetherNet link against OpenSSL 3
RUN apk add --no-cache libssl3
WORKDIR /app/run
COPY ViaProxy-*.jar /app/ViaProxy.jar
ENTRYPOINT ["java", "-jar", "/app/ViaProxy.jar", "config", "viaproxy.yml"]
