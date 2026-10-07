package com.enderdash.agent.replay;

import java.lang.classfile.ClassFile;
import java.lang.classfile.ClassHierarchyResolver;
import java.lang.classfile.ClassTransform;
import java.lang.classfile.Opcode;
import java.lang.classfile.instruction.ReturnInstruction;
import java.lang.constant.ClassDesc;
import java.lang.constant.MethodTypeDesc;
import java.lang.instrument.ClassFileTransformer;
import java.lang.instrument.Instrumentation;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.ProtectionDomain;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import static java.lang.constant.ConstantDescs.*;

/** Test-only observation of original controller evaluation returns in the isolated proxy. */
public final class ControllerAuditAgent {
    private static final String TARGET = "net/raphimc/viabedrock/api/model/entity/CustomEntity";
    private static final ClassDesc OBSERVER = ClassDesc.of(ControllerAuditAgent.class.getName());
    private static final Map<String, Long> identifiers = new TreeMap<>();
    private static final List<String> failures = new ArrayList<>();
    private static Path output;
    private static boolean transformed;
    private static long lastPublish;

    public static void premain(final String argument, final Instrumentation instrumentation) throws Exception {
        configure(Path.of(argument));
        instrumentation.addTransformer(new ClassFileTransformer() {
            @Override
            public byte[] transform(final ClassLoader loader, final String name, final Class<?> redefined,
                                    final ProtectionDomain domain, final byte[] bytes) {
                if (!TARGET.equals(name)) return null;
                try {
                    final byte[] result = observeReturns(bytes, loader);
                    synchronized (ControllerAuditAgent.class) {
                        transformed = true;
                        publish(true);
                    }
                    return result;
                } catch (Throwable error) {
                    failed(error);
                    return null;
                }
            }
        });
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            synchronized (ControllerAuditAgent.class) {
                try { publish(true); } catch (Exception error) { error.printStackTrace(); }
            }
        }, "StackAnvil controller audit flush"));
    }

    static synchronized void configure(final Path file) throws Exception {
        output = file;
        identifiers.clear(); failures.clear(); transformed = false;
        publish(true);
    }

    static byte[] observeReturns(final byte[] bytes, final ClassLoader loader) {
        final ClassFile api = ClassFile.of(ClassFile.ClassHierarchyResolverOption.of(ClassHierarchyResolver.ofResourceParsing(loader)));
        final var model = api.parse(bytes);
        final ClassDesc owner = model.thisClass().asSymbol();
        final long matches = model.methods().stream().filter(method -> method.methodName().equalsString("evaluateRenderControllerChange")
                && method.methodTypeSymbol().equals(MethodTypeDesc.of(CD_boolean))).count();
        if (matches != 1) throw new IllegalArgumentException("Expected one original controller evaluation method");
        return api.transformClass(model, ClassTransform.transformingMethodBodies(method -> method.methodName().equalsString("evaluateRenderControllerChange")
                && method.methodTypeSymbol().equals(MethodTypeDesc.of(CD_boolean)), (builder, element) -> {
            if (element instanceof ReturnInstruction returned && returned.opcode() == Opcode.IRETURN) {
                // Leave the original boolean on the stack and observe the inherited identifier.
                builder.aload(0).invokevirtual(owner, "type", MethodTypeDesc.of(CD_String))
                        .invokestatic(OBSERVER, "record", MethodTypeDesc.of(CD_void, CD_String));
            }
            builder.with(element);
        }));
    }

    public static synchronized void record(final String identifier) {
        try {
            if (identifier == null || identifier.isBlank()) throw new IllegalArgumentException("Controller returned without an actor identifier");
            final boolean first = !identifiers.containsKey(identifier);
            identifiers.merge(identifier, 1L, Long::sum);
            publish(first);
        } catch (Exception error) { failed(error); }
    }

    static synchronized void flush() throws Exception {
        publish(true);
    }

    private static synchronized void failed(final Throwable error) {
        failures.add(error.toString());
        try { publish(true); } catch (Exception writeFailure) { writeFailure.printStackTrace(); }
    }

    private static void publish(final boolean force) throws Exception {
        if (!force && System.nanoTime() - lastPublish < 200_000_000L) return;
        final StringBuilder json = new StringBuilder("{\"schema\":1,\"transformed\":").append(transformed).append(",\"identifiers\":{");
        boolean comma = false;
        for (var entry : identifiers.entrySet()) {
            if (comma) json.append(',');
            json.append(quote(entry.getKey())).append(':').append(entry.getValue()); comma = true;
        }
        json.append("},\"failures\":["); comma = false;
        for (String failure : failures) {
            if (comma) json.append(','); json.append(quote(failure)); comma = true;
        }
        json.append("]}\n");
        final Path temporary = output.resolveSibling(output.getFileName() + ".tmp");
        PrivateFiles.write(temporary, json.toString().getBytes(StandardCharsets.UTF_8));
        Files.move(temporary, output, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
        lastPublish = System.nanoTime();
    }

    private static String quote(final String value) {
        final StringBuilder result = new StringBuilder("\"");
        for (char character : value.toCharArray()) {
            if (character == '\\' || character == '"') result.append('\\').append(character);
            else if (character < 32) result.append(String.format("\\u%04x", (int) character));
            else result.append(character);
        }
        return result.append('"').toString();
    }

}
