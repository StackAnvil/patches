package com.enderdash.agent.replay;

import java.lang.reflect.InvocationTargetException;
import java.nio.file.Files;
import java.util.Map;
import com.viaversion.viaversion.libs.gson.Gson;

/** Executes transformed bytecode to check both boolean branches, side effects, and exceptions. */
public final class ControllerAuditAgentSelfTest {
    public static void main(final String[] arguments) throws Exception {
        final var directory = Files.createTempDirectory("stackanvil-controller-audit");
        try {
            final var output = directory.resolve("audit.json");
            ControllerAuditAgent.configure(output);
            final byte[] original;
            try (var stream = ControllerAuditAgentSelfTest.class.getResourceAsStream("ControllerAuditAgentSelfTest$Fixture.class")) {
                original = stream.readAllBytes();
            }
            final byte[] observed = ControllerAuditAgent.observeReturns(original, ControllerAuditAgentSelfTest.class.getClassLoader());
            final Class<?> fixture = new ClassLoader(ControllerAuditAgentSelfTest.class.getClassLoader()) {
                Class<?> loadFixture() { return defineClass(null, observed, 0, observed.length); }
            }.loadFixture();
            final var evaluate = fixture.getDeclaredMethod("evaluateRenderControllerChange"); evaluate.setAccessible(true);
            for (int branch : new int[]{0, 1}) {
                final Object actor = fixture.getConstructor(int.class).newInstance(branch);
                if (!evaluate.invoke(actor).equals(branch == 1) || !fixture.getMethod("calls").invoke(actor).equals(1)) throw new AssertionError("Observer changed evaluation");
            }
            final Object throwing = fixture.getConstructor(int.class).newInstance(-1);
            try { evaluate.invoke(throwing); throw new AssertionError("Observer swallowed original exception"); }
            catch (InvocationTargetException expected) { if (!(expected.getCause() instanceof IllegalStateException)) throw expected; }
            ControllerAuditAgent.flush();
            final Map<?, ?> audit = new Gson().fromJson(Files.readString(output), Map.class);
            final Map<?, ?> identifiers = (Map<?, ?>) audit.get("identifiers");
            if (identifiers.size() != 1 || ((Number) identifiers.values().iterator().next()).intValue() != 2) throw new AssertionError("Observer missed a normal return or recorded an exceptional exit");
            if (Files.exists(output.resolveSibling("audit.json.tmp"))) throw new AssertionError("Audit publication left an incomplete file");
            ControllerAuditAgent.record(null);
            ControllerAuditAgent.flush();
            final Map<?, ?> failed = new Gson().fromJson(Files.readString(output), Map.class);
            if (((java.util.List<?>) failed.get("failures")).isEmpty()) throw new AssertionError("Missing observer failures");
            // A mismatched class must fail instrumentation rather than manufacture successful coverage.
            try (var stream = ControllerAuditAgentSelfTest.class.getResourceAsStream("ControllerAuditAgent.class")) {
                ControllerAuditAgent.observeReturns(stream.readAllBytes(), ControllerAuditAgentSelfTest.class.getClassLoader());
                throw new AssertionError("Accepted an absent controller method");
            } catch (IllegalArgumentException expected) { }
            System.out.println("PASS controller observer preserves returns, side effects, exceptions, and exact invocation counts");
        } finally {
            try (var paths = Files.walk(directory)) { for (var path : paths.sorted(java.util.Comparator.reverseOrder()).toList()) Files.delete(path); }
        }
    }

    public static final class Fixture {
        private final int branch;
        private int calls;
        public Fixture(final int branch) { this.branch = branch; }
        public String type() { return "fixture:controller"; }
        public int calls() { return this.calls; }
        private boolean evaluateRenderControllerChange() {
            this.calls++;
            if (this.branch < 0) throw new IllegalStateException("fixture exception");
            if (this.branch == 0) return false;
            return true;
        }
    }

}
